import axios from 'axios'
import { useUserStore } from '../stores/userStore'
import { setAuthToken, getAuthToken, clearAuthToken } from '../utils/cookies'

// 类型定义
interface TokenValidationResponse {
  userId: string
  userName: string
  userEmail: string
  role?: string
  userData?: string
  token?: string
}
async function login(userEmail: string, userPassword: string) {
  return await axios
    .post('http://localhost:8081/user/login', {
      userEmail: userEmail,
      userPw: userPassword,
    })
    .then((response) => {
      console.log('request successful:', response)
      if (response.data != 'fail') {
        console.log('Login successful')

        // 保存 token 到 cookie（7天过期）
        if (response.data.token) {
          setAuthToken(response.data.token, 7)
          console.log('Token saved to cookie:', response.data.token)
        }

        // 从后端响应中获取角色信息，如果没有则默认为 'user'
        const userRole = (response.data.role as 'user' | 'admin') || 'user'
        console.log('User role:', userRole)

        useUserStore().login(
          response.data.userId,
          response.data.userName,
          response.data.userEmail,
          userRole,
          response.data.userData,
        )

        return true
      } else {
        console.log('Login failed')
        return false
      }
    })
    .catch((Error) => {
      console.error('Error:', Error)
      return false
    })
}

/**
 * 验证 Token 是否有效
 * @param token 要验证的 token
 * @returns Promise<LoginResponse | null> 返回用户信息或 null
 */
async function checkTokenValidity(token: string): Promise<TokenValidationResponse | null> {
  try {
    console.log('Checking token validity:', token)
    const response = await axios.get(`http://localhost:8081/user/tokenCheck/${token}`)

    console.log('Token check response:', response)

    if (response.status === 200 && response.data && response.data !== 'fail') {
      console.log('Token is valid, user info:', response.data)
      return response.data
    } else {
      console.log('Token is invalid or expired')
      return null
    }
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}

/**
 * 自动登录（基于保存的 Token）
 * @returns Promise<boolean> 是否成功自动登录
 */
async function autoLogin(): Promise<boolean> {
  try {
    const token = getAuthToken()

    if (!token) {
      console.log('No auth token found in cookies')
      return false
    }

    console.log('Found auth token, validating...', token)

    // 检查是否为管理员测试 token
    if (token.startsWith('admin_test_token_')) {
      console.log('Admin test token detected, using stored user info')
      const userStore = useUserStore()

      // 如果 userStore 已经有管理员信息，直接返回成功
      if (userStore.isLoggedIn && userStore.role === 'admin') {
        console.log('Admin test user already logged in')
        return true
      }

      // 否则重新设置管理员测试用户信息
      userStore.login(
        'admin001',
        'admin',
        'admin@questionnaire.com',
        'admin',
        '{"questionnaire_ids":[], "question_ids":[], "QuestionnaireModel_ids":[]}',
      )
      console.log('Admin test user logged in successfully')
      return true
    }

    const userData = await checkTokenValidity(token)

    if (userData) {
      // Token 有效，自动登录
      console.log('Auto login successful with user data:', userData)

      const userStore = useUserStore()
      userStore.login(
        userData.userId,
        userData.userName,
        userData.userEmail,
        (userData.role as 'user' | 'admin') || 'user',
        userData.userData || '{}',
      )

      // 更新 token（延长过期时间）
      if (userData.token) {
        setAuthToken(userData.token, 7)
        console.log('Token refreshed')
      }

      return true
    } else {
      // Token 无效，清除 cookie
      console.log('Token invalid, clearing cookie')
      clearAuthToken()
      return false
    }
  } catch (error) {
    console.error('Auto login failed:', error)
    clearAuthToken()
    return false
  }
}

export { login, checkTokenValidity, autoLogin }
