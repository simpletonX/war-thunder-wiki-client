document.title = `RP-Calculator v${import.meta.env.VITE_APP_VERSION}`;

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// 自定义指令全局注册
import fadeImage from "./directives/fade_image";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.directive("fade-image", fadeImage);

app.mount("#app");

// 仅在生产环境启用离线缓存，避免开发时受到旧缓存影响。
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      })
      .catch((error) => {
        console.warn("PWA Service Worker 注册失败：", error);
      });
  });
}
