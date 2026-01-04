// Token管理工具

const TOKEN_KEY = 'traffic_sim_token';
const USER_INFO_KEY = 'traffic_sim_user_info';

interface UserInfo {
  id: number;
  username: string;
  role: string;
  roleId: number;
}

// 开发环境模拟数据
const DEV_TOKEN = 'dev_token_123456';
const DEV_USER_INFO: UserInfo = {
  id: 1,
  username: 'dev_user',
  role: 'admin',
  roleId: 1
};

// 设置token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// 获取token
export function getToken(): string | null {
  // 开发环境下自动生成模拟token
  if (import.meta.env.DEV) {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setToken(DEV_TOKEN);
      return DEV_TOKEN;
    }
    return storedToken;
  }
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
  // 开发环境下自动生成模拟用户信息
  if (import.meta.env.DEV) {
    const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
    if (!storedUserInfo) {
      setUserInfo(DEV_USER_INFO);
      return DEV_USER_INFO;
    }
    try {
      return JSON.parse(storedUserInfo);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      setUserInfo(DEV_USER_INFO);
      return DEV_USER_INFO;
    }
  }
  
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
  // 开发环境下始终返回已登录
  if (import.meta.env.DEV) {
    return true;
  }
  return !!getToken();
}