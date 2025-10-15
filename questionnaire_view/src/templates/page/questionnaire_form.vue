<template>
  <div class="questionnaire-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ questionnaire?.questionnaireTitle || '问卷调查' }}</h1>
        <p v-if="questionnaire?.questionnaireTitle" class="page-subtitle">感谢您参与此次问卷调查</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载问卷...</p>
      </div>
    </div>

    <!-- 问卷不存在或未启动 -->
    <div v-else-if="!questionnaire || !isQuestionnaireActive" class="error-section">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>{{ !questionnaire ? '问卷不存在' : '问卷未启动' }}</h3>
        <p>{{ getErrorMessage() }}</p>
      </div>
    </div>

    <!-- 问卷表单 -->
    <div v-else class="questionnaire-container">
      <div class="questionnaire-card">
        <!-- 问卷信息 -->
        <div class="questionnaire-info">
          <h2 class="questionnaire-title">{{ questionnaire.questionnaireTitle }}</h2>
          <div class="questionnaire-meta">
            <span class="meta-item">
              <i class="fas fa-clock"></i>
              预计用时: {{ estimatedTime }}分钟
            </span>
            <span class="meta-item">
              <i class="fas fa-list-ol"></i>
              共{{ questions.length }}道题目
            </span>
          </div>
        </div>

        <!-- 问题列表 -->
        <form @submit.prevent="submitQuestionnaire" class="questions-form">
          <div v-for="(question, index) in questions" :key="question.id" class="question-item">
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}</span>
              <div class="question-content">
                <h3 class="question-title">{{ question.title }}</h3>
                <p v-if="question.description" class="question-description">
                  {{ question.description }}
                </p>
              </div>
              <div class="question-type">
                <span class="type-badge">{{ getQuestionTypeDisplay(question.type) }}</span>
              </div>
            </div>

            <!-- 问题输入区域 -->
            <div class="question-input">
              <!-- 单选题 -->
              <div v-if="question.type === 'single'" class="input-group">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item">
                  <input :id="`q${index}_${optionIndex}`" v-model="answers[question.id]" type="radio"
                    :name="`question_${question.id}`" :value="option" class="radio-input" />
                  <label :for="`q${index}_${optionIndex}`" class="radio-label">
                    <span class="radio-custom"></span>
                    <span class="option-text">{{ option }}</span>
                  </label>
                </div>
              </div>

              <!-- 多选题 -->
              <div v-else-if="question.type === 'multiple'" class="input-group">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item">
                  <input :id="`q${index}_${optionIndex}`" v-model="answers[question.id]" type="checkbox" :value="option"
                    class="checkbox-input" />
                  <label :for="`q${index}_${optionIndex}`" class="checkbox-label">
                    <span class="checkbox-custom"></span>
                    <span class="option-text">{{ option }}</span>
                  </label>
                </div>
              </div>

              <!-- 下拉选择题 -->
              <div v-else-if="question.type === 'dropdown'" class="input-group">
                <select v-model="answers[question.id]" class="select-input">
                  <option value="">请选择...</option>
                  <option v-for="(option, optionIndex) in question.options" :key="optionIndex" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <!-- 文本题 -->
              <div v-else-if="question.type === 'text'" class="input-group">
                <textarea v-model="answers[question.id]" class="text-input" placeholder="请输入您的答案..."
                  rows="4"></textarea>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="submit-section">
            <div class="submit-actions">
              <button type="button" @click="saveDraft" class="btn btn-secondary" :disabled="submitting">
                <i class="fas fa-save"></i>
                保存草稿
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || !isFormValid">
                <i class="fas fa-paper-plane"></i>
                {{ submitting ? '提交中...' : '提交问卷' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 提交成功 -->
    <div v-if="submitted" class="success-overlay">
      <div class="success-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>提交成功</h3>
        <p>感谢您的参与！您的回答已成功提交。</p>
        <button @click="resetForm" class="btn btn-primary">
          <i class="fas fa-redo"></i>
          重新填写
        </button>
      </div>
    </div>

    <!-- 调试信息（开发模式） -->
    <div v-if="isDevelopment" class="debug-panel">
      <details>
        <summary>🔧 调试信息</summary>
        <div class="debug-content">
          <p><strong>问卷ID:</strong> {{ debugInfo.questionnaireId }}</p>
          <p><strong>API基础URL:</strong> {{ debugInfo.apiBaseUrl }}</p>
          <p><strong>问卷端点:</strong> {{ debugInfo.questionnairePath }}</p>
          <p><strong>模型端点:</strong> {{ debugInfo.modelPath }}</p>
          <p><strong>时间戳:</strong> {{ debugInfo.timestamp }}</p>
          <button @click="testConnection" class="test-btn">测试API连接</button>
        </div>
      </details>
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
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  getPublicQuestionnaireById,
  getPublicQuestionnaireModelById,
  parsePublicQuestionsArray,
  submitPublicQuestionnaireAnswers,
  savePublicQuestionnaireDraft,
  loadPublicQuestionnaireDraft,
  testApiConnection,
  API_BASE_URL,
  API_ENDPOINTS,
  type QuestionnaireAnswers
} from '@/scripts/questionnairePublicApi'
import { deserializeQuestionnaireStatus, type Questionnaire } from '@/scripts/questionnaireCreate'

const route = useRoute()

// 响应式数据
const questionnaire = ref<Questionnaire | null>(null)
const questions = ref<Array<{ id: string; type: string; title: string; description?: string; options?: string[] }>>([])
const answers = reactive<QuestionnaireAnswers>({})
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)

