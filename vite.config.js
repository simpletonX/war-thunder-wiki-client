import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    // vueDevTools(),
    tailwindcss(),
    // 自动导入 API
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    visualizer({
      filename: './doc/dependency-graph.html', // 输出文件
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    open: true
  }
});
