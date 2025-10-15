<template>
  <div class="questionnaire-analysis">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-nav">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i>
          返回
        </button>
      </div>
      <h1 class="page-title">
        <i class="fas fa-chart-pie"></i>
        问卷数据分析
      </h1>
      <div class="page-description">
        深入分析问卷数据，洞察用户反馈
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-section" v-if="loading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载问卷数据...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div class="error-section" v-if="error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="loadAnalysisData" class="retry-btn">
          <i class="fas fa-redo"></i>
          重试
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content" v-if="!loading && !error">

      <!-- 问卷基本信息卡片 -->
      <div class="questionnaire-overview" v-if="questionnaireInfo">
        <div class="overview-card">
          <div class="card-header">
            <h2>{{ questionnaireInfo.questionnaireTitle }}</h2>
            <div class="question-count">{{ questionsData.length }} 个问题</div>
          </div>
          <p class="description">{{ questionnaireInfo.questionnaireDescription }}</p>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ totalAnswers }}</div>
              <div class="stat-label">总回答数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ validAnswers }}</div>
              <div class="stat-label">有效回答</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ uniqueRespondents }}</div>
              <div class="stat-label">参与人数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ completionRate }}%</div>
              <div class="stat-label">完成率</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析模式切换 -->
      <div class="analysis-mode-switcher">
        <div class="mode-buttons">
          <button :class="['mode-btn', { active: analysisMode === 'overview' }]" @click="analysisMode = 'overview'">
            <i class="fas fa-eye"></i>
            问卷预览
          </button>
          <button :class="['mode-btn', { active: analysisMode === 'detailed' }]" @click="analysisMode = 'detailed'">
            <i class="fas fa-chart-bar"></i>
            详细分析
          </button>
          <button :class="['mode-btn', { active: analysisMode === 'export' }]" @click="analysisMode = 'export'">
            <i class="fas fa-download"></i>
            数据导出
          </button>
        </div>
      </div>

      <!-- 问卷预览模式 -->
      <div class="questionnaire-preview" v-if="analysisMode === 'overview'">
        <div class="preview-container">
          <div class="preview-header">
            <h3>
              <i class="fas fa-list-alt"></i>
              问卷预览 - 答案分布
            </h3>
            <p>以预览形式查看所有问题及其答案分布</p>
          </div>

          <div class="questions-preview" v-if="questionsData && questionsData.length > 0">
            <div v-for="(question, index) in questionsData" :key="question.questionId" class="question-preview-item"
              :class="{ expanded: expandedQuestions.has(question.questionId) }">
              <div class="question-header" @click="toggleQuestionExpansion(question.questionId)">
                <div class="question-info">
                  <span class="question-number">{{ index + 1 }}</span>
                  <span class="question-title">{{ question.questionTitle }}</span>
                  <span class="question-type-badge" :class="getQuestionTypeClass(question.questionType)">
                    {{ getQuestionTypeLabel(question.questionType) }}
                  </span>
                </div>
                <div class="question-stats">
                  <span class="answer-count">{{ getQuestionAnswerCount(question.questionId) }} 回答</span>
                  <i class="fas fa-chevron-down expand-icon"></i>
                </div>
              </div>

              <div class="question-content" v-if="expandedQuestions.has(question.questionId)">
                <div class="question-description" v-if="question.questionTxt">
                  {{ question.questionTxt }}
                </div>

                <!-- 选择题类型的答案分布 -->
                <div v-if="isChoiceQuestion(question.questionType)" class="choice-distribution">
                  <div class="distribution-chart">
                    <div v-for="option in getQuestionOptions(question)" :key="option" class="option-bar">
                      <div class="option-label">{{ option }}</div>
                      <div class="bar-container">
                        <div class="bar-fill"
                          :style="{ width: getOptionPercentage(question.questionId, option) + '%' }"></div>
                        <span class="percentage">{{ getOptionPercentage(question.questionId, option) }}%</span>
                      </div>
                      <div class="option-count">({{ getOptionCount(question.questionId, option) }})</div>
                    </div>
                  </div>
                </div>

                <!-- 文本题类型的回答展示 -->
                <div v-else-if="question.questionType === 'text'" class="text-answers">
                  <div class="text-answers-header">
                    <h4>用户回答 ({{ getQuestionAnswerCount(question.questionId) }} 条)</h4>
                  </div>
                  <div class="text-answers-list">
                    <div v-for="(answer, idx) in getTextAnswers(question.questionId).slice(0, 5)" :key="idx"
                      class="text-answer-item">
                      "{{ answer }}"
                    </div>
                    <div v-if="getTextAnswers(question.questionId).length > 5" class="more-answers">
                      还有 {{ getTextAnswers(question.questionId).length - 5 }} 条回答...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 问题数据为空时的提示 -->
          <div v-else-if="!loading" class="no-questions-message">
            <div class="empty-state">
              <i class="fas fa-question-circle"></i>
              <h4>暂无问题数据</h4>
              <p>正在从问卷模板加载问题数据，请稍候...</p>
              <div v-if="questionnaireInfo?.modelId" class="debug-info">
                <small>模板ID: {{ questionnaireInfo.modelId }}</small>
              </div>
            </div>
          </div>

          <!-- 加载中状态 -->
          <div v-else class="loading-questions">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              <p>正在加载问题数据...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细分析模式 -->
      <div class="detailed-analysis" v-if="analysisMode === 'detailed'">
        <div class="analysis-container">
          <div class="analysis-sidebar">
            <h3>
              <i class="fas fa-filter"></i>
              问题选择
            </h3>
            <div class="question-filter">
              <input v-model="questionFilter" type="text" placeholder="搜索问题..." class="filter-input">
            </div>
            <div class="question-list">
              <div v-for="(question, index) in filteredQuestions" :key="question.questionId"
                :class="['question-item', { active: selectedQuestionId === question.questionId }]"
                @click="selectQuestion(question.questionId)">
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-info">
                  <div class="question-title">{{ question.questionTitle }}</div>
                  <div class="question-meta">
                    <span class="question-type">{{ getQuestionTypeLabel(question.questionType) }}</span>
                    <span class="answer-count">{{ getQuestionAnswerCount(question.questionId) }} 回答</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="analysis-main">
            <div v-if="selectedQuestionId" class="question-analysis">
              <div class="analysis-header">
                <h3>{{ getSelectedQuestion()?.questionTitle }}</h3>
                <div class="analysis-controls">
                  <select v-model="chartType" class="chart-type-selector">
                    <option value="pie">饼图</option>
                    <option value="bar">柱状图</option>
                    <option value="horizontal-bar">水平柱状图</option>
                    <option value="doughnut">环形图</option>
                  </select>
                </div>
              </div>

              <div class="chart-container">
                <div :id="`detailed-chart-${selectedQuestionId}`" class="detailed-chart"></div>
              </div>

              <div class="analysis-insights">
                <h4>数据洞察</h4>
                <div class="insights-list">
                  <div class="insight-item" v-for="insight in getQuestionInsights(selectedQuestionId)"
                    :key="insight.type">
                    <i :class="insight.icon"></i>
                    <span>{{ insight.text }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="no-question-selected">
              <i class="fas fa-mouse-pointer"></i>
              <p>请从左侧选择一个问题进行详细分析</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据导出模式 -->
      <div class="data-export" v-if="analysisMode === 'export'">
        <div class="export-container">
          <div class="export-header">
            <h3>
              <i class="fas fa-file-export"></i>
              数据导出
            </h3>
            <p>选择需要导出的数据格式和内容</p>
          </div>

          <div class="export-options">
            <div class="export-section">
              <h4>导出格式</h4>
              <div class="format-options">
                <label class="format-option" :class="{ 'selected': exportFormat === 'excel' }" data-format="excel">
                  <input type="radio" name="exportFormat" value="excel" v-model="exportFormat">
                  <span class="radio-mark"></span>
                  <i class="fas fa-file-excel"></i>
                  <span class="format-text">Excel (.xlsx)</span>
                </label>
                <label class="format-option" :class="{ 'selected': exportFormat === 'csv' }" data-format="csv">
                  <input type="radio" name="exportFormat" value="csv" v-model="exportFormat">
                  <span class="radio-mark"></span>
                  <i class="fas fa-file-csv"></i>
                  <span class="format-text">CSV (.csv)</span>
                </label>
                <label class="format-option" :class="{ 'selected': exportFormat === 'pdf' }" data-format="pdf">
                  <input type="radio" name="exportFormat" value="pdf" v-model="exportFormat">
                  <span class="radio-mark"></span>
                  <i class="fas fa-file-pdf"></i>
                  <span class="format-text">PDF 报告</span>
                </label>
              </div>
            </div>

            <div class="export-section">
              <h4>导出内容</h4>
              <div class="content-options">
                <label class="content-option">
                  <input type="checkbox" v-model="exportOptions.rawData">
                  <span class="checkmark"></span>
                  <div class="option-info">
                    <strong>原始回答数据</strong>
                    <small>包含每位用户的完整回答记录</small>
                  </div>
                </label>
                <label class="content-option">
                  <input type="checkbox" v-model="exportOptions.statistics">
                  <span class="checkmark"></span>
                  <div class="option-info">
                    <strong>统计分析结果</strong>
                    <small>包含问题统计、选项分布等数据</small>
                  </div>
                </label>
                <label class="content-option" :class="{ 'disabled': isChartsDisabled }">
                  <input type="checkbox" v-model="exportOptions.charts" :disabled="isChartsDisabled">
                  <span class="checkmark"></span>
                  <div class="option-info">
                    <strong>图表图片</strong>
                    <small>包含分析图表的截图（仅PDF格式）</small>
                  </div>
                </label>
              </div>
            </div>

            <div class="export-actions">
              <button class="export-btn" @click="exportData" :disabled="!canExport || isExporting">
                <i v-if="!isExporting" class="fas fa-download"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                {{ isExporting ? '导出中...' : '导出数据' }}
              </button>

              <!-- 测试数据按钮（开发环境） -->
              <button v-if="totalAnswers === 0" class="test-data-btn" @click="generateTestData">
                <i class="fas fa-flask"></i>
                生成测试数据
              </button>

              <div v-if="exportProgress.show" class="export-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: exportProgress.percent + '%' }"></div>
                </div>
                <span class="progress-text">{{ exportProgress.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 无数据状态 -->
    <div class="no-data-section" v-if="!loading && !error && totalAnswers === 0">
      <div class="no-data-message">
        <i class="fas fa-chart-line"></i>
        <h3>暂无回答数据</h3>
        <p>该问卷还没有收到任何回答，无法进行数据分析</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { getCookie } from '@/utils/cookies'
import { getQuestionsByIds } from '@/scripts/questionQuery'
import type { Question } from '@/scripts/questionQuery'
import {
  getQuestionnaireModelById,
  parseQuestionsArray
} from '@/scripts/questionnaireModelQuery'

// 类型定义
interface QuestionnaireInfo {
  questionnaireId: string
  questionnaireTitle: string
  questionnaireStatus: string // JSON字符串格式
  modelId: string
  canDelete: number
  questionnaireDescription?: string // 可选字段
  questionItems?: string // 问题ID数组的JSON字符串，可选
  createdTime?: string // 可选字段
}

interface QuestionnaireAnswer {
  questionnaireId: string
  answer: string  // JSON字符串，包含问题答案
  writerIp: string
}

interface AnalysisData {
  answers: QuestionnaireAnswer[]
}

// 导出数据类型定义
interface RawDataRow {
  '序号': number
  'IP地址': string
  [questionColumn: string]: string | number
}

interface StatisticsRow {
  '问题编号': string
  '问题': string
  '问题类型': string
  '回答数': number
  '回答率': string
}

interface QuestionAnswerStats {
  [questionId: string]: {
    [answer: string]: number
  }
}

interface Insight {
  type: string
  icon: string
  text: string
}

// 路由和参数
const route = useRoute()
const router = useRouter()
const questionnaireId = ref<string>(route.params.id as string)
const currentQuestionnaireId = ref<string>(route.params.id as string)

// 基础数据
const loading = ref(true)
const error = ref<string>('')
const questionnaireInfo = ref<QuestionnaireInfo | null>(null)
const analysisData = ref<AnalysisData | null>(null)
const questionsData = ref<Question[]>([])

// 分析模式
const analysisMode = ref<'overview' | 'detailed' | 'export'>('overview')

// 问卷预览模式相关
const expandedQuestions = ref<Set<string>>(new Set())

// 详细分析模式相关
const selectedQuestionId = ref<string>('')
const questionFilter = ref<string>('')
const chartType = ref<'pie' | 'bar' | 'horizontal-bar' | 'doughnut'>('pie')

// 导出模式相关
const exportFormat = ref<'excel' | 'csv' | 'pdf'>('excel')
const exportOptions = ref({
  rawData: true,
  statistics: true,
  charts: false
})
const isExporting = ref(false)
const exportProgress = ref({
  show: false,
  percent: 0,
  message: ''
})

// Chart实例存储
const chartInstances = ref<Map<string, echarts.ECharts>>(new Map())

// 计算属性
const totalAnswers = computed(() => analysisData.value?.answers?.length || 0)

const validAnswers = computed(() => {
  if (!analysisData.value?.answers) return 0
  return analysisData.value.answers.filter(answer => {
    try {
      const parsed = JSON.parse(answer.answer)
      return Object.keys(parsed).length > 0
    } catch {
      return false
    }
  }).length
})

const uniqueRespondents = computed(() => {
  if (!analysisData.value?.answers) return 0
  const uniqueIps = new Set(analysisData.value.answers.map(answer => answer.writerIp).filter(Boolean))
  return uniqueIps.size
})

const completionRate = computed(() => {
  if (totalAnswers.value === 0) return 0
  return Math.round((validAnswers.value / totalAnswers.value) * 100)
})

const filteredQuestions = computed(() => {
  if (!questionFilter.value) return questionsData.value
  return questionsData.value.filter(question =>
    question.questionTitle.toLowerCase().includes(questionFilter.value.toLowerCase()) ||
    question.questionTxt?.toLowerCase().includes(questionFilter.value.toLowerCase())
  )
})

const canExport = computed(() => {
  return exportFormat.value && (exportOptions.value.rawData || exportOptions.value.statistics || exportOptions.value.charts)
})

// 图表选项是否禁用（Excel和CSV格式时禁用）
const isChartsDisabled = computed(() => {
  return exportFormat.value === 'excel' || exportFormat.value === 'csv'
})

// 问题答案统计
const questionAnswerStats = computed<QuestionAnswerStats>(() => {
  const stats: QuestionAnswerStats = {}

  if (!analysisData.value?.answers) {
    return stats
  }

  analysisData.value.answers.forEach((answer, index) => {
    try {
      // 解析 answer 字段中的 JSON 字符串
      const parsedAnswer = JSON.parse(answer.answer)

      Object.entries(parsedAnswer).forEach(([questionId, answerValue]) => {
        if (!stats[questionId]) {
          stats[questionId] = {}
        }

        // 处理不同类型的答案值
        let normalizedAnswer: string
        if (Array.isArray(answerValue)) {
          // 多选题：将数组转换为逗号分隔的字符串
          normalizedAnswer = answerValue.join(', ')
        } else if (typeof answerValue === 'object' && answerValue !== null) {
          // 如果是对象，尝试转换为字符串
          normalizedAnswer = JSON.stringify(answerValue)
        } else {
          // 单选题或文本题：直接转换为字符串
          normalizedAnswer = String(answerValue || '').trim()
        }

        // 过滤空答案
        if (normalizedAnswer !== '') {
          stats[questionId][normalizedAnswer] = (stats[questionId][normalizedAnswer] || 0) + 1
        }
      })
    } catch (error) {
      console.warn(`解析第 ${index + 1} 个回答失败:`, error, '原始数据:', answer)
    }
  })

  return stats
})

// 主要数据加载函数
async function loadAnalysisData() {
  try {
    loading.value = true
    error.value = ''

    const authToken = getCookie('access_token')
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    }

    // 获取问卷信息
    const questionnaireResponse = await axios.get(
      `http://localhost:8081/questionnaire/search/${questionnaireId.value}`,
      { headers }
    )

    if (questionnaireResponse.status === 200 && questionnaireResponse.data && questionnaireResponse.data !== 'fail') {
      questionnaireInfo.value = questionnaireResponse.data

      // 加载问题数据
      await loadQuestionsData()
    } else {
      throw new Error('获取问卷信息失败')
    }

    // 获取回答数据
    const answersResponse = await axios.get(
      `http://localhost:8081/answer/search/${questionnaireId.value}`,
      { headers }
    )

    if (answersResponse.status === 200 && answersResponse.data && answersResponse.data !== 'fail') {
      // 确保数据是数组格式
      let questionnaireAnswers: QuestionnaireAnswer[] = []

      if (Array.isArray(answersResponse.data)) {
        questionnaireAnswers = answersResponse.data
      } else if (answersResponse.data && typeof answersResponse.data === 'object') {
        // 如果返回的是单个对象，包装成数组
        questionnaireAnswers = [answersResponse.data]
      }

      analysisData.value = { answers: questionnaireAnswers }
    } else {
      analysisData.value = { answers: [] }
    }

  } catch (err) {
    console.error('加载分析数据失败:', err)
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      if (status === 401) {
        error.value = '认证失败，请重新登录'
      } else if (status === 404) {
        error.value = '问卷不存在或已被删除'
      } else {
        error.value = '获取数据失败，请稍后重试'
      }
    } else {
      error.value = '网络错误，请检查连接'
    }
  } finally {
    loading.value = false
  }
}

// 加载问题数据
async function loadQuestionsData() {
  if (!questionnaireInfo.value?.questionItems) {
    // 改为通过模板ID获取问题数据
    await loadQuestionsThroughModel()
    return
  }

  try {
    // 解析问题ID数组
    let questionIds: string[] = []

    if (typeof questionnaireInfo.value.questionItems === 'string') {
      try {
        questionIds = JSON.parse(questionnaireInfo.value.questionItems)
      } catch (parseError) {
        console.error('解析 questionItems JSON 失败:', parseError)
        // 如果解析失败，尝试通过模板获取
        await loadQuestionsThroughModel()
        return
      }
    } else if (Array.isArray(questionnaireInfo.value.questionItems)) {
      questionIds = questionnaireInfo.value.questionItems
    } else {
      console.error('questionItems 格式不正确，尝试通过模板获取问题:', questionnaireInfo.value.questionItems)
      await loadQuestionsThroughModel()
      return
    }

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      // 使用 getQuestionsByIds 批量获取问题详情
      const questions = await getQuestionsByIds(questionIds)
      questionsData.value = questions
    } else {
      await loadQuestionsThroughModel()
    }
  } catch (error) {
    console.error('加载问题数据失败:', error)
    // 如果通过问卷直接获取失败，尝试通过模板获取
    await loadQuestionsThroughModel()
  }
}

