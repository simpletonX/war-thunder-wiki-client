# 其它评估

> 范围：仅基于 `src/`、`tree_data真实数据示例.json` 与根目录配置文件，对项目结构、配置、依赖、可维护性给出评估。

---

## 1. 项目结构合理性

### 1.1 总体目录划分

```
src/
├── api/                # 后端接口（已不再使用）
├── components/
│   └── ui/             # shadcn-vue 重排组件
├── composables/        # 仅 1 个 usePointsSummary
├── lib/                # cn() 工具
├── router/             # 空 routes 的 router
├── stores/             # Pinia
├── utils/              # 业务工具
├── App.vue
├── main.js
└── index.css
```

整体属于**典型的 shadcn-vue + Vue 3 模板**，可读性较好。但有几处需要调整：

- ✅ `components/` 与 `components/ui/` 区分清晰：业务组件在外、UI 原子在内。
- ✅ stores、composables、utils、api 各司其职。
- ⚠️ **`router/` 没有 routes 但 main.js 仍 `app.use(router)`** —— 单视图项目应直接移除 router，或者补全将来需要的路由（如 `#/setting`、`#/about`）。
- ⚠️ **`api/tree_data.js` 完全未被引用**，请求实例 `utils/request.js` 也不再有调用方。结构上保留"未来要用"的接口层是可以的，但代码与依赖均已死。建议：
  - 短期：在文件顶部加 `@deprecated` 注释，明确移除时间。
  - 长期：删除文件并卸载 `axios`。
- ⚠️ `utils/cache.js` 同时承担"批量请求详情"与"清空缓存"两件互不相关的事，建议拆为 `cache.js`（仅 clearTreeDataCache）+ `batch_details.js`（保留以备复用）。
- ⚠️ `composables/` 只有一个文件，且其内部函数没有用 composable 的优势（没有 onMounted/lifecycle hook）。可以下沉为 `utils/computeSummary.js`，或扩展为真正的 composable（如 `useTreeData()` 封装"切换 + 加载 + 写缓存"）。
- ⚠️ `components/` 内的 `public_mask.vue` 与 `public_mask_copy.vue` 命名暗示前者是后者的副本——名字 "_copy" 不应进生产代码。本质上 `public_mask_copy.vue` 是"用于 dialog 内部的半透明遮罩"，应改名为 `dialog_mask.vue` 或合并。
- ⚠️ `components/loading.vue` 是空文件（仅有 `<template></template>`），属于占位/弃置。建议删除或补全。
- ⚠️ `components/wt_tree_item.vue` 单文件 555 行（template + script + scoped style），"折叠子项"那一段几乎重复了顶部的卡片结构。可以拆为：
  - `wt_tree_card.vue`（150×56 卡片）
  - `wt_tree_item.vue`（卡片 + 箭头 + 折叠组）

### 1.2 命名风格

- 大量中文注释、函数名混用 snake_case / camelCase（`tree_data`、`currentVehicleType`、`toggleSelectAll_`、`automaticPlanning_`）；
- 部分函数末尾的 `_`（`toggleSelectAll_`、`automaticPlanning_`）是为了避免与外层变量冲突，但读起来含混。
- props 单词 `vt`、`pt` 含义不直观，尽管注释解释了。
- 一些 emoji 注释（`🚀`、`🛑`、`✅`）出现在生产代码中，控制台与 IDE 中实际上没有恶感，但若团队风格希望"日志可被 grep"则需要清理。

### 1.3 模块边界

- `App.vue` 承担太多职责：
  - 数据加载（`requestTreeData / cacheHit / loadLocalJSON / mountArrowPoints / versionIteration`）
  - 渲染（背景、顶栏、树主体、底部信息）
  - 计算派生（`rankRpSps`、`current_uq`、`current_bg_img`）
  - 事件分发
  - 这些在中型项目里通常会拆为 `useTreeLoader()`、`useVersion()`、`useBackground()` 等 composable，App.vue 只剩布局。
- `mountArrowPoints` 既计算了纯几何，又写回了 localStorage（mixing pure & side-effect）。建议把"几何计算"与"持久化"分离。

---

## 2. 配置文件可优化点

### 2.1 `package.json`

