import axios from "axios";
import { getToken } from "./Auth";

const instance = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "http://127.0.0.1:3822/",
  timeout: 50000,
  withCredentials: true,  //允许发送cookie
});

instance.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    // 处理401未授权错误
    if (err.response && err.response.status === 401) {
      // 清除本地认证信息
      import("./Auth").then(({ clearAuthInfo }) => {
        clearAuthInfo();
      });
      // 跳转到登录页面
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default instance;
