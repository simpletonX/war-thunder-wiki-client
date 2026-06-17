# 性能瓶颈分析（重点）

> 范围：仅基于 `src/`、`tree_data真实数据示例.json` 与根目录配置文件。
> 结论先行：项目最大的性能问题不是"渲染单元数量"，而是**"每一次单击都要把整棵树 JSON 序列化 + 反序列化 + 整体替换 ref"**，叠加 **大量"非局部"的 v-for + key 不稳定 + watch 全树**，使得在中后期 rank 树（aviation/ground 满级）下点击载具时容易出现 100ms+ 卡顿。

下面按"问题严重程度"分类列出。

---

## 1. 状态管理响应机制（最关键）

### 1.1 `instantCaching` 把整棵树"换脸" → 全树重新渲染
位置：`src/stores/tree_data_store.js`

```js
function instantCaching(tree_data_, t_c, type) {
  localStorage.setItem(`${t_c}_${type}`, JSON.stringify(tree_data_));
  const newTreeData = localStorage.getItem(`${t_c}_${type}`);
  updateTreeData(JSON.parse(newTreeData));   // ← 关键：再 parse 回来覆盖 ref
}
```

- 每一次单击载具、全选、反选、列规划，`updateTreeItemSelected` / `toggleSelectAll` / `toggleSelectColumnAbove` 内部都会调用 `instantCaching` —— 即先 `JSON.stringify` 整棵树（包括所有 rank、列、子载具、`arrow_points`、`items`、`vehicle_icon` URL 等冗长字段），再 `JSON.parse` 后整体替换 `tree_data.value`。
- 副作用 1：**所有引用 `tree_data` 的 computed/watch 都会失效重算**（包括 `rankRpSps`、`usePointsSummary`、`areAllDetailsTrueInTree`），并触发整棵树的 v-for 全部重建。
- 副作用 2：**所有 wt_tree_item 的 `props.item` 引用都换了**，由于父组件每次拿到的是新对象，子组件即使内容相等也会执行 patch；`v-for :key` 用的是 `item?.data_unit_id || \`r-${colIndex}-${rowIndex}\``，主键稳定，但 props 仍会重新比对，所有 `<img>` 重新求值。
- 副作用 3：`localStorage.setItem` 在主线程上执行同步序列化；按 19KB 单国数据估算还可控，但用户在 ground 全树（接近 100KB）连点 10 次能感知主线程明显卡顿。

**优化方向**：
1. 去掉 `JSON.stringify → setItem → getItem → JSON.parse` 这段无意义的循环。直接 `tree_data.value = data; localStorage.setItem(key, JSON.stringify(data))`，并把 setItem 放进 `requestIdleCallback` 或防抖（300~500ms）。
2. 进一步：把"选中态"从 tree_data 中剥离，单独维护一个 `selectedSet: Set<data_unit_id>`，让 wt_tree_item 通过 `computed(() => selectedSet.has(item.data_unit_id))` 取，单点修改成本 O(1)，不需要回写整棵树。
3. 用 `shallowRef`+局部对象更新替代深响应：`tree_data` 内部并不需要每个 `vehicle_icon` 字符串都变成响应式 `Proxy`。
4. localStorage 序列化做防抖；切换国家时再 flush。

### 1.2 `updateTreeItemSelected` 全树扫描 → 找到就回写整棵树
位置：`src/utils/treeDataUtils.js`

- 函数遍历每个 rank → 每列 → 每 item，命中后立即 `instantCaching(tree_data.value, t_c.value, type.value)` 并 return。
- 命中位置有可能在最后一个 rank 的最后一列，平均 O(N)，N≈所有载具数量。
- 真正昂贵的是**命中之后**的"全树序列化"。

### 1.3 `areAllDetailsTrueInTree` 在每次 `updateItemSelected` 调用前执行一次
位置：`src/App.vue`

