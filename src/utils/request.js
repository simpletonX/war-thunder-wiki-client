import axios from "axios";
import { useTreeDataStore } from "@/stores/tree_data_store";

const request = axios.create({
  baseURL: "/",
  timeout: 20000,
});

request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("❌ 请求发送失败:", error);
    const treeDataStore = useTreeDataStore();
    treeDataStore.loading.hide();
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (!res.success) {
      console.warn("⚠️ 接口返回错误:", res.error || "未知错误");
      const treeDataStore = useTreeDataStore();
      treeDataStore.loading.hide();
    }
    return res;
  },
  (error) => {
    console.error("❌ 响应错误:", error);
    const treeDataStore = useTreeDataStore();
    treeDataStore.loading.hide();
    return Promise.reject(error);
  }
);

export default request;
