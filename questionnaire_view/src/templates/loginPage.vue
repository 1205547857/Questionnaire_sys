<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card-header">
        <h1 class="page-title">
          <i class="fas fa-sign-in-alt"></i>
          登录
        </h1>
      </div>

      <div class="card-content">
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="field-label" for="email">邮箱:</label>
            <div class="field-content">
              <input id="email" v-model="email" type="email" class="form-input" placeholder="请输入邮箱地址" required />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="password">密码:</label>
            <div class="field-content">
              <input id="password" v-model="password" type="password" class="form-input" placeholder="请输入密码" required />
            </div>
          </div>

          <div class="action-section">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-sign-in-alt"></i>
              {{ isLoading ? '正在登录...' : '登录' }}
            </button>
          </div>
        </form>

        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { login } from '../scripts/login'
export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      successMessage: '',
      isLoading: false
    }
  },
  methods: {
    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    },
    async handleLogin() {
      this.clearMessages()

      // 表单验证
      if (!this.email.trim()) {
        this.errorMessage = '请输入邮箱地址'
        return
      }

      if (!this.password.trim()) {
        this.errorMessage = '请输入密码'
        return
      }

      if (this.password.length < 6) {
        this.errorMessage = '密码长度不能少于6位'
        return
      }

      this.isLoading = true

      try {
        const result = await login(this.email, this.password)
        if (result) {
          this.successMessage = '登录成功！正在跳转...'
          setTimeout(() => {
            this.$router.push('/')
          }, 1500)
        } else {
          this.errorMessage = '登录失败，请检查您的邮箱和密码是否正确'
        }
      } catch (error) {
        console.error('Login error:', error)
        this.errorMessage = '网络错误，请检查网络连接后重试'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
<style scoped>
/* 主容器样式 */
.auth-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* 主卡片样式 */
.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 450px;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片头部 */
.card-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 2rem;
  text-align: center;
}

.page-title {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.page-title i {
  font-size: 2rem;
}

/* 卡片内容 */
.card-content {
  padding: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 表单组样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #34495e;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}

.field-content {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
  background: white;
}

.form-input::placeholder {
  color: #a0a0a0;
}

/* 按钮区域 */
.action-section {
  margin-top: 1rem;
  text-align: center;
}

.btn {
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-width: 150px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 成功消息样式 */
.success-message {
  color: #27ae60;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 1rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 0.5rem;
  }

  .auth-card {
    border-radius: 15px;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>
