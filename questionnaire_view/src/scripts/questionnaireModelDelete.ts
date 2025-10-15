import axios from 'axios'
import { getCookie } from '@/utils/cookies'

// 删除问卷模版响应接口
export interface DeleteModelResponse {
  success: boolean
  message?: string
}

// 删除问卷模版（统一调用后端API处理所有删除逻辑）
export async function deleteQuestionnaireModel(modelId: string): Promise<DeleteModelResponse> {
  try {
    console.log('Deleting questionnaire model (backend handles all logic):', modelId)

    const authToken = getCookie('authToken')
    if (!authToken) {
      throw new Error('未找到认证token')
    }

    // 使用DELETE方法，与其他删除API保持一致
    const response = await axios.delete(`http://localhost:8081/model/delete/${modelId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Delete model response:', response)

    if (response.status === 200) {
      return {
        success: true,
        message: '模版删除成功',
      }
    } else {
      return {
        success: false,
        message: '删除操作失败',
      }
    }
  } catch (error) {
    console.error('删除问卷模版失败:', error)

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || '服务器错误'
      return {
        success: false,
        message: `删除失败: ${errorMessage}`,
      }
    }

    return {
      success: false,
      message: '删除操作失败，请稍后重试',
    }
  }
}