```js
const updateItemSelected = (item, selected) => {
  if (areAllDetailsTrueInTree(tree_data.value)) {
    updateTreeItemSelected({...});
  } else {
    messageStore.show("Please wait...", 2000);
  }
};
```

- 每次单击都会再做一次"递归遍历整棵树检查 details"。在静态 JSON 已被全量加载（所有 details 都是 true）的当前实现下，这个校验**可以一次性缓存为 ref，而不是每次单击都跑 O(N) 递归**。
- 改成：`const allReady = computed(() => areAllDetailsTrueInTree(tree_data.value))`，让 Vue 在 tree_data 变化时再算。

---

## 2. 重渲染频率问题

### 2.1 `App.vue` 模板 v-for 体量
- `tree_data.length × researchable_vehicles.length × column.length` 渲染 `wt_tree_item`，再 + `premium_vehicles` 同尺寸。一国一军种叶子项数可达 **~150**（含 multiple 子项），节点上还有 `<img :src="...">`、`<div class="public-loader small">`、`<template v-else>` 等 5~8 个原子节点。
- 1 次单击 → 整棵 ref 替换 → 全部 150+ 个 `wt_tree_item` 走 patch（即使 props 内容相等，Vue 仍要 diff 子节点结构）。
- 该模板里**没有任何 `v-memo` 或 `defineAsyncComponent`**；首屏渲染只渲染一棵树是可接受的，但每次点击都做全量 patch 是不必要的。

**优化方向**：
- 用 `v-memo="[item.selected, item.details, currentPointsType]"` 包住每个载具卡片的根节点，只有这几个状态变化时才 patch。
- 把 `wt_tree_item` 拆成 `wt_tree_item_root + wt_tree_item_folding`，折叠子项不展开时不渲染。

### 2.2 `wt_tree_item.vue` 首次渲染立即调用 `calcArrowHeight()`
```js
function calcArrowHeight() { ... }
calcArrowHeight();          // 在 setup 同步调用
```
- 没问题——但 `arrow_points` 改变时不会再重算（没有 watch 包裹），如果将来"选中态"影响箭头长度，目前实现不响应。
- 当前 `arrow_points` 是在 `mountArrowPoints` 阶段计算并写进缓存，单击不会触发 `calcArrowHeight` 重跑——这是好事，但要注意 `instantCaching` 把整棵树替换后，`props.item` 是**新对象**，Vue 会重新执行 `setup`，又跑一次 `calcArrowHeight`。把它包成 `computed` 或 `watchEffect` 更清晰。

### 2.3 `App.vue` 中的可疑 setTimeout
```js
setTimeout(() => { console.log(current_bg_img); }, 500);
```
- 每次进入 App 都会触发一次延迟 console.log（显然是调试遗漏）。生产构建中虽然只是 1 次，但暴露了"开发期日志没清理"——见第 9 节。

### 2.4 `wt_type_tabs.vue` 的 `scroll` 监听
```js
window.addEventListener("scroll", handleScroll);
```
- 没有节流。`tree-area` 内部的 overflow:auto 触发的不是 window scroll，但用户拖动页面（如外层）仍会高频回调。建议 `useEventListener(window, 'scroll', handleScroll, { passive: true })` + `throttle(50)`。

### 2.5 频繁的 `storeToRefs` 使用
- 各组件多处 `storeToRefs(treeDataStore)`。`storeToRefs` 是廉价操作，但需要注意：把整个 `tree_data` `storeToRefs` 出去再传给子组件时，子组件 props 是 ref——当前模板里写的是 `tree_data?.length` 直接当对象用，是因为 `storeToRefs` 返回的是 ref，模板中自动 unwrap。这没有错，但**JS 内部使用时要保持 `tree_data.value` 习惯**。

---

## 3. 计算属性与 watcher