// 消息提示
const message = ref({
  text: '',
  type: 'success'
})

// 计算属性
const questionnaireId = computed(() => route.params.id as string)

// 开发模式检查
const isDevelopment = computed(() => import.meta.env.DEV)

// 调试信息
const debugInfo = computed(() => ({
  timestamp: new Date().toISOString(),
  questionnaireId: questionnaireId.value,
  apiBaseUrl: API_BASE_URL,
  questionnairePath: API_ENDPOINTS.questionnaire.replace('{id}', questionnaireId.value),
  modelPath: API_ENDPOINTS.model.replace('{id}', questionnaireId.value)
}))

const isQuestionnaireActive = computed(() => {
  if (!questionnaire.value) return false
  try {
    const status = deserializeQuestionnaireStatus(questionnaire.value.questionnaireStatus)
    return status.active
  } catch {
    return false
  }
})

const estimatedTime = computed(() => {
  // 简单估算：每个问题1分钟
  return Math.max(1, Math.ceil(questions.value.length * 0.5))
})

const isFormValid = computed(() => {
  // 检查是否所有问题都已回答（简单验证）
  return questions.value.length > 0 && questions.value.some(q => answers[q.id] !== undefined && answers[q.id] !== '')
})

// 方法
async function loadQuestionnaire() {
  loading.value = true
  try {
    // 首先测试API连接
    const apiAvailable = await testApiConnection()
    if (!apiAvailable) {
      console.warn('API connection test failed, but continuing with request')
    }

    const data = await getPublicQuestionnaireById(questionnaireId.value)
    if (data) {
      questionnaire.value = data

      // 加载问卷问题
      await loadQuestions()

      // 加载草稿（如果有）
      loadDraftAnswers()
    } else {
      showMessage('未找到指定的问卷，请检查链接是否正确', 'error')
    }
  } catch (error) {
    console.error('Failed to load questionnaire:', error)
    showMessage('加载问卷失败，请检查网络连接', 'error')
  } finally {
    loading.value = false
  }
}

async function loadQuestions() {
  if (!questionnaire.value) return

  try {
    const model = await getPublicQuestionnaireModelById(questionnaire.value.modelId)
    if (model) {
      const questionList = await parsePublicQuestionsArray(model.questionsArray)
      questions.value = questionList

      // 初始化答案对象
      questionList.forEach((question: { id: string; type: string }) => {
        if (question.type === 'multiple') {
          answers[question.id] = []
        } else {
          answers[question.id] = ''
        }
      })
    }
  } catch (error) {
    console.error('Failed to load questions:', error)
    showMessage('加载问题失败', 'error')
  }
}

async function submitQuestionnaire() {
  if (!isFormValid.value) {
    showMessage('请完成所有问题后再提交', 'warning')
    return
  }

  submitting.value = true
  try {
    const result = await submitPublicQuestionnaireAnswers(questionnaireId.value, answers)

    if (result.success) {
      submitted.value = true
      showMessage(result.message, 'success')
      // 清除草稿
      clearDraft()
    } else {
      showMessage(result.message, 'error')
    }
  } catch (error) {
    console.error('Failed to submit questionnaire:', error)
    showMessage('提交失败，请稍后重试', 'error')
  } finally {
    submitting.value = false
  }
}

async function saveDraft() {
  try {
    const result = await savePublicQuestionnaireDraft(questionnaireId.value, answers)
    showMessage(result.message, result.success ? 'success' : 'error')
  } catch (error) {
    console.error('Failed to save draft:', error)
    showMessage('保存失败，请稍后重试', 'error')
  }
}

// 测试API连接
async function testConnection() {
  try {
    showMessage('正在测试API连接...', 'info')
    const isConnected = await testApiConnection()
    if (isConnected) {
      showMessage('API连接测试成功！', 'success')
      console.log('API连接正常:', {
        baseUrl: API_BASE_URL,
        endpoints: API_ENDPOINTS
      })
    } else {
      showMessage('API连接测试失败：服务器无响应', 'error')
    }
  } catch (error) {
    console.error('API连接测试异常:', error)
    showMessage('API连接测试异常：网络错误或服务器不可用', 'error')
  }
}

