// Token管理工具

const TOKEN_KEY = 'traffic_sim_token';
const USER_INFO_KEY = 'traffic_sim_user_info';

interface UserInfo {
  id: number;
  username: string;
  role: string;
  roleId: number;
}

// 设置token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// 获取token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// 删除token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// 设置用户信息
export function setUserInfo(userInfo: UserInfo): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

// 获取用户信息
export function getUserInfo(): UserInfo | null {
  const userInfoStr = localStorage.getItem(USER_INFO_KEY);
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      return null;
    }
  }
  return null;
}

// 删除用户信息
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY);
}

// 清除所有认证信息
export function clearAuthInfo(): void {
  removeToken();
  removeUserInfo();
}

// 检查是否已登录
export function isLoggedIn(): boolean {
  return !!getToken();
}