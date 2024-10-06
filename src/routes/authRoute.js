//登录注册路由
import { Router } from "express";
import authController from "../controllers/authController.js";

//导入 校验refresh token 的中间件
import { verifyRefreshToken } from "../middlewares/verifyToken.js";

const router = Router();

//注册时发送验证码
router.post("/register/send-captcha", authController.sendCaptcha);

//注册时验证验证码
router.post("/register/verify-captcha", authController.verifyCaptcha);

//注册时设置密码
router.post("/register/set-password", authController.setPassword);

// 使用refreshToken 去刷新双token
router.post(
    "/refresh-access-token",
    verifyRefreshToken,
    authController.refreshToken
);

// 手机号密码登录
router.post("/login/phone-password", authController.loginWithPhonePassword);
export default router;
