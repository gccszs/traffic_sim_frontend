import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "http://127.0.0.1:3822/",
  timeout: 50000,
  withCredentials: true,  //允许发送cookie
});

instance.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    return config;
  },
  (error) => {
    // Do something before request is sent
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response; //这里的response就是请求成功后的res , response.data即是请求成功后回调函数内的参数res.data
  },
  (err) => {
    return Promise.reject(err); //将错误消息挂到promise的失败函数上
  }
);

export default instance;
