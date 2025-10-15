<template>
  <div class="admin-layout">
    <AdminSiteList />
    <div class="admin-main-content">
      <div class="admin-container">
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-clipboard-list"></i>
            问卷管理
          </h1>
          <p class="page-description">管理系统中的所有问卷</p>
        </div>

        <!-- 统计信息 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-list-alt"></i>
            </div>
            <div class="stat-info">
              <h3>{{ totalQuestionnaires }}</h3>
              <p>总问卷数</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon status-pass">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
              <h3>{{ statusStats.pass || 0 }}</h3>
              <p>已通过</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon status-uncensor">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <h3>{{ statusStats.uncensor || 0 }}</h3>
              <p>待审核</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon status-block">
              <i class="fas fa-ban"></i>
            </div>
            <div class="stat-info">
              <h3>{{ statusStats.block || 0 }}</h3>
              <p>已阻止</p>
            </div>
          </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
          <div class="filter-controls">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchKeyword" class="search-input" placeholder="搜索问卷标题或ID...">
            </div>
            <div class="filter-dropdown">
              <select v-model="selectedStatus" class="filter-select">
                <option value="">全部状态</option>
                <option value="pass">已通过</option>
                <option value="uncensor">待审核</option>
                <option value="block">已阻止</option>
              </select>
            </div>
            <button @click="refreshQuestionnaires" class="btn btn-refresh" :disabled="loading">
              <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
              刷新
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>加载中...</p>
          </div>
        </div>

        <!-- 问卷列表 -->
        <div v-else-if="filteredQuestionnaires.length > 0" class="questionnaires-section">
          <div class="questionnaires-table-container">
            <table class="questionnaires-table">
              <thead>
                <tr>
                  <th>问卷ID</th>
                  <th>问卷标题</th>
                  <th>模版ID</th>
                  <th>审核状态</th>
                  <th>状态详情</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="questionnaire in filteredQuestionnaires" :key="questionnaire.questionnaireId">
                  <td>{{ questionnaire.questionnaireId }}</td>
                  <td class="questionnaire-title">{{ questionnaire.questionnaireTitle }}</td>
                  <td>{{ questionnaire.modelId }}</td>
                  <td>
                    <span :class="['status-badge', `status-${questionnaire.questionnaireCensor}`]">
                      <i :class="getStatusIcon(questionnaire.questionnaireCensor)"></i>
                      {{ getStatusDisplay(questionnaire.questionnaireCensor) }}
                    </span>
                  </td>
                  <td class="status-details">
                    {{ getStatusDetailInfo(questionnaire.questionnaireStatus) }}
                  </td>
                  <td class="action-buttons">
                    <button @click="previewQuestionnaire(questionnaire)" class="btn btn-sm btn-info">
                      <i class="fas fa-eye"></i>
                      预览
                    </button>

                    <!-- 状态操作下拉菜单 -->
                    <div class="status-dropdown"
                      :class="{ 'active': questionnaire.questionnaireId === activeDropdown }">
                      <button @click="toggleStatusDropdown(questionnaire.questionnaireId)"
                        class="btn btn-sm btn-secondary dropdown-toggle" :disabled="updating">
                        <i class="fas fa-edit"></i>
                        状态操作
                        <i class="fas fa-chevron-down"></i>
                      </button>
                      <div class="dropdown-menu">
                        <button v-if="questionnaire.questionnaireCensor !== 'pass'"
                          @click="updateQuestionnaireStatus(questionnaire, 'pass')" class="dropdown-item status-pass"
                          :disabled="updating">
                          <i class="fas fa-check"></i>
                          通过审核
                        </button>
                        <button v-if="questionnaire.questionnaireCensor !== 'uncensor'"
                          @click="updateQuestionnaireStatus(questionnaire, 'uncensor')"
                          class="dropdown-item status-uncensor" :disabled="updating">
                          <i class="fas fa-clock"></i>
                          待审核
                        </button>
                        <button v-if="questionnaire.questionnaireCensor !== 'block'"
                          @click="updateQuestionnaireStatus(questionnaire, 'block')" class="dropdown-item status-block"
                          :disabled="updating">
                          <i class="fas fa-ban"></i>
                          阻止发布
                        </button>
                      </div>
                    </div>

                    <button @click="deleteQuestionnaire(questionnaire)" class="btn btn-sm btn-danger">
                      <i class="fas fa-trash"></i>
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-section">
          <div class="empty-content">
            <i class="fas fa-clipboard-list"></i>
            <h3>暂无问卷数据</h3>
            <p>{{ searchKeyword || selectedStatus ? '没有符合条件的问卷' : '系统中还没有问卷数据' }}</p>
          </div>
        </div>

        <!-- 问卷预览模态框 -->
        <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
          <div class="modal-content preview-modal" @click.stop>
            <div class="modal-header">
              <h3>
                <i class="fas fa-eye"></i>
                问卷预览
              </h3>
              <button @click="closePreviewModal" class="modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <!-- 问卷基本信息 -->
              <div v-if="selectedQuestionnaire" class="preview-questionnaire-info">
                <h4>{{ selectedQuestionnaire.questionnaireTitle }}</h4>
                <div class="questionnaire-meta">
                  <span class="meta-item">
                    <i class="fas fa-id-card"></i>
                    ID: {{ selectedQuestionnaire.questionnaireId }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-layer-group"></i>
                    模版: {{ selectedQuestionnaire.modelId }}
                  </span>
                  <span :class="['meta-item', 'status-badge', `status-${selectedQuestionnaire.questionnaireCensor}`]">
                    <i :class="getStatusIcon(selectedQuestionnaire.questionnaireCensor)"></i>
                    {{ getStatusDisplay(selectedQuestionnaire.questionnaireCensor) }}
                  </span>
                </div>
              </div>

              <!-- 预览内容 -->
              <div class="preview-content">
                <div v-if="loadingPreview" class="preview-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <p>加载预览中...</p>
                </div>

                <div v-else-if="previewQuestions.length > 0" class="questions-preview">
                  <h5>
                    <i class="fas fa-list"></i>
                    问题列表 ({{ previewQuestions.length }} 题)
                  </h5>
                  <div class="preview-question" v-for="(question, index) in previewQuestions" :key="question.id">
                    <div class="question-header">
                      <span class="question-number">{{ index + 1 }}</span>
                      <span class="question-type">{{ getQuestionTypeDisplay(question.type) }}</span>
                    </div>
                    <div class="question-content">
                      <h6 class="question-title">{{ question.title }}</h6>
                      <p v-if="question.description" class="question-description">{{ question.description }}</p>
                      <div v-if="question.options && question.options.length > 0" class="question-options">
                        <div class="option-item" v-for="(option, optIndex) in question.options.slice(0, 3)"
                          :key="optIndex">
                          {{ option }}
                        </div>
                        <div v-if="question.options.length > 3" class="option-more">
                          ... 还有 {{ question.options.length - 3 }} 个选项
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="preview-empty">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>无法加载问卷预览</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息提示 -->
        <div v-if="message.text" :class="['message-container', message.type]">
          <div class="message-content">
            <i :class="getMessageIcon(message.type)"></i>
            {{ message.text }}
          </div>
          <button @click="clearMessage" class="message-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminSiteList from '../admin_siteList.vue'
import {
  getAllQuestionnaires,
  editQuestionnaire,
  deleteQuestionnaire as deleteQuestionnaireAPI,
  searchModel,
  searchQuestion,
  getStatusDisplay,
  getStatusIcon,
  getStatusDetailInfo,
  getQuestionTypeDisplay,
  parseQuestionOptions,
  parseQuestionsArray,
  type Questionnaire
} from '@/scripts/adminQuestionnaireApi'

// 响应式数据
const questionnaires = ref<Questionnaire[]>([])
const loading = ref(false)
const updating = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')

// 下拉菜单控制
const activeDropdown = ref<string | null>(null)

// 预览相关
const showPreviewModal = ref(false)
const selectedQuestionnaire = ref<Questionnaire | null>(null)
const previewQuestions = ref<Array<{ id: string; type: string; title: string; description?: string; options?: string[] }>>([])
const loadingPreview = ref(false)

// 消息提示
const message = ref({
  text: '',
  type: 'success'
})

// 计算属性
const totalQuestionnaires = computed(() => questionnaires.value.length)

const statusStats = computed(() => {
  const stats: Record<string, number> = {}
  questionnaires.value.forEach(questionnaire => {
    const status = questionnaire.questionnaireCensor
    stats[status] = (stats[status] || 0) + 1
  })
  return stats
})

const filteredQuestionnaires = computed(() => {
  let filtered = questionnaires.value

  // 按状态筛选
  if (selectedStatus.value) {
    filtered = filtered.filter(q => q.questionnaireCensor === selectedStatus.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(q =>
      q.questionnaireTitle.toLowerCase().includes(keyword) ||
      q.questionnaireId.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 主要方法
async function loadAllQuestionnaires() {
  loading.value = true
  try {
    const fetchedQuestionnaires = await getAllQuestionnaires()

    if (fetchedQuestionnaires.length > 0) {
      questionnaires.value = fetchedQuestionnaires
      showMessage(`成功加载 ${fetchedQuestionnaires.length} 个问卷`, 'success')
    } else {
      questionnaires.value = []
      showMessage('暂无问卷数据', 'info')
    }
  } catch (error) {
    console.error('Failed to load questionnaires:', error)
    questionnaires.value = []
    showMessage('加载问卷数据失败，请检查网络连接或联系管理员', 'error')
  } finally {
    loading.value = false
  }
}

async function refreshQuestionnaires() {
  await loadAllQuestionnaires()
}

// 下拉菜单控制函数
function toggleStatusDropdown(questionnaireId: string) {
  if (activeDropdown.value === questionnaireId) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = questionnaireId
  }
}

// 点击外部关闭下拉菜单
function closeDropdown() {
  activeDropdown.value = null
}

async function updateQuestionnaireStatus(questionnaire: Questionnaire, newStatus: string) {
  // 关闭下拉菜单
  closeDropdown()

  if (updating.value) return

  const confirmMessage = `确定要将问卷"${questionnaire.questionnaireTitle}"的状态修改为"${getStatusDisplay(newStatus)}"吗？`
  if (!confirm(confirmMessage)) return

  updating.value = true
  try {
    const updatedQuestionnaire = {
      ...questionnaire,
      questionnaireCensor: newStatus
    }

    const success = await editQuestionnaire(updatedQuestionnaire)
    if (success) {
      // 更新本地数据
      const index = questionnaires.value.findIndex(q => q.questionnaireId === questionnaire.questionnaireId)
      if (index !== -1) {
        questionnaires.value[index].questionnaireCensor = newStatus
      }
      showMessage(`问卷状态已更新为${getStatusDisplay(newStatus)}`, 'success')
    } else {
      showMessage('更新问卷状态失败', 'error')
    }
  } catch (error) {
    console.error('Error updating questionnaire status:', error)
    showMessage('更新问卷状态失败', 'error')
  } finally {
    updating.value = false
  }
}

async function deleteQuestionnaire(questionnaire: Questionnaire) {
  const confirmMessage = `确定要删除问卷"${questionnaire.questionnaireTitle}"吗？此操作不可恢复。`
  if (!confirm(confirmMessage)) return

  try {
    const success = await deleteQuestionnaireAPI(questionnaire.questionnaireId)
    if (success) {
      // 从本地数据中移除
      questionnaires.value = questionnaires.value.filter(q => q.questionnaireId !== questionnaire.questionnaireId)
      showMessage('问卷删除成功', 'success')
    } else {
      showMessage('删除问卷失败', 'error')
    }
  } catch (error) {
    console.error('Error deleting questionnaire:', error)
    showMessage('删除问卷失败', 'error')
  }
}

async function previewQuestionnaire(questionnaire: Questionnaire) {
  selectedQuestionnaire.value = questionnaire
  showPreviewModal.value = true
  await loadQuestionnairePreview(questionnaire)
}

async function loadQuestionnairePreview(questionnaire: Questionnaire) {
  loadingPreview.value = true
  previewQuestions.value = []

  try {
    // 1. 根据问卷的modelId获取模版数据
    const model = await searchModel(questionnaire.modelId)
    if (!model) {
      showMessage('无法获取问卷模版数据', 'error')
      return
    }

    // 2. 解析模版中的问题ID数组
    const questionIds = parseQuestionsArray(model.questionsArray)

    if (questionIds.length === 0) {
      showMessage('该问卷模版没有包含问题', 'warning')
      return
    }

    // 3. 根据问题ID获取具体的问题数据
    const questions = await Promise.all(
      questionIds.map(async (questionId) => {
        const question = await searchQuestion(questionId)
        if (question) {
          const options = parseQuestionOptions(question.questionOptions)

          return {
            id: question.questionId,
            type: question.questionType,
            title: question.questionTitle,
            description: question.questionTxt,
            options: options
          }
        }
        return null
      })
    )

    // 过滤掉null值并更新预览数据
    const validQuestions = questions.filter((q): q is NonNullable<typeof q> => q !== null)
    previewQuestions.value = validQuestions

    if (previewQuestions.value.length === 0) {
      showMessage('无法加载问题数据', 'error')
    }

  } catch (error) {
    console.error('Error loading questionnaire preview:', error)
    showMessage('加载问卷预览失败', 'error')
  } finally {
    loadingPreview.value = false
  }
}

function closePreviewModal() {
  showPreviewModal.value = false
  selectedQuestionnaire.value = null
  previewQuestions.value = []
}

function showMessage(text: string, type: string) {
  message.value.text = text
  message.value.type = type
  setTimeout(() => {
    clearMessage()
  }, 3000)
}

function clearMessage() {
  message.value.text = ''
}

function getMessageIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'success': 'fas fa-check-circle',
    'error': 'fas fa-exclamation-circle',
    'warning': 'fas fa-exclamation-triangle',
    'info': 'fas fa-info-circle'
  }
  return iconMap[type] || 'fas fa-info-circle'
}

// 组件挂载时加载数据
onMounted(() => {
  loadAllQuestionnaires()

  // 添加全局点击事件监听器，用于关闭下拉菜单
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.status-dropdown')) {
      closeDropdown()
    }
  })
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-main-content {
  flex: 1;
  margin-left: 300px;
  transition: margin-left 0.3s;
}

.admin-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
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

.page-description {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  background: #667eea;
}

.stat-icon.status-pass {
  background: #10b981;
}

.stat-icon.status-uncensor {
  background: #f59e0b;
}

.stat-icon.status-block {
  background: #ef4444;
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.stat-info p {
  color: #6b7280;
  margin: 0;
}

/* 筛选和搜索 */
.filter-section {
  margin-bottom: 2rem;
}

.filter-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-dropdown {
  min-width: 150px;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-refresh {
  background: #6b7280;
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background: #4b5563;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-info {
  background: #06b6d4;
  color: white;
}

.btn-info:hover {
  background: #0891b2;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.loading-spinner i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.loading-spinner p {
  color: #6b7280;
  font-size: 1.1rem;
}

/* 空状态 */
.empty-section {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.empty-content i {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-content h3 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-content p {
  color: #6b7280;
  font-size: 1.1rem;
}

/* 问卷列表表格 */
.questionnaires-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.questionnaires-table-container {
  overflow-x: auto;
}

.questionnaires-table {
  width: 100%;
  border-collapse: collapse;
}

.questionnaires-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.questionnaires-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.questionnaires-table tr:hover {
  background: #f9fafb;
}

.questionnaire-title {
  font-weight: 600;
  color: #1f2937;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.status-badge.status-pass {
  background: #10b981;
}

.status-badge.status-uncensor {
  background: #f59e0b;
}

.status-badge.status-block {
  background: #ef4444;
}

.status-details {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

/* 下拉菜单样式 */
.status-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #6b7280;
  color: white;
  border: none;
  transition: all 0.2s;
}

.dropdown-toggle:hover:not(:disabled) {
  background: #4b5563;
}

.dropdown-toggle .fa-chevron-down {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.status-dropdown.active .fa-chevron-down {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 140px;
  display: none;
  overflow: hidden;
}

.status-dropdown.active .dropdown-menu {
  display: block;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: white;
  color: #374151;
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover:not(:disabled) {
  background: #f3f4f6;
}

.dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item.status-pass {
  border-left: 3px solid #10b981;
}

.dropdown-item.status-pass:hover:not(:disabled) {
  background: #ecfdf5;
  color: #065f46;
}

.dropdown-item.status-uncensor {
  border-left: 3px solid #f59e0b;
}

.dropdown-item.status-uncensor:hover:not(:disabled) {
  background: #fffbeb;
  color: #92400e;
}

.dropdown-item.status-block {
  border-left: 3px solid #ef4444;
}

.dropdown-item.status-block:hover:not(:disabled) {
  background: #fef2f2;
  color: #991b1b;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-modal {
  width: 90%;
  max-width: 800px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

/* 预览内容样式 */
.preview-questionnaire-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
}

.preview-questionnaire-info h4 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.questionnaire-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.preview-content h5 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-loading {
  text-align: center;
  padding: 2rem;
}

.preview-loading i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.preview-empty {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.preview-empty i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.questions-preview {
  max-height: 400px;
  overflow-y: auto;
}

.preview-question {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.question-number {
  background: #667eea;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.question-type {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.question-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.question-options {
  margin-top: 0.75rem;
}

.option-item {
  padding: 0.5rem 0;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
}

.option-item:last-child {
  border-bottom: none;
}

.option-more {
  color: #6b7280;
  font-style: italic;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

/* 消息提示 */
.message-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1100;
  animation: slideInRight 0.3s ease-out;
  max-width: 400px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-container.success {
  background: #10b981;
  color: white;
}

.message-container.error {
  background: #ef4444;
  color: white;
}

.message-container.warning {
  background: #f59e0b;
  color: white;
}

.message-container.info {
  background: #06b6d4;
  color: white;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.message-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.message-close:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-main-content {
    margin-left: 0;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .questionnaires-table {
    font-size: 0.875rem;
  }

  .questionnaires-table th,
  .questionnaires-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .preview-modal {
    width: 95%;
    margin: 1rem;
  }

  .questionnaire-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
