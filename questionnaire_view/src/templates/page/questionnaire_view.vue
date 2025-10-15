<template>
  <div class="questionnaire-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-actions">
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i>
          返回
        </button>
        <div class="header-title">
          <h1 class="page-title">
            <i class="fas fa-clipboard-list"></i>
            问卷详情
          </h1>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载问卷信息...</p>
      </div>
    </div>

    <!-- 问卷不存在 -->
    <div v-else-if="!questionnaire" class="error-section">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>问卷不存在</h3>
        <p>未找到指定的问卷，可能已被删除或您没有访问权限。</p>
        <button @click="goBack" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i>
          返回列表
        </button>
      </div>
    </div>

    <!-- 问卷内容 -->
    <div v-else class="questionnaire-content">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-info-circle"></i>
            基本信息
          </h3>
          <div class="status-badge" :class="getStatusClass(questionnaire.questionnaireStatus)">
            <i :class="getStatusIcon(questionnaire.questionnaireStatus)"></i>
            {{ getStatusDisplay(questionnaire.questionnaireStatus) }}
          </div>
        </div>

        <div class="card-content">
          <!-- 问卷标题 -->
          <div class="form-group">
            <label class="field-label">问卷标题</label>
            <input v-model="editForm.questionnaireTitle" type="text" class="form-input title-input"
              placeholder="请输入问卷标题" @blur="saveTitleChanges"
              @keyup.enter="(event) => (event.target as HTMLInputElement)?.blur()" />
          </div>

          <!-- 基于模版 -->
          <div class="form-group">
            <label class="field-label">基于模版</label>
            <div class="field-value">
              <i class="fas fa-layer-group"></i>
              模版ID: {{ questionnaire.modelId }}
            </div>
          </div>

          <!-- 问卷ID -->
          <div class="form-group">
            <label class="field-label">问卷ID</label>
            <div class="field-value">{{ questionnaire.questionnaireId }}</div>
          </div>


        </div>
      </div>

      <!-- 状态管理卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-cogs"></i>
            状态管理
          </h3>
        </div>

        <div class="card-content">
          <!-- 当前状态信息 -->
          <div class="status-info">
            <div class="status-details">
              {{ getStatusDetailInfo(questionnaire.questionnaireStatus) }}
            </div>
          </div>

          <!-- 状态控制 -->
          <div class="status-controls">
            <div class="control-section">
              <h4>问卷控制</h4>
              <div class="control-buttons">
                <button v-if="!isQuestionnaireActive" @click="startQuestionnaire" class="btn btn-success"
                  :disabled="starting">
                  <i class="fas fa-play"></i>
                  {{ starting ? '启动中...' : '启动问卷' }}
                </button>
                <button v-if="isQuestionnaireActive" @click="pauseQuestionnaire" class="btn btn-warning"
                  :disabled="pausing">
                  <i class="fas fa-pause"></i>
                  {{ pausing ? '暂停中...' : '暂停问卷' }}
                </button>
                <button @click="showTimeSettingsModal = true; initTimeSettings()" class="btn btn-info">
                  <i class="fas fa-clock"></i>
                  时间设置
                </button>
              </div>
            </div>
          </div>

          <!-- 问卷链接和二维码（仅在启动状态显示） -->
          <div v-if="isQuestionnaireActive" class="questionnaire-links">
            <div class="link-section">
              <h4>问卷链接</h4>
              <div class="link-container">
                <input :value="questionnaireUrl" readonly class="form-input link-input" @click="selectText" />
                <button @click="copyLink" class="btn btn-info">
                  <i class="fas fa-copy"></i>
                  复制
                </button>
                <a :href="questionnaireUrl" target="_blank" class="btn btn-primary">
                  <i class="fas fa-external-link-alt"></i>
                  打开
                </a>
              </div>
            </div>

            <!-- 二维码 -->
            <div class="qr-section">
              <h4>二维码</h4>
              <div class="qr-container">
                <div id="qrcode" class="qr-code"></div>
                <p class="qr-hint">扫描二维码快速访问问卷</p>
                <div class="qr-actions">
                  <button @click="downloadQRCode" class="btn btn-secondary btn-sm">
                    <i class="fas fa-download"></i>
                    下载二维码
                  </button>
                  <button @click="generateQRCode" class="btn btn-info btn-sm">
                    <i class="fas fa-refresh"></i>
                    重新生成
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 问卷预览卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-eye"></i>
            问卷预览
          </h3>
        </div>

        <div class="card-content">
          <div v-if="modelQuestions.length === 0" class="empty-preview">
            <i class="fas fa-inbox"></i>
            <p>暂无问题内容</p>
          </div>
          <div v-else class="questions-preview">
            <div v-for="(question, index) in modelQuestions" :key="question.id" class="preview-question">
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}</span>
                <span class="question-type">{{ getQuestionTypeDisplay(question.type) }}</span>
              </div>
              <h4 class="question-title">{{ question.title }}</h4>
              <p v-if="question.description" class="question-description">{{ question.description }}</p>
              <div v-if="question.options && question.options.length > 0" class="question-options">
                <div v-for="(option, optIndex) in question.options.slice(0, 3)" :key="optIndex" class="option-item">
                  {{ option }}
                </div>
                <span v-if="question.options.length > 3" class="option-more">
                  +{{ question.options.length - 3 }}个选项
                </span>
              </div>
            </div>
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

    <!-- 时间设置模态框 -->
    <div v-if="showTimeSettingsModal" class="modal-overlay" @click="closeTimeSettingsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-clock"></i>
            时间设置
          </h3>
          <button @click="closeTimeSettingsModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="field-label">开始时间 (可选)</label>
            <input v-model="timeSettings.startDate" type="datetime-local" class="form-input" placeholder="选择开始时间" />
          </div>

          <div class="form-group">
            <label class="field-label">结束时间 (可选)</label>
            <input v-model="timeSettings.endDate" type="datetime-local" class="form-input" placeholder="选择结束时间" />
          </div>

          <p class="field-hint">留空表示不限制时间范围</p>
        </div>

        <div class="modal-footer">
          <button @click="closeTimeSettingsModal" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            取消
          </button>
          <button @click="saveTimeSettings" class="btn btn-primary" :disabled="savingTimeSettings">
            <i class="fas fa-check" v-if="!savingTimeSettings"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ savingTimeSettings ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuestionnaireById } from '@/scripts/questionnaireQuery'
