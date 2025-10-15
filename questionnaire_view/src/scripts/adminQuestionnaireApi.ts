// 使用fetch API代替axios
const API_BASE_URL = 'http://localhost:8081' // 设置正确的基础URL

// API调试日志函数
function logApiCall(endpoint: string, method: string, data?: unknown) {
  console.log(`API Call: ${method} ${endpoint}`, data ? { data } : '')
}

function logApiResponse(endpoint: string, response: Response, data?: unknown) {
  console.log(`API Response: ${endpoint} - Status: ${response.status}`, data ? { data } : '')
}

// 类型定义
export interface Questionnaire {
  questionnaireId: string
  questionnaireStatus: string
  modelId: string
  canDelete: number
  questionnaireTitle: string
  questionnaireCensor: string
}

export interface QuestionnaireModel {
  modelId: string
  questionsArray: string
  canDelete: number
  modelTitle: string
  modelDesc: string
}

export interface Question {
  questionId: string
  questionType: string
  questionOptions: string
  canDelete: number
  questionTitle: string
  questionTxt: string
  shared: number
}

// 问卷相关API
export async function searchQuestionnaire(id: string): Promise<Questionnaire | null> {
  const endpoint = `/questionnaire/search/${id}`
  logApiCall(endpoint, 'GET')

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (response.ok) {
      const data = await response.json()
      logApiResponse(endpoint, response, data)
      return data
    }
    console.warn(`Questionnaire not found: ${id}`)
    return null
  } catch (error) {
    console.error('Error searching questionnaire:', error)
    return null
  }
}

export async function editQuestionnaire(questionnaire: Questionnaire): Promise<boolean> {
  const endpoint = '/questionnaire/edit'
  logApiCall(endpoint, 'POST', questionnaire)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionnaire),
    })
    logApiResponse(endpoint, response)
    return response.ok
  } catch (error) {
    console.error('Error editing questionnaire:', error)
    return false
  }
}

export async function deleteQuestionnaire(id: string): Promise<boolean> {
  const endpoint = `/questionnaire/delete/${id}`
  logApiCall(endpoint, 'DELETE')

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    })
    logApiResponse(endpoint, response)
    return response.ok
  } catch (error) {
    console.error('Error deleting questionnaire:', error)
    return false
  }
}

// 模版相关API
export async function searchModel(id: string): Promise<QuestionnaireModel | null> {
  const endpoint = `/model/search/${id}`
  logApiCall(endpoint, 'GET')

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (response.ok) {
      const data = await response.json()
      logApiResponse(endpoint, response, data)
      return data
    }
    return null
  } catch (error) {
    console.error('Error searching model:', error)
    return null
  }
}

