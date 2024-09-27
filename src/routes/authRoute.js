//登录注册路由
import { Router } from "express";
import { sendError } from "../utils/sendResponse.js";
import Redis from "ioredis";
import config from "../config/index.js";
const router = Router();
const redis = new Redis({ ...config.redis });

const CODE_EXPIRE_TIME = 180; // 定义验证码有效期：3分钟
const SEND_COOLDOWN_TIME = 60; // 定义发送冷却时间：60秒

//注册是发送验证码
router.post("/register/send-verification-code", (req, res) => {
    console.log("调用了/register/send-verification-code");
    try {
        //获取手机号
        const { phone } = req.body;
        console.log("手机号：", phone);
        //如果手机号为空
        if (!phone) {
            throw { code: 400, message: "需要手机号" };
        }
        // 检查该手机号是否在冷却期内
        redis
            .get(`cooldown:${phone}`)
            .then((cooldown) => {
                console.log("cooldown:", cooldown);
                if (cooldown) {
                    //该手机号仍在冷却期中
                    throw { code: 429, message: "每隔60秒才能获取一次验证码" };
                }
                //生成6位随机验证码
                const code = "123123";
                //存储验证码到 Redis，设置3分钟过期时间
                return redis
                    .setex(`verification_code:${phone}`, CODE_EXPIRE_TIME, code)
                    .then(() => {
                        //设置该手机号获取验证码冷却时间 60 秒
                        return redis.setex(
                            `cooldown:${phone}`,
                            SEND_COOLDOWN_TIME,
                            true
                        );
                    })
                    .then(() => {
                        //模拟发送验证码
                        console.log(
                            `Sending verification code ${code} to ${phone}`
                        );
                    });
            })
            .then(() => {
                //响应发送验证码完成
                res.json({ status: true });
            })
            .catch((e) => {
                sendError(res, e, e.code, e.message);
            });
    } catch (e) {
        console.log("try,catch中的catch", e);
        sendError(res, e, e.code, e.message);
    }
});

//注册
router.post("/register", (req, res) => {
    console.log("调用了/register");
});
export default router;
