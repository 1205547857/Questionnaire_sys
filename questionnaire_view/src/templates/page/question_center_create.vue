<template>
  <div class="question-create-container">
    <div class="question-create-card">
      <!-- <div class="setting-item" v-if="['single', 'multiple', 'dropdown'].includes(questionData.type)">
        <label class="checkbox-label">
          <input type="checkbox" v-model="questionData.allowOther" class="checkbox-input" />
          <span class="checkbox-custom"></span>
          <span class="checkbox-text">允许填写其他选项</span>
        </label>
      </div> -->
      <!-- 页面头部 -->
      <div class="card-header">
        <h1 class="page-title">
          <i class="fas fa-plus-circle"></i>
          创建问题
        </h1>
        <p class="page-subtitle">设计您的问卷问题，支持多种题型</p>
      </div>

      <div class="card-content">
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
                        <label class="dropdown-label">第一级选择：</label>
                        <select class="preview-select nested-select" disabled>
                          <option value="">请选择...</option>
                          <option v-for="(option, index) in questionData.options" :key="index" :value="option.text">
                            {{ option.text || `选项 ${index + 1}` }}
                          </option>
                        </select>
                      </div>

                      <!-- 显示有子选项的第二级下拉 -->
                      <div
                        v-for="(option, optionIndex) in questionData.options.filter(opt => opt.children && opt.children.length > 0)"
                        :key="optionIndex" class="dropdown-level secondary-level">
                        <label class="dropdown-label">当选择"{{ option.text }}"时的第二级选择：</label>
                        <select class="preview-select nested-select" disabled>
                          <option value="">请选择...</option>
                          <option v-for="(child, childIndex) in option.children" :key="childIndex" :value="child.text">
                            {{ child.text || `子选项 ${childIndex + 1}` }}
                          </option>
                        </select>
                      </div>

                      <div v-if="questionData.allowOther" class="other-input-container">
                        <label class="other-label">允许填写其他选项</label>
                      </div>
                    </div>
                  </div>

                  <!-- 文本题预览 -->
                  <div v-else-if="questionData.type === 'text'" class="preview-text">
                    <textarea placeholder="请在此输入您的答案..." disabled rows="3" class="preview-textarea"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="resetForm">
              <i class="fas fa-undo"></i>
              重置
            </button>
            <button type="button" class="btn btn-outline" @click="previewQuestion">
              <i class="fas fa-eye"></i>
              预览
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
              <i class="fas fa-save"></i>
              保存问题
            </button>
          </div>
        </form>

        <!-- 消息提示 -->
        <div v-if="message.text" class="message" :class="message.type">
          <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
          {{ message.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { create_question } from '@/scripts/question_create'
// 类型定义
interface Option {
  text: string
  children?: Option[]
}

// 问题类型定义
const questionTypes = [
  { value: 'single', label: '单选题', icon: 'fas fa-dot-circle' },
  { value: 'multiple', label: '多选题', icon: 'fas fa-check-square' },
  { value: 'text', label: '文本题', icon: 'fas fa-edit' },
  { value: 'dropdown', label: '下拉列表', icon: 'fas fa-chevron-down' }
]

// 问题数据
const questionData = reactive({
  title: '',
  description: '',
  type: 'single',
  options: [
    { text: '', children: [] as Option[] },
    { text: '', children: [] as Option[] }
  ],
  allowOther: false,
  isNested: false, // 是否使用嵌套结构
  shared: false // 是否设为共享问题
})

// 消息提示
const message = reactive({
  text: '',
  type: 'success'
})

// 计算属性
const needOptions = computed(() => {
  return ['single', 'multiple', 'dropdown'].includes(questionData.type)
})

const isFormValid = computed(() => {
  if (!questionData.title.trim()) return false

  if (needOptions.value) {
    return questionData.options.some(option => option.text.trim())
  }

  return true
})

// 方法
function selectQuestionType(type: string) {
  questionData.type = type

  // 根据题型初始化选项
  if (needOptions.value && questionData.options.length === 0) {
    questionData.options = [{ text: '', children: [] as Option[] }, { text: '', children: [] as Option[] }]
  }
}

function addOption() {
  questionData.options.push({ text: '', children: [] as Option[] })
}

function addChildOption(parentIndex: number) {
  if (!questionData.options[parentIndex].children) {
    questionData.options[parentIndex].children = [] as Option[]
  }
  questionData.options[parentIndex].children!.push({ text: '' })
}

function removeChildOption(parentIndex: number, childIndex: number) {
  questionData.options[parentIndex].children!.splice(childIndex, 1)
}

function removeOption(index: number) {
  if (questionData.options.length > 2) {
    questionData.options.splice(index, 1)
  }
}

function resetForm() {
  questionData.title = ''
  questionData.description = ''
  questionData.type = 'single'
  questionData.options = [{ text: '', children: [] as Option[] }, { text: '', children: [] as Option[] }]
  questionData.allowOther = false
  questionData.isNested = false
  clearMessage()
}

function previewQuestion() {
  if (!isFormValid.value) {
    showMessage('请填写完整的问题信息', 'error')
    return
  }

  showMessage('预览功能正在开发中...', 'info')
}

// 将选项转换为字符串数组
function convertOptionsToStringArray(): string[] {
  if (!needOptions.value) {
    return []
  }

  const result: string[] = []

  questionData.options.forEach(option => {
    if (option.text.trim()) {
      if (questionData.isNested && option.children.length > 0) {
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

function saveQuestion() {
  if (!isFormValid.value) {
    showMessage('请填写完整的问题信息', 'error')
    return
  }

  // 转换选项为字符串数组
  const optionsArray = convertOptionsToStringArray()

  // 将选项数组转换为JSON字符串供API使用
  const optionsString = JSON.stringify(optionsArray)

  // 将shared布尔值转换为数字
  const sharedValue = questionData.shared ? 1 : 0

  // 调用API保存问题
  create_question(questionData.type, optionsString, questionData.title, questionData.description, sharedValue)
  console.log('保存问题:', {
    type: questionData.type,
    options: optionsArray,
    optionsString: optionsString,
    title: questionData.title,
    description: questionData.description,
    shared: sharedValue
  })
  showMessage('问题保存成功！', 'success')
}

function handleSharedChange() {
  // 简化为普通的共享状态切换
  if (questionData.shared) {
    showMessage('问题已设为共享状态', 'success')
  } else {
    showMessage('已取消共享状态', 'info')
  }
}

function showMessage(text: string, type: string) {
  message.text = text
  message.type = type

  setTimeout(() => {
    clearMessage()
  }, 3000)
}

function clearMessage() {
  message.text = ''
}
</script>

<style scoped>
/* 主容器样式 */
.question-create-container {
  padding: 2rem;
  min-height: 100vh;
  background: transparent;
}

/* 主卡片样式 */
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

/* 卡片头部 */
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

/* 卡片内容 */
.card-content {
  padding: 2.5rem;
}

/* 表单区域 */
.question-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 表单区块 */
.form-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  border-left: 4px solid #4facfe;
}

.section-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #4facfe;
  font-size: 1.1rem;
}

/* 表单组 */
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
  transform: translateY(-1px);
}

/* 问题类型选择 */
.question-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.type-option {
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

.type-option:hover {
  border-color: #4facfe;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.2);
}

.type-option.active {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05));
  border-color: #4facfe;
  color: #4facfe;
}

.type-option i {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.type-option span {
  font-weight: 500;
  font-size: 0.95rem;
}

/* 选项配置 */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.option-item {
  background: white;
  border-radius: 10px;
  padding: 0.5rem;
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.option-index {
  background: #4facfe;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.option-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

.remove-option-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-option-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
}

.add-option-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  align-self: flex-start;
}

.add-option-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(86, 171, 47, 0.3);
}

/* 嵌套选项样式 */
.nested-options-controls {
  background: rgba(79, 172, 254, 0.05);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #4facfe;
}

.nested-option {
  border-left: 3px solid #4facfe;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.02), rgba(0, 242, 254, 0.01));
}

.add-child-btn {
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.add-child-btn:hover {
  background: #138496;
  transform: scale(1.1);
}

.child-options-container {
  margin-top: 0.8rem;
  padding-left: 2rem;
  border-left: 2px dashed #e1e8ed;
  background: rgba(23, 162, 184, 0.02);
  border-radius: 0 8px 8px 0;
}

.child-option-item {
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 6px;
  padding: 0.3rem;
}

.child-option-input-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.child-option-connector {
  color: #6c757d;
  font-family: monospace;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.child-option-index {
  background: #17a2b8;
  color: white;
  min-width: 45px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.child-option-input {
  flex: 1;
  padding: 0.5rem 0.8rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.child-option-input:focus {
  outline: none;
  border-color: #17a2b8;
  box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.1);
}

.remove-child-option-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.remove-child-option-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* 设置区域 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.setting-item {
  background: white;
  border-radius: 10px;
  padding: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  font-weight: 500;
  color: #34495e;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  position: relative;
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
  font-size: 12px;
  font-weight: bold;
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

/* 预览区域 */
.question-preview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 2px dashed #e1e8ed;
}

.preview-question {
  max-width: none;
}

.preview-title {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.8rem 0;
}



.preview-description {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.preview-content {
  margin-top: 1rem;
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
  padding: 0.5rem 0;
}

.preview-option input[type="radio"],
.preview-option input[type="checkbox"] {
  margin: 0;
}

.other-input {
  padding: 0.3rem 0.6rem;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
}

.preview-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
}

/* 下拉列表预览样式 */
.preview-dropdown {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.preview-select {
  width: 100%;
  max-width: 300px;
  padding: 0.8rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-select:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

.preview-select:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
  color: #6c757d;
}

.other-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(79, 172, 254, 0.05);
  border-radius: 8px;
  border-left: 3px solid #4facfe;
}

.other-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #34495e;
}

/* 嵌套下拉列表预览样式 */
.nested-dropdown {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.dropdown-level {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dropdown-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 0.3rem;
}

.nested-select {
  max-width: 280px;
}

.secondary-level {
  margin-left: 1.5rem;
  padding: 1rem;
  background: rgba(23, 162, 184, 0.05);
  border-radius: 8px;
  border-left: 3px solid #17a2b8;
}

.secondary-level .dropdown-label {
  color: #17a2b8;
  font-size: 0.85rem;
}

.secondary-level .nested-select {
  border-color: #17a2b8;
}

.simple-dropdown {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 2px solid #e9ecef;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #4facfe;
  border: 2px solid #4facfe;
}

.btn-outline:hover {
  background: #4facfe;
  color: white;
  transform: translateY(-2px);
}

/* 消息提示 */
.message {
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in;
}

.message.success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05));
  border: 1px solid rgba(40, 167, 69, 0.2);
  color: #155724;
}

.message.error {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
  border: 1px solid rgba(220, 53, 69, 0.2);
  color: #721c24;
}

.message.info {
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(23, 162, 184, 0.05));
  border: 1px solid rgba(23, 162, 184, 0.2);
  color: #0c5460;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
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
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .question-create-container {
    padding: 0.5rem;
  }

  .question-create-card {
    border-radius: 15px;
  }

  .card-content {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
