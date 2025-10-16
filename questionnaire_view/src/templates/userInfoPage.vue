<template>
  <div class="user-center-container">
    <div class="user-center-card">
      <div class="card-header">
        <h1 class="page-title">
          <i class="fas fa-user-circle"></i>
          User Center
        </h1>
      </div>

      <div class="card-content">
        <div class="info-section">
          <h5 class="section-title">Personal Information</h5>

          <!-- Username Field -->
          <div class="form-group">
            <label class="field-label">Username:</label>
            <div class="field-content">
              <span v-if="!editing" class="display-value">{{ userStore.username }}</span>
              <input v-else v-model="updatedUsername" type="text" class="form-input"
                placeholder="Enter your username" />
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label class="field-label">Email:</label>
            <div class="field-content">
              <span v-if="!editing" class="display-value">{{ userStore.email }}</span>
              <input v-else v-model="updatedEmail" type="email" class="form-input" placeholder="Enter your email" />
            </div>
          </div>

          <!-- Password Field -->
          <div v-if="editing" class="form-group">
            <label class="field-label">New Password:</label>
            <div class="field-content">
              <input v-model="newPassword" type="password" class="form-input" :class="{ 'error': passwordError }"
                placeholder="Enter new password (optional)" @input="validatePassword(newPassword)" />
              <div v-if="passwordError" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ passwordError }}
              </div>
            </div>
          </div>

          <!-- Role Field -->
          <div class="form-group">
            <label class="field-label">Role:</label>
            <div class="field-content">
              <span class="role-badge" :class="`role-${userStore.role}`">{{ userStore.role }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-section">
          <button v-if="!editing" class="btn btn-edit" @click="startEditing">
            <i class="fas fa-edit"></i>
            Edit Profile
          </button>
          <div v-else class="button-group">
            <button class="btn btn-save" @click="saveChanges" :disabled="!canSave || isLoading">
              <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isLoading ? '正在保存...' : 'Save Changes' }}
            </button>
            <button class="btn btn-cancel" @click="cancelEditing">
              <i class="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/userStore';
import { ref, computed } from 'vue';
import { updateUserInfo } from '../scripts/userUpdate';
const userStore = useUserStore();
const editing = ref(false);
const updatedEmail = ref(userStore.email);
const updatedUsername = ref(userStore.username);
const newPassword = ref('');
const passwordError = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// 清除消息
function clearMessages() {
  successMessage.value = '';
  errorMessage.value = '';
}

// 显示成功消息
function showSuccess(message: string) {
  clearMessages();
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
}

// 显示错误消息
function showError(message: string) {
  clearMessages();
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, 8000);
}

// 验证新密码
function validatePassword(password: string): boolean {
  // 检查是否为空、只包含空格或无效字符
  if (!password || password.trim() === '') {
    passwordError.value = 'Password cannot be empty or contain only spaces';
    return false;
  }
  // 检查密码长度
  if (password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long';
    return false;
  }
  // 检查是否包含空格
  if (password.includes(' ')) {
    passwordError.value = 'Password cannot contain spaces';
    return false;
  }
  passwordError.value = '';
  return true;
}

// 计算保存按钮是否可用
const canSave = computed(() => {
  if (!editing.value) return true;
  if (newPassword.value && !validatePassword(newPassword.value)) {
    return false;
  }
  return true;
});

function saveChanges() {
  // 清除之前的消息
  clearMessages();

  // 最终验证新密码
  if (newPassword.value && !validatePassword(newPassword.value)) {
    showError('请先修复密码错误再保存。');
    return;
  }

  isLoading.value = true;

  updateUserInfo(userStore.userId, updatedEmail.value, updatedUsername.value, newPassword.value, userStore.userData)
    .then((success) => {
      if (success) {
        userStore.username = updatedUsername.value;
        userStore.email = updatedEmail.value;
        editing.value = false;
        newPassword.value = '';
        showSuccess('用户信息更新成功！您的资料已保存。');
      } else {
        showError('更新失败，请检查您的旧密码是否正确，或稍后再试。');
      }
    })
    .catch((error) => {
      console.error('Error updating user information:', error);
      showError('网络错误，无法连接到服务器，请检查网络连接后重试。');
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function startEditing() {
  clearMessages();
  editing.value = true;
  updatedUsername.value = userStore.username;
  updatedEmail.value = userStore.email;
}

function cancelEditing() {
  clearMessages();
  editing.value = false;
  updatedUsername.value = userStore.username;
  updatedEmail.value = userStore.email;
  newPassword.value = '';
  passwordError.value = '';
}
</script>

<style scoped>
/* 主容器样式 */
.user-center-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  min-height: calc(100vh - 4rem);
}

/* 主卡片样式 */
.user-center-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 0 auto;
  max-width: 800px;
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
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.page-title i {
  font-size: 2.2rem;
}

/* 卡片内容 */
.card-content {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e3f2fd;
  padding-bottom: 0.5rem;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 1.5rem;
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

.display-value {
  display: inline-block;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-input.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* 角色徽章 */
.role-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-guest {
  background: #ecf0f1;
  color: #7f8c8d;
}

.role-user {
  background: #e3f2fd;
  color: #1976d2;
}

.role-admin {
  background: #fff3e0;
  color: #f57c00;
}

/* 按钮区域 */
.action-section {
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

/* 消息提示样式 */
.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-message {
  color: #155724;
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05));
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.error-message {
  color: #721c24;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-width: 120px;
  justify-content: center;
}

.btn-edit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
}

.btn-save {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(86, 171, 47, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-cancel {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%);
  color: white;
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-center-container {
    padding: 1rem;
    min-height: calc(100vh - 2rem);
  }

  .card-content {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .button-group {
    flex-direction: column;
    gap: 0.8rem;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .user-center-container {
    padding: 0.5rem;
    min-height: calc(100vh - 1rem);
  }

  .user-center-card {
    border-radius: 15px;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>
