<template>
  <div class="questionnaire-model-create">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-file-alt"></i>
        创建问卷模版
      </h1>
      <p class="page-description">设计您的问卷模版，支持引用现有问题或直接创建新问题</p>
    </div>

    <!-- 模版基本信息 -->
    <div class="template-info-section">
      <div class="info-card">
        <h3 class="section-title">
          <i class="fas fa-info-circle"></i>
          模版信息
        </h3>
        <div class="form-group">
          <label class="field-label">模版名称 *</label>
          <input v-model="templateName" type="text" class="form-input" placeholder="请输入问卷模版名称" required />
        </div>
        <div class="form-group">
          <label class="field-label">模版描述</label>
          <textarea v-model="templateDescription" class="form-textarea" placeholder="请描述此问卷模版的用途" rows="3"></textarea>
        </div>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="questions-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="fas fa-list-ol"></i>
          问题列表 ({{ questions.length }}个问题)
        </h3>

        <!-- 添加问题按钮组 -->
        <div class="add-question-buttons">
          <button @click="showAddQuestionModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            添加问题
          </button>
        </div>
      </div>

      <!-- 问题列表 -->
      <div v-if="questions.length === 0" class="empty-questions">
        <div class="empty-content">
          <i class="fas fa-inbox"></i>
          <h3>还没有添加问题</h3>
          <p>点击"添加问题"开始创建您的问卷模版</p>
        </div>
      </div>

      <VueDraggable v-else v-model="questions" class="questions-list" item-key="id" handle=".drag-handle">
        <template #item="{ element: question, index }">
          <div class="question-item" :class="{ 'invalid': !isQuestionValid(question) }">
            <!-- 拖拽手柄和序号 -->
            <div class="question-header">
              <div class="question-meta">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <span class="question-number">{{ index + 1 }}</span>
                <span class="question-type-badge" :class="question.type">
                  {{ question.type === 'reference' ? '引用问题' : '新建问题' }}
                </span>
              </div>

              <div class="question-actions">
                <button @click="editQuestion(question, index)" class="action-btn edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="removeQuestion(index)" class="action-btn delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- 问题内容 -->
            <div class="question-content">
              <h4 class="question-title">
                {{ getQuestionDisplayTitle(question) }}
              </h4>
              <p v-if="getQuestionDisplayDescription(question)" class="question-description">
                {{ getQuestionDisplayDescription(question) }}
              </p>

              <!-- 问题类型和选项预览 -->
              <div class="question-preview">
                <div class="question-type-info">
                  <i :class="getQuestionTypeIcon(getQuestionDisplayType(question))"></i>
                  <span>{{ getQuestionTypeDisplayName(getQuestionDisplayType(question)) }}</span>
                </div>

                <!-- 选项预览（如果有） -->
                <div v-if="hasOptions(question)" class="options-preview">
                  <div class="options-list">
                    <span v-for="(option, idx) in getOptionsPreview(question).slice(0, 3)" :key="idx"
                      class="option-tag">
                      {{ option }}
                    </span>
                    <span v-if="getOptionsPreview(question).length > 3" class="option-more">
                      +{{ getOptionsPreview(question).length - 3 }}个选项
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 验证错误提示 -->
            <div v-if="!isQuestionValid(question)" class="question-error">
              <i class="fas fa-exclamation-triangle"></i>
              {{ getQuestionErrorMessage(question) }}
            </div>
          </div>
        </template>
      </VueDraggable>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button @click="$router.go(-1)" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i>
        返回
      </button>

      <button @click="previewTemplate" class="btn btn-info" :disabled="questions.length === 0">
        <i class="fas fa-eye"></i>
        预览模版
      </button>

      <button @click="saveTemplate" class="btn btn-primary" :disabled="!isTemplateValid || saving">
        <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
        {{ saving ? '保存中...' : '保存模版' }}
      </button>
    </div>

    <!-- 添加问题模态框 -->
    <div v-if="showAddQuestionModal" class="modal-overlay" @click="closeAddQuestionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加问题</h3>
          <button @click="closeAddQuestionModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="add-question-options">
            <div class="option-card" @click="addNewQuestion">
              <div class="option-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
              <div class="option-content">
                <h4>直接创建问题</h4>
                <p>在模版中直接创建新问题</p>
              </div>
            </div>

            <div class="option-card" @click="showReferenceQuestionModal">
              <div class="option-icon">
                <i class="fas fa-link"></i>
              </div>
              <div class="option-content">
                <h4>引用现有问题</h4>
                <p>从您已创建的问题组件中选择</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 引用问题选择模态框 -->
    <div v-if="showReferenceModal" class="modal-overlay" @click="closeReferenceModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>选择问题组件</h3>
          <button @click="closeReferenceModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- 搜索和筛选 -->
          <div class="reference-filters">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input v-model="referenceSearchKeyword" type="text" placeholder="搜索问题标题..." class="search-input" />
            </div>
            <select v-model="referenceTypeFilter" class="type-filter">
              <option value="">全部类型</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="text">文本题</option>
              <option value="dropdown">下拉选择题</option>
            </select>
          </div>

          <!-- 问题组件列表 -->
          <div v-if="loadingReference" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在加载问题组件...</p>
          </div>

          <div v-else-if="filteredReferenceQuestions.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>没有找到可引用的问题组件</p>
          </div>

          <div v-else class="reference-questions-list">
            <div v-for="question in filteredReferenceQuestions" :key="question.questionId"
              class="reference-question-item" @click="addReferenceQuestion(question)">
              <div class="reference-question-header">
                <div class="question-type-badge">
                  <i :class="getQuestionTypeIcon(question.questionType)"></i>
                  {{ getQuestionTypeDisplayName(question.questionType) }}
                </div>
              </div>

              <div class="reference-question-content">
                <h4>{{ question.questionTitle }}</h4>
                <p v-if="question.questionTxt">{{ question.questionTxt }}</p>

                <!-- 选项预览 -->
                <div v-if="question.questionOptions && parseQuestionOptions(question.questionOptions).length > 0"
                  class="options-preview">
                  <div class="options-list">
                    <span v-for="(option, idx) in parseQuestionOptions(question.questionOptions).slice(0, 3)" :key="idx"
                      class="option-tag">
                      {{ option }}
                    </span>
                    <span v-if="parseQuestionOptions(question.questionOptions).length > 3" class="option-more">
                      +{{ parseQuestionOptions(question.questionOptions).length - 3 }}个选项
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 问题编辑模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
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

              <div class="options-container">
                <div v-for="(option, index) in editingQuestion.options" :key="index" class="option-item"
                  :class="{ 'nested-option': editingQuestion.isNested && editingQuestion.questionType === 'dropdown' }">

                  <!-- 一级选项 -->
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

    <!-- 预览模态框 -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="modal-content large-modal preview-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-eye"></i>
            问卷模版预览
          </h3>
          <button @click="closePreviewModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- 预览头部信息 -->
          <div class="preview-header">
            <h1 class="preview-title">{{ templateName || '未命名问卷模版' }}</h1>
            <p v-if="templateDescription" class="preview-description">
              {{ templateDescription }}
            </p>
          </div>

          <!-- 预览内容 -->
          <div class="preview-content">
            <div v-if="questions.length === 0" class="preview-empty">
              <div class="empty-icon">
                <i class="fas fa-inbox"></i>
              </div>
              <p>暂无问题</p>
            </div>

            <div v-else class="preview-questions">
              <div v-for="(question, index) in questions" :key="question.id" class="preview-question">
                <div class="question-header">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <h3 class="question-title">{{ getQuestionDisplayTitle(question) }}</h3>
                  <span class="question-type-indicator">
                    <i :class="getQuestionTypeIcon(getQuestionDisplayType(question))"></i>
                    {{ getQuestionTypeDisplayName(getQuestionDisplayType(question)) }}
                  </span>
                </div>

                <div v-if="getQuestionDisplayDescription(question)" class="question-description">
                  {{ getQuestionDisplayDescription(question) }}
                </div>

                <!-- 不同问题类型的预览 -->
                <div class="question-preview-content">
                  <!-- 单选题预览 -->
                  <div v-if="getQuestionDisplayType(question) === 'single' && hasOptions(question)"
                    class="options-preview">
                    <div v-for="(option, optIndex) in getOptionsPreview(question)" :key="optIndex"
                      class="option-item single-option">
                      <input type="radio" :name="`preview-single-${generatePreviewId()}`" disabled />
                      <label>{{ option }}</label>
                    </div>
                  </div>

                  <!-- 多选题预览 -->
                  <div v-else-if="getQuestionDisplayType(question) === 'multiple' && hasOptions(question)"
                    class="options-preview">
                    <div v-for="(option, optIndex) in getOptionsPreview(question)" :key="optIndex"
                      class="option-item multiple-option">
                      <input type="checkbox" disabled />
                      <label>{{ option }}</label>
                    </div>
                  </div>

                  <!-- 下拉选择题预览 -->
                  <div v-else-if="getQuestionDisplayType(question) === 'dropdown' && hasOptions(question)"
                    class="options-preview">
                    <select class="dropdown-preview" disabled>
                      <option value="">请选择...</option>
                      <option v-for="(option, optIndex) in getOptionsPreview(question)" :key="optIndex" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </div>

                  <!-- 文本题预览 -->
                  <div v-else-if="getQuestionDisplayType(question) === 'text'" class="text-preview">
                    <textarea placeholder="请在此输入您的答案..." rows="3" disabled class="text-input-preview"></textarea>
                  </div>

                  <!-- 未知类型 -->
                  <div v-else class="unknown-type">
                    <p class="unknown-message">
                      <i class="fas fa-exclamation-triangle"></i>
                      未知问题类型或配置不完整
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 预览底部信息 -->
          <div class="preview-footer">
            <div class="preview-stats">
              <div class="stat-item">
                <i class="fas fa-list-ol"></i>
                <span>共 {{ questions.length }} 个问题</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-clock"></i>
                <span>预计用时 {{ Math.max(1, Math.ceil(questions.length * 1.5)) }} 分钟</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closePreviewModal" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            关闭预览
          </button>
          <button @click="closePreviewModal(); saveTemplate()" class="btn btn-primary"
            :disabled="!isTemplateValid || saving">
            <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
            {{ saving ? '保存中...' : '确认保存' }}
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import VueDraggable from 'vuedraggable'
import {
  type QuestionItem,
  generateTempId,
  validateQuestionItem,
  validateTemplate,
  processTemplateQuestions,
  createQuestionnaireModel
} from '@/scripts/questionnaireModel'
import {
  getQuestionsByIds,
  parseQuestionOptions,
  getQuestionTypeDisplayName,
  getQuestionTypeIcon,
  type Question
} from '@/scripts/questionQuery'

