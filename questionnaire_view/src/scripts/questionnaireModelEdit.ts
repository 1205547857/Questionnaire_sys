import axios from 'axios'
import { getCookie } from '@/utils/cookies'
import type { QuestionnaireModel } from './questionnaireModelQuery'

// 更新问卷模版请求接口
export interface UpdateModelRequest {
  modelId: string
  questionsArray: string
  can_delete: number
  modelTitle: string
  modelDesc: string
}

// 更新问卷模版响应接口
export interface UpdateModelResponse {
  success: boolean
  message?: string
}

/**
 * 根据ID获取问卷模版详情
 * @param modelId 模版ID
 * @returns 模版详情
 */
export async function getQuestionnaireModelById(
  modelId: string,
): Promise<QuestionnaireModel | null> {
  try {
    console.log('Getting questionnaire model by ID:', modelId)

    const authToken = getCookie('authToken')
    if (!authToken) {
      throw new Error('未找到认证token')
    }

    // 使用 GET 请求到 /model/search/{id} 端点
    const response = await axios.get(`http://localhost:8081/model/search/${modelId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    console.log(`API response for model ${modelId}:`, response.data)

    if (response.data && response.data.modelId) {
      console.log('Questionnaire model found:', response.data)
      return response.data as QuestionnaireModel
    }

    console.warn(`No valid data returned for model ${modelId}`)
    return null
  } catch (error) {
    console.error('Error getting questionnaire model by ID:', error)
    // 不要重新抛出错误，返回 null 让调用者处理
    return null
  }
}

/**
 * 更新问卷模版
 * @param modelData 模版数据
 * @returns 操作结果
 */
export async function updateQuestionnaireModel(
  modelData: UpdateModelRequest,
): Promise<UpdateModelResponse> {
  try {
    console.log('Updating questionnaire model with data:', modelData)

    const authToken = getCookie('authToken')
    if (!authToken) {
      throw new Error('未找到认证token')
    }

    const response = await axios.post('http://localhost:8081/model/edit', modelData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      console.log('Questionnaire model updated successfully')
      return { success: true, message: '模版更新成功' }
    }

    console.error('Failed to update questionnaire model:', response)
    return { success: false, message: '更新失败，请稍后重试' }
  } catch (error) {
    console.error('Error updating questionnaire model:', error)
    return { success: false, message: '网络错误，请检查连接' }
  }
}