// 新增：通过模板获取问题数据的函数
async function loadQuestionsThroughModel() {
  try {
    // 1. 先获取问卷数据，取得模板ID
    if (!currentQuestionnaireId.value) {
      console.error('没有问卷ID，无法获取模板信息')
      questionsData.value = []
      return
    }

    // 如果还没有问卷信息，先获取
    if (!questionnaireInfo.value) {
      const authToken = getCookie('access_token')
      const questionnaireResponse = await axios.get(
        `http://localhost:8081/questionnaire/search/${currentQuestionnaireId.value}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      )

      if (questionnaireResponse.data && questionnaireResponse.data !== 'fail') {
        questionnaireInfo.value = questionnaireResponse.data
      } else {
        console.error('获取问卷信息失败')
        questionsData.value = []
        return
      }
    }

    // 2. 从问卷信息中获取模板ID
    if (!questionnaireInfo.value) {
      console.error('问卷信息为空，无法获取模板ID')
      questionsData.value = []
      return
    }

    const modelId = questionnaireInfo.value.modelId
    if (!modelId) {
      console.error('问卷中没有模板ID，无法获取问题信息')
      questionsData.value = []
      return
    }

    // 3. 获取模板数据
    const modelData = await getQuestionnaireModelById(modelId)
    if (!modelData) {
      console.error('获取问卷模板失败，模板ID:', modelId)
      questionsData.value = []
      return
    }

    // 4. 解析模板中的问题数组，获取问题详情
    const questionItems = await parseQuestionsArray(modelData.questionsArray)

    if (questionItems && questionItems.length > 0) {
      // 提取问题ID
      const questionIds = questionItems.map(item => item.id)

      // 5. 批量获取问题详情
      const questions = await getQuestionsByIds(questionIds)
      questionsData.value = questions
    } else {
      questionsData.value = []
    }

  } catch (error) {
    console.error('通过模板获取问题数据失败:', error)
    questionsData.value = []
  }
}

// 导航相关函数
function goBack() {
  // 优先使用浏览器历史记录返回
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，返回问卷列表页面
    router.push('/questionnaire')
  }
}

// 问卷预览相关函数
function toggleQuestionExpansion(questionId: string) {
  if (expandedQuestions.value.has(questionId)) {
    expandedQuestions.value.delete(questionId)
  } else {
    expandedQuestions.value.add(questionId)
  }
}

function getQuestionTypeLabel(questionType: string): string {
  const typeLabels: Record<string, string> = {
    'single': '单选题',
    'radio': '单选题',
    'multiple': '多选题',
    'checkbox': '多选题',
    'text': '文本题',
    'dropdown': '下拉选择题'
  }
  return typeLabels[questionType] || questionType
}

function getQuestionTypeClass(questionType: string): string {
  const typeClasses: Record<string, string> = {
    'single': 'type-single',
    'multiple': 'type-multiple',
    'text': 'type-text',
    'dropdown': 'type-dropdown'
  }
  return typeClasses[questionType] || 'type-unknown'
}

function isChoiceQuestion(questionType: string): boolean {
  return ['single', 'radio', 'multiple', 'checkbox', 'dropdown'].includes(questionType)
}

function getQuestionOptions(question: Question): string[] {
  try {
    if (!question.questionOptions) {
      return []
    }

    let options: string[] = []

    if (typeof question.questionOptions === 'string') {
      // 如果是字符串，尝试解析JSON
      try {
        const parsed = JSON.parse(question.questionOptions)
        if (Array.isArray(parsed)) {
          options = parsed.map((option: unknown) => String(option))
        } else {
          console.warn('解析的选项不是数组格式:', parsed)
        }
      } catch (parseError) {
        console.error('解析选项JSON失败:', parseError, '原始数据:', question.questionOptions)
      }
    } else if (Array.isArray(question.questionOptions)) {
      // 如果已经是数组，直接使用
      options = (question.questionOptions as unknown[]).map((option: unknown) => String(option))
    } else {
      console.warn('问题选项格式未知:', question.questionOptions)
    }

    return options
  } catch (error) {
    console.error('获取问题选项失败:', error)
    return []
  }
}

function getQuestionAnswerCount(questionId: string): number {
  return Object.keys(questionAnswerStats.value[questionId] || {}).reduce((sum, answer) => {
    return sum + questionAnswerStats.value[questionId][answer]
  }, 0)
}

function getOptionCount(questionId: string, option: string): number {
  const stats = questionAnswerStats.value[questionId]
  if (!stats) return 0

  // 考虑完全匹配和包含匹配（多选题）
  let count = stats[option] || 0

  // 对于多选题，检查包含该选项的组合答案
  Object.entries(stats).forEach(([answer, answerCount]) => {
    if (answer !== option && answer.includes(option)) {
      count += answerCount
    }
  })

  return count
}

function getOptionPercentage(questionId: string, option: string): number {
  const totalCount = getQuestionAnswerCount(questionId)
  if (totalCount === 0) return 0

  const optionCount = getOptionCount(questionId, option)
  return Math.round((optionCount / totalCount) * 100)
}

function getTextAnswers(questionId: string): string[] {
  const stats = questionAnswerStats.value[questionId]
  if (!stats) return []

  return Object.keys(stats).filter(answer => answer.trim() !== '')
}

// 详细分析相关函数
function selectQuestion(questionId: string) {
  selectedQuestionId.value = questionId
  nextTick(() => {
    renderDetailedChart()
  })
}

function getSelectedQuestion(): Question | undefined {
  return questionsData.value.find(q => q.questionId === selectedQuestionId.value)
}

function renderDetailedChart() {
  if (!selectedQuestionId.value) return

  const chartElement = document.getElementById(`detailed-chart-${selectedQuestionId.value}`)
  if (!chartElement) return

  // 清理现有图表
  const existingChart = chartInstances.value.get(`detailed-${selectedQuestionId.value}`)
  if (existingChart) {
    existingChart.dispose()
    chartInstances.value.delete(`detailed-${selectedQuestionId.value}`)
  }

  const chart = echarts.init(chartElement)
  chartInstances.value.set(`detailed-${selectedQuestionId.value}`, chart)

  const stats = questionAnswerStats.value[selectedQuestionId.value]
  if (!stats) return

  const data = Object.entries(stats).map(([answer, count]) => ({
    name: answer,
    value: count
  }))

  let option: echarts.EChartsOption

  switch (chartType.value) {
    case 'pie':
    case 'doughnut':
      option = {
        title: {
          text: getSelectedQuestion()?.questionTitle,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          name: '回答分布',
          type: 'pie',
          radius: chartType.value === 'doughnut' ? ['40%', '70%'] : '50%',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
      break

    case 'bar':
      option = {
        title: {
          text: getSelectedQuestion()?.questionTitle,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '回答数量',
          type: 'bar',
          data: data.map(item => item.value),
          itemStyle: {
            color: '#5470c6'
          }
        }]
      }
      break

    case 'horizontal-bar':
      option = {
        title: {
          text: getSelectedQuestion()?.questionTitle,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.name)
        },
        series: [{
          name: '回答数量',
          type: 'bar',
          data: data.map(item => item.value),
          itemStyle: {
            color: '#5470c6'
          }
        }]
      }
      break
  }

  chart.setOption(option)
}

function getQuestionInsights(questionId: string): Insight[] {
  const stats = questionAnswerStats.value[questionId]
  if (!stats) return []

  const insights: Insight[] = []
  const entries = Object.entries(stats)
  const totalCount = entries.reduce((sum, [, count]) => sum + count, 0)

  if (entries.length === 0) return insights

  // 最受欢迎的答案
  const mostPopular = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  )

  insights.push({
    type: 'popular',
    icon: 'fas fa-trophy',
    text: `最受欢迎的答案是"${mostPopular[0]}"，占比 ${Math.round((mostPopular[1] / totalCount) * 100)}%`
  })

  // 参与度分析
  insights.push({
    type: 'participation',
    icon: 'fas fa-users',
    text: `共有 ${totalCount} 人回答了这个问题`
  })

  // 选项分布分析
  if (entries.length > 1) {
    const evenDistribution = entries.every(([, count]) =>
      Math.abs(count - (totalCount / entries.length)) < (totalCount * 0.2)
    )

    if (evenDistribution) {
      insights.push({
        type: 'distribution',
        icon: 'fas fa-balance-scale',
        text: '各选项分布相对均匀，没有明显偏好'
      })
    } else {
      insights.push({
        type: 'distribution',
        icon: 'fas fa-chart-line',
        text: '选项分布不均，存在明显的用户偏好'
      })
    }
  }

  return insights
}

// 导出相关函数
async function exportData() {
  if (!canExport.value) {
    alert('请选择导出格式和内容')
    return
  }

  try {
    // 设置导出状态
    isExporting.value = true
    exportProgress.value = {
      show: true,
      percent: 0,
      message: '准备导出数据...'
    }

    // 模拟进度更新
    updateProgress(20, '处理数据中...')

    // 根据选择的格式执行不同的导出逻辑
    switch (exportFormat.value) {
      case 'excel':
        await exportToExcel()
        break
      case 'csv':
        await exportToCSV()
        break
      case 'pdf':
        await exportToPDF()
        break
    }

    updateProgress(100, '导出完成!')

    // 延迟隐藏进度条
    setTimeout(() => {
      resetExportState()
    }, 1500)

  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
    resetExportState()
  }
}

// 更新导出进度
function updateProgress(percent: number, message: string) {
  exportProgress.value.percent = percent
  exportProgress.value.message = message
}

// 重置导出状态
function resetExportState() {
  isExporting.value = false
  exportProgress.value = {
    show: false,
    percent: 0,
    message: ''
  }
}

// Excel 导出函数
async function exportToExcel() {
  updateProgress(30, '加载Excel库...')

  // 动态导入 xlsx 库
  const XLSX = await import('xlsx')

  updateProgress(40, '准备Excel数据...')

  const workbook = XLSX.utils.book_new()

  // 导出原始数据
  if (exportOptions.value.rawData) {
    updateProgress(50, '处理原始数据...')
    const rawData = prepareRawDataForExport()
    const worksheet = XLSX.utils.json_to_sheet(rawData)
    XLSX.utils.book_append_sheet(workbook, worksheet, '原始数据')
  }

  // 导出统计数据
  if (exportOptions.value.statistics) {
    updateProgress(70, '处理统计数据...')
    const statsData = prepareStatisticsForExport()
    const worksheet = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(workbook, worksheet, '统计分析')
  }

  updateProgress(90, '生成Excel文件...')

  // 生成文件名
  const fileName = `${questionnaireInfo.value?.questionnaireTitle || '问卷数据'}_${new Date().toISOString().split('T')[0]}.xlsx`

  // 下载文件
  XLSX.writeFile(workbook, fileName)
}

// CSV 导出函数
async function exportToCSV() {
  updateProgress(30, '准备CSV数据...')

  let csvContent = ''

  if (exportOptions.value.rawData) {
    updateProgress(50, '处理原始数据...')
    const rawData = prepareRawDataForExport()
    const rawCsv = convertToCSV(rawData)
    csvContent += '原始回答数据\n' + rawCsv + '\n\n'
  }

  if (exportOptions.value.statistics) {
    updateProgress(70, '处理统计数据...')
    const statsData = prepareStatisticsForExport()
    const statsCsv = convertToCSV(statsData)
    csvContent += '统计分析数据\n' + statsCsv
  }

  updateProgress(90, '生成CSV文件...')

  // 添加BOM以支持中文
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // 生成文件名
  const fileName = `${questionnaireInfo.value?.questionnaireTitle || '问卷数据'}_${new Date().toISOString().split('T')[0]}.csv`

  // 下载文件
  downloadBlob(blob, fileName)
}

// PDF 导出函数
async function exportToPDF() {
  updateProgress(30, '加载PDF库...')

  try {
    // 动态导入 jsPDF 和 html2canvas
    const jsPDF = (await import('jspdf')).jsPDF
    const html2canvas = (await import('html2canvas')).default

    updateProgress(40, '创建PDF文档...')

    // 创建一个临时的HTML页面用于生成PDF
    const tempDiv = document.createElement('div')
    tempDiv.style.width = '800px'
    tempDiv.style.padding = '20px'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, "Microsoft YaHei", "微软雅黑", sans-serif'
    tempDiv.style.fontSize = '14px'
    tempDiv.style.lineHeight = '1.6'
    tempDiv.style.color = '#333'

    // 构建HTML内容
    let htmlContent = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          ${questionnaireInfo.value?.questionnaireTitle || '问卷数据分析报告'}
        </h1>
        <div style="text-align: center; color: #7f8c8d; margin-top: 10px;">
          生成时间: ${new Date().toLocaleString('zh-CN')}
        </div>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">📊 概览统计</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db;">
            <strong>总回答数:</strong> ${totalAnswers.value}
          </div>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #27ae60;">
            <strong>有效回答:</strong> ${validAnswers.value}
          </div>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f39c12;">
            <strong>参与人数:</strong> ${uniqueRespondents.value}
          </div>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #e74c3c;">
            <strong>完成率:</strong> ${completionRate.value}%
          </div>
        </div>
      </div>
    `

    updateProgress(60, '处理统计数据...')

    // 添加统计数据
    if (exportOptions.value.statistics) {
      const statsData = prepareStatisticsForExport()
      htmlContent += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">📈 详细统计</h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #3498db; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">问题</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">类型</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">回答数</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">回答率</th>
              </tr>
            </thead>
            <tbody>
      `

      statsData.forEach((row: StatisticsRow, index: number) => {
        if (row.问题编号) { // 主问题行
          htmlContent += `
            <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${row.问题}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.问题类型}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.回答数}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${row.回答率}</td>
            </tr>
          `
        } else if (row.问题.trim().startsWith('-')) { // 选项行
          htmlContent += `
            <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
              <td style="padding: 8px 10px 8px 30px; border: 1px solid #ddd; color: #666;">${row.问题}</td>
              <td style="padding: 8px; border: 1px solid #ddd;"></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${row.回答数}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${row.回答率}</td>
            </tr>
          `
        }
      })

      htmlContent += '</tbody></table></div>'
    }

    // 添加原始数据摘要
    if (exportOptions.value.rawData) {
      updateProgress(80, '处理原始数据...')
      const rawData = prepareRawDataForExport()
      const sampleData = rawData.slice(0, 5) // 只显示前5条作为示例

      htmlContent += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">📋 原始数据预览 (前5条)</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 12px; line-height: 1.4;">
      `

      sampleData.forEach((row: RawDataRow, index: number) => {
        htmlContent += `
          <div style="background: white; margin-bottom: 15px; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db;">
            <strong>回答 ${index + 1}:</strong><br>
        `

        Object.entries(row).forEach(([key, value]: [string, string | number]) => {
          if (key !== '序号') {
            htmlContent += `<span style="color: #666;">${key}:</span> ${value || '未回答'}<br>`
          }
        })

        htmlContent += '</div>'
      })

      if (rawData.length > 5) {
        htmlContent += `<div style="text-align: center; color: #666; font-style: italic;">... 还有 ${rawData.length - 5} 条数据</div>`
      }

      htmlContent += '</div></div>'
    }

    tempDiv.innerHTML = htmlContent
    document.body.appendChild(tempDiv)

    updateProgress(90, '生成PDF文件...')

    // 使用 html2canvas 将 HTML 转换为图片，然后添加到 PDF
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // 清理临时元素
    document.body.removeChild(tempDiv)

    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // 计算缩放比例
    const ratio = Math.min(pdfWidth / (canvasWidth * 0.264583), pdfHeight / (canvasHeight * 0.264583))
    const scaledWidth = canvasWidth * 0.264583 * ratio
    const scaledHeight = canvasHeight * 0.264583 * ratio

    // 如果内容高度超过一页，需要分页处理
    if (scaledHeight > pdfHeight) {
      const pageHeight = pdfHeight
      const totalPages = Math.ceil(scaledHeight / pageHeight)

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage()

        const sourceY = (canvasHeight / totalPages) * i
        const sourceHeight = Math.min(canvasHeight / totalPages, canvasHeight - sourceY)

        // 创建每页的canvas
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvasWidth
        pageCanvas.height = sourceHeight
        const pageCtx = pageCanvas.getContext('2d')

        pageCtx?.drawImage(canvas, 0, sourceY, canvasWidth, sourceHeight, 0, 0, canvasWidth, sourceHeight)

        const pageImgData = pageCanvas.toDataURL('image/png')
        pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pageHeight)
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight)
    }

    updateProgress(95, '保存PDF文件...')

    // 生成文件名并下载
    const fileName = `${questionnaireInfo.value?.questionnaireTitle || '问卷分析报告'}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('PDF导出失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    alert(`PDF导出失败: ${errorMessage}。建议使用Excel或CSV格式导出数据。`)
    throw error
  }
}

// 准备原始数据用于导出
function prepareRawDataForExport(): RawDataRow[] {
  const rawData: RawDataRow[] = []

  if (!analysisData.value?.answers) {
    return rawData
  }

  analysisData.value.answers.forEach((answerRecord, index) => {
    try {
      const answers = JSON.parse(answerRecord.answer)
      const row: RawDataRow = {
        '序号': index + 1,
        'IP地址': answerRecord.writerIp
      }

      // 添加每个问题的答案
      questionsData.value.forEach((question, qIndex) => {
        // 根据实际数据格式，直接使用问题ID作为键
        const questionId = question.questionId
        let answer = answers[questionId] || ''

        // 如果答案是数组（多选题），转换为字符串
        if (Array.isArray(answer)) {
          answer = answer.join(', ')
        }

        row[`Q${qIndex + 1}. ${question.questionTitle}`] = answer
      })

      rawData.push(row)
    } catch (error) {
      console.warn('解析答案数据失败:', error, answerRecord)
    }
  })

  return rawData
}

// 准备统计数据用于导出
function prepareStatisticsForExport(): StatisticsRow[] {
  const statsData: StatisticsRow[] = []

  questionsData.value.forEach((question, index) => {
    const answerCount = getQuestionAnswerCount(question.questionId)
    const row: StatisticsRow = {
      '问题编号': `Q${index + 1}`,
      '问题': question.questionTitle,
      '问题类型': getQuestionTypeLabel(question.questionType),
      '回答数': answerCount,
      '回答率': `${Math.round((answerCount / totalAnswers.value) * 100)}%`
    }

    statsData.push(row)

    // 对于选择题，添加选项统计
    if (isChoiceQuestion(question.questionType)) {
      const options = getQuestionOptions(question)
      options.forEach(option => {
        const optionCount = getOptionCount(question.questionId, option)
        const percentage = getOptionPercentage(question.questionId, option)
        statsData.push({
          '问题编号': '',
          '问题': `  - ${option}`,
          '问题类型': '',
          '回答数': optionCount,
          '回答率': `${percentage}%`
        })
      })
    }
  })

  return statsData
}// 转换为CSV格式
function convertToCSV(data: (RawDataRow | StatisticsRow)[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows: string[] = []

  // 添加表头
  csvRows.push(headers.map(header => `"${header}"`).join(','))

  // 添加数据行
  data.forEach(row => {
    const values = headers.map(header => {
      const value = (row as Record<string, string | number>)[header] || ''
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  })

  return csvRows.join('\n')
}

// 下载Blob文件
function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 生成测试数据功能（用于开发测试）
function generateTestData() {
  if (confirm('这将生成一些测试数据用于导出功能演示，是否继续？')) {
    // 创建测试问卷信息
    questionnaireInfo.value = {
      questionnaireId: 'test-questionnaire-001',
      questionnaireTitle: '客户满意度调查问卷（测试数据）',
      questionnaireStatus: '{"status": "active"}',
      modelId: 'test-model-001',
      canDelete: 1,
      questionnaireDescription: '这是用于测试导出功能的模拟问卷数据',
      createdTime: new Date().toISOString()
    }

    // 创建测试问题
    questionsData.value = [
      {
        questionId: 'q1',
        questionTitle: '您对我们的服务总体满意度如何？',
        questionType: 'radio',
        questionTxt: '请根据您的使用体验进行评价',
        questionOptions: JSON.stringify(['非常满意', '满意', '一般', '不满意', '非常不满意']),
        canDelete: 1,
        shared: 0
      },
      {
        questionId: 'q2',
        questionTitle: '您最看重我们服务的哪些方面？',
        questionType: 'checkbox',
        questionTxt: '可以选择多个选项',
        questionOptions: JSON.stringify(['服务质量', '响应速度', '价格优势', '专业性', '售后支持']),
        canDelete: 1,
        shared: 0
      },
      {
        questionId: 'q3',
        questionTitle: '请简述您对我们服务的建议',
        questionType: 'text',
        questionTxt: '您的宝贵意见将帮助我们改进服务',
        questionOptions: '',
        canDelete: 1,
        shared: 0
      }
    ]

    // 创建测试答案数据
    const testAnswers = []
    for (let i = 0; i < 50; i++) {
      const answers = {
        q1: ['非常满意', '满意', '一般', '不满意', '非常不满意'][Math.floor(Math.random() * 5)],
        q2: getRandomCheckboxAnswers(['服务质量', '响应速度', '价格优势', '专业性', '售后支持']),
        q3: getRandomTextAnswer()
      }

      testAnswers.push({
        questionnaireId: 'test-questionnaire-001',
        answer: JSON.stringify(answers),
        writerIp: `192.168.1.${Math.floor(Math.random() * 255)}`
      })
    }

    analysisData.value = { answers: testAnswers }

    alert('测试数据已生成！现在可以测试导出功能了。')
  }
}

// 生成随机复选框答案
function getRandomCheckboxAnswers(options: string[]): string {
  const selectedCount = Math.floor(Math.random() * 3) + 1 // 1-3个选项
  const shuffled = [...options].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, selectedCount).join(', ')
}

// 生成随机文本答案
function getRandomTextAnswer(): string {
  const comments = [
    '服务很好，希望继续保持',
    '响应速度可以更快一些',
    '整体满意，价格合理',
    '专业性很强，值得信赖',
    '售后服务及时，很棒',
    '希望能提供更多功能',
    '用户体验不错，会推荐给朋友',
    '建议优化界面设计',
    '性价比很高，满意',
    '服务态度好，解决问题及时'
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

// 监听图表类型变化
watch(chartType, () => {
  if (selectedQuestionId.value) {
    nextTick(() => {
      renderDetailedChart()
    })
  }
})

// 监听导出格式变化，自动调整图表选项
watch(exportFormat, (newFormat) => {
  if (newFormat === 'excel' || newFormat === 'csv') {
    exportOptions.value.charts = false
  }
})

// 组件挂载
onMounted(() => {
  loadAnalysisData()
})

// 组件卸载时清理
onBeforeUnmount(() => {
  chartInstances.value.forEach(chart => {
    chart.dispose()
  })
  chartInstances.value.clear()
})
</script>

<style scoped>
.questionnaire-analysis {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

/* 页面头部 */
.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
}

.header-nav {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-btn:active {
  transform: translateY(0);
}

.back-btn i {
  font-size: 0.9rem;
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
.error-section,
.no-data-section {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffd700;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.error-message i,
.no-data-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message i {
  color: #ff6b6b;
}

.no-data-message i {
  opacity: 0.6;
}

.retry-btn {
  background: #4ecdc4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #45b7b8;
  transform: translateY(-2px);
}

/* 主要内容区域 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* 问卷概览卡片 */
.questionnaire-overview {
  margin-bottom: 2rem;
}

.overview-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.question-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.description {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  opacity: 0.8;
  font-size: 0.9rem;
}

/* 分析模式切换器 */
.analysis-mode-switcher {
  margin-bottom: 2rem;
}

.mode-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.mode-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.mode-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

/* 问卷预览模式 */
.questionnaire-preview {
  margin-bottom: 2rem;
}

.preview-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.preview-header {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.preview-header p {
  margin: 0;
  opacity: 0.8;
}

.questions-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-preview-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.question-preview-item.expanded {
  background: rgba(255, 255, 255, 0.1);
}

.question-header {
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.question-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.question-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.question-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

.question-title {
  font-weight: 500;
  font-size: 1.1rem;
}

.question-type-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-single {
  background: #4ecdc4;
  color: white;
}

.type-multiple {
  background: #45b7d1;
  color: white;
}

.type-text {
  background: #f39c12;
  color: white;
}

.type-dropdown {
  background: #8e44ad;
  color: white;
}

.question-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.answer-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.question-preview-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.question-content {
  padding: 0 1.5rem 1.5rem;
}

.question-description {
  margin-bottom: 1rem;
  opacity: 0.8;
  font-style: italic;
}

/* 选择题分布图表 */
.choice-distribution {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.option-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-label {
  min-width: 120px;
  font-size: 0.9rem;
}

.bar-container {
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 25px;
  display: flex;
  align-items: center;
}

.bar-fill {
  background: linear-gradient(90deg, #4ecdc4, #45b7d1);
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
  min-width: 2px;
}

.percentage {
  position: absolute;
  right: 8px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.option-count {
  min-width: 40px;
  text-align: right;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 文本题回答展示 */
.text-answers {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.text-answers-header h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.text-answers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.text-answer-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-style: italic;
  font-size: 0.9rem;
  border-left: 3px solid #4ecdc4;
}

.more-answers {
  text-align: center;
  opacity: 0.7;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 详细分析模式 */
.detailed-analysis {
  margin-bottom: 2rem;
}

.analysis-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.analysis-sidebar {
  background: rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-sidebar h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-filter {
  margin-bottom: 1rem;
}

.filter-input {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.question-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.question-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.question-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 3px solid #4ecdc4;
}

.question-item .question-number {
  min-width: 25px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.question-item .question-info {
  flex: 1;
}

.question-item .question-title {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  line-height: 1.3;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  opacity: 0.7;
}

.analysis-main {
  padding: 1.5rem;
}

.question-analysis {
  height: 100%;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.analysis-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.chart-type-selector {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.chart-container {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.detailed-chart {
  width: 100%;
  height: 400px;
}

.analysis-insights {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.analysis-insights h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.insight-item i {
  color: #4ecdc4;
}

.no-question-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  opacity: 0.6;
}

.no-question-selected i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 数据导出模式 */
.data-export {
  margin-bottom: 2rem;
}

.export-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.export-header {
  text-align: center;
  margin-bottom: 2rem;
}

.export-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.export-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1.5rem;
}

.export-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.format-options,
.content-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.format-option,
.content-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.05);
}

.format-option:hover,
.content-option:hover {
  background: rgba(78, 205, 196, 0.1);
  border-color: rgba(78, 205, 196, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.15);
}

.format-option input:checked~.radio-mark+i,
.format-option input:checked~.radio-mark+i+.format-text,
.format-option.selected i,
.format-option.selected .format-text {
  color: #4ecdc4;
}

.format-option input:checked~.radio-mark,
.format-option.selected .radio-mark {
  background: #4ecdc4;
  border-color: #4ecdc4;
}

.format-option.selected {
  background: rgba(78, 205, 196, 0.15);
  border-color: #4ecdc4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
}

.format-option input,
.content-option input {
  margin: 0;
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-mark {
  position: relative;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #666;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.format-option input:checked~.radio-mark {
  background: #4ecdc4;
  border-color: #4ecdc4;
}

.radio-mark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.2s ease;
}

.format-option input:checked~.radio-mark::after,
.format-option.selected .radio-mark::after {
  transform: translate(-50%, -50%) scale(1);
}

.format-option.selected i {
  transform: scale(1.1);
  color: #4ecdc4;
}

.format-option.selected .format-text {
  color: #4ecdc4;
  font-weight: 600;
}

/* Excel 格式特定样式 */
.format-option.selected[data-format="excel"] {
  border-color: #217346;
  box-shadow: 0 0 0 3px rgba(33, 115, 70, 0.2);
  background: rgba(33, 115, 70, 0.1);
}

.format-option.selected[data-format="excel"] .radio-mark {
  background: #217346;
  border-color: #217346;
}

.format-option.selected[data-format="excel"] i,
.format-option.selected[data-format="excel"] .format-text {
  color: #217346;
}

/* CSV 格式特定样式 */
.format-option.selected[data-format="csv"] {
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
  background: rgba(0, 102, 204, 0.1);
}

.format-option.selected[data-format="csv"] .radio-mark {
  background: #0066cc;
  border-color: #0066cc;
}

.format-option.selected[data-format="csv"] i,
.format-option.selected[data-format="csv"] .format-text {
  color: #0066cc;
}

/* PDF 格式特定样式 */
.format-option.selected[data-format="pdf"] {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
  background: rgba(220, 53, 69, 0.1);
}

.format-option.selected[data-format="pdf"] .radio-mark {
  background: #dc3545;
  border-color: #dc3545;
}

.format-option.selected[data-format="pdf"] i,
.format-option.selected[data-format="pdf"] .format-text {
  color: #dc3545;
}

.checkmark {
  position: relative;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #4ecdc4;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.content-option input:checked~.checkmark {
  background: #4ecdc4;
  border-color: #4ecdc4;
}

.checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.content-option input:checked~.checkmark::after {
  opacity: 1;
}

/* 禁用状态样式 */
.content-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(200, 200, 200, 0.1);
}

.content-option.disabled:hover {
  background: rgba(200, 200, 200, 0.1);
  border-color: transparent;
  transform: none;
  box-shadow: none;
}

.content-option.disabled .option-info strong,
.content-option.disabled .option-info small {
  color: #999;
}

.option-info {
  flex: 1;
}

.option-info strong {
  display: block;
  color: #333;
  margin-bottom: 0.2rem;
  font-weight: 600;
}

.option-info small {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.3;
}

.format-option i {
  font-size: 1.4rem;
  color: #666;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.format-option input:checked~.radio-mark+i {
  color: #4ecdc4;
  transform: scale(1.1);
}

.format-text {
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
}

.format-option input:checked~.radio-mark+i+.format-text {
  color: #4ecdc4;
  font-weight: 600;
}

.format-option {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.format-option input:checked {
  background: rgba(78, 205, 196, 0.15);
  border-color: #4ecdc4;
}

.export-actions {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.export-btn,
.test-data-btn {
  background: #4ecdc4;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;
}

.test-data-btn {
  background: #f39c12;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
}

.export-btn:hover:not(:disabled),
.test-data-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.export-btn:hover:not(:disabled) {
  background: #45b7b8;
}

.test-data-btn:hover {
  background: #e67e22;
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.export-progress {
  margin-top: 1rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #45b7b8);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: progress-shimmer 1.5s infinite;
}

@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .analysis-container {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 968px) {
  .analysis-container {
    grid-template-columns: 1fr;
  }

  .analysis-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .question-list {
    max-height: 200px;
  }
}

@media (max-width: 768px) {
  .questionnaire-analysis {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mode-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .export-options {
    grid-template-columns: 1fr;
  }

  .option-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .option-label {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .question-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
