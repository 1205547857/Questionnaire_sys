<template>
  <div class="questionnaire-create">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-plus-circle"></i>
        创建问卷
      </h1>
      <p class="page-description">从您的问卷模版中创建新的问卷</p>
    </div>

    <!-- 创建步骤指示器 -->
    <div class="steps-indicator">
      <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">选择模版</div>
      </div>
      <div class="step-connector"></div>
      <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-label">配置问卷</div>
      </div>
      <div class="step-connector"></div>
      <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
        <div class="step-number">3</div>
        <div class="step-label">完成创建</div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingText }}</p>
      </div>
    </div>

    <!-- 步骤1: 选择模版 -->
    <div v-else-if="currentStep === 1" class="step-content">
      <div class="content-card">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-layer-group"></i>
            选择问卷模版
          </h2>
          <p class="section-description">从您创建的模版中选择一个作为问卷基础</p>
        </div>

        <!-- 空状态 -->
        <div v-if="models.length === 0" class="empty-section">
          <div class="empty-content">
            <i class="fas fa-inbox"></i>
            <h3>暂无可用模版</h3>
            <p>您还没有创建任何问卷模版</p>
            <router-link :to="{ name: 'questionnaire_model_create' }" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              立即创建模版
            </router-link>
          </div>
        </div>

        <!-- 模版列表 -->
        <div v-else class="models-section">
          <div class="models-grid">
            <div v-for="model in models" :key="model.modelId" class="model-card"
              :class="{ selected: selectedModelId === model.modelId }" @click="selectModel(model)">
              <div class="model-header">
                <div class="model-type-badge">
                  <i class="fas fa-file-alt"></i>
                  问卷模版
                </div>
                <div class="selection-indicator" v-if="selectedModelId === model.modelId">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>

              <div class="model-content">
                <h3 class="model-title">{{ model.modelTitle || '未命名模版' }}</h3>
                <p v-if="model.modelDesc" class="model-description">
                  {{ model.modelDesc }}
                </p>
              </div>

              <div class="model-questions">
                <div class="questions-info">
                  <div class="question-count">
                    <i class="fas fa-list-ol"></i>
                    <span>{{ getModelQuestionCount(model) }} 个问题</span>
                  </div>
                </div>
              </div>

              <div class="model-footer">
                <span class="model-id">ID: {{ model.modelId }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="step-actions">
            <button @click="goBack" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              返回
            </button>
            <button @click="goToStep2" class="btn btn-primary" :disabled="!selectedModelId">
              <i class="fas fa-arrow-right"></i>
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤2: 配置问卷 -->
    <div v-else-if="currentStep === 2" class="step-content">
      <div class="content-card">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-cog"></i>
            配置问卷信息
          </h2>
          <p class="section-description">设置问卷的基本信息</p>
        </div>

        <div class="form-section">
          <div class="selected-model-info">
            <h4>已选择的模版</h4>
            <div class="model-summary">
              <div class="summary-content">
                <h5>{{ selectedModel?.modelTitle || '未命名模版' }}</h5>
                <p>{{ selectedModel?.modelDesc || '无描述' }}</p>
                <span class="question-count">
                  <i class="fas fa-list-ol"></i>
                  {{ getModelQuestionCount(selectedModel) }} 个问题
                </span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">问卷标题 <span class="required">*</span></label>
            <input v-model="questionnaireForm.questionnaireTitle" type="text" class="form-input" placeholder="请输入问卷标题"
              maxlength="100" />
            <p class="field-hint">为您的问卷设置一个易于识别的标题</p>
          </div>

          <div class="form-group">
            <label class="field-label">问卷状态</label>
            <select v-model="selectedStatusType" @change="handleStatusChange" class="form-select">
              <option value="draft">草稿 - 未启用</option>
              <option value="active">启用 - 可接收回复</option>
              <option value="paused">暂停 - 暂时停止接收回复</option>
            </select>
            <p class="field-hint">推荐先创建为草稿状态，确认无误后再启用</p>
          </div>

          <!-- 启用状态的时间配置 -->
          <div v-if="selectedStatusType === 'active'" class="form-group">
            <label class="field-label">时间配置 (可选)</label>
            <div class="date-inputs">
              <div class="date-input-group">
                <label class="sub-label">开始时间</label>
                <input v-model="statusStartDate" @change="handleStatusChange" type="datetime-local" class="form-input"
                  placeholder="选择开始时间" />
              </div>
              <div class="date-input-group">
                <label class="sub-label">结束时间</label>
                <input v-model="statusEndDate" @change="handleStatusChange" type="datetime-local" class="form-input"
                  placeholder="选择结束时间" />
              </div>
            </div>
            <p class="field-hint">留空表示不限制时间范围</p>
          </div>


        </div>

        <!-- 操作按钮 -->
        <div class="step-actions">
          <button @click="goToStep1" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            上一步
          </button>
          <button @click="createQuestionnaire" class="btn btn-primary" :disabled="!isFormValid || creating">
            <i class="fas fa-check" v-if="!creating"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ creating ? '创建中...' : '创建问卷' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 步骤3: 完成创建 -->
    <div v-else-if="currentStep === 3" class="step-content">
      <div class="content-card success-card">
        <div class="success-content">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2 class="success-title">问卷创建成功！</h2>
          <p class="success-description">您的问卷已成功创建并保存</p>

          <div class="success-details">
            <div class="detail-item">
              <label>问卷ID：</label>
              <span class="detail-value">{{ createdQuestionnaireId }}</span>
            </div>
            <div class="detail-item">
              <label>问卷标题：</label>
              <span class="detail-value">{{ questionnaireForm.questionnaireTitle }}</span>
            </div>
            <div class="detail-item">
              <label>基于模版：</label>
              <span class="detail-value">{{ selectedModel?.modelTitle || '未命名模版' }}</span>
            </div>
            <div class="detail-item">
              <label>问卷状态：</label>
              <span class="detail-value status-badge" :class="statusClass">
                {{ getStatusDisplay(questionnaireForm.questionnaireStatus) }}
              </span>
            </div>
          </div>

          <div class="success-actions">
            <button @click="createAnother" class="btn btn-secondary">
              <i class="fas fa-plus"></i>
              再创建一个
            </button>
            <router-link :to="{ name: 'questionnaire_my' }" class="btn btn-primary">
              <i class="fas fa-list"></i>
              查看我的问卷
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message.text" class="message-container" :class="message.type">
      <div class="message-content">
        <i :class="getMessageIcon(message.type)"></i>
        <span>{{ message.text }}</span>
        <button @click="clearMessage" class="message-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import {
  getQuestionnaireModelsByIds,
  parseQuestionsArraySync,
  type QuestionnaireModel
} from '@/scripts/questionnaireModelQuery'
import {
  createQuestionnaire as createQuestionnaireAPI,
  createDraftStatus,
  createActiveStatus,
  createPausedStatus,
  createDraftStatusJson,
  createActiveStatusJson,
  createPausedStatusJson,
  deserializeQuestionnaireStatus,
  type CreateQuestionnaireRequest,
  type QuestionnaireStatus
} from '@/scripts/questionnaireCreate'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const loadingText = ref('正在加载...')
const creating = ref(false)
const currentStep = ref(1)
const models = ref<QuestionnaireModel[]>([])
const selectedModelId = ref<string | null>(null)
const selectedModel = ref<QuestionnaireModel | null>(null)
const createdQuestionnaireId = ref('')

