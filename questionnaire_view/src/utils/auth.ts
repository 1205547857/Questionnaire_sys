/**
 * 获取带有认证头的 axios 配置
 * 用于需要认证的 API 请求
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
  return {}
}

/**
 * 检查用户是否已认证
 * 可用于路由守卫等场景
 */
export function checkAuth(): boolean {
  return isAuthenticated()
}

/**
 * 强制登出用户（清除 token）
 * 可用于 token 过期或安全相关场景
 */
export function forceLogout(): void {
  clearAuthToken()
  // 这里可以添加重定向到登录页面的逻辑
  console.log('User has been logged out due to security reasons')
}

/**
 * 示例：为 axios 请求添加认证头
 */
export async function authenticatedRequest(url: string, data?: unknown): Promise<unknown> {
  const authHeaders = getAuthHeaders()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      // Token 可能已过期
      forceLogout()
      throw new Error('Authentication failed')
    }

    return response.json()
  } catch (error) {
    console.error('Authenticated request failed:', error)
    throw error
  }
}
