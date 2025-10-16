import axios from 'axios'
import { create_question } from './question_create'

// 共享问题接口类型
export interface SharedQuestion {
  questionId: string
  questionType: string
  questionOptions: string
  canDelete: number
  questionTitle: string
  questionTxt: string
  shared: number
}

/**
 * 获取所有共享问题列表
 * @returns Promise<SharedQuestion[]> 共享问题列表
 */
export async function getSharedQuestions(): Promise<SharedQuestion[]> {
  try {
    console.log('Fetching shared questions...')

    const response = await axios.get('http://localhost:8081/question/get-shared', {
      timeout: 10000,
    })

    console.log('Shared questions response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })

    if (response.status === 200 && response.data && Array.isArray(response.data)) {
      return response.data as SharedQuestion[]
    } else {
      console.log('No shared questions found or invalid response format')
      return []
    }
  } catch (error) {
    console.error('Error fetching shared questions:', error)

    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      console.log('Shared questions fetch error details:', {
        status,
        message: error.response?.data?.message || error.message,
      })
    }

    return []
  }
}

/**
 * 引用共享问题（复制问题数据创建新问题）
 * @param sharedQuestion 要引用的共享问题
 * @returns Promise<boolean> 是否引用成功
 */
export async function referenceSharedQuestion(sharedQuestion: SharedQuestion): Promise<boolean> {
  try {
    console.log('Referencing shared question:', sharedQuestion)

    // 调用问题创建API，传递共享问题的数据（不包括ID）
    // shared参数设为0，因为引用的问题默认为非共享状态
    const result = await create_question(
      sharedQuestion.questionType,
      sharedQuestion.questionOptions,
      sharedQuestion.questionTitle,
      sharedQuestion.questionTxt,
      0, // 引用的问题默认不共享
    )

    console.log('Reference question result:', result)
    return result === true
  } catch (error) {
    console.error('Error referencing shared question:', error)
    return false
  }
}

/**
 * 解析问题选项字符串为数组（用于预览）
 * @param optionsString JSON字符串格式的选项
 * @returns 选项数组
 */
export function parseSharedQuestionOptions(optionsString: string): string[] {
  try {
    if (!optionsString || optionsString.trim() === '') {
      return []
    }

    // 尝试解析JSON字符串
    const parsed = JSON.parse(optionsString)

    if (Array.isArray(parsed)) {
      return parsed
    }

    // 如果不是数组，尝试按逗号分割
    return optionsString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item)
  } catch (error) {
    console.error('Failed to parse question options:', error)
    // 如果解析失败，尝试按逗号分割
    return optionsString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item)
  }
}

/**
 * 获取问题类型的显示名称
 * @param questionType 问题类型
 * @returns string 显示名称
 */
export function getSharedQuestionTypeDisplayName(questionType: string): string {
  const typeMap: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    text: '文本题',
    dropdown: '下拉选择题',
  }

  return typeMap[questionType] || questionType
}

/**
 * 获取问题类型的图标
 * @param questionType 问题类型
 * @returns string 图标类名
 */
export function getSharedQuestionTypeIcon(questionType: string): string {
  const iconMap: Record<string, string> = {
    single: 'fas fa-dot-circle',
    multiple: 'fas fa-check-square',
    text: 'fas fa-edit',
    dropdown: 'fas fa-caret-down',
  }

  return iconMap[questionType] || 'fas fa-question'
}
