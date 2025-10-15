// 问卷编辑相关API
import axios from 'axios'
import { getCookie } from '@/utils/cookies'
import type { UpdateQuestionnaireRequest } from '@/scripts/questionnaireCreate'

// 更新问卷响应接口
export interface UpdateQuestionnaireResponse {
  success: boolean
  message?: string
}

/**
 * 更新问卷信息
 * @param questionnaireData 问卷数据
 * @returns 操作结果
 */
export async function updateQuestionnaire(
  questionnaireData: UpdateQuestionnaireRequest,
): Promise<UpdateQuestionnaireResponse> {
  try {
    console.log('Updating questionnaire with data:', questionnaireData)

    // 获取用户认证token
    const token = getCookie('access_token')

    const response = await axios.post(
      'http://localhost:8081/questionnaire/edit',
      questionnaireData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )

    console.log('Update questionnaire API response:', response)

    if (response.status === 200) {
      console.log('Questionnaire updated successfully')
      return { success: true, message: '问卷更新成功' }
    } else {
      console.error('Failed to update questionnaire:', response)
      return { success: false, message: '更新失败，请稍后重试' }
    }
  } catch (error: unknown) {
    console.error('Error updating questionnaire:', error)

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || '服务器错误'
      return { success: false, message: `问卷更新失败: ${errorMessage}` }
    } else if (error instanceof Error) {
      return { success: false, message: `问卷更新失败: ${error.message}` }
    } else {
      return { success: false, message: '问卷更新失败: 未知错误' }
    }
  }
}
