import { defineStore } from 'pinia'
import { updateUserInfo } from '@/scripts/userUpdate'
import { clearAuthToken } from '@/utils/cookies'

// 用户数据接口，对应后台 UserData 实体类
interface UserData {
  questionnaire_ids: string[]
  question_ids: string[]
  QuestionnaireModel_ids: string[]
}

interface UserState {
  isLoggedIn: boolean
  userId: string
  username: string
  email: string
  role: 'guest' | 'user' | 'admin'
  userData: UserData
  _syncTimer: number | null // 防抖定时器
  _isSyncing: boolean // 是否正在同步中
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userId: '',
    username: '',
    email: '',
    role: 'guest',
    userData: {
      questionnaire_ids: [],
      question_ids: [],
      QuestionnaireModel_ids: [],
    },
    _syncTimer: null,
    _isSyncing: false,
  }),
  actions: {
    login(
      userId: string,
      username: string,
      email: string,
      role: 'user' | 'admin',
      userData: string, // 接收 JSON 字符串
    ) {
      this.isLoggedIn = true
      this.userId = userId
      this.username = username
      this.email = email
      this.role = role
      this.userData = this.parseUserData(userData)
    },
    logout() {
      this.isLoggedIn = false
      this.userId = ''
      this.username = ''
      this.email = ''
      this.role = 'guest'
      this.userData = {
        questionnaire_ids: [],
        question_ids: [],
        QuestionnaireModel_ids: [],
      }
      // 清理同步定时器
      if (this._syncTimer) {
        clearTimeout(this._syncTimer)
        this._syncTimer = null
      }
      this._isSyncing = false

      // 清除认证 token cookie
      clearAuthToken()
      console.log('Auth token cleared from cookie')
    },
    setRole(role: 'guest' | 'user' | 'admin') {
      this.role = role
    },

    // 解析 JSON 字符串为 UserData 对象
    parseUserData(jsonString: string): UserData {
      try {
        const parsed = JSON.parse(jsonString)
        return {
          questionnaire_ids: parsed.questionnaire_ids || [],
          question_ids: parsed.question_ids || [],
          QuestionnaireModel_ids: parsed.QuestionnaireModel_ids || [],
        }
      } catch (error) {
        console.error('解析 userData JSON 失败:', error)
        return {
          questionnaire_ids: [],
          question_ids: [],
          QuestionnaireModel_ids: [],
        }
      }
    },

    // 将 UserData 对象转换为 JSON 字符串
    stringifyUserData(): string {
      return JSON.stringify(this.userData)
    },

    // 防抖同步用户数据到后端
    _debouncedSync() {
      if (!this.isLoggedIn || this._isSyncing) return

      if (this._syncTimer) {
        clearTimeout(this._syncTimer)
      }

      this._syncTimer = window.setTimeout(async () => {
        this._isSyncing = true
        try {
          const success = await updateUserInfo(
            this.userId,
            this.email,
            this.username,
            '', // 密码为空，表示不更新密码
            this.stringifyUserData(),
          )

          if (success) {
            console.log('用户数据同步成功')
          } else {
            console.warn('用户数据同步失败')
          }
        } catch (error) {
          console.error('同步用户数据时发生错误:', error)
        } finally {
          this._isSyncing = false
          this._syncTimer = null
        }
      }, 1000) // 1秒防抖延迟
    },

    // 添加问卷 ID
    addQuestionnaireId(id: string) {
      if (!this.userData.questionnaire_ids.includes(id)) {
        this.userData.questionnaire_ids.push(id)
        this._debouncedSync()
      }
    },

    // 移除问卷 ID
    removeQuestionnaireId(id: string) {
      const index = this.userData.questionnaire_ids.indexOf(id)
      if (index > -1) {
        this.userData.questionnaire_ids.splice(index, 1)
        this._debouncedSync()
      }
    },

    // 添加问题 ID
    addQuestionId(id: string) {
      if (!this.userData.question_ids.includes(id)) {
        this.userData.question_ids.push(id)
        this._debouncedSync()
      }
    },

    // 移除问题 ID
    removeQuestionId(id: string) {
      const index = this.userData.question_ids.indexOf(id)
      if (index > -1) {
        this.userData.question_ids.splice(index, 1)
        this._debouncedSync()
      }
    },

    // 更新问题 ID（替换旧ID为新ID）
    updateQuestionId(oldId: string, newId: string) {
      const index = this.userData.question_ids.indexOf(oldId)
      if (index > -1) {
        this.userData.question_ids[index] = newId
        this._debouncedSync()
        console.log(`Updated question ID: ${oldId} -> ${newId}`)
      } else {
        // 如果旧ID不存在，直接添加新ID
        this.addQuestionId(newId)
        console.log(`Added new question ID: ${newId} (old ID ${oldId} not found)`)
      }
    },

    // 添加问卷模板 ID
    addQuestionnaireModelId(id: string) {
      if (!this.userData.QuestionnaireModel_ids.includes(id)) {
        this.userData.QuestionnaireModel_ids.push(id)
        this._debouncedSync()
      }
    },

    // 移除问卷模板 ID
    removeQuestionnaireModelId(id: string) {
      const index = this.userData.QuestionnaireModel_ids.indexOf(id)
      if (index > -1) {
        this.userData.QuestionnaireModel_ids.splice(index, 1)
        this._debouncedSync()
      }
    },

    // 更新问卷模板 ID（替换旧ID为新ID）
    updateQuestionnaireModelId(oldId: string, newId: string) {
      const index = this.userData.QuestionnaireModel_ids.indexOf(oldId)
      if (index > -1) {
        this.userData.QuestionnaireModel_ids[index] = newId
        this._debouncedSync()
        console.log(`Updated questionnaire model ID: ${oldId} -> ${newId}`)
      } else {
        // 如果旧ID不存在，直接添加新ID
        this.addQuestionnaireModelId(newId)
        console.log(`Added new questionnaire model ID: ${newId} (old ID ${oldId} not found)`)
      }
    },

    // 手动触发同步
    syncUserData() {
      this._debouncedSync()
    },
  },
})