const router = useRouter()
const userStore = useUserStore()

// 基本数据
const templateName = ref('')
const templateDescription = ref('')
const questions = ref<QuestionItem[]>([])
const saving = ref(false)

// 模态框状态
const showAddQuestionModal = ref(false)
const showReferenceModal = ref(false)
const showEditModal = ref(false)
const showPreviewModal = ref(false)

// 引用问题相关
const referenceQuestions = ref<Question[]>([])
const loadingReference = ref(false)
const referenceSearchKeyword = ref('')
const referenceTypeFilter = ref('')

// 编辑问题相关
const editingQuestion = ref<QuestionItem | null>(null)
const editingIndex = ref(-1)

// 问题类型配置
const questionTypes = [
  { value: 'single', label: '单选题', icon: 'fas fa-dot-circle' },
  { value: 'multiple', label: '多选题', icon: 'fas fa-check-square' },
  { value: 'text', label: '文本题', icon: 'fas fa-align-left' },
  { value: 'dropdown', label: '下拉选择题', icon: 'fas fa-chevron-down' }
]

// 消息提示
const message = ref({
  text: '',
  type: 'success'
})

// 计算属性
const isTemplateValid = computed(() => {
  if (!templateName.value.trim()) return false
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
      q.questionTitle.toLowerCase().includes(keyword) ||
      (q.questionTxt && q.questionTxt.toLowerCase().includes(keyword))
    )
  }

  return filtered
})

