# War Thunder 科技树客户端：Codex 迁移上下文

请读取当前项目后继续协作。除非用户明确要求，不要覆盖或回滚工作区中已有修改。无需读取 `node_modules` 和 `static_copy`。

## 项目定位

这是一个 Vue 3 + Vite + Pinia 的战争雷霆科技树规划客户端。核心数据来自：

- `public/database/{country}/{country}_{vehicleType}.json`
- 国家：`usa / germany / ussr / britain / japan / china / italy / france / sweden / israel`
- 军种：`ground / aviation / helicopters / ships / boats`
- 一键路径规划目前只考虑陆军和空军，不处理直升机规划。

## 必读文件

优先完整阅读：

- `src/utils/researchPathPlanner.js`
- `src/utils/researchPathWorker.js`
- `src/utils/treeDataUtils.js` 中 `researchPathPlanner/Path Worker相关` 部分
- `src/App.vue`
- `src/stores/tree_data_store.js`
- `src/components/wt_tree_item.vue`
- `src/components/wt_tree_item_fast_funcs.vue`
- `src/components/development_debug_panel.vue`
- `tests/researchPathPlanner.test.mjs`
- `doc/` 下与路径算法有关的 Markdown

注意：`doc/core_logic.md`、`doc/performance.md` 和旧版 `planPathToTarget2.md` 主要描述历史实现。涉及冲突时，以当前源码为准。

## 当前规划调用链

```text
App.vue
  -> findShortestPathToVehicleWorker(params)
  -> researchPathWorker.js
  -> planShortestResearchPath(payload)
  -> normalizePlanResult(...)
  -> selected_state_map
```

一键规划参数结构：

```js
{
  targets: [{ data_unit_id }],
  planned_prems: [{ data_unit_id }],
  owned_researchables: [{ data_unit_id }],
  priority_column: [columnIndex],
  priority_mode: "soft" | "hard"
}
```

## 算法业务规则

### Rank 解锁数量

- `unlock_quantity` 表示“至少 N 辆”，不是“必须恰好 N 辆”。
- 高级载具和已拥有的可研发载具都参与 Rank 数量统计。
- 依赖链造成的必要超额是合法的。

### 已拥有载具

用户通过快捷功能栏的“标记拥有”将当前所有已选中的 `researchable_vehicles` 写入 `markOwnedVehicleList`。

已拥有载具规则：

- 是普通预选节点，相当于用户已手动规划了一部分。
- 参与 Rank 解锁数量。
- 作为依赖回溯的起点；已经拥有的节点之前不需要重新规划。
- 规划过程不能删除或替换它们。
- 规划完成后仍保留在 `selected_state_map`，保持选中状态。
- 不计入待研发 RP/SP，也不计入全局 RP/SP 总计。
- 仍计入选中数量。
- `markOwnedVehicleList` 在执行规划后保持不变。
- `.mark_owned` 用于 `wt_tree_item` 的拥有状态类名。

### soft 策略

soft 是逐 Rank 决策：

1. 先加入目标的强制依赖、已拥有载具和高级载具。
2. 对当前缺口 Rank，每个指定优先列最多先贡献一个补位包。
3. 优先列贡献后，剩余缺口选择当前真实增量 RP 最低、其次 SP 最低的候选包。
4. 后续 Rank 引入新依赖后，执行依赖安全的冗余清理。
5. 如果某个先前补位节点后来变得多余，且它不是目标、不是已拥有节点、没有最终载具依赖它，删除后 Rank 仍满足门槛，则将其删除。

### hard 策略

- 优先列顺序高于 RP 成本。
- 可以沿优先列继续扩展，不保证最少 RP。

### 无优先列

- 使用最少 RP 搜索。
- RP 相同时比较 SP。
- 搜索达到迭代上限时必须通过 `searchComplete/search_complete` 和中文警告明确说明结果可能不是严格最优。

## 关键回归案例

### 中国空军

参数：

```json
{
  "targets": [{ "data_unit_id": "j_15t" }],
  "planned_prems": [{ "data_unit_id": "jh_7a_prototype" }],
  "priority_column": [1],
  "priority_mode": "soft"
}
```

Rank VIII 应为：

- `j_11`
- `j_11b`
- `jh_7a_prototype`

