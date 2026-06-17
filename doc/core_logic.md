# 核心功能逻辑分析

> 项目：`war-thunder-wikitree.client`（Vue 3 + Vite + Pinia + Tailwind v4 + reka-ui + element-plus）
> 定位：War Thunder（战争雷霆）"科技树（tree）"研究规划工具，用户可在客户端按 国家×军种 浏览整棵研发树、勾选载具、按 RP / SP / BR 三种维度进行汇总，并可一键全选、按列规划、缓存修复、导出图像。

---

## 1. 项目总体架构概览

```
src/
├── main.js                       # 入口：createApp、注册 Pinia、注册 router
├── App.vue                       # 唯一根视图：背景层、顶栏、科技树主体、左侧国家栏、底部信息
├── router/index.js               # 空路由（routes:[]）—— 实际是单页单视图，并未使用路由
├── stores/                       # 全局状态（Pinia setup 写法）
│   ├── tree_data.js              # 当前科技树数据 + 偏好设置（multiple_mode / 背景 / 模糊度 / 全选模式）
│   ├── public_mask.js            # 全局遮罩层（loading + 半透明遮罩 + 透明度）
│   └── public_message_dialog.js  # 全局 toast（顶部消息条）
├── composables/
│   └── usePointsSummary.js       # 由 tree_data 派生 totalSummary（rp/sp）和 totalSelectNum
├── utils/
│   ├── dict.js                   # 常量字典：军种/国家/角色/等级解锁数量/壁纸预设
│   ├── treeDataUtils.js          # 选中/反选/列向上选中/全树详情就绪检测
│   ├── planPathToTarget2.js      # "一键自动规划路线"算法
│   ├── mountArrowPoints.js       # 为研发树 item 计算"指向箭头"的虚拟行/跨 rank 跨距
│   ├── exportElementToImage.js   # html2canvas / modern-screenshot 导出图像
│   ├── loadLocalJson.js          # 从 /database/{country}/{country}_{type}.json 拉取静态数据
│   ├── cache.js                  # 批量请求 unit 详情（已禁用）+ 清理本地全部 tree_data 缓存
│   ├── request.js                # axios 实例，baseURL=http://localhost:3000/api（已弃用）
│   └── dict.js                   # 见上
├── api/tree_data.js              # 旧后端接口（getTreeDataAPI/getUnitDetails，已不再调用）
├── components/
│   ├── wt_tree_item.vue          # 单个载具卡片（最高频组件，含展开/箭头/规划）
│   ├── wt_country_tabs.vue       # 左侧国家垂直 tab
│   ├── wt_type_tabs.vue          # 顶部军种 tab + 总计面板 + 偏好设置 + 导出 + 缓存修复
│   ├── public_mask.vue           # 全屏遮罩
│   ├── public_mask_copy.vue      # 弹窗用的半透明遮罩（被 public_dialog 复用）
│   ├── public_dialog.vue         # 通用弹窗（header / main 插槽）
│   ├── public_message_dialog.vue # 顶部 toast
│   ├── cir_tabs.vue / light_button.vue / light_checkbox.vue / loading.vue
│   └── ui/                       # shadcn-vue (reka-ui) 引入的: Select / Checkbox / Tooltip / NumberField / Label
├── lib/utils.js                  # cn() = twMerge(clsx())
└── index.css                     # tailwind v4 + 自定义字体 + dark 主题变量
```

数据来源演化：早期通过 `request.js`(axios) → 后端 `localhost:3000/api`，又改为 `cdn.jsdelivr.net/gh/...`，**当前 (`App.vue`) 走 `loadLocalJSON()` 从 `public/database/{country}/{country}_{type}.json` 读取**。`api/tree_data.js`、`utils/cache.js` 中的 `batch_request_details` 和 `request.js` 已成为遗留代码。

---

## 2. 模块功能职责

### 2.1 入口 / 应用骨架

