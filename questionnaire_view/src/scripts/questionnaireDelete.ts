import axios from 'axios'
import { getCookie } from '@/utils/cookies'

// 删除问卷响应接口
export interface DeleteQuestionnaireResponse {
  success: boolean
  message?: string
}

/**
 * 删除问卷（统一调用后端API处理所有删除逻辑）
 * @param questionnaireId 问卷ID
 * @returns Promise<DeleteQuestionnaireResponse> 删除结果
 */
export async function deleteQuestionnaire(
  questionnaireId: string,
): Promise<DeleteQuestionnaireResponse> {
  try {
    console.log('Deleting questionnaire (backend handles all logic):', questionnaireId)

    const authToken = getCookie('authToken')
    if (!authToken) {
      throw new Error('未找到认证token')
    }

    const response = await axios.delete(
      `http://localhost:8081/questionnaire/delete/${questionnaireId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Delete questionnaire response:', response)

    if (response.status === 200) {
      console.log('Questionnaire deleted successfully')
      return {
        success: true,
        message: '问卷删除成功',
      }
    } else {
      console.error('Failed to delete questionnaire:', response)
      return {
        success: false,
        message: '删除失败，请稍后重试',
      }
    }
  } catch (error: unknown) {
    console.error('Error deleting questionnaire:', error)

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || '服务器错误'
      return {
        success: false,
        message: `删除失败: ${errorMessage}`,
      }
    } else if (error instanceof Error) {
      return {
        success: false,
        message: `删除失败: ${error.message}`,
      }
    } else {
      return {
        success: false,
        message: '删除失败: 未知错误',
      }
    }
  }
}
