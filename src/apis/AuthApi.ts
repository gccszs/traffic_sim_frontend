import request from '@/mods/Axios';

interface LoginParams {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    userInfo: {
      id: number;
      username: string;
      role: string;
      roleId: number;
    };
  };
}

interface UserInfoResponse {
  success: boolean;
  data?: {
    id: number;
    username: string;
    role: string;
    roleId: number;
  };
}

export function login(params: LoginParams): Promise<LoginResponse> {
  return request.post('/login', params)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Login error:', error);
      return { success: false, message: error.message || '登录失败' };
    });
}

export function logout(): Promise<{ success: boolean }> {
  return request.post('/logout')
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Logout error:', error);
      return { success: false };
    });
}

export function getUserInfo(): Promise<UserInfoResponse> {
  return request.get('/user/info')
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Get user info error:', error);
      return { success: false };
    });
}