// 问题相关API
export async function searchQuestion(id: string): Promise<Question | null> {
  const endpoint = `/question/search/${id}`
  logApiCall(endpoint, 'GET')

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (response.ok) {
      const data = await response.json()
      logApiResponse(endpoint, response, data)
      return data
    }
    return null
  } catch (error) {
    console.error('Error searching question:', error)
    return null
  }
} // 获取所有问卷
export async function getAllQuestionnaires(): Promise<Questionnaire[]> {
  const endpoint = '/questionnaire/getAllQuestionnaire'
  logApiCall(endpoint, 'GET')

  try {
    // 根据API文档，获取所有问卷的端点
    const response = await fetch(`${API_BASE_URL}${endpoint}`)

    if (response.ok) {
      const data = await response.json()
      logApiResponse(endpoint, response, data)

      // 如果返回的是数组，直接返回；如果是包装对象，需要提取数组
      const questionnaires = Array.isArray(data) ? data : []
      console.log(`Successfully fetched ${questionnaires.length} questionnaires`)
      return questionnaires
    } else {
      console.error('Failed to fetch questionnaires, status:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response body:', errorText)
      return []
    }
  } catch (error) {
    console.error('Error getting all questionnaires:', error)

    // 如果API调用失败，返回模拟数据供开发测试
    // 实际部署时应该删除这部分模拟数据或返回空数组
    console.warn('Using mock data due to API failure')
    const mockQuestionnaires: Questionnaire[] = [
      {
        questionnaireId: 'q001',
        questionnaireStatus: JSON.stringify({
          status: 'active',
          startTime: Date.now(),
          endTime: null,
        }),
        modelId: 'm001',
        canDelete: 1,
        questionnaireTitle: '用户满意度调查',
        questionnaireCensor: 'pass',
      },
      {
        questionnaireId: 'q002',
        questionnaireStatus: JSON.stringify({
          status: 'draft',
          startTime: null,
          endTime: null,
        }),
        modelId: 'm002',
        canDelete: 1,
        questionnaireTitle: '产品反馈问卷',
        questionnaireCensor: 'uncensor',
      },
      {
        questionnaireId: 'q003',
        questionnaireStatus: JSON.stringify({
          status: 'paused',
          startTime: Date.now() - 86400000,
          endTime: null,
        }),
        modelId: 'm003',
        canDelete: 1,
        questionnaireTitle: '市场调研问卷',
        questionnaireCensor: 'block',
      },
      {
        questionnaireId: 'q004',
        questionnaireStatus: JSON.stringify({
          status: 'active',
          startTime: Date.now() - 3600000,
          endTime: Date.now() + 86400000,
        }),
        modelId: 'm004',
        canDelete: 1,
        questionnaireTitle: '客户体验调查',
        questionnaireCensor: 'pass',
      },
    ]
    console.log(`Returning ${mockQuestionnaires.length} mock questionnaires`)
    return mockQuestionnaires
  }
} // 批量操作API（如果需要的话）
export async function batchUpdateQuestionnaireStatus(
  questionnaireIds: string[],
  status: string,
): Promise<boolean> {
  const endpoint = '/questionnaire/batch-update-status'
  logApiCall(endpoint, 'POST', { questionnaireIds, status })

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionnaireIds,
        status,
      }),
    })
    logApiResponse(endpoint, response)
    return response.ok
  } catch (error) {
    console.error('Error batch updating questionnaire status:', error)
    return false
  }
}

export async function batchDeleteQuestionnaires(questionnaireIds: string[]): Promise<boolean> {
  const endpoint = '/questionnaire/batch-delete'
  logApiCall(endpoint, 'POST', { questionnaireIds })

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionnaireIds,
      }),
    })
    logApiResponse(endpoint, response)
    return response.ok
  } catch (error) {
    console.error('Error batch deleting questionnaires:', error)
    return false
  }
}

// 辅助函数
export function getStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    pass: '已通过',
    uncensor: '待审核',
    block: '已阻止',
  }
  return statusMap[status] || status
}

export function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    pass: 'fas fa-check-circle',
    uncensor: 'fas fa-clock',
    block: 'fas fa-ban',
  }
  return iconMap[status] || 'fas fa-question-circle'
}

export function getStatusDetailInfo(statusJson: string): string {
  try {
    const status = JSON.parse(statusJson)
    if (status.status === 'active') {
      if (status.endTime && status.endTime < Date.now()) {
        return '已结束'
      }
      return '活跃中'
    } else if (status.status === 'draft') {
      return '草稿'
    } else if (status.status === 'paused') {
      return '已暂停'
    }
    return status.status || '未知'
  } catch {
    return '未知状态'
  }
}

export function getQuestionTypeDisplay(type: string): string {
  const typeMap: Record<string, string> = {
    single_choice: '单选',
    multiple_choice: '多选',
    text: '文本',
    dropdown: '下拉',
    number: '数字',
    date: '日期',
  }
  return typeMap[type] || type
}

// 解析问题选项
export function parseQuestionOptions(optionsJson: string): string[] {
  try {
    const parsed = JSON.parse(optionsJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 解析问题数组
export function parseQuestionsArray(questionsArrayJson: string): string[] {
  try {
    const parsed = JSON.parse(questionsArrayJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