数量为 3，不能无意义加入 `j_8f` 和 `j_10a`。

### 中国陆军

调试样本曾保存于根目录 `临时调试信息.txt`。

核心参数：

- 目标：`cn_m1a2t`、`cn_zbd_04a`
- 已拥有包含 `cn_zts_63_1980`（ZTS63）及其之前的用户规划路径
- 高级载具：`cn_ztz_96b`、`cn_wma_301`
- 优先列：`[1]`
- 模式：`soft`

正确最终 Rank V 数量为 5：

- 已拥有：`cn_zts_63_1980`
- 新规划：`cn_plz_05`、`cn_m113a1_tow`、`cn_m48a1_patton_iii`、`cn_type_59`
- `cn_type_86`（ZBD86）在后续依赖引入 `Type 59` 后变成冗余，应被安全清理。

## 选中态和统计

- `selected_state_map` 保存最终可视选中状态。
- `owned_vehicle_ids` 位于 Pinia store，用于 RP/SP 汇总排除。
- `calculateRankStats` 动态支持 Rank I–IX 及未来 Rank，不可重新硬编码为 I–VIII。
- 已拥有载具在 Rank 和总计统计中只增加 `count`，RP/SP 增量为零。

## 快捷功能栏

`wt_tree_item_fast_funcs.vue` 是全局唯一快捷栏：

- 在 `App.vue` 中只渲染一次，并通过 `Teleport` 放入 `body`。
- `wt_tree_item` 右键时仅上报目标载具、是否高级、列下标和卡片视口坐标。
- 快捷栏根据卡片位置显示在上方或下方。
- `resize` 或任意 `scroll` 时直接关闭，不更新位置。
- 点击外部区域关闭。
- “标记拥有”仅在 `researchable_vehicles` 右键时显示。

功能：

- 向上全选
- 加入队列
- 标记拥有
- 跳转详情

## 动态规划队列 UI

- 动态规划队列入口按钮位于 `wt_type_tabs.vue`，向外抛出 `open-planning-queue`。
- `App.vue` 监听事件打开规划对话框。
- “一键计算开线路径”右侧有“清空规划列表”按钮。
- 清空按钮清除：目标载具、预备高级载具、非主线列优先级。
- 不应清除 `markOwnedVehicleList`，除非用户另有要求。
- `targets` 或 `planner` 中的载具在卡片上添加 `.in_queue`。

## 开发调试面板

`settings.developer_mode` 默认 `false`，持久化在 settings 中。

- 关闭时不挂载、不加载调试面板，也不执行调试记录逻辑。
- 开启后显示可展开/收起面板。
- 每次规划覆盖上一次信息，不持续累积。
- 只保留三栏：完整规划参数、开始执行一键规划、中文算法警告。
- 底部按钮可复制全部调试信息。
- 完整 `params` 必须显示在最上方。

## 其它已修问题

- `getColumnBoundaryVehicles()` 获取列末端折叠组时，如果最后一个子载具 `br == null`，回退到该组第一个子载具。
- Rank IX 的 RP/SP 汇总已修复。
- 快捷栏已从每个 `wt_tree_item` 内移除，避免重叠和点击失效。

## 测试

运行：

```bash
npm run test:planner
npm run build
```

当前测试包括：

- 10 国陆军/空军基础回归
- 单目标、双目标
- soft/hard
- 多个优先列
- 已拥有载具
- 高级载具
- 折叠组
- 依赖闭包
- Rank 数量
- RP/SP 汇总
- soft 冗余叶子检查

大型矩阵目前包含 124 组新增真实数据库场景。最近一次结果为 26 个测试组全部通过。

构建环境会警告当前 Node.js 21.7.3 不属于 Vite 推荐范围；项目声明要求 Node `^20.19.0 || >=22.12.0`。当前构建仍能成功，但迁移环境建议使用 Node 22.12+。

## 协作要求

- 修改算法前先用真实数据库复现，不要只写假数据补丁。
- 修复应覆盖所有国家陆军/空军，不考虑直升机规划。
- 每次算法修改后运行完整 planner 测试和生产构建。
- 不要把历史文档当成当前源码事实。
- 不要删除用户已有的未提交修改或静态资源变更。
