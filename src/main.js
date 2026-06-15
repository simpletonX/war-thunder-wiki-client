import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
// import router from './router'
// 自定义指令全局注册
import fadeImage from './directives/fade_image'

const app = createApp(App)

app.use(createPinia())
// app.use(router)
app.directive('fade-image', fadeImage)

app.mount('#app')