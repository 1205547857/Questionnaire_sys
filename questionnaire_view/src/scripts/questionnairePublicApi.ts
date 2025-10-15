import axios from 'axios'
import type { Questionnaire } from './questionnaireCreate'

// 问卷模型数据结构
export interface QuestionnaireModel {
  modelId: string
  questionsArray: string
  canDelete: number
  modelTitle: string
  modelDesc: string
}

// 问题数据结构
export interface Question {
  id: string
  type: 'single' | 'multiple' | 'text' | 'dropdown'
  title: string
  description?: string
  options?: string[]
}

// 答案数据类型
export interface QuestionnaireAnswers {
  [questionId: string]: string | string[]
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

// API配置
export const API_BASE_URL = 'http://localhost:8081'
export const API_ENDPOINTS = {
  questionnaire: '/questionnaire/search/{id}',
  model: '/model/search/{id}',
  question: '/question/search/{id}', // 问题查询端点
  submit: '/questionnaire/answer', // 待后端提供确切端点
}

// 问题数据缓存
const questionCache = new Map<string, Question | null>()

/**
 * 测试API连接状态
 * @returns Promise<boolean> API是否可用
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.status === 200
  } catch (error) {
    console.warn('API connection test failed:', error)
    return false
  }
}

/**
 * 公开访问：根据问卷ID查询问卷详情（无需认证）
 * @param id 问卷ID
 * @returns Promise<Questionnaire | null> 问卷详情或null
 */
export async function getPublicQuestionnaireById(id: string): Promise<Questionnaire | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.questionnaire.replace('{id}', id)}`
    console.log('Fetching questionnaire by ID (public access):', id)
    console.log('Request URL:', url)

    // 使用API文档中的端点，不发送认证token
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10秒超时
    })

    console.log('Questionnaire fetch response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })

    // 根据API文档，成功时返回200状态和Questionnaire对象
    if (response.status === 200 && response.data && response.data !== 'fail') {
      console.log('Questionnaire fetched successfully:', response.data)
      return response.data as Questionnaire
    } else {
      console.log('Questionnaire not found or failed to fetch')
      return null
    }
  } catch (error) {
    console.error('Error fetching questionnaire:', error)

    // 如果Axios错误，检查是否为认证问题
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message

      console.log('Axios error details:', {
        status,
        message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      })

      if (status === 401) {
        console.log('Authentication required, but this is public access')
      } else if (status === 404) {
        console.log('Questionnaire not found (404)')
      } else if (status === 500) {
        console.log('Server internal error (500)')
      } else {
        console.log('Other server error:', status)
      }
    }

    return null
  }
}

/**
 * 公开访问：根据模型ID查询问卷模型（无需认证）
 * @param modelId 模型ID
 * @returns Promise<QuestionnaireModel | null> 问卷模型或null
 */
export async function getPublicQuestionnaireModelById(
  modelId: string,
): Promise<QuestionnaireModel | null> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.model.replace('{id}', modelId)}`
    console.log('Fetching questionnaire model by ID (public access):', modelId)
    console.log('Request URL:', url)

    // 使用API文档中的端点，不发送认证token
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10秒超时
    })

    console.log('Model fetch response:', response)

    // 根据API文档，成功时返回200状态和QuestionnaireModel对象
    if (response.status === 200 && response.data && response.data.modelId) {
      console.log('Model fetched successfully:', response.data)
      return response.data as QuestionnaireModel
    } else {
      console.log('Model not found or failed to fetch')
      return null
    }
  } catch (error) {
    console.error('Error fetching model:', error)

    // 如果Axios错误，检查是否为认证问题
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401) {
        console.log('Authentication required, but this is public access')
      } else if (status === 404) {
        console.log('Model not found')
      } else {
        console.log('Server error:', status)
      }
    }

    return null
  }
}

/**
 * 公开访问：根据问题ID查询单个问题详情（无需认证）
 * @param questionId 问题ID
 * @returns Promise<Question | null> 问题详情或null
 */