- **`main.js`**：创建 Vue 实例、装载 Pinia 与 vue-router。
- **`router/index.js`**：仅创建了 `createWebHistory` 路由器但 `routes: []` 为空 → 实际不参与渲染逻辑，可视作"占位"。
- **`App.vue`**（核心驱动）：
  - 持有当前 `currentCountry`、`currentVehicleType`、`currentPointsType` 三个本地 ref（初始值取自 `localStorage`）。
  - 通过 `watch([currentCountry, currentVehicleType])` 在切换国家/军种时调用 `requestTreeData()`。
  - `requestTreeData()` 流程：开 mask + loading → `cacheHit()`：localStorage 命中则直接 `mountArrowPoints` + `updateTreeData`；未命中则 `loadLocalJSON` → `mountArrowPoints` → 关 mask。
  - `versionIteration()`：启动时 `fetch('/v-verify.json')` 比对 `localStorage.version_timestamp`，不一致即清空所有 tree_data 缓存（强制刷新）。
  - 派生计算：
    - `current_uq` = `unlock_quantitys[country][type]` —— 每 rank 的解锁阈值。
    - `rankRpSps` —— 每个 rank 的总 RP / 总 SP（基于 `rank.selected`）。
    - `current_bg_img` —— 从 `preset_wallpapers` 找当前背景的元数据。
  - 转发事件：`updateItemSelected`（先调 `areAllDetailsTrueInTree()` 校验，否则弹 toast），`toggleSelectAll_`，`clearCache`，`exportToImage`。

### 2.2 状态管理 stores

- **`useTreeDataStore`**（`tree_data.js`）：
  - `tree_data`：当前科技树数组（顶层是 rank，rank 下含 `researchable_vehicles[][]`、`premium_vehicles[][]`、`selected[]`、`unlock_quantity`）。
  - `instantCaching(data, t_c, type)`：将 data 序列化进 `localStorage` 的 `${t_c}_${type}` 键，并立刻 `JSON.parse` 再回写到 `tree_data`（重要副作用：每次都会把响应式数据"换脸"为新对象引用，详见 performance.md）。
  - 偏好开关：`bg_hidden`（弃置）、`bg_img`、`blur_number`、`multiple_mode`、`all_select_mode`，全部以 localStorage 持久化。
- **`usePublicMaskStore`**（`public_mask.js`）：`visible`、`loadingFunc`、`opacity`，控制全屏遮罩。`hide()` 会顺带把 `loadingFunc` 重置为 false、`opacity` 重置为 0.5。
- **`usePublicMessageDialogStore`**（`public_message_dialog.js`）：顶部 toast 文本与时长。`public_message_dialog.vue` 通过 `watch(store.visible)` 配合 `setTimeout(store.hide, duration)` 实现自动关闭。

### 2.3 composables

- **`usePointsSummary(tree_data, currentPointsType)`**：返回两个 `computed`：
  - `totalSummary`：合计所有 `rank.selected` 的 rp/sp，输出带千分号字符串。
  - `totalSelectNum`：累计 `rank.selected.length`。
  - 注意：第二个参数 `currentPointsType` 实际未在内部使用，是历史遗留参数。

### 2.4 utils（最重要的业务逻辑层）

- **`treeDataUtils.js`**
  - `updateTreeItemSelected({ tree_data, target_item, selected, t_c, type, instantCaching })`：递归遍历 `researchable_vehicles → column → item → item.items`，按 `data_unit_id` 命中后翻转 `selected`，再同步推入/移出 `rank.selected`；最后调用 `instantCaching` 持久化。`type === 'multiple'` 的父项 `selected` 为子项的 `some(...)`。premium 载具的 rp/sp 强制写为 0（不计入总计）。
  - `toggleSelectAll({ tree_data, selectAll, ... })`：
    - 遍历每个 rank 重置 `rank.selected = []`。
    - 全选时只处理 `researchable_vehicles`，`item.selected = item.details`（必须详情就绪）；
    - 若 `all_select_mode = true` 且为 `multiple`，仅选中第一个子项（其余清零）；
    - 反选时同时把 `premium_vehicles` 也清零。
  - `toggleSelectColumnAbove`：右键单击载具时使用——同列从 rank 0 至当前位置全部置为选中/未选中，再走一次 sync 把 `rank.selected` 重新合并。
  - `areAllDetailsTrueInTree`：递归判断所有 single/multiple 的 `details === true`。
  - `getSelectedPremiumIds`：导出已选金币载具的 `data_unit_id` 列表，供"路线规划"作为 preset。

- **`planPathToTarget2.js`**（"一键自动规划路线"算法）
  - `resetAllSelections` → `findVehiclePosition(target_data_unit_id)` → `selectColumnChain` 选目标列依赖链 → `selectPresetPremiumVehicles` 标记 preset 高级载具 → `fillUnlockQuantityOptimized` 逐 rank 检查 `unlock_quantity` 并按"已选列内 multiple 余项 → 否则新列 avgCost 最低"两阶段补足 → `applySelections` → `updateRankSelected` → `instantCaching`。
  - 当前在 `wt_tree_item.vue` 中其实被 `automaticPlanning_` 旧实现替代为 `toggleSelectColumnAbove`（按列向上选中）。`planPathToTarget2` 仅作为已上线但未启用的算法保留。

