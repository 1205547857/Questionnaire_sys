import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initUserDataAutoSync } from '@/composables/useUserDataAutoSync'
import { initializeAuth } from '@/utils/authInit'

// 扩展Window类型
declare global {
  interface Window {
    onVueAppMounted?: () => void
  }
}

// 检查是否为独立页面（问卷填写）
const isStandalonePage = window.location.pathname.startsWith('/form/')

if (isStandalonePage) {
  // 为独立页面移除可能影响的全局样式
  document.body.classList.add('standalone-page')

  // 立即显示应用，避免闪烁
  document.getElementById('app')?.classList.add('initialized')
}

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 应用挂载后初始化
app.mount('#app')

// 通知应用已挂载
if (window.onVueAppMounted) {
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    window.onVueAppMounted?.()
  })
} else {
  // 备用方案
  setTimeout(() => {
    window.onVueAppMounted?.()
  }, 100)
}

// 只在非独立页面初始化这些功能
if (!isStandalonePage) {
  // 初始化用户数据自动同步功能
  initUserDataAutoSync()

  // 初始化认证检查（自动登录）
  initializeAuth()
}