const needOptionsInEdit = computed(() => {
  return editingQuestion.value &&
    ['single', 'multiple', 'dropdown'].includes(editingQuestion.value.questionType || '')
})

// 方法
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
        { text: '', children: [] },
        { text: '', children: [] }
      ],
      allowOther: false,
      isNested: false
    }

    questions.value.push(newQuestion)
    closeAddQuestionModal()

    // 自动打开编辑
    editQuestion(newQuestion, questions.value.length - 1)
    showMessage('问题已添加，请完善问题信息', 'success')
  } catch (error) {
    console.error('添加新问题失败:', error)
    showMessage('添加问题失败，请重试', 'error')
  }
}

function showReferenceQuestionModal() {
  try {
    closeAddQuestionModal()
    showReferenceModal.value = true
    loadReferenceQuestions()
  } catch (error) {
    console.error('打开引用问题模态框失败:', error)
    showMessage('打开引用问题失败，请重试', 'error')
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
    console.log('用户未登录')
    showMessage('请先登录', 'error')
    return
  }

  console.log('用户数据:', userStore.userData)
  const questionIds = userStore.userData?.question_ids
  if (!questionIds || questionIds.length === 0) {
    console.log('用户没有问题组件')
    referenceQuestions.value = []
    showMessage('您还没有创建任何问题组件', 'info')
    return
  }

  console.log('要获取的问题ID:', questionIds)
  loadingReference.value = true

  try {
    const fetchedQuestions = await getQuestionsByIds(questionIds)
    console.log('获取到的问题:', fetchedQuestions)
    referenceQuestions.value = fetchedQuestions

    if (fetchedQuestions.length === 0) {
      showMessage('未找到可用的问题组件', 'warning')
    } else {
      showMessage(`加载了 ${fetchedQuestions.length} 个问题组件`, 'success')
    }
  } catch (error) {
    console.error('Failed to load reference questions:', error)
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
    questionType: question.questionType,
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
  }
}