import { getQuestionnaireModelById, parseQuestionsArray } from '@/scripts/questionnaireModelQuery'
import { updateQuestionnaire } from '@/scripts/questionnaireEdit'
import {
  deserializeQuestionnaireStatus,
  createActiveStatusJson,
  createPausedStatusJson,
  createActiveStatus,
  serializeQuestionnaireStatus,
  type Questionnaire,
  type UpdateQuestionnaireRequest
} from '@/scripts/questionnaireCreate'

// 引入QR码库
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()

// 响应式数据
const questionnaire = ref<Questionnaire | null>(null)
const loading = ref(true)
const starting = ref(false)
const pausing = ref(false)
const modelQuestions = ref<Array<{ id: string; type: string; title: string; description?: string; options?: string[] }>>([])

// 时间设置相关
const showTimeSettingsModal = ref(false)
const savingTimeSettings = ref(false)
const timeSettings = ref({
  startDate: '',
  endDate: ''
})

// 编辑表单
const editForm = ref({
  questionnaireTitle: ''
})

// 消息提示
const message = ref({
  text: '',
  type: 'success'
})

// 计算属性
const questionnaireId = computed(() => route.params.id as string)

const isQuestionnaireActive = computed(() => {
  if (!questionnaire.value) return false
  try {
    const status = deserializeQuestionnaireStatus(questionnaire.value.questionnaireStatus)
    return status.active
  } catch {
    return false
  }
})

const questionnaireUrl = computed(() => {
  if (!questionnaire.value) return ''
  return `${window.location.origin}/form/${questionnaire.value.questionnaireId}`
})

// 方法
async function loadQuestionnaire() {
  loading.value = true
  try {
    const data = await getQuestionnaireById(questionnaireId.value)
    if (data) {
      questionnaire.value = data

      // 初始化编辑表单
      editForm.value = {
        questionnaireTitle: data.questionnaireTitle
      }

      // 加载问卷问题预览
      await loadQuestionnairePreview()

      // 生成二维码（如果问卷已启动）
      if (isQuestionnaireActive.value) {
        await generateQRCode()
      }
    }
  } catch (error) {
    console.error('Failed to load questionnaire:', error)
    showMessage('加载问卷失败', 'error')
  } finally {
    loading.value = false
  }
}

