import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
// import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    // vueDevTools(),
    tailwindcss(),
    // 自动导入 API
    AutoImport({
      resolvers: [],
    }),
    // 自动导入组件
    Components({
      resolvers: [],
    }),
    // visualizer({
    //   filename: "./doc/dependency-graph.html",
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
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
    open: true,
    // host: true,
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**"],
    },
    historyApiFallback: true
  },
});
