import axios from 'axios'
import { getAuthToken } from '../utils/cookies'

// 后端API基础URL
const API_BASE_URL = 'http://localhost:8081'

// 用户数据类型（根据后端API响应）
export interface User {
  userId: string
  userEmail: string
  userName: string
  userPw: string
  userData: string
  role: string
  userStatus: string // 新增用户状态字段：'active' | 'frozen' | 'banned'
}

// 搜索用户响应类型
export interface UserSearchResponse {
  userId: string
  userEmail: string
  userName: string
  userPw: string
  userData: string
  role: string
  userStatus: string // 新增用户状态字段
}

/**
 * 获取管理员token
 * @returns admin token from cookie
 */
function getAdminToken(): string | null {
  return getAuthToken()
}

/**
 * 创建带有管理员认证的axios实例
 */
function createAuthenticatedRequest() {
  const token = getAdminToken()
  if (!token) {
    throw new Error('管理员token不存在，请重新登录')
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

/**
 * 获取所有用户列表
 * @returns Promise<User[]> 用户列表
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const token = getAdminToken()
    if (!token) {
      throw new Error('管理员token不存在，请重新登录')
    }

    const response = await axios.get(`${API_BASE_URL}/user/getAllUser/${token}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('获取用户列表响应:', response.data)

    if (response.data && Array.isArray(response.data)) {
      return response.data
    } else if (response.data && typeof response.data === 'object') {
      // 如果返回的是单个对象，转换为数组
      return [response.data]
    } else {
      console.error('获取用户列表失败:', response.data)
      return []
    }
  } catch (error) {
    console.error('获取用户列表出错:', error)
    throw new Error('获取用户列表失败，请检查网络连接或管理员权限')
  }
}

/**
 * 根据ID搜索用户
 * @param userId 用户ID
 * @returns Promise<UserSearchResponse | null> 用户信息
 */
export async function searchUserById(userId: string): Promise<UserSearchResponse | null> {
  try {
    const token = getAdminToken()
    if (!token) {
      throw new Error('管理员token不存在，请重新登录')
    }

    const response = await axios.get(`${API_BASE_URL}/user/search/${userId}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('搜索用户响应:', response.data)

    if (response.data && response.data !== 'fail') {
      return response.data
    } else {
      console.log('用户不存在或搜索失败')
      return null
    }
  } catch (error) {
    console.error('搜索用户出错:', error)
    throw new Error('搜索用户失败，请检查网络连接')
  }
}

/**
 * 编辑用户信息
 * @param user 用户信息
 * @returns Promise<boolean> 是否成功
 */
export async function editUser(user: User): Promise<boolean> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/edit`,
      {
        userId: user.userId,
        userEmail: user.userEmail,
        userName: user.userName,
        userPw: user.userPw,
        userData: user.userData,
        role: user.role,
        userStatus: user.userStatus,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('编辑用户响应:', response.data)

    if (response.data && response.data !== 'fail') {
      console.log('用户信息更新成功')
      return true
    } else {
      console.log('用户信息更新失败')
      return false
    }
  } catch (error) {
    console.error('编辑用户出错:', error)
    throw new Error('编辑用户失败，请检查网络连接')
  }
}

/**
 * 注册新用户
 * @param userName 用户名
 * @param userEmail 用户邮箱
 * @param userPassword 用户密码
 * @returns Promise<boolean> 是否成功
 */
export async function registerUser(
  userName: string,
  userEmail: string,
  userPassword: string,
): Promise<boolean> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/register`,
      {
        userName: userName,
        userEmail: userEmail,
        userPw: userPassword,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('注册用户响应:', response.data)

    if (response.data && response.data !== 'fail') {
      console.log('用户注册成功')
      return true
    } else {
      console.log('用户注册失败')
      return false
    }
  } catch (error) {
    console.error('注册用户出错:', error)
    throw new Error('注册用户失败，请检查网络连接')
  }
}

/**
 * 删除用户
 * @param userId 用户ID
 * @returns Promise<boolean> 是否成功
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/user/delete/${userId}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('删除用户响应:', response.data)

    if (response.status === 200 && response.data === true) {
      console.log('用户删除成功')
      return true
    } else {
      console.log('用户删除失败')
      return false
    }
  } catch (error) {
    console.error('删除用户出错:', error)
    throw new Error('删除用户失败，请检查网络连接')
  }
}
