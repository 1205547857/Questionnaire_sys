<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { useUserStore } from '../stores/userStore';
const router = useRouter();
const sites = ref([
  {
    id: 1, name: 'question_center', showDropdown: false, list: [
      { id: '1-1', name: 'question_center_create' },
      { id: '1-2', name: 'question_center_my' },
      { id: '1-3', name: 'question_center_shared' },
    ]
  },
  {
    id: 2, name: 'questionnaire_model', showDropdown: false, list: [
      { id: '2-1', name: 'questionnaire_model_create' },
      { id: '2-2', name: 'questionnaire_model_my' },
    ]
  },
  {
    id: 3, name: 'questionnaire', showDropdown: false, list: [
      { id: '3-1', name: 'questionnaire_create' },
      { id: '3-2', name: 'questionnaire_my' },
    ]
  },
]);
function goToPage(siteName: string) {
  router.push({ name: siteName });
}
const sidebarOpen = ref(true);
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
watch(
  () => useUserStore().isLoggedIn,
  (newVal) => {
    console.log('User login status changed:', newVal);
  }
);


</script>

<template>
  <!-- Sidebar -->
  <div class="main-container">
    <nav class="modern-nav vh-100 position-relative" :class="{ 'collapsed': !sidebarOpen }"
      :style="sidebarOpen ? 'width: 280px; transition: width 0.3s;' : 'width: 70px; transition: width 0.3s;'">
      <!-- Navigation Header -->
      <div class="nav-header">
        <h2 v-show="sidebarOpen" class="nav-title">
          <i class="fas fa-th-large"></i>
          Questionnaire
        </h2>
        <button class="nav-toggle-btn" @click="toggleSidebar" aria-label="Toggle sidebar">
          <i class="fas" :class="sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </button>
      </div>
      <!-- Navigation Links -->
      <div class="nav-content" v-show="sidebarOpen">
        <ul class="nav-menu">
          <li v-for="site in sites" :key="site.id" class="nav-item">
            <a href="javascript:void(0)" class="nav-link modern-nav-link"
              @click="site.showDropdown = !site.showDropdown">
              <i class="fas fa-folder nav-icon"></i>
              <span class="nav-text">{{ site.name }}</span>
              <i class="dropdown-arrow fas fa-chevron-right" :class="{ 'rotated': site.showDropdown }"></i>
            </a>
            <transition name="dropdown">
              <ul v-if="site.showDropdown" class="dropdown-menu-custom">
                <li class="dropdown-item-custom" v-for="listItem in site.list" :key="listItem.id"
                  @click="goToPage(listItem.name)">
                  <i class="fas fa-file-alt"></i>
                  <span>{{ listItem.name }}</span>
                </li>
              </ul>
            </transition>
          </li>
        </ul>

        <!-- User Section -->
        <div class="nav-footer">
          <div v-if="useUserStore().isLoggedIn" class="user-section">
            <router-link to="/userInfo" class="user-link">
              <i class="fas fa-user-circle"></i>
              <span>User Center</span>
            </router-link>
          </div>
          <div v-else class="auth-links">
            <router-link to="/login" class="auth-link login-link">
              <i class="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </router-link>
            <router-link to="/register" class="auth-link register-link">
              <i class="fas fa-user-plus"></i>
              <span>Register</span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    <div class="router-view">
      <router-view />
    </div>
  </div>
</template>
<style scoped>
/* 主容器样式 */
.main-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
}

/* 修复router-view样式，移除白边 */
.router-view {
  flex-grow: 1;
  overflow-y: auto;
  background: transparent;
  margin: 0;
  padding: 0;
}

/* 现代化导航样式 */
.modern-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-right: none;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* 导航头部 */
.nav-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

/* 导航头部基础样式 */
.nav-header {
  position: relative;
}

.nav-title {
  color: white;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-title i {
  font-size: 1.6rem;
}

.nav-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-toggle-btn i {
  font-size: 1.1rem;
}

/* 导航内容 */
.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-item {
  margin-bottom: 0.3rem;
}

.modern-nav-link {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  color: #34495e;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  margin: 0 0.5rem;
  border-radius: 10px;
  font-weight: 500;
}

.modern-nav-link:hover {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05));
  color: #4facfe;
  transform: translateX(5px);
  text-decoration: none;
}

.nav-icon {
  width: 20px;
  text-align: center;
  margin-right: 0.8rem;
  font-size: 1rem;
}

.nav-text {
  flex: 1;
  font-size: 0.95rem;
}

/* 下拉箭头样式 */
.dropdown-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
  color: #6c757d;
}

.dropdown-arrow.rotated {
  transform: rotate(90deg);
  color: #4facfe;
}

/* 自定义下拉菜单样式 */
.dropdown-menu-custom {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  background: rgba(79, 172, 254, 0.05);
  border-radius: 8px;
  border-left: 3px solid #4facfe;
  margin-left: 1.5rem;
  margin-right: 0.5rem;
  overflow: hidden;
}

.dropdown-item-custom {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  gap: 0.6rem;
}

.dropdown-item-custom:hover {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.1));
  color: #4facfe;
  padding-left: 1.5rem;
}

.dropdown-item-custom i {
  font-size: 0.8rem;
  width: 16px;
  text-align: center;
  color: #6c757d;
}

.dropdown-item-custom:hover i {
  color: #4facfe;
}

/* 导航底部 */
.nav-footer {
  padding: 1rem;
  border-top: 1px solid rgba(79, 172, 254, 0.1);
  margin-top: auto;
}

/* 用户部分 */
.user-section {
  margin-bottom: 0.5rem;
}

.user-link {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
  gap: 0.6rem;
}

.user-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
  color: white;
  text-decoration: none;
}

.user-link i {
  font-size: 1.2rem;
}

/* 认证链接 */
.auth-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-link {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  gap: 0.6rem;
  font-size: 0.9rem;
}

.login-link {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 172, 254, 0.3);
  color: white;
  text-decoration: none;
}

.register-link {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
}

.register-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(86, 171, 47, 0.3);
  color: white;
  text-decoration: none;
}

.auth-link i {
  font-size: 1rem;
}

/* 保留原有的下拉动画 */
.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scaleY(0) translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0) translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}

/* 折叠状态下隐藏内容区域 - 使用更好的方法 */
.modern-nav {
  position: relative;
}

.modern-nav.collapsed .nav-content {
  display: none;
}

/* 确保折叠时侧边栏的最小宽度和样式 */
.modern-nav.collapsed {
  min-width: 70px;
  overflow: hidden;
}

.modern-nav.collapsed .nav-header {
  padding: 1rem 0.5rem;
  justify-content: center;
}

.modern-nav.collapsed .nav-toggle-btn {
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modern-nav {
    position: fixed;
    height: 100vh;
    z-index: 1000;
  }

  .nav-title {
    font-size: 1.2rem;
  }

  /* 移动端下的按钮调整 */
  .nav-toggle-btn.collapsed-btn {
    position: static;
    transform: none;
  }

  .nav-toggle-btn.collapsed-btn:hover {
    transform: scale(1.05);
  }
}
</style>
