import axios from "axios";

const request = axios.create({
  baseURL: "/",
  timeout: 20000,
});

request.interceptors.request.use(
  (config) => {
    // console.log(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ 请求发送失败:", error);
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (!res.success) {
      console.warn("⚠️ 接口返回错误:", res.error || "未知错误");
    }
    return res;
  },
  (error) => {
    console.error("❌ 响应错误:", error);
    return Promise.reject(error);
  }
);

export default request;
