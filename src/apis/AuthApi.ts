import request from '@/mods/Axios';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  institution: string;
}

interface LoginResponse {
  success: boolean;
  msg: string;
  data?: {
    accessToken: string;
    user: {
      id: number;
      username: string;
      roleName: string;
      roleId: number;
    };
  };
}

interface RegisterResponse {
  success: boolean;
  msg: string;
}

interface UserInfoResponse {
  success: boolean;
  data?: {
    id: number;
    username: string;
    roleName: string;
    roleId: number;
  };
}

export function login(params: LoginParams): Promise<LoginResponse> {
  return request.post('/auth/login', params)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Login error:', error);
      return { success: false, msg: error.message || '登录失败' };
    });
}

export function logout(): Promise<{ success: boolean }> {
  return request.post('/auth/logout')
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

export function register(params: RegisterParams): Promise<boolean> {
  return request.post('/auth/register', params)
    .then((response) => {
      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.msg || '注册失败');
      }
    })
    .catch((error) => {
      console.error('Register error:', error);
      throw error;
    });
}