```jsonc
"dependencies": {
  "@phosphor-icons/vue": "^2.2.1",
  "@tailwindcss/vite": "^4.1.16",
  "@vueuse/core": "^14.3.0",
  "axios": "^1.12.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "element-plus": "^2.13.4",        // ❌ 实际未使用
  "html2canvas": "^1.4.1",          // ❌ 当前导出按钮已禁用，可动态加载
  "modern-screenshot": "^4.6.7",    // ❌ 同上
  "pinia": "^3.0.3",
  "reka-ui": "^2.9.10",
  "tailwind-merge": "^3.6.0",
  "tailwindcss": "^4.1.16",
  "vue": "^3.5.22",
  "vue-router": "^4.6.3"            // ⚠️ 未配置任何 routes
},
"devDependencies": {
  "tw-animate-css": "^1.4.0",       // ❌ 项目未使用 tw-animate 类
  "unplugin-auto-import": "^21.0.0",       // ❌ 仅给 element-plus 服务
  "unplugin-vue-components": "^31.0.0",    // ❌ 仅给 element-plus 服务
  ...
}
```

可裁剪的依赖：

| 依赖 | 状态 | 建议 |
| --- | --- | --- |
| `element-plus` | 全工程 grep 不到任何 import | 删除 |
| `axios` | 仅 `request.js` 使用，且 `request.js` 已无调用方 | 改用 fetch 或全部删除 |
| `unplugin-auto-import` + `unplugin-vue-components` | 仅 `ElementPlusResolver()` | 删除（reka-ui 不需要按需加载，shadcn-vue 直接 import） |
| `vue-router` | routes:[] | 删除 + 移除 `router/index.js` |
| `tw-animate-css` | 仅在 `index.css` `@import "tw-animate-css"` | 用到再 import 具体规则即可，移除整库 |
| `html2canvas` + `modern-screenshot` | 当前 alert 替代不会触发 | 二选一并改为动态 import |

预计可瘦身 200KB+ 已 minified gzipped。

### 2.2 `vite.config.js`

```js
export default defineConfig({
  base: "./",
  plugins: [vue(), tailwindcss(), AutoImport(...), Components(...)],
  resolve: { alias: { "@": ... } },
  build: { outDir: "dist", emptyOutDir: true },
  server: { open: true }
});
```

建议补充：

- **build.target**：`'es2020'` 或 `'esnext'`，与 `node engines >=20.19` 对齐。
- **build.sourcemap**：开发期 true，生产期 'hidden'（保留 sourcemap 便于线上排查但不暴露）。
- **build.rollupOptions.output.manualChunks**：手动分包。
- **build.cssCodeSplit**：默认 true 保留即可。
- **server.host**：本地局域网调试时需要 `host: true`。
- **server.proxy**：当后端恢复使用时方便切换。
- **define**：注入 `__APP_VERSION__` 替换 `versionIteration` 的 fetch。

### 2.3 `jsconfig.json`