// 状态选择管理
const selectedStatusType = ref('draft')
const statusStartDate = ref('')
const statusEndDate = ref('')

// 问卷表单数据
const questionnaireForm = ref<CreateQuestionnaireRequest>({
  questionnaireStatus: createDraftStatusJson(),
  modelId: '',
  questionnaireTitle: '',
  canDelete: 0
})

// 内部状态管理（用于显示和编辑）
const currentStatusObject = ref<QuestionnaireStatus>(createDraftStatus())

// 消息提示
const message = ref({
  text: '',
  type: 'success'
})

// 计算属性
const isFormValid = computed(() => {
  return questionnaireForm.value.modelId !== '' &&
    questionnaireForm.value.questionnaireTitle.trim() !== '' &&
    selectedModel.value !== null
})

const statusClass = computed(() => {
  const status = currentStatusObject.value
  return {
    'status-draft': !status.active && selectedStatusType.value === 'draft',
    'status-active': status.active && selectedStatusType.value === 'active',
    'status-paused': !status.active && selectedStatusType.value === 'paused'
  }
})

// 方法
async function loadModels() {
  if (!userStore.isLoggedIn) {
    showMessage('请先登录', 'error')
    return
  }

  const modelIds = userStore.userData?.QuestionnaireModel_ids
  if (!modelIds || modelIds.length === 0) {
    models.value = []
    return
  }

  loading.value = true
  loadingText.value = '正在加载您的模版...'

  try {
    const fetchedModels = await getQuestionnaireModelsByIds(modelIds)
    models.value = fetchedModels
  } catch (error) {
    console.error('Failed to load models:', error)
    showMessage('加载模版失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

function getModelQuestionCount(model: QuestionnaireModel | null): number {
  if (!model) return 0
  const questions = parseQuestionsArraySync(model.questionsArray)
  return questions.length
}

function selectModel(model: QuestionnaireModel) {
  selectedModelId.value = model.modelId
  selectedModel.value = model
  questionnaireForm.value.modelId = model.modelId || ''
} function goToStep1() {
  currentStep.value = 1
}

function goToStep2() {
  if (!selectedModelId.value) {
    showMessage('请先选择一个模版', 'error')
    return
  }
  currentStep.value = 2
} async function createQuestionnaire() {
  if (!isFormValid.value) {
    showMessage('请完善所有必填信息', 'error')
    return
  }

  creating.value = true
  loadingText.value = '正在创建问卷...'

  try {
    const result = await createQuestionnaireAPI(questionnaireForm.value)
    createdQuestionnaireId.value = result.questionnaireId

    // 将创建的问卷ID添加到用户数据中
    if (userStore.userData) {
      userStore.addQuestionnaireId(result.questionnaireId)
    }

    currentStep.value = 3
    showMessage('问卷创建成功！', 'success')
  } catch (error: unknown) {
    console.error('Failed to create questionnaire:', error)
    const errorMessage = error instanceof Error ? error.message : '问卷创建失败'
    showMessage(errorMessage, 'error')
  } finally {
    creating.value = false
  }
}

function createAnother() {
  // 重置表单
  currentStep.value = 1
  selectedModelId.value = null
  selectedModel.value = null
  createdQuestionnaireId.value = ''
  questionnaireForm.value = {
    questionnaireStatus: createDraftStatusJson(),
    modelId: '',
    questionnaireTitle: '',
    canDelete: 1
  }
  currentStatusObject.value = createDraftStatus()
  selectedStatusType.value = 'draft'
  statusStartDate.value = ''
  statusEndDate.value = ''
  clearMessage()
}

function goBack() {
  router.push({ name: 'questionnaire_my' })
}

function getStatusDisplay(statusJson: string): string {
  try {
    const status = deserializeQuestionnaireStatus(statusJson)
    if (status.active) {
      return '启用'
    } else {
      return selectedStatusType.value === 'draft' ? '草稿' : '暂停'
    }
  } catch {
    return '未知状态'
  }
}

// 状态变更处理函数
function handleStatusChange() {
  const startDate = statusStartDate.value ? new Date(statusStartDate.value) : undefined
  const endDate = statusEndDate.value ? new Date(statusEndDate.value) : undefined

  let statusObject: QuestionnaireStatus
  let statusJson: string

  switch (selectedStatusType.value) {
    case 'draft':
      statusObject = createDraftStatus()
      statusJson = createDraftStatusJson()
      break
    case 'active':
      statusObject = createActiveStatus(startDate, endDate)
      statusJson = createActiveStatusJson(startDate, endDate)
      break
    case 'paused':
      statusObject = createPausedStatus()
      statusJson = createPausedStatusJson()
      break
    default:
      statusObject = createDraftStatus()
      statusJson = createDraftStatusJson()
  }

  // 更新内部状态对象和表单JSON字符串
  currentStatusObject.value = statusObject
  questionnaireForm.value.questionnaireStatus = statusJson
}

// 将Timestamp转换为datetime-local输入格式
function timestampToDatetimeLocal(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  // 转换为本地时间的datetime-local格式 (YYYY-MM-DDTHH:mm)
  return date.toISOString().slice(0, 16)
}

// 当状态对象变化时，同步更新UI输入框
watch(currentStatusObject, (newStatus: QuestionnaireStatus) => {
  if (newStatus.startDate) {
    statusStartDate.value = timestampToDatetimeLocal(newStatus.startDate)
  }
  if (newStatus.endDate) {
    statusEndDate.value = timestampToDatetimeLocal(newStatus.endDate)
  }
}, { deep: true })

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
  const icons: { [key: string]: string } = {
    'success': 'fas fa-check-circle',
    'error': 'fas fa-exclamation-circle',
    'warning': 'fas fa-exclamation-triangle',
    'info': 'fas fa-info-circle'
  }
  return icons[type] || 'fas fa-info-circle'
}



// 组件挂载时加载数据
onMounted(() => {
  loadModels()
})
</script>

<style scoped>
.questionnaire-create {
  padding: 2rem;
  max-width: 1000px;
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

/* 步骤指示器 */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.step.active .step-number {
  background: #4facfe;
  border-color: #4facfe;
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.5);
}

.step.completed .step-number {
  background: #10b981;
  border-color: #10b981;
}

.step-label {
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
}

.step.active .step-label,
.step.completed .step-label {
  opacity: 1;
  font-weight: 600;
}

.step-connector {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 1rem;
}

/* 内容卡片 */
.content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.success-card {
  text-align: center;
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
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-spinner p {
  font-size: 1.1rem;
}

/* 章节头部 */
.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.section-title i {
  color: #4facfe;
}

.section-description {
  color: #6b7280;
  font-size: 1rem;
}

/* 空状态 */
.empty-section {
  text-align: center;
  padding: 3rem;
}

.empty-content i {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-content h3 {
  color: #374151;
  margin-bottom: 1rem;
}

.empty-content p {
  color: #6b7280;
  margin-bottom: 2rem;
}

/* 模版网格 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.model-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.model-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.model-card.selected {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.05);
}

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

.selection-indicator {
  color: #4facfe;
  font-size: 1.5rem;
}

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

.model-questions {
  margin-bottom: 1rem;
}

.questions-info {
  background: #e5e7eb;
  border-radius: 8px;
  padding: 0.8rem;
}

.question-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.question-count i {
  color: #6366f1;
}

.model-footer {
  font-size: 0.8rem;
  color: #6b7280;
}

/* 表单部分 */
.form-section {
  margin-bottom: 2rem;
}

.selected-model-info {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.selected-model-info h4 {
  color: #0c4a6e;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.model-summary {
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.summary-content h5 {
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.summary-content p {
  color: #6b7280;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.question-count {
  color: #0ea5e9;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #34495e;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.field-helper {
  margin-top: 0.5rem;
}

.field-hint {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

.required {
  color: #dc3545;
  margin-left: 0.2rem;
}

/* 日期输入组样式 */
.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sub-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
}

@media (max-width: 768px) {
  .date-inputs {
    grid-template-columns: 1fr;
  }
}

/* 复选框样式 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.checkbox-input:checked+.checkbox-custom {
  background: #4facfe;
  border-color: #4facfe;
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 步骤操作按钮 */
.step-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e1e8ed;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 成功页面 */
.success-content {
  padding: 2rem;
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.success-title {
  color: #1f2937;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.success-description {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.success-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #1f2937;
  font-weight: 600;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-paused {
  background: #fee2e2;
  color: #991b1b;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* 消息提示 */
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
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
  background: #d4edda;
  border-left: 4px solid #28a745;
  color: #155724;
}

.message-container.error {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
  color: #721c24;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.message-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  margin-left: auto;
}

.message-close:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-create {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .steps-indicator {
    margin-bottom: 2rem;
  }

  .step-connector {
    width: 40px;
  }

  .models-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
  }

  .success-actions {
    flex-direction: column;
  }
}
</style>
