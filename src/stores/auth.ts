import { defineStore } from 'pinia';
import { login, logout, getUserInfo } from '@/apis/AuthApi';
import { setToken, getToken, removeToken, setUserInfo, getUserInfo as getLocalUserInfo, removeUserInfo } from '@/mods/Auth';

interface UserInfo {
  id: number;
  username: string;
  role: string;
  roleId: number;
}

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: getToken(),
    userInfo: getLocalUserInfo(),
    roles: [],
    permissions: [],
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRole: (state) => (role: string) => state.roles.includes(role),
    hasPermission: (state) => (permission: string) => state.permissions.includes(permission)
  },

  actions: {
    // 初始化状态（用于开发环境）
    initDevState() {
      if (import.meta.env.DEV) {
        const token = getToken();
        const userInfo = getLocalUserInfo();
        if (token && userInfo) {
          this.token = token;
          this.userInfo = userInfo;
          this.roles = [userInfo.role];
        }
      }
    },

    // 登录
    async login(username: string, password: string) {
      this.loading = true;
      try {
        const response = await login({ username, password });
        if (response.success && response.data) {
          const { token, userInfo } = response.data;
          this.token = token;
          this.userInfo = userInfo;
          this.roles = [userInfo.role];
          // 存储到本地
          setToken(token);
          setUserInfo(userInfo);
          return true;
        } else {
          throw new Error(response.message || '登录失败');
        }
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 登出
    async logout() {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        this.resetState();
      }
    },

    // 重置状态
    resetState() {
      this.token = null;
      this.userInfo = null;
      this.roles = [];
      this.permissions = [];
      // 清除本地存储
      removeToken();
      removeUserInfo();
    },

    // 获取用户信息
    async getInfo() {
      // 开发环境下直接使用本地模拟数据
      if (import.meta.env.DEV) {
        const userInfo = getLocalUserInfo();
        if (userInfo) {
          this.userInfo = userInfo;
          this.roles = [userInfo.role];
          return userInfo;
        }
      }
      
      if (!this.token) {
        throw new Error('No token found');
      }
      
      try {
        const response = await getUserInfo();
        if (response.success && response.data) {
          this.userInfo = response.data;
          this.roles = [response.data.role];
          return response.data;
        } else {
          throw new Error('获取用户信息失败');
        }
      } catch (error) {
        console.error('Get user info failed:', error);
        this.resetState();
        throw error;
      }
    }
  }
});