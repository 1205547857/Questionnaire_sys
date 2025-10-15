<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import AdminSiteList from '../admin_siteList.vue'

const userStore = useUserStore()

// 统计数据
const statistics = ref({
  totalUsers: 0,
  totalQuestionnaires: 0,
  activeQuestionnaires: 0,
  totalResponses: 0,
  todayRegistrations: 0,
  todaySubmissions: 0
})

// 系统状态
const systemStatus = ref({
  serverStatus: 'running',
  databaseStatus: 'connected',
  memoryUsage: 68,
  cpuUsage: 45,
  diskUsage: 78
})

// 最近活动
const recentActivities = ref([
  { id: 1, type: 'user_register', description: '新用户注册: user123', time: '2分钟前' },
  { id: 2, type: 'questionnaire_create', description: '创建问卷: 客户满意度调查', time: '5分钟前' },
  { id: 3, type: 'questionnaire_submit', description: '问卷提交: 10份新回复', time: '8分钟前' },
  { id: 4, type: 'system_backup', description: '数据备份完成', time: '1小时前' },
])

// 快捷操作
const quickActions = [
  { name: '用户管理', icon: 'fa-users', route: 'admin_user_list', color: '#3b82f6' },
  { name: '问卷审核', icon: 'fa-clipboard-check', route: 'admin_questionnaire_audit', color: '#10b981' },
  { name: '系统设置', icon: 'fa-cogs', route: 'admin_system_settings', color: '#f59e0b' },
  { name: '数据备份', icon: 'fa-database', route: 'admin_backup', color: '#ef4444' },
]

// 模拟加载统计数据
onMounted(async () => {
  // 这里应该调用实际的API获取统计数据
  setTimeout(() => {
    statistics.value = {
      totalUsers: 1248,
      totalQuestionnaires: 89,
      activeQuestionnaires: 23,
      totalResponses: 5642,
      todayRegistrations: 12,
      todaySubmissions: 156
    }
  }, 1000)
})

function getStatusColor(status: string) {
  switch (status) {
    case 'running':
    case 'connected':
      return '#10b981'
    case 'warning':
      return '#f59e0b'
    case 'error':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'user_register':
      return 'fa-user-plus'
    case 'questionnaire_create':
      return 'fa-file-plus'
    case 'questionnaire_submit':
      return 'fa-paper-plane'
    case 'system_backup':
      return 'fa-shield-alt'
    default:
      return 'fa-info-circle'
  }
}

function goToQuickAction(route: string) {
  // 这里可以添加路由跳转逻辑
  console.log('Navigate to:', route)
}
</script>

<template>
  <div class="admin-layout">
    <!-- 管理员侧边栏 -->
    <AdminSiteList />

    <!-- 主内容区域 -->
    <div class="admin-main-content">
      <div class="admin-container">
        <!-- 页面头部 -->
        <div class="admin-header">
          <div class="header-info">
            <h1 class="page-title">
              <i class="fas fa-tachometer-alt"></i>
              管理员控制台
            </h1>
            <p class="welcome-text">欢迎回来，{{ userStore.username }}！</p>
          </div>
          <div class="current-time">
            {{ new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            }) }}
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ statistics.totalUsers.toLocaleString() }}</h3>
              <p class="stat-label">总用户数</p>
              <span class="stat-change positive">+{{ statistics.todayRegistrations }} 今日新增</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon questionnaires">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ statistics.totalQuestionnaires }}</h3>
              <p class="stat-label">总问卷数</p>
              <span class="stat-change positive">{{ statistics.activeQuestionnaires }} 个活跃</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon responses">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ statistics.totalResponses.toLocaleString() }}</h3>
              <p class="stat-label">总回复数</p>
              <span class="stat-change positive">+{{ statistics.todaySubmissions }} 今日新增</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon status">
              <i class="fas fa-server"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">正常</h3>
              <p class="stat-label">系统状态</p>
              <span class="stat-change positive">所有服务运行正常</span>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="content-grid">
          <!-- 快捷操作 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-bolt"></i>
                快捷操作
              </h3>
            </div>
            <div class="quick-actions">
              <button v-for="action in quickActions" :key="action.name" class="quick-action-btn"
                :style="{ borderColor: action.color }" @click="goToQuickAction(action.route)">
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <i :class="`fas ${action.icon}`"></i>
                </div>
                <span class="action-name">{{ action.name }}</span>
              </button>
            </div>
          </div>

          <!-- 系统状态 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-heartbeat"></i>
                系统状态
              </h3>
            </div>
            <div class="system-status">
              <div class="status-item">
                <div class="status-info">
                  <i class="fas fa-server"></i>
                  <span>服务器状态</span>
                </div>
                <div class="status-indicator" :style="{ backgroundColor: getStatusColor(systemStatus.serverStatus) }">
                  运行中
                </div>
              </div>

              <div class="status-item">
                <div class="status-info">
                  <i class="fas fa-database"></i>
                  <span>数据库连接</span>
                </div>
                <div class="status-indicator" :style="{ backgroundColor: getStatusColor(systemStatus.databaseStatus) }">
                  已连接
                </div>
              </div>

              <div class="resource-usage">
                <div class="usage-item">
                  <span class="usage-label">内存使用率</span>
                  <div class="usage-bar">
                    <div class="usage-fill" :style="{ width: systemStatus.memoryUsage + '%' }"></div>
                  </div>
                  <span class="usage-value">{{ systemStatus.memoryUsage }}%</span>
                </div>

                <div class="usage-item">
                  <span class="usage-label">CPU使用率</span>
                  <div class="usage-bar">
                    <div class="usage-fill" :style="{ width: systemStatus.cpuUsage + '%' }"></div>
                  </div>
                  <span class="usage-value">{{ systemStatus.cpuUsage }}%</span>
                </div>

                <div class="usage-item">
                  <span class="usage-label">磁盘使用率</span>
                  <div class="usage-bar">
                    <div class="usage-fill" :style="{ width: systemStatus.diskUsage + '%' }"></div>
                  </div>
                  <span class="usage-value">{{ systemStatus.diskUsage }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="content-card full-width">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-history"></i>
                最近活动
              </h3>
            </div>
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon">
                  <i :class="`fas ${getActivityIcon(activity.type)}`"></i>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-main-content {
  flex: 1;
  margin-left: 300px;
  padding: 0;
  transition: margin-left 0.3s;
}

.admin-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title i {
  color: #667eea;
}

.welcome-text {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.current-time {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.questionnaires {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.responses {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.status {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.stat-change.positive {
  background: #dcfce7;
  color: #16a34a;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.content-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title i {
  color: #667eea;
}

.quick-actions {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-action-btn {
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.action-name {
  font-weight: 600;
  color: #1f2937;
}

.system-status {
  padding: 2rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.status-item:last-child {
  border-bottom: none;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-weight: 500;
}

.status-info i {
  color: #6b7280;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.resource-usage {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.usage-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.usage-label {
  min-width: 100px;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.usage-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s;
}

.usage-value {
  min-width: 40px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.activity-list {
  padding: 2rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.activity-content {
  flex: 1;
}

.activity-description {
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .admin-main-content {
    margin-left: 70px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-main-content {
    margin-left: 0;
  }

  .admin-container {
    padding: 1rem;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>