### 3.1 `rankRpSps` 在 `App.vue` 中存在重复劳动
```js
const rankRpSps = computed(() => tree_data.value.map(rankItem => {
  let total_rp = 0, total_sp = 0;
  rankItem.selected?.forEach(...)
}));
```
- 与 `usePointsSummary` 的 `totalSummary` 几乎重复地遍历 `rank.selected`。两者各自跑一次 reduce。
- 可以合并：让 `usePointsSummary` 同时返回 `byRank: { rank, total_rp_text, total_sp_text }[]`，节省一半遍历。

### 3.2 字符串化的 RP/SP
- 数据里 `rp: "54,000"`（字符串带逗号），每次合计前要 `String(val).replace(/,/g, "")`。
- 单次 ~ μs，但频繁选中、再加上多个 computed 共同消费，能省则省：**在 mountArrowPoints 阶段顺手把 rp/sp 转成数字**，再保留一个 `rp_text/sp_text` 给 UI。这样每次合计只做加法。

### 3.3 `usePointsSummary` 多余形参
- 接收 `currentPointsType` 但函数体内未使用。

### 3.4 `formatToWan` 中 `formatted > 0`
```js
const formatted = result.toFixed(2).replace(/\.?0+$/, "");
const text = formatted > 0 ? "万" : "";
```
- `formatted` 是字符串，与数字 0 做隐式比较——边界情况会出错（如 `"0.5"` 与 `0` 比较成立）。这不是性能问题，但会被频繁调用（rp/sp 变化时）。

---

## 4. 异步、API 请求与初始化加载

### 4.1 `loadLocalJSON` 串行加载
- 切换国家×军种时只 `fetch` 当前那一份 JSON。但**完全未做预取或并发预热**：用户首次加载美国陆军后，浏览德国陆军会经历完整 `mask + loading + 网络 RTT`。
- 项目内置 `concurrency=4`、`AbortController`、`task_id` 防竞态的批量请求工具（cache.js 中的 `batch_request_details`），但已不再被调用——这一套基础设施完全可以复用为"后台预取相邻数据集"。

**优化方向**：
- 启动时 `requestIdleCallback` 内异步预取最常用的 1~2 个国家 JSON（美 / 苏 / 德 ground），写进 IndexedDB 缓存。
- 单数据集 19~100KB，10 国 × 5 军种 = 50 文件总量约 ~3MB；即使一次性 prefetch 也能接受。

### 4.2 `versionIteration` 阻塞首屏
```js
onMounted(async () => {
  await versionIteration();    // ← 阻塞
  requestTreeData();
});
```
- `await fetch('/v-verify.json')` 在 onMounted 内阻塞 `requestTreeData`。`/v-verify.json` 一般极小，但若网络拥塞，首屏会延迟一个 RTT 才看到 mask。
- 改为：先发起 `requestTreeData()` 触发 mask + 渲染骨架，并行执行 `versionIteration`。如果版本不一致再 `clearTreeDataCache()` 并重新请求。

### 4.3 axios 实例的 baseURL 失效
- `request.js` 的 `baseURL: "http://localhost:3000/api"` 已经不再被实际调用方使用（`api/tree_data.js` 也没人引用）；这部分代码可以直接删除以减小 bundle。
- axios 这一份依赖 ~30KB gzipped，可裁剪。

### 4.4 `mountArrowPoints` 用了一次大深拷贝
```js
const copy_tree_data = JSON.parse(JSON.stringify(tree_data.value));
```
- 入口是缓存命中路径每次都拷一遍。完整 ground tree 数据约 80KB，深拷贝 1~2ms，可接受；但**如果 `arrow_points` 已经全部存在**，函数内的"已存在则跳过"路径还是把所有 rank、column、row 走了一遍。可以加快返回：
  ```js
  if (everyItemHasArrow(tree_data.value)) return;
  ```
- 此外 `Math.max(...allCols.map(col => col.length))` 在列数多时存在调用栈风险（一般无碍），改成 `reduce` 安全且更快。

