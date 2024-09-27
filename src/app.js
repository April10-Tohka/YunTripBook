import express from "express";
//引入路由
import uploadRoute from "./routes/uploadRoute.js";
import authRoute from "./routes/authRoute.js";

//引入全局中间件
import {
    loggerMiddleWare,
    loggerErrorMiddleWare,
} from "./middlewares/logger.js";
//创建服务器
const app = express();
//全局中间件
app.use(loggerMiddleWare);
app.use(express.json());
//使用路由
app.use("/api", uploadRoute);
app.use("/auth", authRoute);

//测试路由
app.get("/test/123", (req, res) => {
    console.log("路由123");
    setTimeout(() => {
        res.json({ a: 1 });
    }, 300);
});

//错误全局中间件
app.use(loggerErrorMiddleWare);
export default app;