- **`mountArrowPoints.js`**：
  - 为每个 researchable item 生成 `arrow_points = { placeholder_item, cross_level, has_next_item }`。
  - 计算逻辑：以"虚拟行轴 = ∑ 各 rank 最长列长度（prefixRows）+ 行下标"，沿同列向下找下一个有效 item，得到跨 rank 距离与中间 placeholder 行数。
  - 已存在 `arrow_points` 的 item 跳过本轮计算（性能优化）。
  - 计算完毕后 `instantCaching(copy_tree_data, _t_c, _type)` 把带 arrow_points 的版本回写缓存。

- **`exportElementToImage.js`**：
  - `exportElementToImage(node, opts)` —— 用 html2canvas 截屏整个 `treeArea`，`scale = devicePixelRatio`，背景 `#181e21`。
  - `modernScreenshot(node)` —— 用 `modern-screenshot` 的 `domToPng` 备选实现。
  - `downloadDataUrl(url)` —— 创建 `<a>` 触发下载。
  - 注意：当前在 `wt_type_tabs.vue` 中"导出图像"按钮被替换成 `alert("导出图像功能维护中...")`，实际未触发。

- **`loadLocalJson.js`**：单一职责，`fetch('/database/{t_c}/{t_c}_{type}.json')`。
- **`cache.js`**：
  - `batch_request_details(tree_data, t_c, type)`：基于 `getUnitDetails` 的并发批量请求 + 中断 + 防竞态 + 即时缓存的实现，**当前并未被任何调用方调用**（属于"曾经的逐 unit 详情拉取"方案）。
  - `clearTreeDataCache()`：双层 for 循环，把 `country_code × vehicle_type` 共 50 个 localStorage key 全清。
  - `abort_batch_request()`：清空当前 task_id 与 AbortController 列表（被 App.vue 在切换 country/type 时调用）。

### 2.5 组件

- **`wt_tree_item.vue`**（核心交互单元，渲染一个 150×56 的载具卡片）
  - props：`item`、`isPremium`、`isDefault`、`currentPointsType`、`totalSelectNum`、`planPathToTarget2Params`。
  - 行为：
    - 左键 → 单击 single 直接 emit `updateItemSelected`；点击 multiple 折叠组：若 `multiple_mode=true` 走 `multipleEvent` 单击选首项 / 双击展开；否则展开 `showStatus=true` 并打开半透明 mask。
    - 右键 → `automaticPlanning(item)` → `toggleSelectColumnAbove`（同列向上选中）。
  - 派生：`calcArrowHeight()` 把 `arrow_points` 转成像素高度，渲染指向下一级载具的箭头。`watch(public_mask.visible)` 在 mask 关闭时收起折叠列表。
- **`wt_country_tabs.vue`**：左侧 10 个国家的 SVG 图标列表，单击 emit `update:modelValue`；维护 1440px 主区域左侧 fixed 位置（`top: calc(50% - 330px)`）。
- **`wt_type_tabs.vue`**（功能聚合栏）：
  - 顶部 5 个军种 tab；中央"当前总计"面板（`formatToWan` 把 RP/SP 缩成"X.X 万"）；右侧 偏好设置 / 导出图像（已隐藏）/ 缓存修复 / 加群按钮。
  - 偏好设置弹窗用 reka-ui 的 Select、Checkbox、NumberField、Tooltip 组合：背景壁纸、模糊度、`multiple_mode`、`all_select_mode`。
  - `onMounted` 注册 `window.scroll`，越过 114px 阈值时给自身加 `scroll-trigger` 类（位置变 fixed，动效"由上滑入"），`onUnmounted` 移除监听。
- **`public_mask.vue` / `public_mask_copy.vue` / `public_dialog.vue` / `public_message_dialog.vue`**：见 2.2。
- **`cir_tabs.vue`**：胶囊型 radio 切换，用于切换"研发点 / 战斗权重 / 银狮"。
- **`light_button.vue` / `light_checkbox.vue`**：装饰性 3D 按钮 / 96 个 div 组成的"灯泡"3D 复选框。
- **`components/ui/`**：shadcn-vue (reka-ui) 复制的标准组件集，仅做样式映射，无业务逻辑。

---

## 3. 模块调用关系（顺序流）