async function loadQuestionnairePreview() {
  if (!questionnaire.value) return

  try {
    const model = await getQuestionnaireModelById(questionnaire.value.modelId)
    if (model) {
      const questions = await parseQuestionsArray(model.questionsArray)
      modelQuestions.value = questions
    }
  } catch (error) {
    console.error('Failed to load questionnaire preview:', error)
  }
}

async function generateQRCode() {
  if (!isQuestionnaireActive.value) return

  try {
    await nextTick()
    const qrElement = document.getElementById('qrcode')
    if (qrElement) {
      // 显示加载状态
      qrElement.innerHTML = `<div style="width: 200px; height: 200px; border: 2px dashed #2563eb; display: flex; align-items: center; justify-content: center; color: #2563eb; text-align: center; font-size: 14px;"><i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>生成中...</div>`

      // 生成二维码
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, questionnaireUrl.value, {
        width: 200,
        color: {
          dark: '#2563eb', // 蓝色主题
          light: '#ffffff'
        },
        margin: 3,
        errorCorrectionLevel: 'H' // 高容错率
      })

      // 清空加载状态并添加二维码
      qrElement.innerHTML = ''
      qrElement.appendChild(canvas)
      console.log('QR code generated successfully for URL:', questionnaireUrl.value)
    }
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    // 如果生成失败，显示错误信息
    const qrElement = document.getElementById('qrcode')
    if (qrElement) {
      qrElement.innerHTML = `<div style="width: 200px; height: 200px; border: 2px solid #e74c3c; display: flex; align-items: center; justify-content: center; color: #e74c3c; text-align: center; font-size: 14px;"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>二维码生成失败<br><small>请稍后重试</small></div>`
    }
  }
}

function downloadQRCode() {
  try {
    const qrElement = document.getElementById('qrcode')
    const canvas = qrElement?.querySelector('canvas')

    if (canvas) {
      // 创建下载链接
      const link = document.createElement('a')
      link.download = `问卷二维码_${questionnaire.value?.questionnaireTitle || 'questionnaire'}.png`
      link.href = canvas.toDataURL('image/png')

      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showMessage('二维码下载成功', 'success')
    } else {
      showMessage('请先生成二维码', 'error')
    }
  } catch (error) {
    console.error('Failed to download QR code:', error)
    showMessage('下载失败，请重试', 'error')
  }
}

async function saveTitleChanges() {
  if (!questionnaire.value) return

  // 如果标题没有变化，不进行保存
  if (editForm.value.questionnaireTitle === questionnaire.value.questionnaireTitle) {
    return
  }

  try {
    const updateData: UpdateQuestionnaireRequest = {
      questionnaireId: questionnaire.value.questionnaireId,
      questionnaireStatus: questionnaire.value.questionnaireStatus,
      modelId: questionnaire.value.modelId,
      questionnaireTitle: editForm.value.questionnaireTitle
    }

    const result = await updateQuestionnaire(updateData)
    if (result.success) {
      // 更新本地数据
      questionnaire.value.questionnaireTitle = editForm.value.questionnaireTitle
      showMessage('标题保存成功', 'success')
    } else {
      // 如果保存失败，恢复原始标题
      editForm.value.questionnaireTitle = questionnaire.value.questionnaireTitle
      showMessage(result.message || '标题保存失败', 'error')
    }
  } catch (error) {
    console.error('Failed to save title:', error)
    // 如果保存失败，恢复原始标题
    editForm.value.questionnaireTitle = questionnaire.value.questionnaireTitle
    showMessage('保存失败，请稍后重试', 'error')
  }
}

async function startQuestionnaire() {
  if (!questionnaire.value) return

  starting.value = true
  try {
    const updateData: UpdateQuestionnaireRequest = {
      questionnaireId: questionnaire.value.questionnaireId,
      questionnaireStatus: createActiveStatusJson(),
      modelId: questionnaire.value.modelId,
      questionnaireTitle: questionnaire.value.questionnaireTitle,
      canDelete: questionnaire.value.canDelete
    }

    const result = await updateQuestionnaire(updateData)
    if (result.success) {
      questionnaire.value.questionnaireStatus = updateData.questionnaireStatus
      showMessage('问卷启动成功', 'success')

      // 生成二维码
      await generateQRCode()
    } else {
      showMessage(result.message || '启动失败', 'error')
    }
  } catch (error) {
    console.error('Failed to start questionnaire:', error)
    showMessage('启动失败，请稍后重试', 'error')
  } finally {
    starting.value = false
  }
}

