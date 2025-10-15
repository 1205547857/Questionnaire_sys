// 问卷创建相关API
export interface CreateQuestionnaireResponse {
  questionnaireId: string
  questionnaireStatus: string // JSON字符串格式
  modelId: string
  questionnaireTitle: string
  canDelete?: number // 可选字段
}

import axios from 'axios'
import { getCookie } from '@/utils/cookies'

// 问卷状态接口
export interface QuestionnaireStatus {
  active: boolean
  createdData: number // Timestamp 时间戳
  startDate: number | null // Timestamp 时间戳
  endDate: number | null // Timestamp 时间戳
}

// 问卷数据接口
export interface Questionnaire {
  questionnaireId: string
  questionnaireStatus: string // JSON字符串格式
  modelId: string
  questionnaireTitle: string
  canDelete: number
}

// 创建问卷请求接口
export interface CreateQuestionnaireRequest {
  questionnaireStatus: string // JSON字符串格式
  modelId: string
  questionnaireTitle: string
  canDelete?: number // 可选字段，后端会使用默认值
}

// 创建问卷响应接口
export interface CreateQuestionnaireResponse {
  questionnaireId: string
}

// 更新问卷请求接口
export interface UpdateQuestionnaireRequest {
  questionnaireId: string
  questionnaireStatus: string // JSON字符串格式
  modelId: string
  questionnaireTitle: string
  canDelete?: number // 可选字段，后端会使用默认值
}

// 创建问卷
export async function createQuestionnaire(
  questionnaireData: CreateQuestionnaireRequest,
): Promise<CreateQuestionnaireResponse> {
  console.log('Creating questionnaire with data:', questionnaireData)

  try {
    // 获取用户认证token
    const token = getCookie('access_token')

    const response = await axios.post(
      'http://localhost:8081/questionnaire/create',
      questionnaireData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )

    console.log('Questionnaire API response:', response)

    if (response.status === 200 && response.data) {
      console.log('Questionnaire created successfully:', response.data)
      return response.data as CreateQuestionnaireResponse
    } else {
      console.error('Failed to create questionnaire:', response)
      throw new Error(`问卷创建失败: ${response.data || '服务器响应异常'}`)
    }
  } catch (error: unknown) {
    console.error('Error creating questionnaire:', error)

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || '服务器错误'
      throw new Error(`问卷创建失败: ${errorMessage}`)
    } else if (error instanceof Error) {
      throw new Error(`问卷创建失败: ${error.message}`)
    } else {
      throw new Error('问卷创建失败: 未知错误')
    }
  }
}

// 创建问卷状态对象的工具函数
export function createQuestionnaireStatus(
  active: boolean,
  startDate?: Date | null,
  endDate?: Date | null,
): QuestionnaireStatus {
  return {
    active,
    createdData: Date.now(), // 当前时间戳
    startDate: startDate ? startDate.getTime() : null,
    endDate: endDate ? endDate.getTime() : null,
  }
}

// 预定义的常用状态创建函数
export function createDraftStatus(): QuestionnaireStatus {
  return createQuestionnaireStatus(false) // 草稿状态，未启用
}

export function createActiveStatus(startDate?: Date, endDate?: Date): QuestionnaireStatus {
  return createQuestionnaireStatus(true, startDate, endDate) // 启用状态
}

export function createPausedStatus(): QuestionnaireStatus {
  return createQuestionnaireStatus(false) // 暂停状态，设为未启用
}

// JSON序列化工具函数
export function serializeQuestionnaireStatus(status: QuestionnaireStatus): string {
  return JSON.stringify(status)
}

// JSON反序列化工具函数
export function deserializeQuestionnaireStatus(statusJson: string): QuestionnaireStatus {
  try {
    return JSON.parse(statusJson) as QuestionnaireStatus
  } catch (error) {
    console.error('Failed to parse questionnaire status JSON:', statusJson, error)
    // 返回默认的草稿状态
    return createDraftStatus()
  }
}

// 从状态对象创建 JSON 字符串的便捷函数
export function createDraftStatusJson(): string {
  return serializeQuestionnaireStatus(createDraftStatus())
}

export function createActiveStatusJson(startDate?: Date, endDate?: Date): string {
  return serializeQuestionnaireStatus(createActiveStatus(startDate, endDate))
}

export function createPausedStatusJson(): string {
  return serializeQuestionnaireStatus(createPausedStatus())
}

// Timestamp 转换工具函数
export function timestampToDate(timestamp: number | null): Date | null {
  return timestamp ? new Date(timestamp) : null
}

export function timestampToISOString(timestamp: number | null): string | null {
  return timestamp ? new Date(timestamp).toISOString() : null
}

export function dateToTimestamp(date: Date | null): number | null {
  return date ? date.getTime() : null
}

// 从ISO字符串创建带时间戳的状态对象
export function createQuestionnaireStatusFromISO(
  active: boolean,
  startDateISO?: string | null,
  endDateISO?: string | null,
): QuestionnaireStatus {
  const startDate = startDateISO ? new Date(startDateISO) : null
  const endDate = endDateISO ? new Date(endDateISO) : null
  return createQuestionnaireStatus(active, startDate, endDate)
}

// 获取状态对象的可读时间信息
export function getStatusDateInfo(status: QuestionnaireStatus) {
  return {
    createdAt: timestampToDate(status.createdData),
    startAt: timestampToDate(status.startDate),
    endAt: timestampToDate(status.endDate),
    createdISO: timestampToISOString(status.createdData),
    startISO: timestampToISOString(status.startDate),
    endISO: timestampToISOString(status.endDate),
  }
}
