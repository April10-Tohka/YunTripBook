// 专门用于调用携程api的axios实例
import axios from "axios";
const ctripApiService = axios.create({
    baseURL: "https://m.ctrip.com",
    timeout: 5000,
    headers: {
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        "Content-Type": "application/json",
        Accept: "*/*",
        Host: "m.ctrip.com",
        Connection: "keep-alive",
    },
});

// 添加请求拦截器
ctripApiService.interceptors.request.use(
    function (config) {
        return config;
    },
    function (err) {
        return Promise.reject(err);
    }
);

// 添加响应拦截器
ctripApiService.interceptors.response.use(
    function (response) {
        console.log("对响应数据做点什么");
        return response.data;
    },
    function (err) {
        console.log("对响应错误做点什么");
        return Promise.reject(err);
    }
);
export default ctripApiService;