async function pauseQuestionnaire() {
  if (!questionnaire.value) return

  pausing.value = true
  try {
    const updateData: UpdateQuestionnaireRequest = {
      questionnaireId: questionnaire.value.questionnaireId,
      questionnaireStatus: createPausedStatusJson(),
      modelId: questionnaire.value.modelId,
      questionnaireTitle: questionnaire.value.questionnaireTitle,
      canDelete: questionnaire.value.canDelete
    }

    const result = await updateQuestionnaire(updateData)
    if (result.success) {
      questionnaire.value.questionnaireStatus = updateData.questionnaireStatus
      showMessage('问卷已暂停', 'success')
    } else {
      showMessage(result.message || '暂停失败', 'error')
    }
  } catch (error) {
    console.error('Failed to pause questionnaire:', error)
    showMessage('暂停失败，请稍后重试', 'error')
  } finally {
    pausing.value = false
  }
}

function copyLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(questionnaireUrl.value).then(() => {
      showMessage('链接已复制到剪贴板', 'success')
    }).catch(() => {
      showMessage('复制失败，请手动复制', 'error')
    })
  } else {
    // 兼容旧浏览器
    const textarea = document.createElement('textarea')
    textarea.value = questionnaireUrl.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showMessage('链接已复制到剪贴板', 'success')
  }
}

function selectText(event: Event) {
  const target = event.target as HTMLInputElement
  target.select()
}

// 时间设置相关函数
function closeTimeSettingsModal() {
  showTimeSettingsModal.value = false
  // 重置表单
  timeSettings.value = {
    startDate: '',
    endDate: ''
  }
}

async function saveTimeSettings() {
  if (!questionnaire.value) {
    showMessage('问卷数据不存在', 'error')
    return
  }

  savingTimeSettings.value = true

  try {
    // 解析当前状态
    const currentStatus = deserializeQuestionnaireStatus(questionnaire.value.questionnaireStatus)

    // 创建新的状态对象，使用输入的时间
    const startDate = timeSettings.value.startDate ? new Date(timeSettings.value.startDate) : undefined
    const endDate = timeSettings.value.endDate ? new Date(timeSettings.value.endDate) : undefined

    const newStatus = createActiveStatus(startDate, endDate)
    newStatus.active = currentStatus.active // 保持当前的启用状态

    // 创建更新请求
    const updateRequest: UpdateQuestionnaireRequest = {
      questionnaireId: questionnaire.value.questionnaireId,
      questionnaireStatus: serializeQuestionnaireStatus(newStatus),
      modelId: questionnaire.value.modelId,
      questionnaireTitle: questionnaire.value.questionnaireTitle,
      canDelete: questionnaire.value.canDelete
    }

    // 调用更新API
    await updateQuestionnaire(updateRequest)

    // 更新本地数据
    questionnaire.value.questionnaireStatus = updateRequest.questionnaireStatus

    showMessage('时间设置保存成功', 'success')
    closeTimeSettingsModal()

  } catch (error) {
    console.error('保存时间设置失败:', error)
    showMessage('保存时间设置失败，请重试', 'error')
  } finally {
    savingTimeSettings.value = false
  }
}

// 将Timestamp转换为datetime-local输入格式
function timestampToDatetimeLocal(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  // 转换为本地时间的datetime-local格式 (YYYY-MM-DDTHH:mm)
  return date.toISOString().slice(0, 16)
}

// 初始化时间设置表单
function initTimeSettings() {
  if (!questionnaire.value) return

  try {
    const status = deserializeQuestionnaireStatus(questionnaire.value.questionnaireStatus)
    timeSettings.value = {
      startDate: timestampToDatetimeLocal(status.startDate),
      endDate: timestampToDatetimeLocal(status.endDate)
    }
  } catch (error) {
    console.error('初始化时间设置失败:', error)
    timeSettings.value = {
      startDate: '',
      endDate: ''
    }
  }
}

