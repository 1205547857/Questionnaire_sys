<template>
  <div class="questionnaire-model-edit">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-edit"></i>
        编辑问卷模版
      </h1>
      <p class="page-description">修改您的问卷模版信息</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载模版信息...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-section">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="loadModel" class="btn btn-primary">
          <i class="fas fa-redo"></i>
          重试
        </button>
      </div>
    </div>

    <!-- 编辑表单 -->
    <div v-else-if="model" class="edit-form-section">
      <div class="form-card">
        <!-- 模版基本信息 -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-info-circle"></i>
            基本信息
          </h3>

          <div class="form-group">
            <label class="field-label">模版标题 *</label>
            <input v-model="formData.modelTitle" type="text" class="form-input" placeholder="请输入模版标题" maxlength="100" />
          </div>

          <div class="form-group">
            <label class="field-label">模版描述</label>
            <textarea v-model="formData.modelDesc" class="form-textarea" placeholder="请输入模版描述（可选）" maxlength="500"
              rows="4"></textarea>
          </div>
        </div>

        <!-- 问题列表展示和编辑 -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-list"></i>
              包含的问题 ({{ questions.length }}个)
            </h3>
            <div class="add-question-buttons">
              <button @click="addNewQuestion" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                新建问题
              </button>
              <button @click="showReferenceQuestionModal" class="btn btn-secondary">
                <i class="fas fa-link"></i>
                引用问题
              </button>
            </div>
          </div>

          <div v-if="questions.length === 0" class="empty-questions">
            <div class="empty-content">
              <i class="fas fa-inbox"></i>
              <h3>暂无问题</h3>
              <p>点击上方按钮开始添加问题</p>
            </div>
          </div>

          <vue-draggable v-else v-model="questions" class="questions-list" :group="{ name: 'questions' }" item-key="id"
            handle=".drag-handle">
            <template #item="{ element: question, index }">
              <div class="question-item" :class="{ invalid: !isQuestionValid(question) }">
                <div class="question-header">
                  <div class="question-meta">
                    <i class="fas fa-grip-vertical drag-handle"></i>
                    <span class="question-number">{{ index + 1 }}</span>
                    <span class="question-type-badge" :class="question.type">
                      <i :class="question.type === 'reference' ? 'fas fa-link' :
                        question.type === 'modified_reference' ? 'fas fa-edit' : 'fas fa-plus'"></i>
                      {{ question.type === 'reference' ? '引用问题' :
                        question.type === 'modified_reference' ? '已修改引用' : '新建问题' }}
                    </span>
                  </div>
                  <div class="question-actions">
                    <button @click="editQuestion(question, index)" class="action-btn edit-btn" title="编辑问题">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="removeQuestion(index)" class="action-btn delete-btn" title="移除问题">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div class="question-content">
                  <h4 class="question-title">{{ getQuestionDisplayTitle(question) }}</h4>
                  <p v-if="getQuestionDisplayDescription(question)" class="question-description">
                    {{ getQuestionDisplayDescription(question) }}
                  </p>

                  <div class="question-preview">
                    <div class="question-type-info">
                      <i :class="getQuestionTypeIcon(getQuestionDisplayType(question))"></i>
                      <span>{{ getQuestionTypeDisplayName(getQuestionDisplayType(question)) }}</span>
                    </div>

                    <div v-if="getOptionsPreviewForQuestion(question).length > 0" class="options-preview">
                      <div class="options-list">
                        <span v-for="(option, optIndex) in getOptionsPreviewForQuestion(question).slice(0, 3)"
                          :key="optIndex" class="option-tag">
                          {{ option }}
                        </span>
                        <span v-if="getOptionsPreviewForQuestion(question).length > 3" class="option-more">
                          +{{ getOptionsPreviewForQuestion(question).length - 3 }} 个选项
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 问题错误提示 -->
                  <div v-if="!isQuestionValid(question)" class="question-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{{ getQuestionErrorMessage(question) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </vue-draggable>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button @click="goBack" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            返回
          </button>

          <button @click="saveModel" :disabled="!isFormValid || saving" class="btn btn-primary">
            <i class="fas fa-spinner fa-spin" v-if="saving"></i>
            <i class="fas fa-save" v-else></i>
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加问题模态框 -->
    <div v-if="showAddQuestionModal" class="modal-overlay" @click="closeAddQuestionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>选择问题类型</h3>
          <button @click="closeAddQuestionModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="add-question-options">
            <div class="option-card" @click="addNewQuestion">
              <div class="option-icon">
                <i class="fas fa-plus"></i>
              </div>
              <div class="option-content">
                <h4>新建问题</h4>
                <p>创建一个全新的问题</p>
              </div>
            </div>
            <div class="option-card" @click="showReferenceQuestionModal">
              <div class="option-icon">
                <i class="fas fa-link"></i>
              </div>
              <div class="option-content">
                <h4>引用问题</h4>
                <p>从已有问题中选择</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 引用问题模态框 -->
    <div v-if="showReferenceModal" class="modal-overlay" @click="closeReferenceModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>选择要引用的问题</h3>
          <button @click="closeReferenceModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="reference-filters">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input v-model="referenceSearchKeyword" type="text" placeholder="搜索问题标题或内容..." class="search-input" />
            </div>
            <select v-model="referenceTypeFilter" class="type-filter">
              <option value="">全部类型</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="text">文本题</option>
              <option value="dropdown">下拉选择题</option>
            </select>
          </div>

          <div v-if="loadingReference" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在加载问题列表...</p>
          </div>

          <div v-else-if="filteredReferenceQuestions.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>{{ referenceQuestions.length === 0 ? '暂无可引用的问题' : '没有找到匹配的问题' }}</p>
          </div>

          <div v-else class="reference-questions-list">
            <div v-for="question in filteredReferenceQuestions" :key="question.questionId"
              class="reference-question-item" @click="addReferenceQuestion(question)">
              <div class="question-type-badge">
                <i :class="getQuestionTypeIcon(question.questionType)"></i>
                {{ getQuestionTypeDisplayName(question.questionType) }}
              </div>
              <h4>{{ question.questionTitle || '未命名问题' }}</h4>
              <p v-if="question.questionTxt">{{ question.questionTxt }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑问题模态框 -->
    <div v-if="showEditModal && editingQuestion" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>编辑问题</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- 统一的问题编辑表单 -->
          <div v-if="editingQuestion" class="new-question-form">
            <!-- 基本信息区域 -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-info-circle"></i>
                基本信息
              </h3>

              <!-- 问题标题 -->
              <div class="form-group">
                <label class="field-label">问题标题 *</label>
                <input v-model="editingQuestion.title" type="text" class="form-input" placeholder="请输入问题标题" required />
              </div>

              <!-- 问题描述 -->
              <div class="form-group">
                <label class="field-label">问题描述</label>
                <textarea v-model="editingQuestion.description" class="form-textarea" placeholder="请输入问题的详细描述（可选）"
                  rows="3"></textarea>
              </div>

              <!-- 问题类型 -->
              <div class="form-group">
                <label class="field-label">问题类型 *</label>
                <div class="question-types">
                  <div v-for="type in questionTypes" :key="type.value" class="type-option"
                    :class="{ active: editingQuestion.questionType === type.value }"
                    @click="selectQuestionType(type.value)">
                    <i :class="type.icon"></i>
                    <span>{{ type.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 选项配置区域 -->
            <div v-if="needOptionsInEdit" class="form-section">
              <h3 class="section-title">
                <i class="fas fa-list"></i>
                选项配置
              </h3>

              <!-- 嵌套选项开关（下拉题型） -->
              <div v-if="editingQuestion.questionType === 'dropdown'" class="nested-options-controls">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="editingQuestion.isNested" class="checkbox-input" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">启用多级下拉列表（如：国家-省份-城市）</span>
                </label>
              </div>

              <!-- 选项列表 -->
              <div class="options-container">
                <div v-for="(option, index) in editingQuestion.options" :key="index" class="option-item"
                  :class="{ 'nested-option': editingQuestion.isNested && editingQuestion.questionType === 'dropdown' }">
                  <div class="option-input-group">
                    <span class="option-index">{{ index + 1 }}</span>
                    <input v-model="option.text" type="text" class="option-input"
                      :placeholder="editingQuestion.isNested ? `一级选项 ${index + 1}（如：中国）` : `选项 ${index + 1}`"
                      required />

                    <!-- 添加子选项按钮 -->
                    <button v-if="editingQuestion.isNested && editingQuestion.questionType === 'dropdown'" type="button"
                      class="add-child-btn" @click="addChildOption(index)" title="添加子选项">
                      <i class="fas fa-plus"></i>
                    </button>

                    <button type="button" class="remove-option-btn" @click="removeOption(index)"
                      v-if="editingQuestion.options && editingQuestion.options.length > 2">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- 子选项列表 -->
                  <div
                    v-if="editingQuestion.isNested && editingQuestion.questionType === 'dropdown' && option.children && option.children.length > 0"
                    class="child-options-container">
                    <div v-for="(child, childIndex) in option.children" :key="childIndex" class="child-option-item">
                      <div class="child-option-input-group">
                        <span class="child-option-connector">└─</span>
                        <span class="child-option-index">{{ index + 1 }}.{{ childIndex + 1 }}</span>
                        <input v-model="child.text" type="text" class="child-option-input"
                          :placeholder="`二级选项 ${childIndex + 1}（如：北京）`" />
                        <button type="button" class="remove-child-btn" @click="removeChildOption(index, childIndex)">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="button" class="add-option-btn" @click="addOption">
                  <i class="fas fa-plus"></i>
                  {{ editingQuestion.isNested ? '添加一级选项' : '添加选项' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEditModal" class="btn btn-secondary">取消</button>
          <button @click="saveEditingQuestion" class="btn btn-primary">保存修改</button>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message.text" :class="['message-container', message.type]">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import VueDraggable from 'vuedraggable'
import {
  getQuestionnaireModelById,
  updateQuestionnaireModel,
  type UpdateModelRequest
} from '@/scripts/questionnaireModelEdit'
import {
  parseQuestionsArray,
  type QuestionnaireModel
} from '@/scripts/questionnaireModelQuery'
import {
  type QuestionItem,
  generateTempId,
  validateQuestionItem,
  validateTemplate,
  processTemplateQuestions
} from '@/scripts/questionnaireModel'
import {
  getQuestionsByIds,
  parseQuestionOptions,
  getQuestionTypeDisplayName,
  getQuestionTypeIcon,
  type Question
} from '@/scripts/questionQuery'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const model = ref<QuestionnaireModel | null>(null)
const questions = ref<QuestionItem[]>([])

// 模态框状态
const showAddQuestionModal = ref(false)
const showReferenceModal = ref(false)
const showEditModal = ref(false)

// 引用问题相关
const referenceQuestions = ref<Question[]>([])
const loadingReference = ref(false)
const referenceSearchKeyword = ref('')
const referenceTypeFilter = ref('')

// 编辑问题相关
const editingQuestion = ref<QuestionItem | null>(null)
const editingIndex = ref(-1)

// 表单数据
const formData = ref({
  modelTitle: '',
  modelDesc: ''
})

// 消息提示
const message = ref({
  text: '',
  type: 'success'
})

// 计算属性
const modelId = computed(() => route.params.id as string)

const isFormValid = computed(() => {
  if (!formData.value.modelTitle.trim()) return false
  if (questions.value.length === 0) return false

  const validation = validateTemplate(questions.value)
  return validation.valid
})

const filteredReferenceQuestions = computed(() => {
  let filtered = referenceQuestions.value

  // 按类型筛选
  if (referenceTypeFilter.value) {
    filtered = filtered.filter(q => q.questionType === referenceTypeFilter.value)
  }

  // 按关键词搜索
  if (referenceSearchKeyword.value.trim()) {
    const keyword = referenceSearchKeyword.value.toLowerCase().trim()
    filtered = filtered.filter(q =>
      (q.questionTitle && q.questionTitle.toLowerCase().includes(keyword)) ||
      (q.questionTxt && q.questionTxt.toLowerCase().includes(keyword))
    )
  }

  return filtered
})

const needOptionsInEdit = computed(() => {
  return editingQuestion.value &&
    ['single', 'multiple', 'dropdown'].includes(editingQuestion.value.questionType || editingQuestion.value.type || '')
})

// 问题类型配置
const questionTypes = [
  { value: 'single', label: '单选题', icon: 'fas fa-dot-circle' },
  { value: 'multiple', label: '多选题', icon: 'fas fa-check-square' },
  { value: 'text', label: '文本题', icon: 'fas fa-align-left' },
  { value: 'dropdown', label: '下拉选择题', icon: 'fas fa-chevron-down' }
]

// 方法
async function loadModel() {
  if (!modelId.value) {
    error.value = '缺少模版ID参数'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('Loading model with ID:', modelId.value)
    const modelData = await getQuestionnaireModelById(modelId.value)

    if (!modelData) {
      error.value = '未找到指定的模版'
      return
    }

    model.value = modelData

    // 填充表单数据
    formData.value.modelTitle = modelData.modelTitle || ''
    formData.value.modelDesc = modelData.modelDesc || ''

    // 解析问题列表 - 使用异步版本获取完整问题数据
    const parsedQuestions = await parseQuestionsArray(modelData.questionsArray)

    // 转换为编辑器需要的格式
    questions.value = parsedQuestions.map(q => ({
      id: q.id,
      type: 'reference' as const, // 从已保存的模版加载的都是引用类型
      questionId: q.id,
      questionTitle: q.title,
      questionTxt: q.description || '',
      questionOptions: JSON.stringify(q.options || []),
      canDelete: 1
    }))

    console.log('Model loaded successfully:', modelData)
    console.log('Parsed questions:', questions.value)

  } catch (err) {
    console.error('Failed to load model:', err)
    error.value = '加载模版信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function saveModel() {
  if (!isFormValid.value || !model.value) {
    showMessage('请填写必要信息', 'error')
    return
  }

  saving.value = true

  try {
    console.log('开始保存模版，处理问题列表...')

    // 处理问题列表：创建新问题组件并获取问题ID数组
    const questionIds = await processTemplateQuestions(questions.value)
    console.log('处理后的问题ID数组:', questionIds)

    const updateData: UpdateModelRequest = {
      modelId: model.value.modelId,
      modelTitle: formData.value.modelTitle.trim(),
      modelDesc: formData.value.modelDesc.trim(),
      questionsArray: JSON.stringify(questionIds), // 更新问题ID数组
      canDelete: model.value.canDelete
    }

    console.log('Saving model with data:', updateData)
    const result = await updateQuestionnaireModel(updateData)

    if (result.success) {
      showMessage(result.message || '模版更新成功！', 'success')

      // 如果模版ID发生了变化，更新用户数据中的ID
      if (result.newModelId) {
        userStore.updateQuestionnaireModelId(model.value.modelId, result.newModelId)
        console.log(`Updated user model ID mapping: ${model.value.modelId} -> ${result.newModelId}`)
      }

      // 3秒后返回列表页
      setTimeout(() => {
        router.push({ name: 'questionnaire_model_my' })
      }, 2000)
    } else {
      showMessage(result.message || '保存失败，请稍后重试', 'error')
    }

  } catch (err) {
    console.error('Failed to save model:', err)
    showMessage('保存失败，请检查网络连接', 'error')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push({ name: 'questionnaire_model_my' })
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
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || 'fas fa-info-circle'
}

// 问题操作方法
function closeAddQuestionModal() {
  showAddQuestionModal.value = false
}

function addNewQuestion() {
  try {
    const newQuestion: QuestionItem = {
      id: generateTempId(),
      type: 'new',
      title: '',
      description: '',
      questionType: 'single',
      options: [
        { text: '选项1' },
        { text: '选项2' }
      ],
      allowOther: false,
      isNested: false
    }

    questions.value.push(newQuestion)
    closeAddQuestionModal()
    showMessage('问题已添加，请完善问题信息', 'success')
  } catch (error) {
    console.error('添加问题失败:', error)
    showMessage('添加问题失败', 'error')
  }
}

function showReferenceQuestionModal() {
  try {
    showReferenceModal.value = true
    loadReferenceQuestions()
  } catch (error) {
    console.error('打开引用问题模态框失败:', error)
    showMessage('加载引用问题失败', 'error')
  }
}

function closeReferenceModal() {
  showReferenceModal.value = false
  referenceSearchKeyword.value = ''
  referenceTypeFilter.value = ''
}

async function loadReferenceQuestions() {
  console.log('开始加载引用问题...')

  if (!userStore.isLoggedIn) {
    showMessage('请先登录', 'error')
    return
  }

  console.log('用户数据:', userStore.userData)
  const questionIds = userStore.userData?.question_ids
  if (!questionIds || questionIds.length === 0) {
    console.log('用户没有可引用的问题组件')
    referenceQuestions.value = []
    return
  }

  console.log('要获取的问题ID:', questionIds)
  loadingReference.value = true

  try {
    const questions = await getQuestionsByIds(questionIds)
    referenceQuestions.value = questions
    console.log('引用问题加载完成:', questions.length)
  } catch (error) {
    console.error('加载引用问题失败:', error)
    showMessage('加载问题组件失败: ' + error, 'error')
  } finally {
    loadingReference.value = false
  }
}

function addReferenceQuestion(question: Question) {
  const referenceQuestion: QuestionItem = {
    id: generateTempId(),
    type: 'reference',
    questionId: question.questionId,
    questionTitle: question.questionTitle,
    questionOptions: question.questionOptions,
    questionTxt: question.questionTxt,
    canDelete: question.canDelete
  }

  questions.value.push(referenceQuestion)
  closeReferenceModal()
  showMessage('问题已添加到模版', 'success')
}

function removeQuestion(index: number) {
  const question = questions.value[index]
  const title = getQuestionDisplayTitle(question)

  if (confirm(`确定要移除问题"${title}"吗？`)) {
    questions.value.splice(index, 1)
    showMessage('问题已移除', 'success')
  }
}

function editQuestion(question: QuestionItem, index: number) {
  // 如果是引用问题，先转换为可编辑的问题格式
  if (question.type === 'reference') {
    editingQuestion.value = convertReferenceToEditableQuestion(question)
  } else {
    // 对于新建问题和已修改的引用问题，直接编辑
    editingQuestion.value = JSON.parse(JSON.stringify(question)) // 深拷贝
  }
  editingIndex.value = index
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingQuestion.value = null
  editingIndex.value = -1
}

function selectQuestionType(type: string) {
  if (editingQuestion.value) {
    editingQuestion.value.questionType = type

    // 如果切换到需要选项的类型，初始化选项
    if (['single', 'multiple', 'dropdown'].includes(type) && !editingQuestion.value.options) {
      editingQuestion.value.options = [
        { text: '选项1' },
        { text: '选项2' }
      ]
    }
  }
}

function addOption() {
  if (editingQuestion.value?.options) {
    editingQuestion.value.options.push({ text: '' })
  }
}

function removeOption(index: number) {
  if (editingQuestion.value?.options && editingQuestion.value.options.length > 2) {
    editingQuestion.value.options.splice(index, 1)
  }
}

function addChildOption(parentIndex: number) {
  if (editingQuestion.value?.options?.[parentIndex]) {
    if (!editingQuestion.value.options[parentIndex].children) {
      editingQuestion.value.options[parentIndex].children = []
    }
    editingQuestion.value.options[parentIndex].children!.push({ text: '' })
  }
}

function removeChildOption(parentIndex: number, childIndex: number) {
  if (editingQuestion.value?.options?.[parentIndex]?.children) {
    editingQuestion.value.options[parentIndex].children!.splice(childIndex, 1)
  }
}

function saveEditingQuestion() {
  if (editingQuestion.value && editingIndex.value >= 0) {
    const validation = validateQuestionItem(editingQuestion.value)
    if (!validation.valid) {
      showMessage(validation.message || '问题信息不完整', 'error')
      return
    }

    questions.value[editingIndex.value] = editingQuestion.value
    closeEditModal()
    showMessage('问题已更新', 'success')
  }
}

// 将引用问题转换为可编辑的问题格式
function convertReferenceToEditableQuestion(referenceQuestion: QuestionItem): QuestionItem {
  try {
    // 解析选项
    let optionsArray: Array<{ text: string; children?: Array<{ text: string }> }> = []
    if (referenceQuestion.questionOptions) {
      try {
        const parsedOptions = parseQuestionOptions(referenceQuestion.questionOptions)
        optionsArray = parsedOptions.map(opt => ({ text: opt }))
      } catch (e) {
        console.warn('Failed to parse question options:', e)
      }
    }

    // 如果没有选项且问题类型需要选项，添加默认选项
    const questionType = referenceQuestion.questionType || 'single'
    if (['single', 'multiple', 'dropdown'].includes(questionType) && optionsArray.length === 0) {
      optionsArray = [
        { text: '选项1' },
        { text: '选项2' }
      ]
    }

    // 创建可编辑的问题对象
    return {
      id: referenceQuestion.id || generateTempId(),
      type: 'modified_reference', // 标识为修改过的引用问题
      originalQuestionId: referenceQuestion.questionId, // 保存原始问题ID以供参考
      title: referenceQuestion.questionTitle || '未命名问题',
      description: referenceQuestion.questionTxt || '',
      questionType: questionType,
      options: optionsArray,
      allowOther: false,
      isNested: false
    }
  } catch (error) {
    console.error('Failed to convert reference question:', error)
    // 返回一个基本的问题格式
    return {
      id: referenceQuestion.id || generateTempId(),
      type: 'new',
      title: referenceQuestion.questionTitle || '未命名问题',
      description: referenceQuestion.questionTxt || '',
      questionType: 'single',
      options: [{ text: '选项1' }, { text: '选项2' }],
      allowOther: false,
      isNested: false
    }
  }
}

// 显示相关方法
function getQuestionDisplayTitle(question: QuestionItem): string {
  if (question.type === 'reference') {
    return question.questionTitle || '未知问题'
  } else {
    // 对于新建问题和修改过的引用问题，使用title字段
    return question.title || '未命名问题'
  }
}

function getQuestionDisplayDescription(question: QuestionItem): string {
  if (question.type === 'reference') {
    return question.questionTxt || ''
  } else {
    // 对于新建问题和修改过的引用问题，使用description字段
    return question.description || ''
  }
}

function getQuestionDisplayType(question: QuestionItem): string {
  return question.questionType || 'single'
}

function isQuestionValid(question: QuestionItem): boolean {
  return validateQuestionItem(question).valid
}

function getQuestionErrorMessage(question: QuestionItem): string {
  const validation = validateQuestionItem(question)
  return validation.message || ''
}

function getOptionsPreviewForQuestion(question: QuestionItem): string[] {
  if (question.type === 'reference' && question.questionOptions) {
    return parseQuestionOptions(question.questionOptions)
  } else if ((question.type === 'new' || question.type === 'modified_reference') && question.options) {
    const allOptions: string[] = []
    question.options.forEach((option) => {
      if (option.text.trim()) {
        if (question.isNested && option.children && option.children.length > 0) {
          // 嵌套结构：父选项 > 子选项
          option.children.forEach((child) => {
            if (child.text.trim()) {
              allOptions.push(`${option.text} > ${child.text}`)
            }
          })
        } else {
          // 普通选项
          allOptions.push(option.text)
        }
      }
    })
    return allOptions
  }
  return []
}

// 组件挂载时加载数据
onMounted(() => {
  loadModel()
})
</script>

<style scoped>
.questionnaire-model-edit {
  padding: 2rem;
  max-width: 800px;
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

/* 加载和错误状态 */
.loading-section,
.error-section {
  text-align: center;
  padding: 3rem;
  color: white;
}

.loading-spinner i,
.error-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
}

/* 表单区域 */
.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e1e8ed;
}

.section-title i {
  color: #4facfe;
}

/* 表单元素 */
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
.form-textarea {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: white;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

/* 问题列表 */
.empty-questions {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-questions i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #4facfe;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.question-number {
  background: #4facfe;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.question-type {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.question-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.options-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-tag {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  padding: 0.25rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
  border: 1px solid rgba(79, 172, 254, 0.2);
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

/* 问题编辑相关样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-question-buttons {
  display: flex;
  gap: 0.5rem;
}

.empty-content {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 问题项样式 */
.question-item {
  transition: all 0.3s ease;
}

.question-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.question-item.invalid {
  border-left: 4px solid #ef4444;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  font-size: 1.2rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.question-type-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.question-type-badge.reference {
  background: linear-gradient(45deg, #10b981 0%, #34d399 100%);
  color: white;
}

.question-type-badge.new {
  background: linear-gradient(45deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.question-type-badge.modified_reference {
  background: linear-gradient(45deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
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

.delete-btn:hover {
  background: #dc2626;
}

.question-preview {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.question-type-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4facfe;
  font-weight: 500;
}

.options-preview .options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-more {
  color: #6b7280;
  font-size: 0.8rem;
  font-style: italic;
}

.question-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.8rem;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
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
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large-modal {
  max-width: 800px;
}

.modal-header {
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.convert-btn {
  background: linear-gradient(45deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.convert-btn:hover {
  background: linear-gradient(45deg, #d97706 0%, #f59e0b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.close-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  font-size: 1.3rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 添加问题选项 */
.add-question-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-card {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.option-card:hover {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.05);
  transform: translateY(-2px);
}

.option-icon {
  font-size: 2rem;
  color: #4facfe;
  margin-bottom: 1rem;
}

.option-content h4 {
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.option-content p {
  color: #6b7280;
  font-size: 0.9rem;
}

/* 引用问题相关 */
.reference-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  position: relative;
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
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
}

.type-filter {
  padding: 0.8rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.reference-questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.reference-question-item {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reference-question-item:hover {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.05);
  transform: translateY(-1px);
}

/* 模态框表单样式 - 与questionnaire_model_create保持一致 */
.new-question-form .form-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  border-left: 4px solid #4facfe;
  margin-bottom: 1.5rem;
}

.new-question-form .section-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.new-question-form .section-title i {
  color: #4facfe;
  font-size: 1.1rem;
}

.new-question-form .form-group {
  margin-bottom: 1.5rem;
}

.new-question-form .field-label {
  display: block;
  font-weight: 600;
  color: #34495e;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.new-question-form .form-input,
.new-question-form .form-textarea {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: white;
  resize: vertical;
}

.new-question-form .form-input:focus,
.new-question-form .form-textarea:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
  transform: translateY(-1px);
}

/* 问题类型选择样式 */
.new-question-form .question-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.new-question-form .type-option {
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  padding: 1.2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.new-question-form .type-option:hover {
  border-color: #4facfe;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.2);
}

.new-question-form .type-option.active {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05));
  border-color: #4facfe;
  color: #4facfe;
}

.new-question-form .type-option i {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

/* 嵌套选项控制 */
.nested-options-controls {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #34495e;
}

.checkbox-input {
  margin: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  position: relative;
  background: white;
  transition: all 0.3s ease;
}

.checkbox-input:checked+.checkbox-custom {
  background: #4facfe;
  border-color: #4facfe;
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

/* 选项容器样式 */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  border: 1px solid #e1e8ed;
  border-radius: 10px;
  padding: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #4facfe;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.1);
}

.option-item.nested-option {
  background: #f8f9fa;
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.option-index {
  min-width: 35px;
  height: 35px;
  background: #4facfe;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.option-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

.add-child-btn,
.remove-option-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.add-child-btn {
  background: #10b981;
  color: white;
}

.add-child-btn:hover {
  background: #059669;
  transform: scale(1.1);
}

.remove-option-btn {
  background: #ef4444;
  color: white;
}

.remove-option-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* 子选项样式 */
.child-options-container {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 2px dashed #e1e8ed;
}

.child-option-item {
  margin-bottom: 0.8rem;
}

.child-option-input-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.child-option-connector {
  color: #6b7280;
  font-family: monospace;
  font-size: 1rem;
  min-width: 20px;
}

.child-option-index {
  min-width: 60px;
  padding: 0.3rem 0.6rem;
  background: #e1e8ed;
  color: #6b7280;
  border-radius: 15px;
  font-size: 0.8rem;
  text-align: center;
  flex-shrink: 0;
}

.child-option-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.child-option-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

.remove-child-btn {
  padding: 0.3rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  flex-shrink: 0;
}

.remove-child-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* 添加选项按钮 */
.add-option-btn {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.add-option-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
}



/* 引用问题样式 */
.reference-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.readonly-field {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  color: #374151;
}

.type-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4facfe;
  font-weight: 500;
}

.type-display i {
  font-size: 1.1rem;
}

.readonly-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.readonly-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.readonly-option:last-child {
  border-bottom: none;
}

.readonly-option .option-index {
  background: #4facfe;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.readonly-option .option-text {
  flex: 1;
  color: #374151;
}

.reference-note {
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #4facfe;
  margin-top: 1rem;
}

.reference-note i {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-model-edit {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .add-question-buttons {
    justify-content: center;
  }

  .add-question-options,
  .question-types {
    grid-template-columns: 1fr;
  }

  .reference-filters {
    flex-direction: column;
  }
}
</style>
