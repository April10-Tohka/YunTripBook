import { sendError, sendResponse } from "../utils/sendResponse.js";
import authService from "../services/authService.js";
import checkFunctions from "../utils/checkFunctions.js";
class AuthController {
    //发送验证码
    sendCaptcha(req, res) {
        try {
            //获取手机号
            const { phone } = req.body;
            console.log("手机号：", phone);
            //如果手机号为空
            if (!phone) {
                throw { code: 400, message: "手机号不能为空" };
            }
            if (!checkFunctions.isValidChinaMobile(phone)) {
                throw { code: 400, message: "手机号码格式不正确" };
            }
            authService
                .generateCaptchaAndSend(phone)
                .then((data) => {
                    sendResponse(res, data);
                })
                .catch((err) => {
                    sendError(res, err);
                });
        } catch (err) {
            console.log("try,catch中的catch", err);
            sendError(res, err);
        }
    }

    //验证验证码
    verifyCaptcha(req, res) {
        try {
            //获取手机号和验证码
            const { phone, captcha } = req.body;
            console.log("phone:", phone);
            console.log("captcha:", captcha);
            //如果手机号或者验证码为空
            if (!phone) {
                throw { code: 400, message: "需要手机号" };
            }
            if (!captcha) {
                throw { code: 400, message: "需要验证码" };
            }
            if (!checkFunctions.isValidChinaMobile(phone)) {
                throw { code: 400, message: "手机号码格式不正确" };
            }
            if (!checkFunctions.isValidCaptcha(captcha)) {
                throw { code: 400, message: "验证码格式为六位数字" };
            }
            authService
                .verifyCaptcha(phone, captcha)
                .then((data) => {
                    sendResponse(res, data);
                })
                .catch((err) => {
                    sendError(res, err);
                });
        } catch (err) {
            console.log("try,catch中的catch", err);
            sendError(res, err);
        }
    }

    //设置密码
    setPassword(req, res) {
        try {
            //获取客户端传来的手机号和密码
            let { phone, password } = req.body;
            console.log("传来的手机号和密码:", phone, password);
            //如果手机号或者密码为空
            if (!phone) {
                throw { code: 400, message: "需要手机号" };
            }
            if (!password) {
                throw { code: 400, message: "需要密码" };
            }
            if (!checkFunctions.isValidChinaMobile(phone)) {
                throw { code: 400, message: "手机号码格式不正确" };
            }
            const commonPasswords = new Set([
                "123456",
                "password",
                "qwerty",
                "111111",
                "abc123",
            ]);
            if (commonPasswords.has(password)) {
                throw {
                    code: 400,
                    message: "您的密码太常见。请选择一个更强的密码。",
                };
            }
            // 接受用户输入的密码并去除两端的空白字符
            password = password.trim();
            if (!checkFunctions.validatePassword(password)) {
                throw { code: 400, message: "密码不符合复杂度要求" };
            }
            authService
                .setPasswordAndCreateUser(phone, password)
                .then((data) => {
                    console.log("设置密码成功", data);
                    // 设置 HttpOnly Cookie
                    res.cookie("refreshToken", data.data.refreshToken, {
                        httpOnly: true, // 防止JS访问
                        sameSite: "Strict", // 防止CSRF攻击
                        maxAge: 24 * 60 * 60 * 1000, // 1天
                    });
                    delete data.data.refreshToken;
                    sendResponse(res, data);
                })
                .catch((err) => {
                    console.log("设置密码失败", err);
                    sendError(res, err);
                });
        } catch (err) {
            console.log("try,catch中的catch", err);
            sendError(res, err);
        }
    }

    // 使用 Refresh Token 重新生成 Access Token
    refreshToken(req, res) {
        const user = req.user;
        authService
            .refreshAccessTokenAndRefreshToken(user)
            .then(({ accessToken, refreshToken }) => {
                // 设置 HttpOnly Cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true, // 防止JS访问
                    sameSite: "Strict", // 防止CSRF攻击
                    maxAge: 24 * 60 * 60 * 1000, // 1天
                });
                sendResponse(res, {
                    code: 200,
                    message: "刷新双token成功",
                    data: { accessToken },
                });
            })
            .catch((err) => {
                sendError(res, err);
            });
    }

    //手机号密码登录
    loginWithPhonePassword(req, res) {
        console.log("使用手机号密码登录");
        try {
            //获取手机号及密码
            const { phone, hashedPassword } = req.body;
            console.log("phone:", phone);
            console.log("hashedPassword:", hashedPassword);
            if (!phone) {
                throw { code: 400, message: "请输入手机号" };
            }
            if (!hashedPassword) {
                throw { code: 400, message: "请输入登录密码" };
            }
            authService
                .verifyPhonePasswordAndGenerateToken(phone, hashedPassword)
                .then((data) => {
                    console.log("验证手机号密码成功!", data);
                    // 设置 HttpOnly Cookie
                    res.cookie("refreshToken", data.data.refreshToken, {
                        httpOnly: true, // 防止JS访问
                        sameSite: "Strict", // 防止CSRF攻击
                        maxAge: 24 * 60 * 60 * 1000, // 1天
                    });
                    delete data.data.refreshToken;
                    sendResponse(res, data);
                })
                .catch((err) => {
                    console.error("验证手机号密码失败！！！！", err);
                    sendError(res, err);
                });
        } catch (err) {
            sendError(res, err);
        }
    }
}

export default new AuthController();
