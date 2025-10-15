<template>
  <div class="questionnaire-model-my">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-file-alt"></i>
        我的问卷模版
      </h1>
      <p class="page-description">管理您创建的所有问卷模版</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.totalModels }}</h3>
            <p>总模版数</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-list-ol"></i>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.totalQuestions }}</h3>
            <p>总问题数</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="stat-info">
            <h3>{{ statistics.avgQuestionsPerModel }}</h3>
            <p>平均问题数/模版</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model="searchKeyword" type="text" placeholder="搜索模版标题或描述..." class="search-input" />
        </div>

        <button @click="refreshModels" class="btn btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载模版列表...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredModels.length === 0" class="empty-section">
      <div class="empty-content">
        <i class="fas fa-inbox"></i>
        <h3>{{ models.length === 0 ? '暂无问卷模版' : '没有找到匹配的模版' }}</h3>
        <p>{{ models.length === 0 ? '您还没有创建任何问卷模版' : '尝试调整搜索条件' }}</p>
        <router-link :to="{ name: 'questionnaire_model_create' }" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          创建第一个模版
        </router-link>
      </div>
    </div>

    <!-- 模版列表 -->
    <div v-else class="models-section">
      <div class="models-grid">
        <div v-for="model in filteredModels" :key="model.modelId" class="model-card">
          <!-- 模版卡片头部 -->
          <div class="model-header">
            <div class="model-type-badge">
              <i class="fas fa-file-alt"></i>
              问卷模版
            </div>
            <div class="model-actions">
              <button @click="editModel(model)" class="action-btn edit-btn" title="编辑模版">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteModel(model)" class="action-btn delete-btn" title="删除模版">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- 模版内容 -->
          <div class="model-content">
            <h3 class="model-title">{{ model.modelTitle || '未命名模版' }}</h3>
            <p v-if="model.modelDesc" class="model-description">
              {{ model.modelDesc }}
            </p>
          </div>

          <!-- 模版问题信息 -->
          <div class="model-questions">
            <div class="questions-info">
              <div class="question-count">
                <i class="fas fa-list-ol"></i>
                <span>{{ getModelQuestionCount(model) }} 个问题</span>
              </div>
              <div v-if="getModelQuestionCount(model) > 0" class="questions-preview">
                <div class="preview-tags">
                  <span v-for="(question, index) in getModelQuestionsPreview(model)" :key="index" class="question-tag"
                    :title="question.title || '未命名问题'">
                    {{ (question.title || '未命名问题').length > 20 ? (question.title || '未命名问题').substring(0, 20) + '...' :
                      (question.title || '未命名问题') }}
                  </span>
                  <span v-if="getModelQuestionCount(model) > 3" class="more-questions">
                    +{{ getModelQuestionCount(model) - 3 }}个问题
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 模版底部信息 -->
          <div class="model-footer">
            <span class="model-id">ID: {{ model.modelId }}</span>

          </div>
        </div>
      </div>
    </div>

    <!-- 分页（如果需要） -->
    <div v-if="filteredModels.length > 0" class="pagination-section">
      <p class="result-info">
        显示 {{ filteredModels.length }} 个模版，共 {{ statistics.totalModels }} 个
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import {
  getQuestionnaireModelsByIds,
  parseQuestionsArray,
  parseQuestionsArraySync,
  getModelStatisticsSync,
  type QuestionnaireModel,
  type QuestionItem
} from '@/scripts/questionnaireModelQuery'
import { deleteQuestionnaireModel } from '@/scripts/questionnaireModelDelete'

const userStore = useUserStore()
const router = useRouter()

// 响应式数据
const models = ref<QuestionnaireModel[]>([])
const loading = ref(false)
const searchKeyword = ref('')

// 计算属性
const statistics = computed(() => {
  // 使用同步版本进行统计，以避免在计算属性中使用异步函数
  return getModelStatisticsSync(models.value)
})

const filteredModels = computed(() => {
  let filtered = models.value

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    filtered = filtered.filter(m =>
      (m.modelTitle && m.modelTitle.toLowerCase().includes(keyword)) ||
      (m.modelDesc && m.modelDesc.toLowerCase().includes(keyword))
    )
  }

  return filtered
})

// 响应式数据存储解析后的问题数据
const modelQuestionsCache = ref<Map<string, QuestionItem[]>>(new Map())

// 方法
function getModelQuestionCount(model: QuestionnaireModel): number {
  // 使用缓存的问题数据或同步解析获取数量
  const cachedQuestions = modelQuestionsCache.value.get(model.modelId)
  if (cachedQuestions) {
    return cachedQuestions.length
  }

  // 如果没有缓存，使用同步解析获取大致数量
  const questions = parseQuestionsArraySync(model.questionsArray)
  return questions.length
}