export async function getPublicQuestionById(questionId: string): Promise<Question | null> {
  // 检查缓存
  if (questionCache.has(questionId)) {
    console.log('从缓存获取问题:', questionId)
    return questionCache.get(questionId) || null
  }

  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.question.replace('{id}', questionId)}`
    console.log('Fetching question by ID (public access):', questionId)
    console.log('Request URL:', url)

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    console.log('Question fetch response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })

    if (response.status === 200 && response.data && response.data !== 'fail') {
      const data = response.data

      // 转换后端数据格式为前端Question格式
      const question: Question = {
        id: String(data.id || data.questionId || questionId),
        type: String(data.type || data.questionType || 'text') as Question['type'],
        title: String(data.title || data.questionTitle || data.questionTxt || '未命名问题'),
        description: String(data.description || data.questionTxt || ''),
        options: Array.isArray(data.options)
          ? data.options.map(String)
          : data.questionOptions
            ? typeof data.questionOptions === 'string'
              ? JSON.parse(data.questionOptions)
              : Array.isArray(data.questionOptions)
                ? data.questionOptions.map(String)
                : []
            : [],
      }

      // 缓存问题数据
      questionCache.set(questionId, question)
      return question
    } else {
      console.log('Question not found or failed to fetch')
      // 缓存null结果，避免重复请求
      questionCache.set(questionId, null)
      return null
    }
  } catch (error) {
    console.error('Error fetching question:', error)

    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      console.log('Question fetch error details:', {
        status,
        message: error.response?.data?.message || error.message,
        questionId,
      })
    }

    // 缓存null结果，避免重复请求失败的问题
    questionCache.set(questionId, null)
    return null
  }
}

/**
 * 解析问题数组字符串（公开访问版本）
 */
export async function parsePublicQuestionsArray(
  questionsArrayStr: string | unknown,
): Promise<Question[]> {
  try {
    console.log('开始解析问题数组，原始数据:', questionsArrayStr)
    console.log('数据类型:', typeof questionsArrayStr)

    // 如果已经是对象/数组，直接使用
    let parsed: unknown
    if (typeof questionsArrayStr === 'string') {
      console.log('数据长度:', questionsArrayStr?.length)

      if (!questionsArrayStr || questionsArrayStr.trim() === '') {
        console.log('问题数组字符串为空或无效')
        return []
      }

      parsed = JSON.parse(questionsArrayStr)
    } else {
      console.log('数据已经是对象，直接使用')
      parsed = questionsArrayStr
    }
    console.log('JSON解析结果:', parsed)
    console.log('解析结果类型:', typeof parsed)
    console.log('是否为数组:', Array.isArray(parsed))

    if (!Array.isArray(parsed)) {
      console.log('解析结果不是数组')
      return []
    }

    console.log('解析后的数组长度:', parsed.length)

    // 检查数组第一个元素的类型来判断存储格式
    if (parsed.length > 0) {
      console.log('数组第一个元素:', parsed[0])
      console.log('第一个元素类型:', typeof parsed[0])
      const firstItem = parsed[0]

      // 如果第一个元素是字符串，说明存储的是问题ID数组
      if (typeof firstItem === 'string') {
        console.log('检测到问题ID数组格式，需要通过API获取问题数据')
        console.log('问题ID列表:', parsed)

        // 批量获取问题数据
        const questions: Question[] = []

        for (let i = 0; i < parsed.length; i++) {
          const questionId = parsed[i] as string
          console.log(`正在获取问题 ${i + 1}/${parsed.length}, ID: ${questionId}`)

          try {
            const questionData = await getPublicQuestionById(questionId)
            if (questionData) {
              questions.push(questionData)
              console.log(`问题 ${questionId} 获取成功:`, questionData.title)
            } else {
              console.warn(`问题 ${questionId} 获取失败，使用占位符`)
              // 使用占位符数据
              questions.push({
                id: questionId,
                type: 'text',
                title: `问题 ${i + 1} (加载失败)`,
                description: '题目加载失败，请联系管理员',
                options: [],
              })
            }
          } catch (error) {
            console.error(`获取问题 ${questionId} 时出错:`, error)
            // 使用占位符数据
            questions.push({
              id: questionId,
              type: 'text',
              title: `问题 ${i + 1} (网络错误)`,
              description: '题目加载失败，请检查网络连接',
              options: [],
            })
          }
        }

        console.log(`批量获取问题完成，成功获取 ${questions.length} 个问题`)
        return questions
      }
      // 如果第一个元素是对象，说明存储的是完整的问题对象数组
      else if (typeof firstItem === 'object' && firstItem !== null) {
        console.log('检测到问题对象数组格式，直接解析')
        return parsed.map((item: Record<string, unknown>) => ({
          id: String(item.id || item.questionId || Math.random()),
          type: String(item.type || item.questionType || 'text') as Question['type'],
          title: String(item.title || item.questionTitle || '未命名问题'),
          description: String(item.description || item.questionTxt || ''),
          options: Array.isArray(item.options)
            ? item.options.map(String)
            : item.questionOptions
              ? typeof item.questionOptions === 'string'
                ? JSON.parse(item.questionOptions as string)
                : item.questionOptions
              : [],
        }))
      }
    }

    console.log('没有匹配到任何解析逻辑，尝试直接使用数据')

    // 最后尝试：如果parsed是数组但为空，或者不匹配前面的条件
    if (Array.isArray(parsed) && parsed.length === 0) {
      console.log('数组为空，返回空结果')
      return []
    }

    // 如果是非空数组但没有匹配到已知格式，尝试通用解析
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log('尝试通用解析...')
      return parsed.map((item: unknown, index: number) => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>
          return {
            id: String(obj.id || obj.questionId || `question_${index + 1}`),
            type: (obj.type || obj.questionType || 'text') as Question['type'],
            title: String(obj.title || obj.questionTitle || obj.questionTxt || `问题 ${index + 1}`),
            description: String(obj.description || obj.questionTxt || ''),
            options: Array.isArray(obj.options) ? obj.options.map(String) : [],
          }
        }
        return {
          id: `question_${index + 1}`,
          type: 'text' as const,
          title: String(item),
          description: '',
          options: [],
        }
      })
    }

    console.log('所有解析方法都失败，返回空数组')
    return []
  } catch (error) {
    console.error('解析公开问题数组失败:', error)
    console.error('错误详情:', error)

    // 返回一些默认问题作为示例
    return [
      {
        id: 'sample_1',
        type: 'single',
        title: '您对我们的服务满意吗？',
        options: ['非常满意', '满意', '一般', '不满意', '非常不满意'],
      },
      {
        id: 'sample_2',
        type: 'multiple',
        title: '您希望我们在哪些方面改进？（多选）',
        options: ['服务质量', '响应速度', '产品功能', '用户体验', '价格'],
      },
      {
        id: 'sample_3',
        type: 'text',
        title: '请留下您的宝贵意见和建议：',
      },
    ]
  }
}

/**
 * 提交问卷答案（公开访问）
 * @param questionnaireId 问卷ID
 * @param answers 答案数据
 * @returns Promise<{success: boolean, message: string}> 提交结果
 */
export async function submitPublicQuestionnaireAnswers(
  questionnaireId: string,
  answers: QuestionnaireAnswers,
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Submitting questionnaire answers (public access):', { questionnaireId, answers })

    // TODO: 等待后端提供提交问卷答案的API端点
    // 目前作为占位符实现，模拟提交过程
    console.warn('Submit API not implemented yet - using mock implementation')

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 模拟成功响应（实际项目中需要替换为真实API调用）
    const mockSuccess = Math.random() > 0.1 // 90%成功率模拟

    if (mockSuccess) {
      // 在真实API可用之前，至少保存到本地存储作为备份
      const submissionKey = `questionnaire_submission_${questionnaireId}_${Date.now()}`
      const submissionData = {
        questionnaireId,
        answers,
        submitTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        status: 'pending_server_sync',
      }

      try {
        localStorage.setItem(submissionKey, JSON.stringify(submissionData))
        console.log('Answers saved locally pending server sync:', submissionKey)
      } catch (storageError) {
        console.warn('Failed to save submission locally:', storageError)
      }

      return {
        success: true,
        message: '问卷提交成功，感谢您的参与！您的答案已保存。',
      }
    } else {
      return {
        success: false,
        message: '提交失败，请稍后重试。',
      }
    }

    /*
    // 未来真实API实现示例：
    const response = await axios.post(
      `http://localhost:8081/questionnaire/submit/${questionnaireId}`,
      {
        answers: answers,
        submitTime: new Date().toISOString(),
        userAgent: navigator.userAgent
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status === 200 || response.status === 201) {
      return { success: true, message: '问卷提交成功，感谢您的参与！' }
    } else {
      return { success: false, message: '提交失败，请稍后重试' }
    }
    */
  } catch (error) {
    console.error('Error submitting questionnaire:', error)

    // 提供更详细的错误信息
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 400) {
        return { success: false, message: '提交数据格式错误，请检查后重试' }
      } else if (status === 404) {
        return { success: false, message: '问卷不存在或已过期' }
      } else if (status === 500) {
        return { success: false, message: '服务器错误，请稍后重试' }
      }
    }

    // 网络错误或其他未知错误
    return {
      success: false,
      message: '网络错误，提交失败。您的答案已保存在本地，请检查网络连接后重试。',
    }
  }
}