function resetForm() {
  submitted.value = false

  // 重置答案
  questions.value.forEach((question: { id: string; type: string }) => {
    if (question.type === 'multiple') {
      answers[question.id] = []
    } else {
      answers[question.id] = ''
    }
  })
}

// 加载草稿答案
function loadDraftAnswers() {
  const draftAnswers = loadPublicQuestionnaireDraft(questionnaireId.value)
  if (draftAnswers) {
    Object.assign(answers, draftAnswers)
    showMessage('已加载上次保存的草稿', 'info')
  }
}

// 清除草稿
function clearDraft() {
  try {
    const draftKey = `questionnaire_draft_${questionnaireId.value}`
    localStorage.removeItem(draftKey)
  } catch (error) {
    console.error('Failed to clear draft:', error)
  }
}

function getErrorMessage(): string {
  if (!questionnaire.value) {
    return '未找到指定的问卷，请检查链接是否正确。如果问题持续，请联系问卷发布者。'
  } else if (!isQuestionnaireActive.value) {
    return '该问卷当前未开放，请联系问卷发布者。问卷可能已结束或尚未开始。'
  }
  return '加载过程中发生未知错误，请刷新页面重试。'
}

function getQuestionTypeDisplay(type: string): string {
  const typeMap: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    text: '问答题',
    dropdown: '下拉题'
  }
  return typeMap[type] || type
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
  loadQuestionnaire()
})
</script>

<style scoped>
.questionnaire-form {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  /* 确保填写页面完全独立，占满整个视口 */
  width: 100vw;
  margin: 0;
  position: relative;
}

/* 重置所有可能的系统样式影响 */
.questionnaire-form * {
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

/* 加载和错误状态 */
.loading-section,
.error-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner,
.error-content {
  text-align: center;
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-spinner i {
  font-size: 3rem;
  color: #4299e1;
  margin-bottom: 1rem;
}

.error-content i {
  font-size: 4rem;
  color: #f56565;
  margin-bottom: 1rem;
}

.error-content h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #718096;
  margin-bottom: 0;
}

/* 问卷容器 */
.questionnaire-container {
  max-width: 800px;
  margin: 0 auto;
}

.questionnaire-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 问卷信息 */
.questionnaire-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem;
  text-align: center;
}

.questionnaire-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.questionnaire-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 问题表单 */
.questions-form {
  padding: 2rem;
}

.question-item {
  margin-bottom: 3rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 2rem;
}

.question-item:last-child {
  border-bottom: none;
  margin-bottom: 2rem;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.question-number {
  background: #4299e1;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-title {
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.4;
}

.question-description {
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.question-type {
  flex-shrink: 0;
}

.type-badge {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 输入组件 */
.question-input {
  padding-left: 3rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
}

/* 单选按钮 */
.radio-input {
  display: none;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  width: 100%;
}

.radio-label:hover {
  background: #f7fafc;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.radio-input:checked+.radio-label .radio-custom {
  border-color: #4299e1;
  background: #4299e1;
}

.radio-input:checked+.radio-label .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* 复选框 */
.checkbox-input {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  width: 100%;
}

.checkbox-label:hover {
  background: #f7fafc;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-input:checked+.checkbox-label .checkbox-custom {
  border-color: #4299e1;
  background: #4299e1;
}

.checkbox-input:checked+.checkbox-label .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.option-text {
  color: #2d3748;
  line-height: 1.4;
}

/* 下拉选择和文本输入 */
.select-input,
.text-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.select-input:focus,
.text-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.text-input {
  resize: vertical;
  min-height: 100px;
}

/* 提交区域 */
.submit-section {
  border-top: 2px solid #e2e8f0;
  padding-top: 2rem;
  margin-top: 2rem;
}

.submit-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #4299e1 0%, #3182ce 100%);
  color: white;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 成功覆盖层 */
.success-overlay {
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
}

.success-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.success-icon {
  font-size: 4rem;
  color: #48bb78;
  margin-bottom: 1rem;
}

.success-content h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.success-content p {
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.5;
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
  background: #f0fff4;
  border-left: 4px solid #48bb78;
  color: #22543d;
}

.message-container.error {
  background: #fed7d7;
  border-left: 4px solid #f56565;
  color: #742a2a;
}

.message-container.warning {
  background: #fefcbf;
  border-left: 4px solid #ed8936;
  color: #744210;
}

.message-container.info {
  background: #e0f2fe;
  border-left: 4px solid #0ea5e9;
  color: #0c4a6e;
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
  .questionnaire-form {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .questionnaire-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .questions-form {
    padding: 1.5rem;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-input {
    padding-left: 0;
  }

  .submit-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}

/* 调试面板样式 */
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 10px;
  max-width: 400px;
  font-size: 12px;
  z-index: 1000;
}

.debug-panel summary {
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
}

.debug-panel summary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.debug-content p {
  margin: 5px 0;
  word-break: break-all;
}

.test-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  margin-top: 10px;
}

.test-btn:hover {
  background: #45a049;
}
</style>
