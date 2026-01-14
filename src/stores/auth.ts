import { defineStore } from 'pinia';
import { login as loginApi, logout, getUserInfo } from '@/apis/AuthApi';
import { setToken, getToken, removeToken, setUserInfo, getUserInfo as getLocalUserInfo, removeUserInfo } from '@/mods/Auth';

// 导入@/mods/Auth中的UserInfo类型
type UserInfo = ReturnType<typeof getLocalUserInfo>;

interface AuthState {
  token: string | null;
  userInfo: UserInfo;
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
    hasRole: (state) => (role: Number) => state.userInfo?.roleId === role,
    hasPermission: (state) => (permission: string) => state.permissions.includes(permission)
  },

  actions: {
    // 登录
    async login(username: string, password: string) {
      this.loading = true;
      try {
        // 正常登录流程
        const response = await loginApi({ username, password });
        if (response.success && response.data) {
          const { accessToken, user } = response.data;
          // 转换为符合@/mods/Auth.UserInfo格式的数据
          const userInfo = {
            id: user.id,
            username: user.username,
            role: user.roleName,
            roleId: user.roleId
          };
          this.token = accessToken;
          this.userInfo = userInfo;
          this.roles = [user.roleId.toString()];
          // 存储到本地
          setToken(accessToken);
          setUserInfo(userInfo);
          return true;
        } else {
          throw new Error(response.msg || '登录失败');
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
      if (!this.token) {
        throw new Error('No token found');
      }
      
      try {
        const response = await getUserInfo();
        if (response.success && response.data) {
          // 转换为符合@/mods/Auth.UserInfo格式的数据
          const userInfo = {
            id: response.data.id,
            username: response.data.username,
            role: response.data.roleName,
            roleId: response.data.roleId
          };
          this.userInfo = userInfo;
          this.roles = [userInfo.role];
          return userInfo;
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