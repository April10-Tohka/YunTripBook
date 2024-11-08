import express from "express";
//引入路由
import uploadRoute from "./routes/uploadRoute.js";
import authRoute from "./routes/authRoute.js";
import homeRoute from "./routes/homeRoute.js";
import ticketRoute from "./routes/ticketRoute.js";
import orderRoute from "./routes/orderRoute.js";
import payRoute from "./routes/payRoute.js";
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
app.use(express.urlencoded({ extended: true })); //解析 application/x-www-form-urlencoded 格式的数据 支付宝异步通知就是这个格式
app.use(express.json()); //解析 JSON 格式的数据
app.use(setResponseHeader);
app.use(loggerMiddleWare);

//使用路由
app.use("/api", uploadRoute);
app.use("/api", homeRoute);
app.use("/api", ticketRoute);
app.use("/auth", authRoute);
app.use("/api", orderRoute);
app.use("/api", payRoute);
//测试路由
app.get("/test/verify-access-token", verifyAccessToken, (req, res) => {
    console.log("校验access token 路由,中间件通过后就会看到这句话");
    console.log("查看req.user:", req.user);
    res.json(req.user);
});
//无感刷新后，继续原来操作接口
app.post("/test/continue-operation", verifyAccessToken, (req, res) => {
    console.log("校验accesstoken通过过，会看到这句话");
    res.status(200).json({ data: { a: 1, b: 2, c: 3 } });
});
//错误全局中间件
app.use(loggerErrorMiddleWare);
export default app;
