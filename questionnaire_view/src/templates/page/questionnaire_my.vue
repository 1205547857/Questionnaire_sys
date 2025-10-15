<template>
  <div class="questionnaire-my">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-clipboard-list"></i>
        我的问卷
      </h1>
      <p class="page-description">管理您创建的所有问卷</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalQuestionnaires }}</h3>
            <p>总问卷数</p>
          </div>
        </div>

        <div class="stat-card" v-for="(count, status) in questionnaireStatusStats" :key="status">
          <div class="stat-icon">
            <i :class="getStatusIcon(status)"></i>
          </div>
          <div class="stat-info">
            <h3>{{ count }}</h3>
            <p>{{ getStatusDisplayName(status) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="stat-info">
            <h3>
              <router-link :to="{ name: 'questionnaire_create' }" class="create-link">
                创建新问卷
              </router-link>
            </h3>
            <p>开始创建</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model="searchKeyword" type="text" placeholder="搜索问卷标题..." class="search-input" />
        </div>

        <div class="filter-dropdown">
          <select v-model="selectedStatus" class="status-filter">
            <option value="">全部状态</option>
            <option value="active">启用中</option>
            <option value="draft">草稿</option>
          </select>
        </div>

        <button @click="refreshQuestionnaires" class="btn btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载问卷列表...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredQuestionnaires.length === 0" class="empty-section">
      <div class="empty-content">
        <i class="fas fa-inbox"></i>
        <h3>{{ questionnaires.length === 0 ? '暂无问卷' : '没有找到匹配的问卷' }}</h3>
        <p>{{ questionnaires.length === 0 ? '您还没有创建任何问卷' : '尝试调整搜索条件或筛选器' }}</p>
        <router-link :to="{ name: 'questionnaire_create' }" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          创建第一个问卷
        </router-link>
      </div>
    </div>

    <!-- 问卷列表 -->
    <div v-else class="questionnaires-section">
      <div class="questionnaires-grid">
        <div v-for="questionnaire in filteredQuestionnaires" :key="questionnaire.questionnaireId"
          class="questionnaire-card">
          <!-- 问卷卡片头部 -->
          <div class="questionnaire-header">
            <div class="questionnaire-status-badge"
              :class="getQuestionnaireStatusClass(questionnaire.questionnaireStatus)">
              <i :class="getQuestionnaireStatusIcon(questionnaire.questionnaireStatus)"></i>
              {{ getQuestionnaireStatusDisplay(questionnaire.questionnaireStatus) }}
            </div>
            <div class="questionnaire-actions">
              <button @click="viewQuestionnaire(questionnaire)" class="action-btn view-btn" title="查看问卷">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="analyzeQuestionnaire(questionnaire)" class="action-btn analyze-btn" title="数据分析">
                <i class="fas fa-chart-bar"></i>
              </button>
              <button @click="deleteQuestionnaire(questionnaire)" class="action-btn delete-btn"
                :disabled="isQuestionnaireActive(questionnaire.questionnaireStatus)"
                :title="isQuestionnaireActive(questionnaire.questionnaireStatus) ? '启动中的问卷无法删除' : '删除问卷'">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- 问卷内容 -->
          <div class="questionnaire-content">
            <h3 class="questionnaire-title">{{ questionnaire.questionnaireTitle }}</h3>
            <p class="questionnaire-model">
              <i class="fas fa-layer-group"></i>
              基于模版ID: {{ questionnaire.modelId }}
            </p>
          </div>

          <!-- 问卷状态详情 -->
          <div class="questionnaire-status-details">
            <div class="status-info">
              {{ getStatusDetailInfo(questionnaire.questionnaireStatus) }}
            </div>
          </div>

          <!-- 问卷底部信息 -->
          <div class="questionnaire-footer">
            <span class="questionnaire-id">ID: {{ questionnaire.questionnaireId }}</span>

          </div>
        </div>
      </div>
    </div>

    <!-- 分页信息 -->
    <div v-if="filteredQuestionnaires.length > 0" class="pagination-section">
      <p class="result-info">
        显示 {{ filteredQuestionnaires.length }} 个问卷，共 {{ totalQuestionnaires }} 个
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import {
  getQuestionnairesByIds,
  getQuestionnaireStatusDisplay,
  getQuestionnaireStatusIcon,
  getQuestionnaireStatusClass,
  isQuestionnaireActive,
  type Questionnaire
} from '@/scripts/questionnaireQuery'
import { deleteQuestionnaire as deleteQuestionnaireAPI } from '@/scripts/questionnaireDelete'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const questionnaires = ref<Questionnaire[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')

// 计算属性
const totalQuestionnaires = computed(() => questionnaires.value.length)

const questionnaireStatusStats = computed(() => {
  const stats: Record<string, number> = {}
  questionnaires.value.forEach(questionnaire => {
    try {
      const status = JSON.parse(questionnaire.questionnaireStatus)
      const statusKey = status.active ? 'active' : 'draft'
      stats[statusKey] = (stats[statusKey] || 0) + 1
    } catch {
      // 忽略解析错误
    }
  })
  return stats
})

const filteredQuestionnaires = computed(() => {
  let filtered = questionnaires.value

  // 按状态筛选
  if (selectedStatus.value) {
    filtered = filtered.filter(q => {
      try {
        const status = JSON.parse(q.questionnaireStatus)
        const statusKey = status.active ? 'active' : 'draft'
        return statusKey === selectedStatus.value
      } catch {
        return false
      }
    })
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    filtered = filtered.filter(q =>
      q.questionnaireTitle.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 方法
async function loadQuestionnaires() {
  if (!userStore.isLoggedIn) {
    console.log('User not logged in')
    return
  }

  const questionnaireIds = userStore.userData?.questionnaire_ids
  if (!questionnaireIds || questionnaireIds.length === 0) {
    console.log('No questionnaire IDs found in user data')
    questionnaires.value = []
    return
  }

  loading.value = true
  try {
    console.log('Loading questionnaires for IDs:', questionnaireIds)
    const fetchedQuestionnaires = await getQuestionnairesByIds(questionnaireIds)
    questionnaires.value = fetchedQuestionnaires
    console.log('Questionnaires loaded successfully:', fetchedQuestionnaires.length)
  } catch (error) {
    console.error('Failed to load questionnaires:', error)
  } finally {
    loading.value = false
  }
}

async function refreshQuestionnaires() {
  await loadQuestionnaires()
}

function viewQuestionnaire(questionnaire: Questionnaire) {
  console.log('View questionnaire:', questionnaire.questionnaireId)
  // 导航到查看页面
  router.push(`/page/questionnaire_view/${questionnaire.questionnaireId}`)
}

function analyzeQuestionnaire(questionnaire: Questionnaire) {
  console.log('Analyze questionnaire:', questionnaire.questionnaireId)
  // 导航到数据分析页面
  router.push(`/page/questionnaire_analysis/${questionnaire.questionnaireId}`)
}

async function deleteQuestionnaire(questionnaire: Questionnaire) {
  // 检查问卷是否为启动状态
  if (isQuestionnaireActive(questionnaire.questionnaireStatus)) {
    alert('无法删除启动中的问卷，请先停用问卷后再删除。')
    return
  }

  const confirmMessage = `确定要删除问卷"${questionnaire.questionnaireTitle}"吗？`

  const confirmed = confirm(confirmMessage)
  if (!confirmed) {
    return
  }

  try {
    console.log('Processing delete request for questionnaire:', questionnaire.questionnaireId)

    // 调用统一的删除API（后端处理所有删除逻辑）
    const result = await deleteQuestionnaireAPI(questionnaire.questionnaireId)

    if (result.success) {
      // 无论哪种情况都需要从用户数据中移除问卷ID
      userStore.removeQuestionnaireId(questionnaire.questionnaireId)

      // 重新加载问卷列表
      await loadQuestionnaires()

      // 显示成功消息
      alert(result.message || '问卷删除成功')
    } else {
      alert(result.message || '问卷删除失败')
    }
  } catch (error) {
    console.error('Failed to delete questionnaire:', error)
    alert('操作失败，请稍后重试')
  }
}

// 辅助函数
function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    active: '启用中',
    draft: '草稿'
  }
  return statusMap[status] || status
}

function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    active: 'fas fa-play-circle',
    draft: 'fas fa-pause-circle'
  }
  return iconMap[status] || 'fas fa-question-circle'
}

function getStatusDetailInfo(statusJson: string): string {
  try {
    const status = JSON.parse(statusJson)
    if (status.active) {
      let info = '问卷正在运行'
      if (status.startDate) {
        const startDate = new Date(status.startDate)
        info += ` | 开始时间: ${startDate.toLocaleDateString()}`
      }
      if (status.endDate) {
        const endDate = new Date(status.endDate)
        info += ` | 结束时间: ${endDate.toLocaleDateString()}`
      }
      return info
    } else {
      return '问卷处于草稿状态，尚未启用'
    }
  } catch {
    return '状态信息无法解析'
  }
}

// 监听用户登录状态和questionnaire_ids变化
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue) {
    loadQuestionnaires()
  } else {
    questionnaires.value = []
  }
}, { immediate: true })

