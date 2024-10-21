import express from "express";
//引入路由
import uploadRoute from "./routes/uploadRoute.js";
import authRoute from "./routes/authRoute.js";
import homeRoute from "./routes/homeRoute.js";
//引入全局中间件
import {
    loggerMiddleWare,
    loggerErrorMiddleWare,
} from "./middlewares/logger.js";
import { setResponseHeader } from "./middlewares/CORS.js";

// 引入路由中间件
import { verifyAccessToken } from "./middlewares/verifyToken.js";

//创建服务器
const app = express();

//全局中间件
app.use(setResponseHeader);
app.use(loggerMiddleWare);
app.use(express.json());

//使用路由
app.use("/api", uploadRoute);
app.use("/api", homeRoute);
app.use("/auth", authRoute);

//测试路由
app.get("/test/verify-access-token", verifyAccessToken, (req, res) => {
    console.log("校验access token 路由,中间件通过后就会看到这句话");
    console.log("查看req.user:", req.user);
    const refreshToken = req.headers.cookie.split("=")[1];
    console.log("refreshToken:", refreshToken);
    res.json(req.user);
});

//错误全局中间件
app.use(loggerErrorMiddleWare);
export default app;