### 4.5 `cache.js` 中保留的废弃逻辑
- `batch_request_details`、`abort_batch_request` 内部 `requestAnimationFrame(check)` 实现"可中断 sleep"——RAF 频率约 60Hz，sleep 300ms 就是 18 次回调累积。在不打开任何任务的情况下，`current_task_id` 一直为 null 时不会出现，但代码遗留容易在未来被误启用。

---

## 5. DOM、虚拟列表与样式开销

### 5.1 没有虚拟列表
- 单屏可见 ~15 张卡片，但整棵树渲染的 DOM 节点数（`wt_tree_item × ~150`）每张又有 6~10 个子节点，合计 ~1500 节点。在 1440px 宽度下 SPA 单页可接受，但与 backdrop-filter 叠加（见 5.2）会进一步拖累。
- 可使用 IntersectionObserver 把不在可视区的 rank 标记为 `content-visibility: auto;` 以让浏览器跳过其 layout/paint，单条 CSS 即可拿到不错收益。

### 5.2 backdrop-filter 与 mask-image 同时叠加
- `App.vue` 全局 `backdropFilter: blur(${blur_number}px)` + `.tree-area` 的 `-webkit-mask-image: linear-gradient(...)` + `wt-tree .backdrop-filter`（注释中有 backdrop-filter:20px，目前已注释，但 `.public-mask-` 与 `.scroll-trigger` 内 `backdrop-filter: blur(100px)` 仍在用）。
- backdrop-filter（特别是 blur 半径 60+ ）是 GPU 上较昂贵的操作，加上 `mask-image` 强制走合成层，带 video 背景时栅格化代价更高。
- 改进：
  - 模糊度通过滚动隐藏遮罩简化为 `filter: blur` 而非 `backdrop-filter`。
  - 把 mask-image 替换成"上下渐变阴影 div"模拟。

### 5.3 `.wt-tree-item::before` 伪元素背景图
- 每个 wt_tree_item（150×56）都铺一张 `/static/6417ea1848ed628c46d5.png` 作为纹理 + `opacity: 0.3`。150 张图共享同一 url 是好事（浏览器解码一次），但每张都建一个绘制层，影响 paint。
- 同理 `.wt-tree-item.prem::before` 用了 `-white.png` 副本。

### 5.4 大量内联 style 与 transition
- `wt-tree-item { transition: 0.3s; }` 是全属性过渡——意味着包括 `transform`、`box-shadow`、`opacity` 都会动画。当连续点击或全选触发 `opacity: 0.4 → 1`，会出现 150 张卡片同时启动动画，触发 GPU 大批合成。
- 建议：`transition: opacity .3s, box-shadow .3s, border-color .3s`。

### 5.5 `light_checkbox.vue` 的 96 个 div + 6 面 3D 立方体
- 灯泡复选框由 `6 face × 16 子 div` = 96 个 DOM。该组件目前在 `wt_type_tabs.vue` 中被作为"全选"按钮渲染。属于装饰性高代价组件。
- 优化：换成纯 CSS 单元素方案，或以 SVG 渲染。

### 5.6 顶栏 `total-panel::before` 无限循环动画
```css
animation: moveRight 3s ... infinite alternate;
```
- 每 3 秒一个 `left: 0% → 80%` + `filter: blur(30px)`，blur 在动画期间会让浏览器持续分配新的合成层。改为 `transform: translateX(...)` 可以让动画走 GPU 合成路径，无需重绘。

### 5.7 全局 `* { vertical-align: middle; box-sizing: border-box; }`
- 声明在 `index.css` 顶部，作用于所有元素。`vertical-align` 是 inline/table-cell 才会生效的属性，在大部分元素上仅是"无害"开销，但一旦风格库（reka-ui、element-plus）期望默认 baseline，可能产生意外的视觉错位 + 调试时间成本。
- 移除或限定到具体选择器更安全。

