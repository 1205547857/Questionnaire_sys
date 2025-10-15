import axios from 'axios'
import { getCookie } from '@/utils/cookies'

// 编辑问题的接口类型
export interface EditQuestionRequest {
  questionId: string
  questionType: string
  questionOptions: string
  canDelete: number
  questionTitle: string
  questionTxt: string
  shared: number // 0 或 1，表示是否共享
}

// 问题详情的接口类型
export interface QuestionDetail {
  questionId: string
  questionType: string
  questionOptions: string
  canDelete: number
  questionTitle: string
  questionTxt: string
  shared: number // 0 或 1，表示是否共享
}

/**
 * 根据ID获取问题详情
 * @param questionId 问题ID
 * @returns 问题详情对象
 */
export async function getQuestionById(questionId: string): Promise<QuestionDetail | null> {
  try {
    const authToken = getCookie('authToken')
    const response = await axios.get(`http://localhost:8081/question/search/${questionId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.status === 200 && response.data) {
      return response.data as QuestionDetail
    }

    console.error('Failed to get question:', response)
    return null
  } catch (error) {
    console.error('Error getting question by ID:', error)
    return null
  }
}

/**
 * 更新问题信息
 * @param questionData 更新的问题数据
 * @returns 操作结果，包含新的问题ID（如果发生了变化）
 */
export async function updateQuestion(
  questionData: EditQuestionRequest,
): Promise<{ success: boolean; message?: string; newQuestionId?: string }> {
  try {
    console.log('Updating question with data:', questionData)

    const authToken = getCookie('authToken')
    const response = await axios.post('http://localhost:8081/question/edit', questionData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      console.log('Question updated successfully')
      console.log('Update response:', response.data)

      // 检查响应中是否包含新的问题ID
      const newQuestionId = response.data?.questionId || response.data?.id

      if (newQuestionId && newQuestionId !== questionData.questionId) {
        console.log(`Question ID changed: ${questionData.questionId} -> ${newQuestionId}`)
        return {
          success: true,
          message: '问题更新成功，问题ID已更新',
          newQuestionId,
        }
      } else {
        return { success: true, message: '问题更新成功' }
      }
    }

    console.error('Failed to update question:', response)
    return { success: false, message: '更新失败，请稍后重试' }
  } catch (error) {
    console.error('Error updating question:', error)
    return { success: false, message: '网络错误，请检查连接' }
  }
}

/**
 * 解析问题选项字符串为数组
 * @param optionsString JSON字符串格式的选项
 * @returns 选项数组
 */
export function parseQuestionOptionsForEdit(optionsString: string): string[] {
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
    console.warn('Failed to parse question options:', error)
    // 解析失败时，尝试按逗号分割
    return optionsString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item)
  }
}

/**
 * 将选项数组转换为编辑表单需要的格式
 * @param options 选项数组
 * @param isNested 是否为嵌套选项
 * @returns 编辑表单选项格式
 */
export function convertOptionsForEdit(options: string[], isNested: boolean = false) {
  if (!options || options.length === 0) {
    return [
      { text: '', children: [] },
      { text: '', children: [] },
    ]
  }

  if (isNested) {
    // 处理嵌套选项 "父选项 > 子选项"
    const nestedMap: { [key: string]: string[] } = {}

    options.forEach((option) => {
      if (option.includes(' > ')) {
        const [parent, child] = option.split(' > ')
        if (!nestedMap[parent]) {
          nestedMap[parent] = []
        }
        nestedMap[parent].push(child)
      } else {
        // 单独的选项作为父选项
        if (!nestedMap[option]) {
          nestedMap[option] = []
        }
      }
    })

    return Object.keys(nestedMap).map((parent) => ({
      text: parent,
      children: nestedMap[parent].map((child) => ({ text: child })),
    }))
  } else {
    // 普通选项
    return options.map((option) => ({
      text: option,
      children: [],
    }))
  }
}
