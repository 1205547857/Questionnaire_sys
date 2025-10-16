import axios from 'axios'
import { getCookie } from '@/utils/cookies'
import { useUserStore } from '@/stores/userStore'

// 问卷模版接口类型
export interface QuestionnaireModel {
  modelId: string | null // 创建时为null，响应时包含后端生成的ID
  questionsArray: string // JSON字符串：问题ID数组
  canDelete: number // 0或1
  modelTitle: string // 模版标题
  modelDesc: string // 模版描述
}

// 问题项接口（用于模版编辑器中的问题管理）
export interface QuestionItem {
  id: string // 临时ID（用于前端管理）
  type: 'reference' | 'new' | 'modified_reference' // 引用现有问题组件 或 新建问题 或 修改过的引用问题

  // 引用类型的问题（从现有问题组件引用）
  questionId?: string // 问题组件ID
  questionTitle?: string
  questionOptions?: string
  questionTxt?: string
  canDelete?: number
  shared?: number // 0 或 1，表示是否共享

  // 新建类型的问题（在模版中临时创建）
  title?: string
  description?: string
  questionType?: string
  options?: Array<{ text: string; children?: Array<{ text: string }> }>
  allowOther?: boolean
  isNested?: boolean

  // 修改过的引用问题的额外字段
  originalQuestionId?: string // 原始问题ID，用于追踪来源
}

// 创建问卷模版
export async function createQuestionnaireModel(
  title: string,
  description: string,
  questionIds: string[],
): Promise<{ success: boolean; modelId?: string; message?: string }> {
  try {
    const modelData: QuestionnaireModel = {
      modelId: null,
      questionsArray: JSON.stringify(questionIds),
      canDelete: 0,
      modelTitle: title,
      modelDesc: description,
    }

    console.log('Creating questionnaire model with data:', modelData)

    const authToken = getCookie('authToken')
    const response = await axios.post('http://localhost:8081/model/create', modelData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200 && response.data) {
      console.log('Questionnaire model created successfully:', response.data)
      useUserStore().addQuestionnaireModelId(response.data.modelId || response.data.id)
      return {
        success: true,
        modelId: response.data.modelId || response.data.id,
      }
    }

    console.error('Failed to create questionnaire model:', response)
    return { success: false, message: '创建失败，请稍后重试' }
  } catch (error) {
    console.error('Error creating questionnaire model:', error)
    return { success: false, message: '网络错误，请检查连接' }
  }
}

// 处理模版保存逻辑：自动创建新问题组件并返回问题ID数组
export async function processTemplateQuestions(questions: QuestionItem[]): Promise<string[]> {
  const questionIds: string[] = []

  for (const question of questions) {
    if (question.type === 'reference' && question.questionId) {
      // 引用现有问题组件，直接使用ID
      questionIds.push(question.questionId)
    } else if (question.type === 'new' || question.type === 'modified_reference') {
      // 新建问题，需要先调用API创建问题组件
      try {
        console.log('Creating new question component:', question)

        // 转换选项为字符串数组
        const optionsArray: string[] = []
        if (question.options) {
          question.options.forEach((option) => {
            if (option.text.trim()) {
              if (question.isNested && option.children && option.children.length > 0) {
                // 嵌套结构：父选项 > 子选项
                option.children.forEach((child) => {
                  if (child.text.trim()) {
                    optionsArray.push(`${option.text} > ${child.text}`)
                  }
                })
              } else {
                // 普通选项
                optionsArray.push(option.text)
              }
            }
          })
        }

        const optionsString = JSON.stringify(optionsArray)

        // 直接调用后端API创建问题并获取问题ID
        const authToken = getCookie('authToken')
        const response = await axios.post(
          'http://localhost:8081/question/create',
          {
            questionType: question.questionType || 'single',
            questionOptions: optionsString,
            questionTitle: question.title || '',
            questionTxt: question.description || '',
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
        )

        console.log('Create question response:', response)

        if (
          response.status === 200 &&
          response.data &&
          response.data !== 'fail' &&
          response.data.questionId
        ) {
          const questionId = response.data.questionId
          questionIds.push(questionId)
          console.log('Question component created successfully with ID:', questionId)
          // 注意：不再将新创建的问题ID添加到用户的问题列表中
          // 这样新建问题和修改过的引用问题只会在当前模版中使用
        } else {
          console.error('Failed to create question component:', response.data)
          throw new Error(`问题组件创建失败: ${response.data || '服务器响应异常'}`)
        }
      } catch (error) {
        console.error('Error creating question component:', error)
        throw new Error(`创建问题组件失败: ${error}`)
      }
    }
  }

  return questionIds
}

// 生成临时ID（用于前端问题管理）
export function generateTempId(): string {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 验证问题数据完整性
export function validateQuestionItem(question: QuestionItem): { valid: boolean; message?: string } {
  if (question.type === 'reference') {
    if (!question.questionId) {
      return { valid: false, message: '引用问题缺少问题ID' }
    }
    return { valid: true }
  } else if (question.type === 'new' || question.type === 'modified_reference') {
    if (!question.title || !question.title.trim()) {
      return { valid: false, message: '问题标题不能为空' }
    }
    if (!question.questionType) {
      return { valid: false, message: '请选择问题类型' }
    }

    // 检查选择类题型的选项
    if (['single', 'multiple', 'dropdown'].includes(question.questionType)) {
      if (!question.options || question.options.length === 0) {
        return { valid: false, message: '选择类问题必须添加选项' }
      }

      const hasValidOption = question.options.some((option) => option.text.trim())
      if (!hasValidOption) {
        return { valid: false, message: '至少需要一个有效选项' }
      }
    }

    return { valid: true }
  }

  return { valid: false, message: '无效的问题类型' }
}

// 验证整个模版
export function validateTemplate(questions: QuestionItem[]): { valid: boolean; message?: string } {
  if (questions.length === 0) {
    return { valid: false, message: '模版至少需要包含一个问题' }
  }

  for (let i = 0; i < questions.length; i++) {
    const validation = validateQuestionItem(questions[i])
    if (!validation.valid) {
      return { valid: false, message: `第${i + 1}个问题：${validation.message}` }
    }
  }

  return { valid: true }
}
