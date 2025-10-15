import axios from 'axios'
import { getCookie } from '@/utils/cookies'
import type { Questionnaire } from './questionnaireCreate'

// 重新导出Questionnaire类型以供其他模块使用
export type { Questionnaire } from './questionnaireCreate'

/**
 * 根据问卷ID查询单个问卷详情
 * @param id 问卷ID
 * @returns Promise<Questionnaire | null> 问卷详情或null
 */
async function getQuestionnaireById(id: string): Promise<Questionnaire | null> {
  try {
    console.log('Fetching questionnaire by ID:', id)

    const authToken = getCookie('access_token')
    const response = await axios.get(`http://localhost:8081/questionnaire/search/${id}`, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })

    console.log('Questionnaire fetch response:', response)

    if (response.status === 200 && response.data && response.data !== 'fail') {
      console.log('Questionnaire fetched successfully:', response.data)
      return response.data as Questionnaire
    } else {
      console.log('Questionnaire not found or failed to fetch')
      return null
    }
  } catch (error) {
    console.error('Error fetching questionnaire:', error)
    return null
  }
}

/**
 * 批量查询多个问卷详情
 * @param ids 问卷ID数组
 * @returns Promise<Questionnaire[]> 成功查询到的问卷列表
 */
async function getQuestionnairesByIds(ids: string[]): Promise<Questionnaire[]> {
  if (!ids || ids.length === 0) {
    return []
  }

  console.log('Fetching multiple questionnaires by IDs:', ids)

  try {
    // 并行查询所有问卷
    const promises = ids.map((id) => getQuestionnaireById(id))
    const results = await Promise.all(promises)

    // 过滤掉查询失败的问卷（null值）
    const validQuestionnaires = results.filter(
      (questionnaire) => questionnaire !== null,
    ) as Questionnaire[]

    console.log(
      `Successfully fetched ${validQuestionnaires.length} out of ${ids.length} questionnaires`,
    )
    return validQuestionnaires
  } catch (error) {
    console.error('Error fetching multiple questionnaires:', error)
    return []
  }
}

/**
 * 获取问卷状态的显示名称
 * @param statusJson 问卷状态JSON字符串
 * @returns string 显示名称
 */
function getQuestionnaireStatusDisplay(statusJson: string): string {
  try {
    const status = JSON.parse(statusJson)
    if (status.active) {
      return '启用中'
    } else {
      return '草稿'
    }
  } catch (error) {
    console.warn('Failed to parse questionnaire status:', statusJson, error)
    return '未知状态'
  }
}

/**
 * 获取问卷状态的图标
 * @param statusJson 问卷状态JSON字符串
 * @returns string 图标类名
 */
function getQuestionnaireStatusIcon(statusJson: string): string {
  try {
    const status = JSON.parse(statusJson)
    if (status.active) {
      return 'fas fa-play-circle' // 启用状态
    } else {
      return 'fas fa-pause-circle' // 草稿状态
    }
  } catch {
    return 'fas fa-question-circle' // 未知状态
  }
}

/**
 * 获取问卷状态的样式类
 * @param statusJson 问卷状态JSON字符串
 * @returns string 样式类名
 */
function getQuestionnaireStatusClass(statusJson: string): string {
  try {
    const status = JSON.parse(statusJson)
    if (status.active) {
      return 'status-active'
    } else {
      return 'status-draft'
    }
  } catch {
    return 'status-unknown'
  }
}

/**
 * 检查问卷是否为活跃状态
 * @param statusJson 问卷状态JSON字符串
 * @returns boolean 是否为活跃状态
 */
function isQuestionnaireActive(statusJson: string): boolean {
  try {
    const status = JSON.parse(statusJson)
    return status.active === true
  } catch (error) {
    console.warn('Failed to parse questionnaire status:', statusJson, error)
    return false
  }
}

export {
  getQuestionnaireById,
  getQuestionnairesByIds,
  getQuestionnaireStatusDisplay,
  getQuestionnaireStatusIcon,
  getQuestionnaireStatusClass,
  isQuestionnaireActive,
}