function editQuestion(question: QuestionItem, index: number) {
  // 如果是引用问题，先转换为新问题格式
  if (question.type === 'reference') {
    editingQuestion.value = convertReferenceToEditableQuestion(question)
  } else {
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

    // 初始化选项
    if (['single', 'multiple', 'dropdown'].includes(type)) {
      if (!editingQuestion.value.options || editingQuestion.value.options.length === 0) {
        editingQuestion.value.options = [
          { text: '', children: [] },
          { text: '', children: [] }
        ]
      }
    }
  }
}

function addOption() {
  if (editingQuestion.value?.options) {
    editingQuestion.value.options.push({ text: '', children: [] })
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
      showMessage(validation.message || '问题数据无效', 'error')
      return
    }

    questions.value[editingIndex.value] = editingQuestion.value
    closeEditModal()
    showMessage('问题保存成功', 'success')
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
      type: 'new', // 转换为新问题类型以便编辑
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
    return question.title || '新建问题'
  }
}

function getQuestionDisplayDescription(question: QuestionItem): string {
  if (question.type === 'reference') {
    return question.questionTxt || ''
  } else {
    return question.description || ''
  }
}

function getQuestionDisplayType(question: QuestionItem): string {
  return question.questionType || 'single'
}

function hasOptions(question: QuestionItem): boolean {
  const type = getQuestionDisplayType(question)
  return ['single', 'multiple', 'dropdown'].includes(type)
}

function getOptionsPreview(question: QuestionItem): string[] {
  if (question.type === 'reference' && question.questionOptions) {
    return parseQuestionOptions(question.questionOptions)
  } else if (question.type === 'new' && question.options) {
    const options: string[] = []
    question.options.forEach(option => {
      if (option.text.trim()) {
        if (question.isNested && option.children && option.children.length > 0) {
          option.children.forEach(child => {
            if (child.text.trim()) {
              options.push(`${option.text} > ${child.text}`)
            }
          })
        } else {
          options.push(option.text)
        }
      }
    })
    return options
  }
  return []
}



function isQuestionValid(question: QuestionItem): boolean {
  return validateQuestionItem(question).valid
}

function getQuestionErrorMessage(question: QuestionItem): string {
  const validation = validateQuestionItem(question)
  return validation.message || ''
}

function previewTemplate() {
  if (!isTemplateValid.value) {
    showMessage('请先完善模版信息和问题设置', 'warning')
    return
  }
  showPreviewModal.value = true
}

function closePreviewModal() {
  showPreviewModal.value = false
}

