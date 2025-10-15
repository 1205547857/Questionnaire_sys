<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const adminSites = ref([
  {
    id: 1, name: '用户管理', showDropdown: false, list: [
      { id: '1-1', name: 'admin_user_list', displayName: '用户列表' },
      { id: '1-2', name: 'admin_user_statistics', displayName: '用户统计' },
    ]
  },
  {
    id: 2, name: '问卷管理', showDropdown: false, list: [
      { id: '2-1', name: 'admin_questionnaire_list', displayName: '所有问卷' },
      { id: '2-2', name: 'admin_questionnaire_statistics', displayName: '问卷统计' },
      { id: '2-3', name: 'admin_questionnaire_audit', displayName: '问卷审核' },
    ]
  },
  {
    id: 3, name: '系统管理', showDropdown: false, list: [
      { id: '3-1', name: 'admin_system_settings', displayName: '系统设置' },
      { id: '3-2', name: 'admin_system_logs', displayName: '系统日志' },
      { id: '3-3', name: 'admin_backup', displayName: '数据备份' },
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

// 退出管理员模式，返回普通用户界面
function exitAdminMode() {
  router.push('/userInfo');
}

// 登出功能
function logout() {
  userStore.logout();
  router.push('/login');
}

watch(
  () => useUserStore().isLoggedIn,
  (newVal) => {
    console.log('Admin - User login status changed:', newVal);
  }
);
</script>

<template>
  <!-- Admin Sidebar -->
  <div class="main-container">
    <nav class="admin-nav vh-100 position-relative" :class="{ 'collapsed': !sidebarOpen }"
      :style="sidebarOpen ? 'width: 300px; transition: width 0.3s;' : 'width: 70px; transition: width 0.3s;'">
      <!-- Admin Navigation Header -->
      <div class="nav-header">
        <h2 v-show="sidebarOpen" class="nav-title">
          <i class="fas fa-crown"></i>
          管理员控制台
        </h2>
        <button class="nav-toggle-btn" @click="toggleSidebar" aria-label="Toggle sidebar">
          <i class="fas" :class="sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </button>
      </div>

      <!-- Admin Navigation Links -->
      <div class="nav-content" v-show="sidebarOpen">
        <div class="nav-menu-container">
          <ul class="nav-menu">
            <li v-for="site in adminSites" :key="site.id" class="nav-item">
              <a href="javascript:void(0)" class="nav-link admin-nav-link"
                @click="site.showDropdown = !site.showDropdown">
                <i class="fas fa-cog nav-icon"></i>
                <span class="nav-text">{{ site.name }}</span>
                <i class="dropdown-arrow fas fa-chevron-right" :class="{ 'rotated': site.showDropdown }"></i>
              </a>
              <transition name="dropdown">
                <ul v-if="site.showDropdown" class="dropdown-menu-custom">
                  <li class="dropdown-item-custom" v-for="listItem in site.list" :key="listItem.id"
                    @click="goToPage(listItem.name)">
                    <i class="fas fa-file-alt"></i>
                    <span>{{ listItem.displayName }}</span>
                  </li>
                </ul>
              </transition>
            </li>
          </ul>
        </div>

        <!-- Admin User Section -->
        <div class="nav-footer">
          <div class="admin-info">
            <div class="admin-badge">
              <i class="fas fa-shield-alt"></i>
              <span>管理员</span>
            </div>
            <div class="admin-username">{{ userStore.username }}</div>
          </div>

          <div class="admin-actions">
            <button @click="exitAdminMode" class="admin-action-btn exit-btn">
              <i class="fas fa-user"></i>
              <span>用户模式</span>
            </button>
            <button @click="logout" class="admin-action-btn logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Collapsed state icons -->
      <div class="collapsed-icons" v-show="!sidebarOpen">
        <button class="collapsed-icon-btn" @click="exitAdminMode" title="用户模式">
          <i class="fas fa-user"></i>
        </button>
        <button class="collapsed-icon-btn" @click="logout" title="退出登录">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.main-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  height: 100vh;
}

.admin-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-nav.collapsed {
  width: 70px !important;
}

.nav-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
  position: relative;
}

.nav-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-title i {
  margin-right: 0.75rem;
  color: #ffd700;
}

.nav-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.nav-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-content {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-menu-container {
  flex: 1;
  overflow: hidden;
  contain: layout style;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: background-color 0.2s ease;
  position: relative;
}

.admin-nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  width: 20px;
  text-align: center;
  color: #ffd700;
}

.nav-text {
  flex: 1;
  font-weight: 600;
  font-size: 1rem;
}

.dropdown-arrow {
  transition: transform 0.3s;
  font-size: 0.9rem;
}

.dropdown-arrow.rotated {
  transform: rotate(90deg);
}

.dropdown-menu-custom {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin: 0.5rem 1rem;
  overflow: hidden;
}

.dropdown-item-custom {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
}

.dropdown-item-custom:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dropdown-item-custom i {
  margin-right: 0.75rem;
  font-size: 0.9rem;
  color: #ffd700;
}

.nav-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  margin-top: auto;
  flex-shrink: 0;
  contain: layout style;
}

.admin-info {
  margin-bottom: 1rem;
}

.admin-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 215, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.admin-badge i {
  margin-right: 0.5rem;
  color: #ffd700;
}

.admin-badge span {
  font-weight: 600;
  font-size: 0.9rem;
}

.admin-username {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 0.5rem;
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.admin-action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.admin-action-btn i {
  margin-right: 0.5rem;
}

.exit-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.collapsed-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  gap: 1rem;
}

.collapsed-icon-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.collapsed-icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  max-height: 300px;
  transform: translateY(0);
}

/* 滚动条样式 */
.nav-content::-webkit-scrollbar {
  width: 6px;
}

.nav-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.nav-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.nav-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-nav {
    width: 100% !important;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
  }

  .admin-nav.collapsed {
    width: 70px !important;
  }
}
</style>
