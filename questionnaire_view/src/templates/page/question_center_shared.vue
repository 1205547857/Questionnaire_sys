<template>
  <div class="question-center-shared">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-share-alt"></i>
        共享问题中心
      </h1>
      <p class="page-description">发现和引用其他用户共享的问题组件</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-share-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalSharedQuestions }}</h3>
            <p>共享问题总数</p>
          </div>
        </div>

        <div class="stat-card" v-for="(count, type) in questionTypeStats" :key="type">
          <div class="stat-icon">
            <i :class="getSharedQuestionTypeIcon(type)"></i>
          </div>
          <div class="stat-info">
            <h3>{{ count }}</h3>
            <p>{{ getSharedQuestionTypeDisplayName(type) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model="searchKeyword" type="text" placeholder="搜索共享问题标题或内容..." class="search-input" />
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

        <button @click="refreshSharedQuestions" class="btn btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载共享问题...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredQuestions.length === 0" class="empty-section">
      <div class="empty-content">
        <i class="fas fa-share-alt"></i>
        <h3>{{ sharedQuestions.length === 0 ? '暂无共享问题' : '没有找到匹配的问题' }}</h3>
        <p>{{ sharedQuestions.length === 0 ? '还没有用户共享问题组件' : '尝试调整搜索条件或筛选器' }}</p>
      </div>
    </div>

    <!-- 共享问题列表 -->
    <div v-else class="questions-section">
      <div class="questions-grid">
        <div v-for="question in filteredQuestions" :key="question.questionId" class="question-card">
          <!-- 问题卡片头部 -->
          <div class="question-header">
            <div class="question-type-badge">
              <i :class="getSharedQuestionTypeIcon(question.questionType)"></i>
              {{ getSharedQuestionTypeDisplayName(question.questionType) }}
            </div>
            <div class="question-actions">
              <button @click="previewQuestion(question)" class="action-btn preview-btn" title="预览问题">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="referenceQuestion(question)" class="action-btn reference-btn" title="引用问题"
                :disabled="referencingQuestions.has(question.questionId)">
                <i class="fas fa-copy" :class="{ 'fa-spin': referencingQuestions.has(question.questionId) }"></i>
              </button>
            </div>
          </div>

          <!-- 问题内容 -->
          <div class="question-content">
            <h3 class="question-title">{{ question.questionTitle }}</h3>
            <p v-if="question.questionTxt" class="question-description">{{ question.questionTxt }}</p>

            <!-- 选项预览 -->
            <div v-if="hasOptions(question.questionType)" class="question-options-preview">
              <h4 class="options-title">选项预览:</h4>
              <div class="options-list">
                <div v-for="(option, index) in parseSharedQuestionOptions(question.questionOptions)" :key="index"
                  class="option-item">
                  <span class="option-index">{{ index + 1 }}.</span>
                  <span class="option-text">{{ option }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 问题标识 -->
          <div class="question-footer">
            <div class="question-id">
              <i class="fas fa-hashtag"></i>
              ID: {{ question.questionId }}
            </div>
            <div class="shared-badge">
              <i class="fas fa-share-alt"></i>
              共享问题
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="previewingQuestion" class="modal-overlay" @click="closePreview">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <i :class="getSharedQuestionTypeIcon(previewingQuestion.questionType)"></i>
            问题预览
          </h2>
          <button @click="closePreview" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="preview-question">
            <div class="preview-type-badge">
              {{ getSharedQuestionTypeDisplayName(previewingQuestion.questionType) }}
            </div>
            <h3 class="preview-title">{{ previewingQuestion.questionTitle }}</h3>
            <p v-if="previewingQuestion.questionTxt" class="preview-description">{{ previewingQuestion.questionTxt }}
            </p>

            <!-- 预览不同题型 -->
            <div class="preview-content">
              <!-- 单选题预览 -->
              <div v-if="previewingQuestion.questionType === 'single'" class="preview-options">
                <div v-for="(option, index) in parseSharedQuestionOptions(previewingQuestion.questionOptions)"
                  :key="index" class="preview-option">
                  <input type="radio" :name="`preview-${previewingQuestion.questionId}`" disabled />
                  <span>{{ option }}</span>
                </div>
              </div>

              <!-- 多选题预览 -->
              <div v-else-if="previewingQuestion.questionType === 'multiple'" class="preview-options">
                <div v-for="(option, index) in parseSharedQuestionOptions(previewingQuestion.questionOptions)"
                  :key="index" class="preview-option">
                  <input type="checkbox" disabled />
                  <span>{{ option }}</span>
                </div>
              </div>

              <!-- 下拉列表预览 -->
              <div v-else-if="previewingQuestion.questionType === 'dropdown'" class="preview-dropdown">
                <select disabled class="preview-select">
                  <option>请选择...</option>
                  <option v-for="(option, index) in parseSharedQuestionOptions(previewingQuestion.questionOptions)"
                    :key="index">
                    {{ option }}
                  </option>
                </select>
              </div>

              <!-- 文本题预览 -->
              <div v-else-if="previewingQuestion.questionType === 'text'" class="preview-text">
                <textarea placeholder="请在此输入您的回答..." disabled class="preview-textarea"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="referenceQuestion(previewingQuestion)" class="btn btn-primary"
            :disabled="referencingQuestions.has(previewingQuestion.questionId)">
            <i class="fas fa-copy" :class="{ 'fa-spin': referencingQuestions.has(previewingQuestion.questionId) }"></i>
            引用此问题
          </button>
          <button @click="closePreview" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            关闭
          </button>
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
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  getSharedQuestions,
  referenceSharedQuestion,
  parseSharedQuestionOptions,
  getSharedQuestionTypeDisplayName,
  getSharedQuestionTypeIcon,
  type SharedQuestion
} from '@/scripts/questionShared'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const sharedQuestions = ref<SharedQuestion[]>([])
const searchKeyword = ref('')
const selectedType = ref('')
const previewingQuestion = ref<SharedQuestion | null>(null)
const referencingQuestions = reactive(new Set<string>())

// 消息提示
const message = reactive({
  text: '',
  type: 'success'
})

// 计算属性
const totalSharedQuestions = computed(() => sharedQuestions.value.length)

const questionTypeStats = computed(() => {
  const stats: Record<string, number> = {}
  sharedQuestions.value.forEach(question => {
    const type = question.questionType
    stats[type] = (stats[type] || 0) + 1
  })
  return stats
})

const filteredQuestions = computed(() => {
  let filtered = sharedQuestions.value

  // 按类型筛选
  if (selectedType.value) {
    filtered = filtered.filter(q => q.questionType === selectedType.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(q =>
      q.questionTitle.toLowerCase().includes(keyword) ||
      (q.questionTxt && q.questionTxt.toLowerCase().includes(keyword))
    )
  }

  return filtered
})

// 方法
async function loadSharedQuestions() {
  loading.value = true
  try {
    console.log('Loading shared questions...')
    const questions = await getSharedQuestions()
    sharedQuestions.value = questions
    console.log('Loaded shared questions:', questions.length)
  } catch (error) {
    console.error('Failed to load shared questions:', error)
    showMessage('加载共享问题失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

async function refreshSharedQuestions() {
  await loadSharedQuestions()
  showMessage('共享问题列表已刷新', 'success')
}

function previewQuestion(question: SharedQuestion) {
  previewingQuestion.value = question
}

function closePreview() {
  previewingQuestion.value = null
}

async function referenceQuestion(question: SharedQuestion) {
  if (referencingQuestions.has(question.questionId)) {
    return
  }

  try {
    referencingQuestions.add(question.questionId)
    console.log('Referencing question:', question)

    const success = await referenceSharedQuestion(question)

    if (success) {
      showMessage(`问题 "${question.questionTitle}" 引用成功！您可以在"我的问题"中查看`, 'success')
      closePreview()

      // 延迟跳转到我的问题页面
      setTimeout(() => {
        router.push('/page/question_center_my')
      }, 2000)
    } else {
      showMessage('引用问题失败，请稍后重试', 'error')
    }
  } catch (error) {
    console.error('Error referencing question:', error)
    showMessage('引用问题失败，请稍后重试', 'error')
  } finally {
    referencingQuestions.delete(question.questionId)
  }
}

function hasOptions(questionType: string): boolean {
  return ['single', 'multiple', 'dropdown'].includes(questionType)
}

function showMessage(text: string, type: string) {
  message.text = text
  message.type = type

  // 自动清除消息
  setTimeout(() => {
    clearMessage()
  }, 5000)
}

function clearMessage() {
  message.text = ''
  message.type = 'success'
}

function getMessageIcon(type: string): string {
  const iconMap: Record<string, string> = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  }
  return iconMap[type] || 'fas fa-info-circle'
}

// 生命周期
onMounted(() => {
  loadSharedQuestions()
})
</script>

<style scoped>
/* 整体布局 */
.question-center-shared {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title i {
  margin-right: 0.8rem;
  color: #ffd700;
}

.page-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 统计信息 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-size: 1.5rem;
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.stat-info p {
  margin: 0.25rem 0 0 0;
  color: #7f8c8d;
  font-weight: 500;
}

/* 筛选区域 */
.filter-section {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.filter-dropdown {
  min-width: 150px;
}

.type-filter {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-filter:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-refresh {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* 加载和空状态 */
.loading-section,
.empty-section {
  text-align: center;
  padding: 4rem 2rem;
  color: white;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffd700;
}

.loading-spinner p {
  font-size: 1.2rem;
  margin: 0;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.empty-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

/* 问题列表 */
.questions-section {
  max-width: 1200px;
  margin: 0 auto;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.question-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e1e8ed;
}

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #4facfe;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.question-type-badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.preview-btn {
  background: #17a2b8;
  color: white;
}

.preview-btn:hover {
  background: #138496;
  transform: scale(1.1);
}

.reference-btn {
  background: #28a745;
  color: white;
}

.reference-btn:hover:not(:disabled) {
  background: #218838;
  transform: scale(1.1);
}

.reference-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.question-content {
  margin-bottom: 1.5rem;
}

.question-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.question-description {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.question-options-preview {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
}

.options-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.option-index {
  font-weight: 500;
  color: #495057;
  min-width: 20px;
}

.option-text {
  flex: 1;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.question-id {
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.shared-badge {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #6c757d;
}

.modal-close:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.preview-question {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
}

.preview-type-badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.preview-description {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.preview-content {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.preview-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.preview-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.preview-option:hover {
  background: #f8f9fa;
}

.preview-option input {
  margin: 0;
}

.preview-dropdown,
.preview-text {
  width: 100%;
}

.preview-select,
.preview-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.preview-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* 消息提示 */
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  min-width: 300px;
  max-width: 500px;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.message-container.success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.9), rgba(40, 167, 69, 0.8));
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: white;
}

.message-container.error {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(220, 53, 69, 0.8));
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: white;
}

.message-container.warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 193, 7, 0.8));
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #212529;
}

.message-container.info {
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.9), rgba(23, 162, 184, 0.8));
  border: 1px solid rgba(23, 162, 184, 0.3);
  color: white;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.message-content i {
  font-size: 1.2rem;
}

.message-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: auto;
  padding: 0.2rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.message-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-center-shared {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .questions-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .question-card {
    padding: 1.5rem;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    max-height: 90vh;
  }

  .message-container {
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .question-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .question-actions {
    align-self: flex-end;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