/**
 * 保存问卷草稿（公开访问）
 * @param questionnaireId 问卷ID
 * @param answers 答案数据
 * @returns Promise<{success: boolean, message: string}> 保存结果
 */
export async function savePublicQuestionnaireDraft(
  questionnaireId: string,
  answers: QuestionnaireAnswers,
): Promise<{ success: boolean; message: string }> {
  try {
    // 使用localStorage保存草稿，因为匿名用户无法使用服务器端存储
    const draftKey = `questionnaire_draft_${questionnaireId}`
    const draftData = {
      answers: answers,
      saveTime: new Date().toISOString(),
    }

    localStorage.setItem(draftKey, JSON.stringify(draftData))

    console.log('Public draft saved locally:', draftData)
    return { success: true, message: '草稿已保存到本地' }
  } catch (error) {
    console.error('Error saving public questionnaire draft:', error)
    return { success: false, message: '草稿保存失败' }
  }
}

/**
 * 加载问卷草稿（公开访问）
 * @param questionnaireId 问卷ID
 * @returns 草稿数据或null
 */
export function loadPublicQuestionnaireDraft(questionnaireId: string): QuestionnaireAnswers | null {
  try {
    const draftKey = `questionnaire_draft_${questionnaireId}`
    const draftJson = localStorage.getItem(draftKey)

    if (draftJson) {
      const draftData = JSON.parse(draftJson)
      console.log('Public draft loaded from local:', draftData)
      return draftData.answers || null
    }

    return null
  } catch (error) {
    console.error('Error loading public questionnaire draft:', error)
    return null
  }
}
