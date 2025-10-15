import { watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

/**
 * 用户数据自动同步 Composable
 * 监听 userData 的变化并自动同步到后端
 */
export function useUserDataAutoSync() {
  const userStore = useUserStore()

  // 监听 userData 的深度变化
  const stopWatcher = watch(
    () => userStore.userData,
    async (newUserData, oldUserData) => {
      // 只有在用户已登录且数据确实发生变化时才同步
      if (
        !userStore.isLoggedIn ||
        userStore._isSyncing ||
        JSON.stringify(newUserData) === JSON.stringify(oldUserData)
      ) {
        return
      }

      console.log('检测到 userData 变化，准备同步到后端:', {
        old: oldUserData,
        new: newUserData,
      })

      // 调用 store 的防抖同步方法
      userStore.syncUserData()
    },
    {
      deep: true, // 深度监听对象内部变化
      flush: 'post', // 在组件更新后执行
    },
  )

  // 返回停止监听的函数
  return {
    stopAutoSync: stopWatcher,
  }
}

/**
 * 全局初始化自动同步功能
 * 在应用启动时调用一次即可
 */
export function initUserDataAutoSync() {
  const { stopAutoSync } = useUserDataAutoSync()

  console.log('用户数据自动同步功能已启用')

  // 返回停止函数，可在应用卸载时调用
  return stopAutoSync
}
