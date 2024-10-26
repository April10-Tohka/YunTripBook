//登录注册路由
import { Router } from "express";
import authController from "../controllers/authController.js";

//导入 校验refresh token 的中间件
import { verifyRefreshToken } from "../middlewares/verifyToken.js";

const router = Router();

//发送验证码
router.post("/send-captcha", authController.sendCaptcha);

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

//手机号验证码登录
router.post("/login/phone-captcha", authController.loginWithPhoneCaptcha);

//退出登录
router.post("/logout", authController.logout);
export default router;
