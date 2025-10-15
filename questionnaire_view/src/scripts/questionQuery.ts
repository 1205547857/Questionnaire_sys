import axios from 'axios'

// 问题类型定义
export interface Question {
  questionId: string
  questionType: string // 'single' | 'multiple' | 'text' | 'dropdown'
  questionOptions: string
  canDelete: number // 0 或 1
  questionTitle: string
  questionTxt: string
  shared: number // 0 或 1，表示是否共享
}

/**
 * 根据问题ID查询单个问题详情
 * @param id 问题ID
 * @returns Promise<Question | null> 问题详情或null
 */
async function getQuestionById(id: string): Promise<Question | null> {
  try {
    console.log('Fetching question by ID:', id)
    const response = await axios.get(`http://localhost:8081/question/search/${id}`)

    console.log('Question fetch response:', response)

    if (response.status === 200 && response.data && response.data !== 'fail') {
      console.log('Question fetched successfully:', response.data)
      return response.data as Question
    } else {
      console.log('Question not found or failed to fetch')
      return null
    }
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

/**
 * 批量查询多个问题详情
 * @param ids 问题ID数组
 * @returns Promise<Question[]> 成功查询到的问题列表
 */
async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids || ids.length === 0) {
    return []
  }

  console.log('Fetching multiple questions by IDs:', ids)

  try {
    // 并行查询所有问题
    const promises = ids.map((id) => getQuestionById(id))
    const results = await Promise.all(promises)

    // 过滤掉查询失败的问题（null值）
    const validQuestions = results.filter((question) => question !== null) as Question[]

    console.log(`Successfully fetched ${validQuestions.length} out of ${ids.length} questions`)
    return validQuestions
  } catch (error) {
    console.error('Error fetching multiple questions:', error)
    return []
  }
}

/**
 * 解析问题选项字符串
 * @param optionsString 选项字符串（JSON格式）
 * @returns string[] 选项数组
 */
function parseQuestionOptions(optionsString: string): string[] {
  try {
    if (!optionsString || optionsString.trim() === '') {
      return []
    }

    // 尝试解析JSON格式的选项
    const options = JSON.parse(optionsString)
    if (Array.isArray(options)) {
      return options
    }

    // 如果不是数组，返回空数组
    return []
  } catch (error) {
    console.warn('Failed to parse question options:', optionsString, error)
    return []
  }
}

/**
 * 获取问题类型的显示名称
 * @param questionType 问题类型
 * @returns string 显示名称
 */
function getQuestionTypeDisplayName(questionType: string): string {
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
function getQuestionTypeIcon(questionType: string): string {
  const iconMap: Record<string, string> = {
    single: 'fas fa-dot-circle',
    multiple: 'fas fa-check-square',
    text: 'fas fa-edit',
    dropdown: 'fas fa-caret-down',
  }

  return iconMap[questionType] || 'fas fa-question'
}

export {
  getQuestionById,
  getQuestionsByIds,
  parseQuestionOptions,
  getQuestionTypeDisplayName,
  getQuestionTypeIcon,
}
