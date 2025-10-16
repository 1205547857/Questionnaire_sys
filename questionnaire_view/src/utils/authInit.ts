import { autoLogin } from '@/scripts/login'
import { useUserStore } from '@/stores/userStore'

/**
 * 应用初始化 - 自动登录检查
 * 在应用启动时调用，检查是否有有效的 token 并自动登录
 */
export async function initializeAuth(): Promise<void> {
  console.log('Initializing authentication...')

  try {
    const userStore = useUserStore()

    // 如果用户已经登录，跳过自动登录
    if (userStore.isLoggedIn) {
      console.log('User already logged in, skipping auto login')
      return
    }

    // 尝试自动登录
    const success = await autoLogin()

    if (success) {
      console.log('Auto login successful')
    } else {
      console.log('Auto login failed or no valid token found')
    }
  } catch (error) {
    console.error('Authentication initialization failed:', error)
  }
}

/**
 * 页面加载时的认证检查
 * 可以在路由守卫中使用
 */
export async function checkAuthOnPageLoad(): Promise<boolean> {
  console.log('Checking authentication on page load...')

  try {
    const userStore = useUserStore()

    // 如果已经登录，返回 true
    if (userStore.isLoggedIn) {
      return true
    }

    // 尝试自动登录
    return await autoLogin()
  } catch (error) {
    console.error('Page load auth check failed:', error)
    return false
  }
}