```jsonc
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

- 仅有 paths，缺 `target`、`module`、`baseUrl`、`checkJs`、`jsx`。
- 推荐补全（否则 VSCode 默认推断的 ECMAScript 等级可能不对，导致编辑期报红）：

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "allowJs": true,
    "checkJs": false,
    "jsx": "preserve"
  },
  "include": ["src/**/*", "vite.config.js"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.4 `components.json` (shadcn-vue)

- 配置正确（new-york 风格、phosphor 图标库、@/components 别名）。
- 唯一可优化：`"font": "dm-sans"` —— 当前 `index.css` 通过 Google Fonts 加载，应当改为本地字体或将 dm-sans 移除。

### 2.5 `index.html`

```html
<title>War Thunder WIKI</title>
<link rel="stylesheet" href="/src/index.css" />
```

- ⚠️ `<link rel="stylesheet" href="/src/index.css" />` 是显式引入 CSS——这是 vite 中的非常规写法。通常 css 由 main.js `import './index.css'` 导入即可，能享受 HMR + 打包指纹缓存。当前这种引法在 dev 没问题，但生产 `dist/index.html` 会保留对 `/src/...` 的引用，虽然 vite 仍能处理但语义不清晰。
- 缺少 `<meta name="description">`、`<meta name="theme-color">`、`<meta charset>`（已有 UTF-8）但缺 og 标签。
- `<html lang="">` 应为 `lang="zh-CN"` 或 `lang="en"`（项目存在中英混排 UI）。
- `<body class="dark">` 是硬编码主题——若未来支持白天主题需要改写，建议放在 main.js 里根据偏好挂载。

### 2.6 `index.css`

- @import url(googleapis) 阻塞首屏（见 performance.md）。
- `* { vertical-align: middle; box-sizing: border-box; }` 通配符样式过广。
- 重复声明：`.dark` 在文件中出现两次（39 行的 `--popover/--accent/--input` 与 140 行后的完整 dark 主题），合并到一处更清晰。

### 2.7 `tailwind.config.*` 缺失

- 项目使用 Tailwind v4（`@tailwindcss/vite`），配置走 CSS `@theme inline` 方式。这是 v4 的新方式，能用，但部分团队仍习惯 `tailwind.config.js`。当前已通过 `@theme inline` 与 `@custom-variant dark` 满足需要，若未来引入 plugin（如 typography）则需要新建。

### 2.8 `.gitignore`

- 文件 385 字节（默认 vite 模板），未检查具体内容；建议确保至少：
  ```
  dist/
  node_modules/
  .DS_Store
  *.log
  .vite/
  .env*
  !.env.example
  ```
- 同时把 `tree_data真实数据示例.json` 与本次生成的 `doc/` 是否随仓库提交需要团队约定。

### 2.9 一键启动脚本

- `一键启动.bat` / `一键启动.command` —— 给非前端同事提供快速入口是好事，但要注意：
  - `.bat` 在 macOS 下不可用；
  - `.command` 在 Linux 下不可用；
  - 建议用 `npm run dev` + 文档说明替代。
- 另外项目根目录的中文文件名在 git checkout 跨平台时偶有编码问题。

### 2.10 `prebuild/v-verify.cjs`

- `npm run build` 前执行 `prebuild`，从代码看应该是写入 `public/v-verify.json` 的版本时间戳——这套机制运转良好，建议在 README 中明确"版本号格式 / 触发清缓存的条件"。

---

## 3. 依赖冗余或可替换方案

### 3.1 截图库二选一

| 项 | 优势 | 劣势 |
| --- | --- | --- |
| `html2canvas` | 历史悠久、文档多 | 体积大、复杂 CSS 渲染失真常见 |
| `modern-screenshot` | 体积小、API 简洁、对 mask-image 支持更好 | 较新、生态文档少 |

考虑到本项目存在大量 backdrop-filter / mask-image，**推荐保留 modern-screenshot**，移除 html2canvas。

### 3.2 element-plus 可彻底删除

- shadcn-vue (reka-ui) 已经覆盖 Select / Checkbox / Tooltip / NumberField / Label。
- 删除后 `unplugin-auto-import` 与 `unplugin-vue-components` 也可移除。

### 3.3 axios → fetch / ofetch

- 项目仅做"GET JSON 文件"，fetch 完全够用。
- 若担心 timeout 与拦截器，引入 ofetch（~7KB）替代 axios（~30KB）。

### 3.4 `@vueuse/core` 使用率

- 仅用了 `reactiveOmit`（在 ui/checkbox/Checkbox.vue 中）。
- 14.3 版本完整包压缩后约 50KB。建议改为按需 import（vite tree-shaking 已经会做，但显式 import 让产物可读性更高）。

### 3.5 `@phosphor-icons/vue` 使用率

- 仅用 `PhCheck`、`PhWarningCircle` 两个图标。
- 库内部按需导入足够轻量；继续保留可。但若图标使用面继续受限，直接内联 SVG 可消除依赖。

### 3.6 `pinia` + Composition store

- 用得正确，无可替代建议。`pinia` 体积小、API 直观。

### 3.7 `tailwind-merge` + `clsx` + `class-variance-authority`

- shadcn-vue 标配。当前 ui 组件依赖 `cn()`（`tailwind-merge(clsx(inputs))`）。
- `class-variance-authority` 在源码中是否被使用？grep 一下：仅 shadcn-vue 生成的 `ui/` 文件夹的部分组件可能用到。如果未使用 `cva()` 的组件较多，可考虑去除。

### 3.8 `tw-animate-css` 删除

- 项目里 `index.css` 仅 `@import "tw-animate-css"`，无具体 `animate-*` 类应用 → 直接移除。

### 3.9 `vue-router` 删除（前提是不再支持路由）

- 当前 `router/index.js` routes:[]、main.js `app.use(router)`，删除后 bundle 减小、心智负担降低。
- 若未来要做"偏好设置子页"或"详情页"，再引入。

---

## 4. 可维护性与代码质量

### 4.1 重复字典

- `country_code_texts` 同时存在于：
  - `src/utils/dict.js`
  - `src/components/wt_country_tabs.vue`（30 行的 `const country_code_texts = { ... }`，与 dict 完全重复）
- 后者可以删除并 import 自 dict.js。

### 4.2 死代码

- `wt_tree_item.vue` 内 `automaticPlanning_`（旧实现）保留并被新函数 `automaticPlanning` 替代。
- `App.vue` 的 `clearCache` 注释掉的旧实现仍在文件中。
- `cache.js` 的 `batch_request_details` / `abort_batch_request` 不再被调用。
- `wt_type_tabs.vue` 的 `toggleBgVisible` 函数定义了但没绑定到任何事件。
- `loading.vue` 是空文件。

### 4.3 错误处理不完善

- `request.js` 拦截器里 `console.warn`／`console.error`，没有对调用方暴露统一的错误对象。
- `loadLocalJSON` 在 fetch 失败时 `throw new Error(...)`，但 App.vue 里 `requestTreeData` 没有 try/catch，失败时 mask 不会被关闭——用户看不到任何提示，仅控制台报错。
- `versionIteration` 同样没有 catch（fetch /v-verify.json 失败时 onMounted 异步链就断了）。

### 4.4 无类型检查、无 lint、无 test

- 项目没有 TypeScript、ESLint、Prettier、Vitest 配置。
- 中等规模项目长期维护建议至少补：
  - `eslint` + `eslint-plugin-vue` 防止"未使用变量""响应式失效"等常见错误；
  - `prettier` 统一格式（避免后续缩进/分号差异引入大 PR）；
  - `vitest` + `@vue/test-utils` 至少覆盖 `treeDataUtils.js`、`mountArrowPoints.js`、`planPathToTarget2.js` 这三块纯函数算法。
- 依赖运行时为 Node `^20.19 || >=22.12` —— 与 Vite 7.x、Vue 3.5、Pinia 3、Tailwind 4 兼容性 OK。

### 4.5 国际化

- UI 文案中英混排（"等待服务器数据响应中..."、"Please wait for the details request to be completed."）。建议引入 vue-i18n 或至少抽出一份 `locales` 字典统一管理。

### 4.6 可访问性 (a11y)

- 大部分按钮是 `<div class="cursor-pointer" @click>`，缺少 role、aria-label、键盘可达性。
- `cir_tabs.vue` 用了 `role="tablist"` 与 `role="tab"`，做得不错，但没有 `aria-selected`。
- 全局 `<img>` 缺少 `alt`，对截图工具与屏幕阅读器都不友好。

### 4.7 SEO

- 旧 `doc/小红书SEO优化.md` 等已被 git 标记为删除。仍可在 `index.html` 中补 meta description / og:image，方便分享卡片。

### 4.8 文档与注释

- 函数级 JSDoc 多处存在且精到（mountArrowPoints、updateTreeItemSelected）。
- 顶层 README 仅 1KB，建议扩充：环境要求、目录约定、版本号机制、缓存策略、贡献流程。

---

## 5. 总体打分

| 维度 | 评分 | 说明 |
| --- | --- | --- |
| 业务逻辑清晰度 | ★★★★☆ | 单视图 + 单一数据源 + 静态 JSON，模型简洁。 |
| 可维护性 | ★★★☆☆ | 代码量适中但重复字典、死代码、命名不一致积累中。 |
| 可扩展性 | ★★★☆☆ | 没有 router、没有按域拆分；新增"对比模式 / 历史 / 收藏"会需要架构调整。 |
| 性能 | ★★☆☆☆ | 主要被 `instantCaching` 整树替换 + 全树深响应拖慢，加上 backdrop-filter 与字体阻塞。 |
| 工程基建 | ★★☆☆☆ | 无 lint / test / TS / CI；配置文件留有大量未启用项。 |
| 依赖管理 | ★★★☆☆ | 选型合理但有 1/3 是死/重复依赖。 |

---

## 6. 短中长期改进建议

**短期（1~2 天）**
1. 删除 element-plus、axios、vue-router、tw-animate-css、unplugin-auto-import / unplugin-vue-components。
2. 清理死代码：`api/`、`request.js`、`cache.js` 内的 batch、`automaticPlanning_`、`loading.vue`、`public_mask_copy.vue` 重命名。
3. 统一 country_code_texts 字典。
4. 字体自托管 + font-display swap。
5. 关闭/移除生产 console。

**中期（1~2 周）**
1. 实施 `instantCaching` 重构 + `selectedSet` 独立选中态（performance.md P0 项）。
2. 拆 App.vue / wt_tree_item.vue。
3. vite manualChunks + 动态加载 html2canvas。
4. 加 ESLint + Prettier + Vitest，覆盖三大算法。
5. 补错误处理与全局 toast。

**长期（持续）**
1. 渐进式迁 TypeScript（先 utils 后 stores 后 components）。
2. 引入 i18n、a11y 全面整改。
3. localStorage → IndexedDB（idb-keyval），并支持服务端同步。
4. 评估是否要把"科技树渲染"做成可发布 npm 子包，以便其他社区项目复用（同等数据格式）。