watch(() => userStore.userData?.questionnaire_ids, () => {
  if (userStore.isLoggedIn) {
    loadQuestionnaires()
  }
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  if (userStore.isLoggedIn) {
    loadQuestionnaires()
  }
})
</script>

<style scoped>
.questionnaire-my {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.page-title i {
  margin-right: 0.5rem;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 统计信息 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-info h3 {
  font-size: 1.8rem;
  margin: 0;
  font-weight: bold;
}

.stat-info p {
  margin: 0;
  opacity: 0.9;
}

.create-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.create-link:hover {
  color: #4facfe;
  text-decoration: underline;
}

/* 筛选和搜索 */
.filter-section {
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.8rem 0.8rem 0.8rem 2.5rem;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

.filter-dropdown select {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  cursor: pointer;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  color: white;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loading-spinner p {
  font-size: 1.1rem;
}

/* 空状态 */
.empty-section {
  text-align: center;
  padding: 3rem;
}

.empty-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  color: white;
}

.empty-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty-content p {
  opacity: 0.9;
  margin-bottom: 2rem;
}

/* 问卷列表 */
.questionnaires-section {
  margin-bottom: 2rem;
}

.questionnaires-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.questionnaire-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.questionnaire-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 问卷卡片头部 */
.questionnaire-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.questionnaire-status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.questionnaire-status-badge.status-active {
  background: linear-gradient(45deg, #10b981 0%, #34d399 100%);
  color: white;
}

.questionnaire-status-badge.status-draft {
  background: linear-gradient(45deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.questionnaire-status-badge.status-unknown {
  background: linear-gradient(45deg, #6b7280 0%, #9ca3af 100%);
  color: white;
}

.questionnaire-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background: #3b82f6;
  color: white;
}

.view-btn:hover {
  background: #2563eb;
}

.analyze-btn {
  background: #f59e0b;
  color: white;
}

.analyze-btn:hover {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
}

.delete-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 问卷内容 */
.questionnaire-content {
  margin-bottom: 1rem;
}

.questionnaire-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.questionnaire-model {
  color: #6b7280;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* 问卷状态详情 */
.questionnaire-status-details {
  margin-bottom: 1rem;
}

.status-info {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 0.85rem;
  color: #374151;
  line-height: 1.4;
}

/* 问卷底部 */
.questionnaire-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}



/* 分页信息 */
.pagination-section {
  text-align: center;
  padding: 1rem;
}

.result-info {
  color: white;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-my {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .questionnaires-grid {
    grid-template-columns: 1fr;
  }
}
</style>
