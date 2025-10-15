<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card-header">
        <h1 class="page-title">
          <i class="fas fa-user-plus"></i>
          注册账号
        </h1>
      </div>

      <div class="card-content">
        <form @submit.prevent="register" class="auth-form">
          <div class="form-group">
            <label class="field-label">用户名:</label>
            <div class="field-content">
              <input type="text" v-model="username" class="form-input" placeholder="请输入用户名" required />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">邮箱:</label>
            <div class="field-content">
              <input type="email" v-model="email" class="form-input" placeholder="请输入邮箱地址" required />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">密码:</label>
            <div class="field-content">
              <input type="password" v-model="password" class="form-input" placeholder="请输入密码" required />
            </div>
          </div>

          <div class="action-section">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-user-plus"></i>
              {{ isLoading ? '正在注册...' : '注册' }}
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
import { register } from '@/scripts/register';
export default {
  data() {
    return {
      username: '',
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
    validateForm() {
      // 验证用户名
      if (!this.username.trim()) {
        this.errorMessage = '请输入用户名'
        return false
      }

      if (this.username.length < 2) {
        this.errorMessage = '用户名长度不能少于2位字符'
        return false
      }

      if (this.username.length > 20) {
        this.errorMessage = '用户名长度不能超过20位字符'
        return false
      }

      // 验证邮箱
      if (!this.email.trim()) {
        this.errorMessage = '请输入邮箱地址'
        return false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errorMessage = '请输入正确的邮箱格式'
        return false
      }

      // 验证密码
      if (!this.password.trim()) {
        this.errorMessage = '请输入密码'
        return false
      }

      if (this.password.length < 6) {
        this.errorMessage = '密码长度不能少于6位'
        return false
      }

      if (this.password.includes(' ')) {
        this.errorMessage = '密码不能包含空格'
        return false
      }

      return true
    },
    async register() {
      this.clearMessages()

      if (!this.validateForm()) {
        return
      }

      this.isLoading = true

      try {
        const result = await register(this.username, this.email, this.password)
        if (result) {
          this.successMessage = '注册成功！正在跳转到登录页面...'
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } else {
          this.errorMessage = '注册失败，该邮箱可能已被注册，请更换邮箱后重试'
        }
      } catch (error) {
        console.error('Register error:', error)
        this.errorMessage = '网络错误，请检查网络连接后重试'
      } finally {
        this.isLoading = false
      }
    },
  }
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
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
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
  border-color: #56ab2f;
  box-shadow: 0 0 0 3px rgba(86, 171, 47, 0.1);
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
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(86, 171, 47, 0.3);
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

/* 错误消息样式优化 */
.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
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