async function saveTemplate() {
  if (!isTemplateValid.value) {
    showMessage('请完善模版信息和问题设置', 'error')
    return
  }

  saving.value = true
  try {
    console.log('开始保存模版...')

    // 处理问题：创建新问题组件并获取所有问题ID
    const questionIds = await processTemplateQuestions(questions.value)
    console.log('处理完成的问题ID列表:', questionIds)

    console.log('准备保存的模版数据:', {
      title: templateName.value,
      description: templateDescription.value,
      questionIds: questionIds
    })

    // 调用API保存模版，使用新的参数签名
    const result = await createQuestionnaireModel(
      templateName.value,
      templateDescription.value,
      questionIds
    )

    if (result.success) {
      console.log('模版保存成功, ID:', result.modelId)
      showMessage('问卷模版创建成功！', 'success')

      // 延迟跳转
      setTimeout(() => {
        router.push('/page/questionnaire_model_my')
      }, 2000)
    } else {
      console.error('模版保存失败:', result.message)
      showMessage(result.message || '保存失败，请稍后重试', 'error')
    }

  } catch (error) {
    console.error('保存模版时发生错误:', error)
    showMessage(`保存失败: ${error}`, 'error')
  } finally {
    saving.value = false
  }
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

// 预览相关方法
function generatePreviewId(): string {
  return 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 组件挂载时的初始化
onMounted(() => {
  console.log('问卷模版创建页面已加载')
})
</script>

<style scoped>
.questionnaire-model-create {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 模版信息区域 */
.template-info-section {
  margin-bottom: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

/* 问题区域 */
.questions-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: white;
}

.add-question-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-info {
  background: #06b6d4;
  color: white;
}

.btn-warning {
  background: #f59e0b;
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

/* 空状态 */
.empty-questions {
  text-align: center;
  padding: 3rem;
}

.empty-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  color: white;
}

.empty-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

/* 问题列表 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.question-item.invalid {
  border-left: 4px solid #ef4444;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.question-number {
  min-width: 30px;
  height: 30px;
  background: #4facfe;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
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

.question-content {
  margin-bottom: 1rem;
}

.question-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.question-description {
  color: #6b7280;
  margin-bottom: 1rem;
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

/* 操作按钮区域 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
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
  background: linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.convert-btn:hover {
  background: linear-gradient(45deg, #ee5a24 0%, #ff6b6b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(238, 90, 36, 0.4);
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
  font-size: 2.5rem;
  color: #4facfe;
  margin-bottom: 1rem;
}

.option-content h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.option-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

/* 引用问题相关 */
.reference-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
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
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.type-filter {
  padding: 0.8rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
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
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reference-question-item:hover {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.05);
  transform: translateY(-1px);
}

/* 其他样式省略... */

.message-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  max-width: 400px;
  border-radius: 10px;
  overflow: hidden;
}

.message-container.success {
  background: linear-gradient(45deg, #10b981 0%, #34d399 100%);
}

.message-container.error {
  background: linear-gradient(45deg, #ef4444 0%, #f87171 100%);
}

.message-content {
  padding: 1rem 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.message-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.2rem;
  margin-left: auto;
}

/* 模态框表单样式 - 与question_center_create保持一致 */
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

/* 引用问题样式优化 */
.reference-section {
  background: #f0f9ff;
  border-left: 4px solid #0ea5e9;
}

.reference-section .section-title {
  color: #0369a1;
}

.reference-section .section-title i {
  color: #0ea5e9;
}

.readonly-field {
  background: white;
  padding: 0.8rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  color: #6b7280;
  font-size: 1rem;
}

.type-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-display i {
  color: #4facfe;
}

.readonly-options {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
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
  min-width: 25px;
  height: 25px;
  background: #e1e8ed;
  color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.readonly-option .option-text {
  flex: 1;
  color: #374151;
}

.reference-note {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  padding: 1rem;
  color: #1e40af;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.reference-note i {
  color: #3b82f6;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

/* 预览模态框样式 */
.preview-modal {
  max-width: 900px;
  max-height: 95vh;
}

.preview-header {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 2px solid #e1e8ed;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
}

.preview-title {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.preview-description {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.preview-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.preview-empty .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.preview-questions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.preview-question {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.preview-question:hover {
  border-color: #4facfe;
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.1);
}

.preview-question .question-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.preview-question .question-number {
  min-width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.preview-question .question-title {
  flex: 1;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  min-width: 200px;
}

.question-type-indicator {
  background: #f8f9fa;
  color: #6c757d;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid #dee2e6;
  white-space: nowrap;
}

.question-type-indicator i {
  color: #4facfe;
}

.preview-question .question-description {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  color: #6c757d;
  margin-bottom: 1.5rem;
  border-left: 3px solid #4facfe;
  font-style: italic;
}

.question-preview-content {
  margin-top: 1rem;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.option-item:hover {
  background: #e3f2fd;
  border-color: #4facfe;
}

.option-item input[type="radio"],
.option-item input[type="checkbox"] {
  margin: 0;
  transform: scale(1.2);
}

.option-item label {
  margin: 0;
  color: #495057;
  font-size: 1rem;
  cursor: default;
}

.dropdown-preview {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #495057;
  cursor: not-allowed;
}

.text-input-preview {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #6c757d;
  resize: vertical;
  cursor: not-allowed;
  font-family: inherit;
}

.unknown-type {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.unknown-message {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

.unknown-message i {
  margin-right: 0.5rem;
  color: #f39c12;
}

.preview-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e8ed;
}

.preview-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-item i {
  color: #4facfe;
}

/* 预览模态框响应式 */
@media (max-width: 768px) {
  .preview-modal {
    max-width: 95%;
    margin: 1rem;
  }

  .preview-header {
    padding: 1.5rem 1rem;
  }

  .preview-title {
    font-size: 1.5rem;
  }

  .preview-question {
    padding: 1.5rem;
  }

  .preview-question .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .question-type-indicator {
    align-self: flex-start;
  }

  .preview-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .questionnaire-model-create {
    padding: 1rem;
  }

  .new-question-form .question-types {
    grid-template-columns: 1fr;
  }

  .option-input-group {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .child-option-input-group {
    flex-wrap: wrap;
  }
}
</style>
