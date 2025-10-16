import axios from 'axios'
import { getCookie } from '@/utils/cookies'
import type { Question } from '@/scripts/questionQuery'

// 问卷模版数据接口
export interface QuestionnaireModel {
  modelId: string
  questionsArray: string
  canDelete: number
  modelTitle: string
  modelDesc: string
}

// 问题项接口
export interface QuestionItem {
  id: string
  type: string
  title: string
  description?: string
  options?: string[]
  shared?: number // 0 或 1，表示是否共享
}

// 根据模版ID查询单个问卷模版
export async function getQuestionnaireModelById(
  modelId: string,
): Promise<QuestionnaireModel | null> {
  try {
    const authToken = getCookie('authToken')
    if (!authToken) {
      throw new Error('未找到认证token')
    }

    const response = await axios.get(`http://localhost:8081/model/search/${modelId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    console.log(`API response for model ${modelId}:`, response.data)

    if (response.data && response.data.modelId) {
      return response.data as QuestionnaireModel
    }

    console.warn(`No valid data returned for model ${modelId}`)
    return null
  } catch (error) {
    console.error('获取问卷模版失败:', error)
    // 不要重新抛出错误，返回 null 让批量查询继续处理其他模版
    return null
  }
}

// 根据模版ID列表批量查询问卷模版
export async function getQuestionnaireModelsByIds(
  modelIds: string[],
): Promise<QuestionnaireModel[]> {
  if (!modelIds || modelIds.length === 0) {
    return []
  }

  try {
    const models: QuestionnaireModel[] = []

    // 并行请求所有模版
    const promises = modelIds.map((modelId) => getQuestionnaireModelById(modelId))

    const results = await Promise.all(promises)

    // 过滤掉失败的请求，只返回有效的模版
    results.forEach((model) => {
      if (model) {
        models.push(model)
      }
    })

    return models
  } catch (error) {
    console.error('批量获取问卷模版失败:', error)
    throw error
  }
}

// 解析问题数组字符串 - 支持问题ID数组和问题对象数组两种格式
export async function parseQuestionsArray(questionsArrayStr: string): Promise<QuestionItem[]> {
  try {
    if (!questionsArrayStr || questionsArrayStr.trim() === '') {
      return []
    }

    const parsed = JSON.parse(questionsArrayStr)

    if (!Array.isArray(parsed)) {
      return []
    }

    // 检查数组第一个元素的类型来判断存储格式
    if (parsed.length > 0) {
      const firstItem = parsed[0]

      // 如果第一个元素是字符串，说明存储的是问题ID数组
      if (typeof firstItem === 'string') {
        console.log('检测到问题ID数组格式，需要通过API获取问题数据')
        // 导入getQuestionsByIds函数来获取完整的问题数据
        const { getQuestionsByIds } = await import('@/scripts/questionQuery')
        const questionIds = parsed as string[]
        const questionsData: Question[] = await getQuestionsByIds(questionIds)

        // 转换为QuestionItem格式
        return questionsData.map((questionData) => ({
          id: String(questionData.questionId || Math.random()),
          type: String(questionData.questionType || 'text'),
          title: String(questionData.questionTitle || '未命名问题'),
          description: String(questionData.questionTxt || ''),
          shared: Number(questionData.shared || 0), // 添加shared字段映射
          options: questionData.questionOptions
            ? typeof questionData.questionOptions === 'string'
              ? JSON.parse(questionData.questionOptions)
              : questionData.questionOptions
            : [],
        }))
      }
      // 如果第一个元素是对象，说明存储的是完整的问题对象数组（旧格式兼容）
      else if (typeof firstItem === 'object' && firstItem !== null) {
        console.log('检测到问题对象数组格式，直接解析')
        return parsed.map((item: Record<string, unknown>) => ({
          id: String(item.id || item.questionId || Math.random()),
          type: String(item.type || item.questionType || 'text'),
          title: String(item.title || item.questionTitle || '未命名问题'),
          description: String(item.description || item.questionTxt || ''),
          shared: Number(item.shared || 0), // 添加shared字段映射
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

    return []
  } catch (error) {
    console.error('解析问题数组失败:', error)
    return []
  }
}

// 同步版本的解析函数，用于兼容不支持异步的场景
export function parseQuestionsArraySync(questionsArrayStr: string): QuestionItem[] {
  try {
    if (!questionsArrayStr || questionsArrayStr.trim() === '') {
      return []
    }

    const parsed = JSON.parse(questionsArrayStr)

    if (!Array.isArray(parsed)) {
      return []
    }

    // 如果存储的是问题ID数组，返回占位符数据
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      return parsed.map((id: string, index: number) => ({
        id: id,
        type: 'text',
        title: `问题 ${index + 1}（加载中...）`,
        description: '正在加载问题详情...',
        options: [],
      }))
    }

    // 处理问题对象数组
    return parsed.map((item: Record<string, unknown>) => ({
      id: String(item.id || item.questionId || Math.random()),
      type: String(item.type || item.questionType || 'text'),
      title: String(item.title || item.questionTitle || '未命名问题'),
      description: String(item.description || item.questionTxt || ''),
      options: Array.isArray(item.options) ? item.options.map(String) : [],
    }))
  } catch (error) {
    console.warn('同步解析问题数组失败:', error)
    return []
  }
}

// 获取模版统计信息
export async function getModelStatistics(models: QuestionnaireModel[]): Promise<{
  totalModels: number
  totalQuestions: number
  avgQuestionsPerModel: number
}> {
  const totalModels = models.length
  let totalQuestions = 0

  // 使用Promise.all并行处理所有模版的问题解析
  const questionArrays = await Promise.all(
    models.map((model) => parseQuestionsArray(model.questionsArray)),
  )

  questionArrays.forEach((questions) => {
    totalQuestions += questions.length
  })

  const avgQuestionsPerModel = totalModels > 0 ? Math.round(totalQuestions / totalModels) : 0

  return {
    totalModels,
    totalQuestions,
    avgQuestionsPerModel,
  }
}

// 同步版本的统计信息，用于快速预览
export function getModelStatisticsSync(models: QuestionnaireModel[]): {
  totalModels: number
  totalQuestions: number
  avgQuestionsPerModel: number
} {
  const totalModels = models.length
  let totalQuestions = 0

  models.forEach((model) => {
    const questions = parseQuestionsArraySync(model.questionsArray)
    totalQuestions += questions.length
  })

  const avgQuestionsPerModel = totalModels > 0 ? Math.round(totalQuestions / totalModels) : 0

  return {
    totalModels,
    totalQuestions,
    avgQuestionsPerModel,
  }
}
