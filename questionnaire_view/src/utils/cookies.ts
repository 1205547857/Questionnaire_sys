/**
 * Cookie 工具函数
 * 提供设置、获取、删除 cookie 的功能
 */

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param days 过期天数，默认7天
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

/**
 * 获取 Cookie 值
 * @param name Cookie 名称
 * @returns Cookie 值或 null
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
    }
  }
  return null
}

/**
 * 删除 Cookie
 * @param name Cookie 名称
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

/**
 * 检查 Cookie 是否存在
 * @param name Cookie 名称
 * @returns 是否存在
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}

/**
 * 获取认证 Token
 * @returns Token 值或 null
 */
export function getAuthToken(): string | null {
  return getCookie('authToken')
}

/**
 * 设置认证 Token
 * @param token Token 值
 * @param days 过期天数，默认7天
 */
export function setAuthToken(token: string, days: number = 7): void {
  setCookie('authToken', token, days)
}

/**
 * 清除认证 Token
 */
export function clearAuthToken(): void {
  deleteCookie('authToken')
}

/**
 * 检查是否已认证（Token 是否存在）
 * @returns 是否已认证
 */
export function isAuthenticated(): boolean {
  return hasCookie('authToken')
}