function goBack() {
  router.push({ name: 'questionnaire_my' })
}

// 辅助函数
function getStatusClass(statusJson: string): string {
  try {
    const status = deserializeQuestionnaireStatus(statusJson)
    return status.active ? 'status-active' : 'status-draft'
  } catch {
    return 'status-unknown'
  }
}

function getStatusIcon(statusJson: string): string {
  try {
    const status = deserializeQuestionnaireStatus(statusJson)
    return status.active ? 'fas fa-play-circle' : 'fas fa-pause-circle'
  } catch {
    return 'fas fa-question-circle'
  }
}

function getStatusDisplay(statusJson: string): string {
  try {
    const status = deserializeQuestionnaireStatus(statusJson)
    return status.active ? '启用中' : '草稿'
  } catch {
    return '未知状态'
  }
}

function getStatusDetailInfo(statusJson: string): string {
  try {
    const status = deserializeQuestionnaireStatus(statusJson)
    if (status.active) {
      let info = '问卷正在运行'
      if (status.startDate) {
        const startDate = new Date(status.startDate)
        info += ` | 开始时间: ${startDate.toLocaleString()}`
      }
      if (status.endDate) {
        const endDate = new Date(status.endDate)
        info += ` | 结束时间: ${endDate.toLocaleString()}`
      }
      return info
    } else {
      return '问卷处于草稿状态，尚未启用'
    }
  } catch {
    return '状态信息无法解析'
  }
}

function getQuestionTypeDisplay(type: string): string {
  const typeMap: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    text: '文本题',
    dropdown: '下拉选择题'
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
.questionnaire-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 页面头部 */
.page-header {
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
}

.header-title {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: 1.8rem;
  margin: 0;
  color: white;
  font-weight: bold;
}

.page-title i {
  margin-right: 0.5rem;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
}

/* 按钮样式 */
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

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #06b6d4;
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 加载和错误状态 */
.loading-section,
.error-section {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner,
.error-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  color: white;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #f59e0b;
}

/* 内容卡片 */
.questionnaire-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.status-active {
  background: rgba(16, 185, 129, 0.2);
  color: #065f46;
  border: 2px solid #10b981;
}

.status-badge.status-draft {
  background: rgba(245, 158, 11, 0.2);
  color: #92400e;
  border: 2px solid #f59e0b;
}

.card-content {
  padding: 2rem;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.field-value {
  padding: 0.8rem 0;
  color: #1f2937;
  font-weight: 500;
}

.text-success {
  color: #10b981 !important;
}

.text-danger {
  color: #ef4444 !important;
}

/* 状态信息 */
.status-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.status-details {
  color: #6b7280;
  font-weight: 500;
}

/* 控制按钮 */
.control-section {
  margin-bottom: 1.5rem;
}

.control-section h4 {
  margin-bottom: 1rem;
  color: #374151;
}

.control-buttons {
  display: flex;
  gap: 1rem;
}

/* 问卷链接 */
.questionnaire-links {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.link-section {
  margin-bottom: 2rem;
}

.link-section h4,
.qr-section h4 {
  margin-bottom: 1rem;
  color: #374151;
}

.link-container {
  display: flex;
  gap: 0.5rem;
}

.link-input {
  flex: 1;
  background: #f9fafb;
  cursor: pointer;
}

.qr-section {
  text-align: center;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-code {
  border-radius: 10px;
  overflow: hidden;
}

.qr-hint {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.qr-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

/* 问卷预览 */
.empty-preview {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-preview i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.questions-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-question {
  background: #f9fafb;
  border-radius: 10px;
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
  background: #e5e7eb;
  color: #374151;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.question-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-item {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  color: #374151;
}

.option-more {
  color: #6b7280;
  font-size: 0.8rem;
  font-style: italic;
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
  .questionnaire-view {
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-buttons {
    justify-content: center;
  }

  .link-container {
    flex-direction: column;
  }

  .control-buttons {
    flex-direction: column;
  }
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.title-input {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1f2937;
  border: 2px solid #d1d5db;
  background: #f9fafb;
}

.title-input:hover {
  border-color: #9ca3af;
  background: #ffffff;
}

.title-input:focus {
  background: #ffffff;
  border-color: #3b82f6;
  color: #111827;
}

.field-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}
</style>
