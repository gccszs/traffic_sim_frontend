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
  res: string;
  msg: string;
  data: string | null;
  timestamp: number;
  success: boolean;
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

interface UserProfile {
  success: boolean;
  data?: {
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    institution: string;
    roleName: string;
    roleId: number;
    createdAt?: string;
    updatedAt?: string;
  };
  msg?: string;
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

export function register(params: RegisterParams): Promise<RegisterResponse> {
  return request.post('/auth/register', params)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Register error:', error);
      return {
        res: 'ERR_UNKNOWN',
        msg: error.message || '注册失败',
        data: null,
        timestamp: Date.now(),
        success: false
      };
    });
}

// 获取用户个人数据
export function getUserProfile(id: number): Promise<UserProfile> {
  return request.get(`/user/${id}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Get user profile error:', error);
      return {
        success: false,
        msg: error.message || '获取用户个人数据失败'
      };
    });
}