function getModelQuestionsPreview(model: QuestionnaireModel): QuestionItem[] {
  // 使用缓存的问题数据
  const cachedQuestions = modelQuestionsCache.value.get(model.modelId)
  if (cachedQuestions) {
    return cachedQuestions.slice(0, 3) // 只显示前3个问题
  }

  // 如果没有缓存，使用同步解析获取预览
  const questions = parseQuestionsArraySync(model.questionsArray)
  return questions.slice(0, 3)
}



async function loadModels() {
  console.log('loadModels called')
  console.log('User logged in:', userStore.isLoggedIn)
  console.log('User data:', userStore.userData)

  if (!userStore.isLoggedIn) {
    console.log('User not logged in')
    loading.value = false
    return
  }

  const modelIds = userStore.userData?.QuestionnaireModel_ids
  console.log('Model IDs from user data:', modelIds)

  if (!modelIds || modelIds.length === 0) {
    console.log('No model IDs found in user data')
    models.value = []
    loading.value = false
    return
  }

  loading.value = true
  try {
    console.log('Loading models for IDs:', modelIds)
    const fetchedModels = await getQuestionnaireModelsByIds(modelIds)
    console.log('Fetched models:', fetchedModels)
    models.value = fetchedModels

    // 异步加载所有模版的问题数据
    const questionsLoadPromises = fetchedModels.map(async (model) => {
      try {
        const questions = await parseQuestionsArray(model.questionsArray)
        modelQuestionsCache.value.set(model.modelId, questions)
      } catch (error) {
        console.error('Failed to load questions for model:', model.modelId, error)
      }
    })

    // 不等待问题加载完成，让页面先显示基本信息
    Promise.all(questionsLoadPromises).then(() => {
      console.log('All questions loaded successfully')
    }).catch(error => {
      console.error('Some questions failed to load:', error)
    })

    console.log('Models loaded successfully:', fetchedModels.length)
  } catch (error) {
    console.error('Failed to load models:', error)
    models.value = [] // 确保在错误时清空模版列表
  } finally {
    loading.value = false
  }
}

async function refreshModels() {
  await loadModels()
}

function editModel(model: QuestionnaireModel) {
  console.log('Edit model:', model.modelId)
  // 导航到编辑页面
  router.push({
    name: 'questionnaire_model_edit',
    params: { id: model.modelId }
  })
}

async function deleteModel(model: QuestionnaireModel) {
  const confirmMessage = `确定要删除模版"${model.modelTitle || '未命名模版'}"吗？`

  const confirmed = confirm(confirmMessage)
  if (!confirmed) {
    return
  }

  try {
    console.log('Processing delete request for model:', model.modelId)

    const result = await deleteQuestionnaireModel(model.modelId)

    if (result.success) {
      // 无论哪种情况都需要从用户数据中移除模版ID
      userStore.removeQuestionnaireModelId(model.modelId)

      // 重新加载模版列表
      await loadModels()

      // 显示成功消息
      alert(result.message || '模版删除成功')
    } else {
      const errorMessage = result.message || '操作失败，请稍后重试'
      alert(errorMessage)
    }
  } catch (error) {
    console.error('Failed to delete model:', error)
    alert('操作失败，请稍后重试')
  }
}

// 监听用户登录状态和模版ID变化
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue) {
    loadModels()
  } else {
    models.value = []
  }
}, { immediate: true })

watch(() => userStore.userData?.QuestionnaireModel_ids, () => {
  if (userStore.isLoggedIn) {
    loadModels()
  }
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  if (userStore.isLoggedIn) {
    loadModels()
  }
})
</script>

<style scoped>
.questionnaire-model-my {
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

/* 模版列表 */
.models-section {
  margin-bottom: 2rem;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.model-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 模版卡片头部 */
.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.model-type-badge {
  background: linear-gradient(45deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.model-actions {
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

/* 模版内容 */
.model-content {
  margin-bottom: 1.5rem;
}

.model-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.model-description {
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* 模版问题信息 */
.model-questions {
  margin-bottom: 1rem;
}

.questions-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
}

.question-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  color: #374151;
  font-weight: 500;
}

.question-count i {
  color: #6366f1;
}

.questions-preview {
  margin-top: 0.5rem;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.question-tag {
  background: #e0e7ff;
  color: #4338ca;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-questions {
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
  padding: 0.2rem 0.6rem;
}

/* 模版底部 */
.model-footer {
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
  .questionnaire-model-my {
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

  .models-grid {
    grid-template-columns: 1fr;
  }
}
</style>
