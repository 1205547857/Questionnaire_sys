<template>
  <div class="auth-status">
    <div class="status-card">
      <h3>
        <i class="fas fa-shield-alt"></i>
        认证状态监控
      </h3>

      <div class="status-info">
        <div class="info-item">
          <label>登录状态:</label>
          <span :class="loginStatusClass">{{ loginStatusText }}</span>
        </div>

        <div class="info-item">
          <label>Token状态:</label>
          <span :class="tokenStatusClass">{{ tokenStatusText }}</span>
        </div>

        <div class="info-item" v-if="userStore.isLoggedIn">
          <label>用户信息:</label>
          <span class="user-info">{{ userStore.username }} ({{ userStore.email }})</span>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="checkAuth" class="btn btn-primary">
          <i class="fas fa-sync-alt"></i>
          重新检查认证
        </button>

        <button @click="forceReauth" class="btn btn-warning">
          <i class="fas fa-redo"></i>
          强制重新认证
        </button>

        <button v-if="userStore.isLoggedIn" @click="logout" class="btn btn-danger">
          <i class="fas fa-sign-out-alt"></i>
          登出
        </button>
      </div>

      <div class="auth-logs" v-if="authLogs.length > 0">
        <h4>认证日志</h4>
        <div class="log-container">
          <div v-for="(log, index) in authLogs.slice(-5)" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { autoLogin, checkTokenValidity } from '@/scripts/login'
import { getAuthToken } from '@/utils/cookies'

const userStore = useUserStore()

// 认证日志
interface AuthLog {
  time: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

const authLogs = ref<AuthLog[]>([])

// 添加日志
function addLog(message: string, type: AuthLog['type'] = 'info') {
  const now = new Date()
  const time = now.toLocaleTimeString()
  authLogs.value.push({ time, message, type })
}

// 计算属性
const loginStatusClass = computed(() => ({
  'status-success': userStore.isLoggedIn,
  'status-error': !userStore.isLoggedIn
}))

const loginStatusText = computed(() =>
  userStore.isLoggedIn ? '已登录' : '未登录'
)

const tokenStatusClass = computed(() => {
  const hasToken = !!getAuthToken()
  return {
    'status-success': hasToken,
    'status-error': !hasToken
  }
})

const tokenStatusText = computed(() => {
  const token = getAuthToken()
  return token ? '存在' : '不存在'
})

// 方法
async function checkAuth() {
  addLog('开始检查认证状态...', 'info')

  try {
    const token = getAuthToken()
    if (!token) {
      addLog('未找到 Token', 'warning')
      return
    }

    const userData = await checkTokenValidity(token)
    if (userData) {
      addLog('Token 验证成功', 'success')
    } else {
      addLog('Token 验证失败', 'error')
    }
  } catch (error) {
    addLog(`认证检查失败: ${error}`, 'error')
  }
}

async function forceReauth() {
  addLog('强制重新认证...', 'info')

  try {
    const success = await autoLogin()
    if (success) {
      addLog('重新认证成功', 'success')
    } else {
      addLog('重新认证失败', 'error')
    }
  } catch (error) {
    addLog(`重新认证出错: ${error}`, 'error')
  }
}

function logout() {
  addLog('用户手动登出', 'info')
  userStore.logout()
  addLog('登出完成', 'success')
}

// 组件挂载时的初始化
onMounted(() => {
  addLog('认证状态组件已加载', 'info')

  if (userStore.isLoggedIn) {
    addLog(`当前用户: ${userStore.username}`, 'success')
  }

  const token = getAuthToken()
  if (token) {
    addLog('发现已保存的 Token', 'info')
  }
})
</script>

<style scoped>
.auth-status {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.status-card h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}

.status-card h3 i {
  margin-right: 0.5rem;
}

.status-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-weight: bold;
}

.status-success {
  color: #4ade80;
  font-weight: bold;
}

.status-error {
  color: #f87171;
  font-weight: bold;
}

.user-info {
  color: #fbbf24;
}

.action-buttons {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(45deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.auth-logs {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
}

.auth-logs h4 {
  margin-bottom: 0.8rem;
  color: #fbbf24;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 0.8rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #94a3b8;
  min-width: 80px;
}

.log-item.success {
  color: #4ade80;
}

.log-item.error {
  color: #f87171;
}

.log-item.warning {
  color: #fbbf24;
}

.log-item.info {
  color: #60a5fa;
}
</style>
