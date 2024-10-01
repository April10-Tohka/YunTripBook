//登录注册路由
import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

//注册时发送验证码
router.post("/register/send-captcha", authController.sendCaptcha);

//注册时验证验证码
router.post("/register/verify-captcha", authController.verifyCaptcha);

//注册时设置密码
router.post("/register/set-password", authController.setPassword);
export default router;