### 5.8 `[data-reka-popper-content-wrapper] { z-index: 1000 !important; }`
- !important + 通配符。当前看 mask 层级是 999，弹窗 1000，能用，但脆弱：未来若引入更高层级组件就要继续抬。

---

## 6. 资源加载与打包

### 6.1 字体加载
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
@font-face { font-family: "WTSymbols"; src: url("/static/symbols_skyquake.bfc9728c6a6bc73f209a.ttf"); }
@font-face { font-family: "amarurgt"; src: url("/static/amarurgt.ttf"); }
body { font-family: "WTSymbols"; }
```
- DM Sans 走 Google Fonts 国际 CDN，**国内用户首屏字体加载会卡顿**（且 v-verify.json 每次启动都要 await，叠加之下首屏体感差）。
- WTSymbols 与 amarurgt 都是大尺寸 ttf（数百 KB），未指定 `font-display: swap`。
- 建议：
  - 把 DM Sans 自托管或用 woff2 子集。
  - `@font-face { font-display: swap; }`。
  - 字体子集化（仅保留实际用到的字符）。

### 6.2 默认背景视频
- `preset_wallpapers` 中 default 是 `/static/wallpapers/default.mp4`（reel-2023.mp4 已删除）。
- 视频文件容量较大（早期项目中 reel-2023.mp4 约 5~10MB）。`<video autoplay muted loop>` 会立即下载整个文件。
- 建议：第一屏先显示纯色或低分辨率封面图，video 通过 IntersectionObserver / requestIdleCallback 延迟挂载；或者将 default 改为 image，把视频列入"高级偏好"。

### 6.3 vite 配置过于精简
位置：`vite.config.js`
```js
build: { outDir: "dist", emptyOutDir: true }
```
- 缺少 `manualChunks` 与 `target`：
  - 没有手动分包 → axios + html2canvas + modern-screenshot + element-plus + reka-ui 都打入主 bundle。
  - 没有 `build.target: 'es2020'`，默认 target=modules 已 OK，但项目里大量 `optional chaining`/`??`，需保证 target 与 node engines (`^20.19 || >=22.12`) 一致。
- 缺少 `build.rollupOptions.output.manualChunks`：建议
  ```js
  manualChunks: {
    vendor_vue: ['vue','vue-router','pinia'],
    vendor_ui: ['reka-ui', 'element-plus', '@phosphor-icons/vue'],
    vendor_screenshot: ['html2canvas','modern-screenshot'],
  }
  ```
- `Components({ resolvers: [ElementPlusResolver()] })` 自动按需引入 element-plus —— 但项目里**根本没用 element-plus 任何组件**（通篇用 reka-ui + shadcn-vue）。可以直接移除此 resolver 与依赖（详见 other_evaluation）。
- `AutoImport` 也只挂着 ElementPlusResolver，没有实际作用。

### 6.4 `html2canvas` 与 `modern-screenshot` 双工具同存
- 两个截图库总计 gzipped ~120KB，**项目里"导出图像"按钮已被 alert 替代不会执行**，纯粹是死代码。
- 建议保留一个并按需 dynamic import：
  ```js
  async function exportToImage() {
    const { exportElementToImage } = await import('@/utils/exportElementToImage');
    ...
  }
  ```

### 6.5 `vue-router`
- 路由表为空（`routes: []`），单页单视图实际用不到 router。但仍 `app.use(router)`，多打 ~5KB 进 bundle。删除即可。

### 6.6 `tw-animate-css`
- 引入了但项目实际未使用任何其内置 animate 类（grep 不到）。去除可减体积。

### 6.7 静态资源放在 `public/`
- `public/static/wallpapers/`、`public/static/main_role/*.svg`、`public/static/country_ico/*.svg` 等——`/static/...` 直接通过 fetch 拿，不参与 vite 打包指纹，不能享受长缓存（依赖手动 v-verify.json）。
- 其中 SVG 图标（main_role/country_ico）共 30+ 个，建议改为打包成 sprite 或用 `phosphor-icons/vue` 已有图标库内嵌。

---

## 7. localStorage 使用

### 7.1 写入频率高
- 每一次"选中"事件最终都会 `localStorage.setItem(key, JSON.stringify(整棵树))`。点击 10 次 = 10 次大字符串同步写入。
- localStorage 的 setItem 为同步阻塞操作，在 100KB 左右单次约 1~5ms（不同浏览器差异较大）。叠加序列化约 5~20ms。
- 建议：
  - 改为 `requestIdleCallback` 或 `setTimeout(..., 0)` 防抖（300~500ms）。
  - 或者改用 IndexedDB（异步）。

### 7.2 数据存储 50 条同结构 key
- `${country}_${type}` × 10×5 = 50 个 key。每条 19KB~100KB。localStorage 单 origin 上限 5~10MB——**若用户切换过所有国家/军种，可能逼近上限**。
- 建议合并为单一 key + 分片读，或迁 IndexedDB。

### 7.3 `clearTreeDataCache` 中双 for 循环 50 次 removeItem
- 不算瓶颈，但仍是同步 IO。

### 7.4 偏好设置存储格式不统一
- `multiple_mode` / `all_select_mode` 用 `Number(val)` 转 1/0；`bg_img` / `currentPointsType` 是字符串；`blur_number` 取出后是字符串。
- `currentPointsType` 在模板中以 `currentPointsType == 0` 比较（== 是字符串/数字隐式转换），逻辑能跑但脆弱。

---

## 8. 算法层面的重复劳动

### 8.1 `treeDataUtils` 的多次树扫描
- 单次"选中"操作的复杂度：`updateTreeItemSelected` O(N) + `instantCaching` 的 stringify O(N) + parse O(N) + 新数据 patch O(N) ≈ 4N。
- 加上 `areAllDetailsTrueInTree`（每次单击调用一次） + 两个 computed（`rankRpSps`、`totalSummary` 各 reduce 一次） = 7~8 次全树扫描/单次点击。
- 优化目标：将"选中态"独立到 Set 后，单次点击只剩 1 次 Set.add/delete + 局部 computed 取值。

### 8.2 `mountArrowPoints` 的"已经计算过则跳过"判断粒度
```js
if (item.arrow_points && typeof item.arrow_points === "object") continue;
```
- 单 item 跳过，但函数顶部依旧把整棵树深拷贝。当 100% items 都已有 arrow_points 时，仍要复制一遍并写回 localStorage——造成"切回曾访问过的国家×军种"也要走一遍序列化。可以先扫描判断是否 100% 命中，命中则只 `updateTreeData(parsed)` 不做拷贝写回。

### 8.3 `planPathToTarget2` 多次 findVehiclePosition
- `selectPresetPremiumVehicles` 对每个 preset id 都调用一次 `findVehiclePosition`，复杂度 O(P × N)。预先建立 `dataUnitId → {position}` 的索引可以降到 O(N + P)。

### 8.4 双 Map/Set 结构应在切数据时构建
- 整树路由如 `Map<data_unit_id, item>` + `Set<rank.selected.data_unit_id>` 一旦构建，所有"选中、查找、合计"都能 O(1)。当前每个操作都重新 O(N) 扫描。

---

## 9. 杂项与代码层面的小开销

- `App.vue:229` `setTimeout(() => console.log(current_bg_img), 500)` 调试 console 应清理。
- 多处 console.log（"本地缓存命中"、"无法满足 unlock_quantity" 等）在生产环境下会一直输出，`vite-plugin-vue-devtools` 已注释，但建议加 `vite-plugin-remove-console` 在 build 阶段移除。
- `wt_tree_item.vue` 中 `automaticPlanning_` 旧实现保留并注释了所有逻辑；当前用的 `automaticPlanning` 又调用 `toggleSelectColumnAbove`。两份函数共存增加维护成本与未来误用风险。
- `request.js` 的 axios 实例不再使用，但仍被 `api/tree_data.js` import—把整个 axios 包牵进 bundle。
- `storeToRefs(treeDataStore)` 与 `treeDataStore.xxx` 混用——一致性差，但与性能无关。

---

## 10. 优化优先级清单（按"投入产出比"）

| 优先级 | 项 | 预期收益 |
| ---- | --- | --- |
| P0 | 把 `instantCaching` 内部的 `stringify+parse` 循环去掉，并用防抖写 localStorage | 最直接，单击响应可下降 50~80% |
| P0 | 把"选中态"剥离为 `Set<data_unit_id>`，wt_tree_item 用 computed 取 | 杜绝整树替换引发的 patch 风暴 |
| P0 | `areAllDetailsTrueInTree` 改 computed 缓存 | 每次点击省一次 O(N) |
| P1 | `wt_tree_item` 加 `v-memo`、折叠子项延迟挂载 | 重渲染节点数量大幅下降 |
| P1 | 拆分 vendor chunks、移除 element-plus / axios / vue-router 等无用依赖、动态加载 html2canvas | 首屏 bundle 减半（粗估）|
| P1 | 字体自托管 + font-display swap + 子集化 | 首屏字体闪现/卡顿消除 |
| P2 | `mountArrowPoints` 全命中时跳过重写 | 首次切换体验提升 |
| P2 | `planPathToTarget2` 建 dataUnitId 索引 | 仅在功能启用时受益 |
| P2 | `total-panel::before` 用 transform 代替 left | 无限动画的功耗减小 |
| P3 | `light_checkbox` 改 SVG / `light_button` 也类似 | 装饰性，影响小 |
| P3 | 移除调试 console.log、未引用模块（cache.js 中的 batch_request_details） | 清理脏代码 |

---

## 11. 速查：可能造成"卡顿、响应慢、渲染阻塞"的因素

1. ✅ 单击载具 → `instantCaching` 整棵树 stringify + parse + 替换 ref → 全树重渲染（最严重）。
2. ✅ `localStorage.setItem` 同步写大 JSON。
3. ✅ `areAllDetailsTrueInTree` 每次点击都跑全树递归。
4. ✅ `wt_tree_item` 没有 `v-memo`，所有 props 引用变更后子树都进入 patch。
5. ✅ `backdrop-filter: blur(60~100px)` + 全屏 video + `mask-image` 同时叠加，合成层昂贵。
6. ✅ `light_checkbox` 96 个 div、`total-panel::before` 持续 `filter: blur(30px)` 动画。
7. ✅ 未做虚拟列表 / `content-visibility`，所有 rank 一次性 layout。
8. ✅ Google Fonts 首屏阻塞 + 大 ttf 字体未子集化、未 swap。
9. ✅ `html2canvas` + `modern-screenshot` 双截图库塞进主 bundle 但功能已关闭。
10. ✅ 残留 axios + element-plus resolver + vue-router 空路由 + cache.js 死代码。
11. ✅ `tree_data` 整树深响应 + 每个对象都被 Proxy 包装。
12. ✅ `versionIteration` 串行阻塞首屏 `requestTreeData`。
13. ✅ `App.vue:229` `setTimeout` 残留调试。
14. ✅ scroll 监听无节流。
15. ✅ `mountArrowPoints` 全命中场景仍做深拷贝并回写。
16. ✅ 频繁地把 RP/SP 字符串去逗号 → Number 转换分散在多处。
17. ✅ `rankRpSps` 与 `totalSummary` 重复遍历 selected 列表。
18. ✅ 切换国家时未 prefetch 邻近国家数据。
19. ✅ `class_name` 切换驱动 `transition: 0.3s`（全属性），全选时 150 张卡片同时动画。
20. ✅ `Components` AutoImport 仅为 element-plus 加 resolver，但 element-plus 实际未使用，仍占用编译时间与产物体积。