### 3.1 启动流程
```
main.js
  └── createApp(App)
       └── App.onMounted
            ├── versionIteration(): fetch('/v-verify.json') -> 校验 -> 清缓存
            └── requestTreeData()
                 └── cacheHit()
                      ├── localStorage 命中
                      │     ├── mountArrowPoints({ value: parsed }, ..., instantCaching)
                      │     │     └── instantCaching(local, t_c, type) // store
                      │     └── updateTreeData(parsed)
                      └── 未命中
                            ├── loadLocalJSON(country, type) -> fetch JSON
                            └── mountArrowPoints({ value: res }, ..., instantCaching)
```

### 3.2 切换国家/军种
```
watch([currentCountry, currentVehicleType])
  ├── abort_batch_request() (旧逻辑遗留，目前 batch_request 未启用)
  ├── localStorage.setItem
  └── requestTreeData()
```

### 3.3 用户单击单载具
```
wt_tree_item.clickTrigger(item)
  └── emit("updateItemSelected", item, !item.selected)
       └── App.updateItemSelected
            ├── areAllDetailsTrueInTree(tree_data) ? 否：messageStore.show("Please wait...")
            └── updateTreeItemSelected({...})
                 ├── 递归更新 selected / rank.selected
                 └── instantCaching(tree_data, t_c, type) // 把整棵树回写 localStorage 并更新 ref
```

### 3.4 全选 / 反全选
```
wt_type_tabs.toggleSelectAll → emit toggleSelectAll
  └── App.toggleSelectAll_
       └── toggleSelectAll({ selectAll: !totalSelectNum.value, ... })
            └── instantCaching(...)
```

### 3.5 右键单击 → "列向上选中"（自动规划替代实现）
```
wt_tree_item.@contextmenu -> automaticPlanning(item)
  └── toggleSelectColumnAbove({ tree_data, clicked_item, select: !item.selected, t_c, type, instantCaching })
       └── instantCaching(...)
```

### 3.6 派生数据流（响应式链）
```
tree_data (Pinia ref)
  ├── App.rankRpSps (computed)        // 每 rank RP/SP 文本
  ├── usePointsSummary -> totalSummary / totalSelectNum (computed)
  │      └── 传给 wt_type_tabs 显示
  └── 传给 wt_tree_item -> 卡片显示 br/rp/sp/main_role/箭头
```

### 3.7 偏好设置 / 背景
```
wt_type_tabs (Select / NumberField / Checkbox)
  └── treeDataStore.toggleBgImg / toggleBlurNumber / toggleMultipleMode / toggleAllSelectMode
       ├── localStorage.setItem
       └── ref.value = newVal -> App 中的 computed current_bg_img 与 backdropFilter 重新求值
```

---

## 4. 数据形状（基于 tree_data 真实数据示例.json）

```jsonc
[
  {
    "rank": "IV",                    // 罗马数字
    "researchable_vehicles": [        // 列：每个数组元素是"一列"
      [ /* item ... */ ]              // item: { type:"single"|"multiple", title, vehicle_icon,
                                      //        br, rp, sp, data_unit_id, selected, class_name,
                                      //        details, main_role, items?, arrow_points? }
    ],
    "premium_vehicles": [ [ /*...*/ ] ],
    "selected": [],                   // 摘要：{ data_unit_id, rp, sp }[]
    "unlock_quantity": 0
  }
]
```

要点：
- 单个国家×军种 JSON 总尺寸约 19KB（示例为以色列空军）；
- `items` 字段表示折叠组（`type=multiple`），其下 `subItem` 与父结构同形；
- `class_name` 为 `""`（普通）/ `"prem"`（金币）/ `"squad"`（小队车）—— 三种视觉风格；
- `arrow_points` 由 `mountArrowPoints` 注入，首次加载或缓存命中时写入；
- `unlock_quantity` 仅作为"自动规划"的硬约束，UI 上则用 `unlock_quantitys` 字典（dict.js）覆盖显示，存在重复信息源问题。

---

## 5. 总结

整个项目可视为一个"**单视图 + 单一数据流**"的 SPA：

```
localStorage / 静态 JSON
        ↓
   tree_data ref ←── instantCaching（写回也更新 ref）
        ↓
  computed 派生（usePointsSummary、rankRpSps）
        ↓
  wt_tree_item × N  →  emit('updateItemSelected')
        ↓
   updateTreeItemSelected (utils)
        ↓
   instantCaching（再次更新 ref，触发整棵树重新渲染）
```

业务复杂度集中在 `treeDataUtils.js`（选中态多源同步）+ `mountArrowPoints.js`（虚拟行计算）+ `planPathToTarget2.js`（路径规划），前者是"日常 UI 交互的瓶颈所在"，后两者只在切换数据源时执行一次。