<template>
  <div class="question-center-my">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-list-alt"></i>
        我的问题组件
      </h1>
      <p class="page-description">管理您创建的所有问题组件</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalQuestions }}</h3>
            <p>总问题数</p>
          </div>
        </div>

        <div class="stat-card" v-for="(count, type) in questionTypeStats" :key="type">
          <div class="stat-icon">
            <i :class="getQuestionTypeIcon(type)"></i>
          </div>
          <div class="stat-info">
            <h3>{{ count }}</h3>
            <p>{{ getQuestionTypeDisplayName(type) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model="searchKeyword" type="text" placeholder="搜索问题标题或内容..." class="search-input" />
        </div>

        <div class="filter-dropdown">
          <select v-model="selectedType" class="type-filter">
            <option value="">全部类型</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="text">文本题</option>
            <option value="dropdown">下拉选择题</option>
          </select>
        </div>

        <button @click="refreshQuestions" class="btn btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载问题列表...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredQuestions.length === 0" class="empty-section">
      <div class="empty-content">
        <i class="fas fa-inbox"></i>
        <h3>{{ questions.length === 0 ? '暂无问题组件' : '没有找到匹配的问题' }}</h3>
        <p>{{ questions.length === 0 ? '您还没有创建任何问题组件' : '尝试调整搜索条件或筛选器' }}</p>
        <router-link :to="{ name: 'question_center_create' }" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          创建第一个问题
        </router-link>
      </div>
    </div>

    <!-- 问题列表 -->
    <div v-else class="questions-section">
      <div class="questions-grid">
        <div v-for="question in filteredQuestions" :key="question.questionId" class="question-card">
          <!-- 问题卡片头部 -->
          <div class="question-header">
            <div class="question-type-badge">
              <i :class="getQuestionTypeIcon(question.questionType)"></i>
              {{ getQuestionTypeDisplayName(question.questionType) }}
            </div>
            <div class="question-actions">
              <button @click="editQuestion(question)" class="action-btn edit-btn" title="编辑问题">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteQuestion(question)" class="action-btn delete-btn" title="删除问题">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- 问题内容 -->
          <div class="question-content">
            <h3 class="question-title">{{ question.questionTitle }}</h3>
            <p v-if="question.questionTxt" class="question-description">
              {{ question.questionTxt }}
            </p>
          </div>

          <!-- 问题选项（如果有） -->
          <div v-if="getQuestionOptions(question).length > 0" class="question-options">
            <h4>选项：</h4>
            <div class="options-list">
              <span v-for="(option, index) in getQuestionOptions(question).slice(0, 3)" :key="index" class="option-tag">
                {{ option }}
              </span>
              <span v-if="getQuestionOptions(question).length > 3" class="option-more">
                +{{ getQuestionOptions(question).length - 3 }}个选项
              </span>
            </div>
          </div>

          <!-- 问题底部信息 -->
          <div class="question-footer">
            <span class="question-id">ID: {{ question.questionId }}</span>

          </div>
        </div>
      </div>
    </div>

    <!-- 分页（如果需要） -->
    <div v-if="filteredQuestions.length > 0" class="pagination-section">
      <p class="result-info">
        显示 {{ filteredQuestions.length }} 个问题，共 {{ totalQuestions }} 个
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import {
  getQuestionsByIds,
  parseQuestionOptions,
  getQuestionTypeDisplayName,
  getQuestionTypeIcon,
  type Question
} from '@/scripts/questionQuery'
import { deleteQuestion as deleteQuestionAPI } from '@/scripts/questionDelete'

const userStore = useUserStore()
const router = useRouter()

// 响应式数据
const questions = ref<Question[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedType = ref('')

// 计算属性
const totalQuestions = computed(() => questions.value.length)

const questionTypeStats = computed(() => {
  const stats: Record<string, number> = {}
  questions.value.forEach(question => {
    const type = question.questionType
    stats[type] = (stats[type] || 0) + 1
  })
  return stats
})

const filteredQuestions = computed(() => {
  let filtered = questions.value

  // 按类型筛选
  if (selectedType.value) {
    filtered = filtered.filter(q => q.questionType === selectedType.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    filtered = filtered.filter(q =>
      q.questionTitle.toLowerCase().includes(keyword) ||
      (q.questionTxt && q.questionTxt.toLowerCase().includes(keyword))
    )
  }

  return filtered
})

// 方法
function getQuestionOptions(question: Question): string[] {
  return parseQuestionOptions(question.questionOptions)
}

async function loadQuestions() {
  if (!userStore.isLoggedIn) {
    console.log('User not logged in')
    return
  }

  const questionIds = userStore.userData.question_ids
  if (!questionIds || questionIds.length === 0) {
    console.log('No question IDs found in user data')
    questions.value = []
    return
  }

  loading.value = true
  try {
    console.log('Loading questions for IDs:', questionIds)
    const fetchedQuestions = await getQuestionsByIds(questionIds)
    questions.value = fetchedQuestions
    console.log('Questions loaded successfully:', fetchedQuestions.length)
  } catch (error) {
    console.error('Failed to load questions:', error)
  } finally {
    loading.value = false
  }
}

async function refreshQuestions() {
  await loadQuestions()
}

function editQuestion(question: Question) {
  console.log('Edit question:', question.questionId)
  // 导航到编辑页面
  router.push(`/page/question_center_edit/${question.questionId}`)
}

async function deleteQuestion(question: Question) {
  const confirmMessage = `确定要删除问题"${question.questionTitle}"吗？`
  const confirmed = confirm(confirmMessage)
  if (!confirmed) {
    return
  }

  try {
    console.log('Processing delete request for question:', question.questionId)

    // 调用统一的删除API（后端处理所有删除逻辑）
    const result = await deleteQuestionAPI(question.questionId)

    if (result.success) {
      // 无论哪种情况都需要从用户数据中移除问题ID
      userStore.removeQuestionId(question.questionId)

      // 重新加载问题列表
      await loadQuestions()

      // 显示成功消息
      alert(result.message || '问题删除成功')
    } else {
      alert(result.message || '问题删除失败')
    }
  } catch (error) {
    console.error('Failed to delete question:', error)
    alert('操作失败，请稍后重试')
  }
}

// 监听用户登录状态和question_ids变化
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue) {
    loadQuestions()
  } else {
    questions.value = []
  }
}, { immediate: true })

watch(() => userStore.userData.question_ids, () => {
  if (userStore.isLoggedIn) {
    loadQuestions()
  }
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  if (userStore.isLoggedIn) {
    loadQuestions()
  }
})
</script>

<style scoped>
.question-center-my {
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

/* 问题列表 */
.questions-section {
  margin-bottom: 2rem;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.question-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 问题卡片头部 */
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-type-badge {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.question-actions {
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

.edit-btn {
  background: #10b981;
  color: white;
}

.edit-btn:hover {
  background: #059669;
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

/* 问题内容 */
.question-content {
  margin-bottom: 1rem;
}

.question-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.question-description {
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* 问题选项 */
.question-options {
  margin-bottom: 1rem;
}

.question-options h4 {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-tag {
  background: #e5e7eb;
  color: #374151;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
}

.option-more {
  color: #6b7280;
  font-size: 0.8rem;
  font-style: italic;
}

/* 问题底部 */
.question-footer {
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
  .question-center-my {
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

  .questions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
