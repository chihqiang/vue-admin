import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// 开发环境：引入 mock（拦截 axios 请求，模拟后端接口）
// 必须在 App 初始化之前导入，避免 store 中请求早于 mock 注册导致 404
import './mock'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
