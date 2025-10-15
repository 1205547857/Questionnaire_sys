<template>
  <div class="question-create-container">
    <div class="question-create-card">
      <!-- 页面头部 -->
      <div class="card-header">
        <h1 class="page-title">
          <i class="fas fa-edit"></i>
          {{ isEditMode ? '编辑问题' : '创建问题' }}
        </h1>
        <p class="page-subtitle">{{ isEditMode ? '修改您的问卷问题信息' : '设计您的问卷问题，支持多种题型' }}</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>正在加载问题信息...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-section">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <div style="margin-top: 1rem;">
            <button @click="retryLoad" class="btn btn-primary" style="margin-right: 0.5rem;">重试</button>
            <button @click="testAPI" class="btn btn-warning" style="margin-right: 0.5rem;">测试API</button>
            <button @click="$router.go(-1)" class="btn btn-secondary">返回</button>
          </div>
        </div>
      </div> <!-- 表单内容 -->
      <div v-else class="card-content">
        <form @submit.prevent="saveQuestion" class="question-form">
          <!-- 基本信息区域 -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              基本信息
            </h3>

            <!-- 问题标题 -->
            <div class="form-group">
              <label class="field-label" for="questionTitle">问题标题 *</label>
              <input id="questionTitle" v-model="questionData.title" type="text" class="form-input"
                placeholder="请输入问题标题" required />
            </div>

            <!-- 问题描述 -->
            <div class="form-group">
              <label class="field-label" for="questionDescription">问题描述</label>
              <textarea id="questionDescription" v-model="questionData.description" class="form-textarea"
                placeholder="请输入问题的详细描述（可选）" rows="3"></textarea>
            </div>

            <!-- 问题类型 -->
            <div class="form-group">
              <label class="field-label">问题类型 *</label>
              <div class="question-types">
                <div v-for="type in questionTypes" :key="type.value" class="type-option"
                  :class="{ active: questionData.type === type.value }" @click="selectQuestionType(type.value)">
                  <i :class="type.icon"></i>
                  <span>{{ type.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 选项配置区域 -->
          <div class="form-section" v-if="needOptions">
            <h3 class="section-title">
              <i class="fas fa-list"></i>
              选项配置
            </h3>

            <!-- 下拉列表嵌套选项 -->
            <div v-if="questionData.type === 'dropdown'" class="nested-options-controls">
              <label class="checkbox-label">
                <input type="checkbox" v-model="questionData.isNested" class="checkbox-input" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">启用多级下拉列表（如：国家-省份-城市）</span>
              </label>
            </div>

            <div class="options-container">
              <div v-for="(option, index) in questionData.options" :key="index" class="option-item"
                :class="{ 'nested-option': questionData.isNested && questionData.type === 'dropdown' }">

                <!-- 一级选项 -->
                <div class="option-input-group">
                  <span class="option-index">{{ index + 1 }}</span>
                  <input v-model="option.text" type="text" class="option-input"
                    :placeholder="questionData.isNested ? `一级选项 ${index + 1}（如：中国）` : `选项 ${index + 1}`" required />

                  <!-- 添加子选项按钮 -->
                  <button v-if="questionData.isNested && questionData.type === 'dropdown'" type="button"
                    class="add-child-btn" @click="addChildOption(index)" title="添加子选项">
                    <i class="fas fa-plus"></i>
                  </button>

                  <button type="button" class="remove-option-btn" @click="removeOption(index)"
                    v-if="questionData.options.length > 2">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <!-- 子选项列表 -->
                <div
                  v-if="questionData.isNested && questionData.type === 'dropdown' && option.children && option.children.length > 0"
                  class="child-options-container">
                  <div v-for="(child, childIndex) in option.children" :key="childIndex" class="child-option-item">
                    <div class="child-option-input-group">
                      <span class="child-option-connector">└─</span>
                      <span class="child-option-index">{{ index + 1 }}.{{ childIndex + 1 }}</span>
                      <input v-model="child.text" type="text" class="child-option-input" :placeholder="`子选项（如：江西省）`"
                        required />
                      <button type="button" class="remove-child-option-btn"
                        @click="removeChildOption(index, childIndex)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="add-option-btn" @click="addOption">
                <i class="fas fa-plus"></i>
                {{ questionData.isNested && questionData.type === 'dropdown' ? '添加一级选项' : '添加选项' }}
              </button>
            </div>
          </div>

          <!-- 问题设置区域 -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-cog"></i>
              问题设置
            </h3>

            <div class="settings-grid">
              <div class="setting-item" v-if="questionData.type === 'multiple'">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="questionData.allowOther" class="checkbox-input" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">允许填写其他选项</span>
                </label>
              </div>

              <div class="setting-item">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="questionData.shared" @change="handleSharedChange"
                    class="checkbox-input" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">设为共享问题</span>
                </label>
                <p class="setting-description">
                  共享问题可以被其他用户引用和使用
                </p>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-eye"></i>
              问题预览
            </h3>

            <div class="question-preview">
              <div class="preview-question">
                <h4 class="preview-title">
                  {{ questionData.title || '问题标题' }}
                </h4>
                <p v-if="questionData.description" class="preview-description">
                  {{ questionData.description }}
                </p>

                <!-- 预览不同题型 -->
                <div class="preview-content">
                  <!-- 单选题预览 -->
                  <div v-if="questionData.type === 'single'" class="preview-options">
                    <div v-for="(option, index) in questionData.options" :key="index" class="preview-option">
                      <input type="radio" :name="`preview-${Date.now()}`" disabled />
                      <span>{{ option.text || `选项 ${index + 1}` }}</span>
                    </div>
                    <div v-if="questionData.allowOther" class="preview-option">
                      <input type="radio" :name="`preview-${Date.now()}`" disabled />
                      <span>其他：</span>
                      <input type="text" placeholder="请填写" disabled class="other-input" />
                    </div>
                  </div>

                  <!-- 多选题预览 -->
                  <div v-else-if="questionData.type === 'multiple'" class="preview-options">
                    <div v-for="(option, index) in questionData.options" :key="index" class="preview-option">
                      <input type="checkbox" disabled />
                      <span>{{ option.text || `选项 ${index + 1}` }}</span>
                    </div>
                    <div v-if="questionData.allowOther" class="preview-option">
                      <input type="checkbox" disabled />
                      <span>其他：</span>
                      <input type="text" placeholder="请填写" disabled class="other-input" />
                    </div>
                  </div>

                  <!-- 下拉列表预览 -->
                  <div v-else-if="questionData.type === 'dropdown'" class="preview-dropdown">
                    <!-- 非嵌套下拉列表 -->
                    <div v-if="!questionData.isNested" class="simple-dropdown">
                      <select class="preview-select" disabled>
                        <option value="">请选择...</option>
                        <option v-for="(option, index) in questionData.options" :key="index" :value="option.text">
                          {{ option.text || `选项 ${index + 1}` }}
                        </option>
                        <option v-if="questionData.allowOther" value="other">其他</option>
                      </select>
                      <div v-if="questionData.allowOther" class="other-input-container"
                        style="margin-top: 0.8rem; display: none;">
                        <label class="other-label">请填写其他选项：</label>
                        <input type="text" placeholder="请填写" disabled class="other-input" />
                      </div>
                    </div>

                    <!-- 嵌套下拉列表 -->
                    <div v-else class="nested-dropdown">
                      <div class="dropdown-level">
                        <select class="preview-select" disabled>
                          <option value="">请选择一级选项...</option>
                          <option v-for="(option, index) in questionData.options" :key="index" :value="option.text">
                            {{ option.text || `一级选项 ${index + 1}` }}
                          </option>
                        </select>
                      </div>
                      <div class="dropdown-level">
                        <select class="preview-select" disabled>
                          <option value="">请先选择一级选项...</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- 文本题预览 -->
                  <div v-else-if="questionData.type === 'text'" class="preview-text">
                    <textarea class="preview-textarea" placeholder="请在此输入您的答案..." disabled rows="4"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" @click="$router.go(-1)" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              返回
            </button>

            <button type="button" @click="previewQuestion" class="btn btn-info" :disabled="!isFormValid">
              <i class="fas fa-eye"></i>
              预览
            </button>

            <button type="button" @click="resetForm" class="btn btn-warning" v-if="!isEditMode">
              <i class="fas fa-undo"></i>
              重置
            </button>

            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || saving">
              <i :class="saving ? 'fas fa-spinner fa-spin' : (isEditMode ? 'fas fa-save' : 'fas fa-plus')"></i>
              {{ saving ? '保存中...' : (isEditMode ? '保存修改' : '创建问题') }}
            </button>
          </div>
        </form>

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
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="modal-content large-modal preview-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-eye"></i>
            问题预览
          </h3>
          <button @click="closePreviewModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- 预览内容 -->
          <div class="preview-content">
            <div class="preview-questions">
              <div class="preview-question">
                <div class="question-header">
                  <span class="question-number">1.</span>
                  <h3 class="question-title">{{ questionData.title || '问题标题' }}</h3>
                  <span class="question-type-indicator">
                    <i :class="getQuestionTypeIcon(questionData.type)"></i>
                    {{ getQuestionTypeDisplayName(questionData.type) }}
                  </span>
                </div>

                <div v-if="questionData.description" class="question-description">
                  {{ questionData.description }}
                </div>

                <!-- 不同问题类型的预览 -->
                <div class="question-preview-content">
                  <!-- 单选题预览 -->
                  <div v-if="questionData.type === 'single' && needOptions" class="options-preview">
                    <div v-for="(option, optIndex) in getValidOptions()" :key="optIndex"
                      class="option-item single-option">
                      <input type="radio" :name="`preview-single-${Date.now()}`" disabled />
                      <label>{{ option }}</label>
                    </div>
                    <div v-if="questionData.allowOther" class="option-item single-option">
                      <input type="radio" :name="`preview-single-${Date.now()}`" disabled />
                      <label>其他：<input type="text" placeholder="请填写" disabled class="other-input-inline" /></label>
                    </div>
                  </div>

                  <!-- 多选题预览 -->
                  <div v-else-if="questionData.type === 'multiple' && needOptions" class="options-preview">
                    <div v-for="(option, optIndex) in getValidOptions()" :key="optIndex"
                      class="option-item multiple-option">
                      <input type="checkbox" disabled />
                      <label>{{ option }}</label>
                    </div>
                    <div v-if="questionData.allowOther" class="option-item multiple-option">
                      <input type="checkbox" disabled />
                      <label>其他：<input type="text" placeholder="请填写" disabled class="other-input-inline" /></label>
                    </div>
                  </div>

                  <!-- 下拉选择题预览 -->
                  <div v-else-if="questionData.type === 'dropdown' && needOptions" class="options-preview">
                    <!-- 非嵌套下拉列表 -->
                    <div v-if="!questionData.isNested" class="simple-dropdown">
                      <select class="dropdown-preview" disabled>
                        <option value="">请选择...</option>
                        <option v-for="(option, optIndex) in getValidOptions()" :key="optIndex" :value="option">
                          {{ option }}
                        </option>
                        <option v-if="questionData.allowOther" value="other">其他</option>
                      </select>
                    </div>
                    <!-- 嵌套下拉列表 -->
                    <div v-else class="nested-dropdown">
                      <div class="dropdown-level">
                        <label class="dropdown-label">一级选项：</label>
                        <select class="dropdown-preview" disabled>
                          <option value="">请选择一级选项...</option>
                          <option v-for="(option, optIndex) in questionData.options" :key="optIndex"
                            :value="option.text" v-show="option.text.trim()">
                            {{ option.text }}
                          </option>
                        </select>
                      </div>
                      <div class="dropdown-level">
                        <label class="dropdown-label">二级选项：</label>
                        <select class="dropdown-preview" disabled>
                          <option value="">请先选择一级选项...</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- 文本题预览 -->
                  <div v-else-if="questionData.type === 'text'" class="text-preview">
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
                <i class="fas fa-question-circle"></i>
                <span>问题类型：{{ getQuestionTypeDisplayName(questionData.type) }}</span>
              </div>
              <div v-if="needOptions" class="stat-item">
                <i class="fas fa-list"></i>
                <span>选项数量：{{ getValidOptions().length }}个</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closePreviewModal" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            关闭预览
          </button>
          <button @click="closePreviewModal(); saveQuestion()" class="btn btn-primary"
            :disabled="!isFormValid || saving">
            <i :class="saving ? 'fas fa-spinner fa-spin' : (isEditMode ? 'fas fa-save' : 'fas fa-plus')"></i>
            {{ saving ? '保存中...' : (isEditMode ? '确认保存' : '确认创建') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { create_question } from '@/scripts/question_create'
import { getCookie } from '@/utils/cookies'
import { useUserStore } from '@/stores/userStore'
import {
  getQuestionById,
  updateQuestion,
  parseQuestionOptionsForEdit,
  convertOptionsForEdit,
  type EditQuestionRequest,
  type QuestionDetail
} from '@/scripts/questionEdit'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)
const questionId = computed(() => route.params.id as string)

// 选项接口
interface Option {
  text: string
  children?: Option[]
}

// 问题类型配置
const questionTypes = [
  { value: 'single', label: '单选题', icon: 'fas fa-dot-circle' },
  { value: 'multiple', label: '多选题', icon: 'fas fa-check-square' },
  { value: 'text', label: '文本题', icon: 'fas fa-align-left' },
  { value: 'dropdown', label: '下拉选择题', icon: 'fas fa-chevron-down' }
]

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const questionData = ref({
  title: '',
  description: '',
  type: 'single',
  options: [{ text: '', children: [] as Option[] }, { text: '', children: [] as Option[] }],
  allowOther: false,
  isNested: false,
  shared: false // 是否设为共享问题
})

const message = ref({
  text: '',
  type: 'success'
})

// 预览模态框状态
const showPreviewModal = ref(false)

// 原始问题数据（用于编辑模式）
const originalQuestion = ref<QuestionDetail | null>(null)

// 计算属性
const needOptions = computed(() => {
  return ['single', 'multiple', 'dropdown'].includes(questionData.value.type)
})

const isFormValid = computed(() => {
  if (!questionData.value.title.trim()) return false

  if (needOptions.value) {
    return questionData.value.options.some(option => option.text.trim())
  }

  return true
})

// 方法
function selectQuestionType(type: string) {
  questionData.value.type = type

  // 根据题型初始化选项
  if (needOptions.value && questionData.value.options.length === 0) {
    questionData.value.options = [{ text: '', children: [] as Option[] }, { text: '', children: [] as Option[] }]
  }
}

function addOption() {
  questionData.value.options.push({ text: '', children: [] as Option[] })
}

function addChildOption(parentIndex: number) {
  if (!questionData.value.options[parentIndex].children) {
    questionData.value.options[parentIndex].children = [] as Option[]
  }
  questionData.value.options[parentIndex].children!.push({ text: '' })
}

function removeChildOption(parentIndex: number, childIndex: number) {
  questionData.value.options[parentIndex].children!.splice(childIndex, 1)
}

function removeOption(index: number) {
  if (questionData.value.options.length > 2) {
    questionData.value.options.splice(index, 1)
  }
}

function resetForm() {
  if (isEditMode.value && originalQuestion.value) {
    // 编辑模式：恢复到原始数据
    loadQuestionData(originalQuestion.value)
  } else {
    // 创建模式：重置为空
    questionData.value.title = ''
    questionData.value.description = ''
    questionData.value.type = 'single'
    questionData.value.options = [{ text: '', children: [] as Option[] }, { text: '', children: [] as Option[] }]
    questionData.value.allowOther = false
    questionData.value.isNested = false
    questionData.value.shared = false
  }
  clearMessage()
}

function previewQuestion() {
  if (!isFormValid.value) {
    showMessage('请填写完整的问题信息', 'error')
    return
  }

  showPreviewModal.value = true
}

function closePreviewModal() {
  showPreviewModal.value = false
}

// 获取有效选项（过滤空值）
function getValidOptions(): string[] {
  if (!needOptions.value) return []

  const result: string[] = []

  questionData.value.options.forEach(option => {
    if (option.text.trim()) {
      if (questionData.value.isNested && option.children && option.children.length > 0) {
        // 嵌套结构：父选项 > 子选项
        option.children.forEach(child => {
          if (child.text.trim()) {
            result.push(`${option.text} > ${child.text}`)
          }
        })
      } else {
        // 普通选项
        result.push(option.text)
      }
    }
  })

  return result
}

function handleSharedChange() {
  // 简化为普通的共享状态切换
  if (questionData.value.shared) {
    showMessage('问题已设为共享状态', 'success')
  } else {
    showMessage('已取消共享状态', 'info')
  }
}

// 获取问题类型显示名称
function getQuestionTypeDisplayName(type: string): string {
  const typeMap: { [key: string]: string } = {
    single: '单选题',
    multiple: '多选题',
    text: '文本题',
    dropdown: '下拉选择题'
  }
  return typeMap[type] || '未知类型'
}

// 获取问题类型图标
function getQuestionTypeIcon(type: string): string {
  const iconMap: { [key: string]: string } = {
    single: 'fas fa-dot-circle',
    multiple: 'fas fa-check-square',
    text: 'fas fa-align-left',
    dropdown: 'fas fa-chevron-down'
  }
  return iconMap[type] || 'fas fa-question-circle'
}

// 将选项转换为字符串数组
function convertOptionsToStringArray(): string[] {
  if (!needOptions.value) {
    return []
  }

  const result: string[] = []

  questionData.value.options.forEach(option => {
    if (option.text.trim()) {
      if (questionData.value.isNested && option.children && option.children.length > 0) {
        // 嵌套结构：父选项 > 子选项
        option.children.forEach(child => {
          if (child.text.trim()) {
            result.push(`${option.text} > ${child.text}`)
          }
        })
      } else {
        // 普通选项
        result.push(option.text)
      }
    }
  })

  return result
}

async function saveQuestion() {
  if (!isFormValid.value) {
    showMessage('请填写完整的问题信息', 'error')
    return
  }

  saving.value = true
  try {
    // 转换选项为字符串数组
    const optionsArray = convertOptionsToStringArray()
    const optionsString = JSON.stringify(optionsArray)

    if (isEditMode.value) {
      // 编辑模式：更新问题
      const editData: EditQuestionRequest = {
        questionId: questionId.value,
        questionType: questionData.value.type,
        questionOptions: optionsString,
        canDelete: originalQuestion.value?.canDelete || 0,
        questionTitle: questionData.value.title,
        questionTxt: questionData.value.description,
        shared: questionData.value.shared ? 1 : 0
      }

      const result = await updateQuestion(editData)

      if (result.success) {
        showMessage(result.message || '问题更新成功！', 'success')

        // 如果问题ID发生了变化，更新用户数据中的ID
        if (result.newQuestionId) {
          userStore.updateQuestionId(questionId.value, result.newQuestionId)
          console.log(`Updated user question ID mapping: ${questionId.value} -> ${result.newQuestionId}`)
        }

        // 延迟跳转回列表页
        setTimeout(() => {
          router.push('/page/question_center_my')
        }, 1500)
      } else {
        showMessage(result.message || '更新失败，请稍后重试', 'error')
      }
    } else {
      // 创建模式：创建新问题
      await create_question(questionData.value.type, optionsString, questionData.value.title, questionData.value.description)
      console.log('保存问题:', {
        type: questionData.value.type,
        options: optionsArray,
        optionsString: optionsString,
        title: questionData.value.title,
        description: questionData.value.description
      })
      showMessage('问题保存成功！', 'success')
    }
  } catch (error) {
    console.error('保存问题失败:', error)
    showMessage('保存失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

// 加载问题数据（编辑模式）
function loadQuestionData(questionDetail: QuestionDetail) {
  questionData.value.title = questionDetail.questionTitle
  questionData.value.description = questionDetail.questionTxt || ''
  questionData.value.type = questionDetail.questionType
  questionData.value.shared = questionDetail.shared === 1 // 将数字转换为布尔值

  // 解析选项
  const optionsArray = parseQuestionOptionsForEdit(questionDetail.questionOptions)  // 检查是否为嵌套选项
  const hasNestedOptions = optionsArray.some(opt => opt.includes(' > '))
  questionData.value.isNested = hasNestedOptions && questionDetail.questionType === 'dropdown'

  // 转换选项格式
  questionData.value.options = convertOptionsForEdit(optionsArray, questionData.value.isNested)

  // 确保至少有两个选项
  if (needOptions.value && questionData.value.options.length < 2) {
    while (questionData.value.options.length < 2) {
      questionData.value.options.push({ text: '', children: [] })
    }
  }
}

// 加载问题详情
async function loadQuestionDetail() {
  if (!isEditMode.value) return

  console.log('开始加载问题详情, ID:', questionId.value)
  loading.value = true
  error.value = ''

  try {
    console.log('调用API获取问题详情...')
    const questionDetail = await getQuestionById(questionId.value)
    console.log('API返回结果:', questionDetail)

    if (!questionDetail) {
      error.value = '问题不存在或已被删除'
      console.error('问题详情为空')
      return
    }

    originalQuestion.value = questionDetail
    loadQuestionData(questionDetail)
    console.log('问题数据加载完成')

  } catch (err) {
    console.error('加载问题详情失败:', err)
    error.value = '加载问题信息失败，请稍后重试'
  } finally {
    loading.value = false
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

// 重试加载
function retryLoad() {
  console.log('重试加载问题详情')
  loadQuestionDetail()
}

// 测试API
async function testAPI() {
  console.log('测试API连接...')
  try {
    const authToken = getCookie('authToken')
    console.log('当前AuthToken:', authToken)

    const testUrl = `http://localhost:8081/question/search/${questionId.value}`
    console.log('测试URL:', testUrl)

    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    console.log('响应状态:', response.status)
    const data = await response.text()
    console.log('响应数据:', data)

    showMessage(`API测试完成，状态: ${response.status}`, response.ok ? 'success' : 'error')
  } catch (err) {
    console.error('API测试失败:', err)
    showMessage('API测试失败，请检查控制台', 'error')
  }
}

// 组件挂载
onMounted(() => {
  console.log('组件已挂载')
  console.log('当前路由参数:', route.params)
  console.log('编辑模式:', isEditMode.value)
  console.log('问题ID:', questionId.value)

  if (isEditMode.value) {
    console.log('进入编辑模式，开始加载问题详情')
    loadQuestionDetail()
  } else {
    console.log('创建模式，跳过数据加载')
  }
})
</script>

<style scoped>
/* 与 question_center_create.vue 相同的样式 */
.question-create-container {
  padding: 2rem;
  min-height: 100vh;
  background: transparent;
}

.question-create-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 2.5rem;
  text-align: center;
  color: white;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.page-title i {
  font-size: 2.4rem;
}

.page-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

/* 加载和错误状态 */
.loading-section,
.error-section {
  text-align: center;
  padding: 3rem;
}

.loading-spinner,
.error-content {
  color: #4facfe;
}

.loading-spinner i,
.error-content i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-content {
  background: rgba(239, 68, 68, 0.1);
  border-radius: 15px;
  padding: 2rem;
  color: #dc2626;
}

.card-content {
  padding: 2.5rem;
}

.question-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid rgba(79, 172, 254, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #1e40af;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #4facfe;
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
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.question-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.type-option {
  background: white;
  border: 2px solid #e5e7eb;
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

.type-option:hover {
  border-color: #4facfe;
  transform: translateY(-2px);
}

.type-option.active {
  border-color: #4facfe;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
  color: #1e40af;
}

.type-option i {
  font-size: 1.5rem;
  color: #6b7280;
}

.type-option.active i {
  color: #4facfe;
}

.nested-options-controls {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #374151;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked+.checkbox-custom {
  background: #4facfe;
  border-color: #4facfe;
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 5px;
  width: 6px;
  height: 10px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.setting-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #6c757d;
  line-height: 1.4;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
}

.info-text {
  color: #17a2b8;
  font-weight: 500;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
}

.option-index {
  min-width: 30px;
  height: 30px;
  background: #4facfe;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
}

.option-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}

.add-child-btn,
.remove-option-btn,
.remove-child-option-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-child-btn {
  background: #10b981;
  color: white;
}

.add-child-btn:hover {
  background: #059669;
}

.remove-option-btn,
.remove-child-option-btn {
  background: #ef4444;
  color: white;
}

.remove-option-btn:hover,
.remove-child-option-btn:hover {
  background: #dc2626;
}

.child-options-container {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.child-option-item {
  padding: 0.8rem 1rem 0.8rem 2rem;
}

.child-option-input-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.child-option-connector {
  color: #6b7280;
  font-family: monospace;
}

.child-option-index {
  min-width: 40px;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.child-option-input {
  flex: 1;
  padding: 0.5rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.add-option-btn {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  align-self: flex-start;
}

.add-option-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.setting-item {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.question-preview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 2px solid #e5e7eb;
}

.preview-question {
  max-width: 600px;
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.8rem;
}

.preview-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.preview-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.preview-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-dropdown {
  max-width: 300px;
}

.nested-dropdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dropdown-level {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  width: 100%;
}

.preview-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
}

.other-input {
  padding: 0.3rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 150px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 2px solid rgba(79, 172, 254, 0.1);
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

.message-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  max-width: 400px;
  border-radius: 10px;
  overflow: hidden;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-container.success {
  background: linear-gradient(45deg, #10b981 0%, #34d399 100%);
}

.message-container.error {
  background: linear-gradient(45deg, #ef4444 0%, #f87171 100%);
}

.message-container.warning {
  background: linear-gradient(45deg, #f59e0b 0%, #fbbf24 100%);
}

.message-container.info {
  background: linear-gradient(45deg, #06b6d4 0%, #22d3ee 100%);
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
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.message-close:hover {
  opacity: 1;
}

/* 预览模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.large-modal {
  max-width: 900px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #e1e8ed;
}

/* 预览内容样式 */
.preview-modal {
  max-width: 900px;
  max-height: 95vh;
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.other-input-inline {
  padding: 0.2rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 120px;
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

.nested-dropdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dropdown-level {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dropdown-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .question-create-container {
    padding: 1rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .question-types {
    grid-template-columns: 1fr;
  }

  .form-actions {
    justify-content: center;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }

  .message-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  /* 预览模态框响应式 */
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .preview-modal {
    max-width: 95%;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
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
</style>
