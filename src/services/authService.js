import Redis from "ioredis";
import config from "../config/index.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateToken.js";

class AuthService {
    #CODE_EXPIRE_TIME = 180; // 验证码有效期：3分钟
    #SEND_COOLDOWN_TIME = 60; // 验证码发送冷却时间：60秒
    #MAX_DAILY_SEND_ATTEMPTS = 5; // 每日最多发送验证码次数
    #MAX_FAILED_ATTEMPTS = 5; // 最大验证失败次数
    #FAILED_ATTEMPTS_COOLDOWN = 1800; // 冷却时间：30分钟
    #saltRounds = 10; // 哈希盐值
    #ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // accessToken过期时间15min
    #REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24; // refreshToken过期时间1d
    constructor() {
        this.redis = new Redis({ ...config.redis });
    }
    /*
    生成验证码并发送
     */
    generateCaptchaAndSend(phone) {
        return new Promise((resolve, reject) => {
            // 检查该手机号是否在冷却期内
            this.redis
                .get(`cooldown:${phone}`)
                .then((cooldown) => {
                    if (cooldown) {
                        //该手机号仍在冷却期中,抛出错误提示
                        throw {
                            code: 429,
                            message: `每隔${this.#SEND_COOLDOWN_TIME}秒才能获取一次验证码`,
                        };
                    }
                    //检查该手机号是否超过每天的发送次数上限
                    return this.redis.get(`send_attempts:${phone}`);
                })
                .then((sendAttempts) => {
                    if (sendAttempts >= this.#MAX_DAILY_SEND_ATTEMPTS) {
                        throw {
                            code: 429,
                            message: "已达到每日限额。请明天再试。",
                        };
                    }
                    //生成6位随机验证码
                    const code = Array.from({ length: 6 }, () =>
                        Math.floor(Math.random() * 10)
                    ).join("");

                    //存储验证码到 Redis，设置3分钟过期时间
                    return this.redis
                        .setex(`captcha:${phone}`, this.#CODE_EXPIRE_TIME, code)
                        .then(() => {
                            //设置该手机号获取验证码冷却时间 60 秒
                            return this.redis.setex(
                                `cooldown:${phone}`,
                                this.#SEND_COOLDOWN_TIME,
                                true
                            );
                        })
                        .then(() => {
                            //更新发送验证码次数
                            return this.redis
                                .incr(`send_attempts:${phone}`)
                                .then(() => {
                                    //设置每日发送验证码次数的过期时间
                                    return this.redis.expire(
                                        `send_attempts:${phone}`,
                                        86400
                                    );
                                });
                        })
                        .then(() => {
                            //模拟发送验证码(后续使用外部API)
                            console.log(`Sending captcha ${code} to ${phone}`);
                        });
                })
                .then(() => {
                    //响应发送验证码完成
                    resolve({
                        code: 200,
                        message: "发送验证码成功",
                    });
                })
                .catch((err) => {
                    //响应发送验证码的错误
                    reject(err);
                });
        });
    }

    /*
    验证验证码
     */
    verifyCaptcha(phone, captcha) {
        return new Promise((resolve, reject) => {
            // 查询该手机号是否存在数据库中
            User.queryUserByPhone(phone)
                .then(({ exit }) => {
                    console.log("queryUserByPhone返回的结果,是否存在", exit);
                    //如果存在，说明已注册，请直接登录
                    if (exit) {
                        reject({
                            code: 409,
                            message: "该手机号已注册,请直接登录",
                        });
                    }
                    //不存在,继续注册流程
                    // 检查该手机号是否因验证失败次数过多而被冷却
                    return this.redis.hget(
                        `phone:${phone}`,
                        "fail_attempts_cooldown"
                    );
                })
                .then((isCooldown) => {
                    console.log(`该手机号${phone}是否被冷却:${isCooldown}`);
                    if (isCooldown) {
                        throw {
                            code: 429,
                            message: "失败次数过多。请 30 分钟后重试。",
                        };
                    }
                    //检查验证码是否正确
                    return this.redis.get(`captcha:${phone}`);
                })
                .then((storeCaptcha) => {
                    console.log("storeCode:", storeCaptcha);
                    //验证码不存在(验证码过期了)
                    if (!storeCaptcha) {
                        throw {
                            code: 400,
                            message: "验证码已过期或不存在",
                        };
                    }
                    //验证验证码不通过
                    if (captcha !== storeCaptcha) {
                        //增加验证失败次数
                        return this.redis
                            .hincrby(`phone:${phone}`, "fail_attempts", 1)
                            .then((failAttempts) => {
                                //达到最大失败次数，该手机号无法继续输入验证码并设置 30 分钟的冷却时间
                                if (failAttempts >= this.#MAX_FAILED_ATTEMPTS) {
                                    return Promise.all([
                                        this.redis.hset(`phone:${phone}`, {
                                            fail_attempts_cooldown: true,
                                        }),
                                        this.redis.expire(
                                            `phone:${phone}`,
                                            this.#FAILED_ATTEMPTS_COOLDOWN
                                        ),
                                    ]).then(() => {
                                        throw {
                                            code: 429,
                                            message:
                                                "失败次数过多。请 30 分钟后重试。",
                                        };
                                    });
                                }
                                //没有达到最大失败次数,无效验证码
                                throw {
                                    code: 400,
                                    message: "无效验证码",
                                };
                            });
                    }
                    //验证码通过,删除 Redis 中的验证码和失败次数记录
                    return this.redis
                        .del([`captcha:${phone}`, `phone:${phone}`])
                        .then(() => {
                            resolve({ message: "验证码通过" });
                        });
                })
                .catch((err) => {
                    reject(err);
                });
            // this.redis
            //     .hget(`phone:${phone}`, "fail_attempts_cooldown")
            //     .then((isCooldown) => {
            //         console.log(`该手机号${phone}是否被冷却:${isCooldown}`);
            //         if (isCooldown) {
            //             throw {
            //                 code: 429,
            //                 message: "失败次数过多。请 30 分钟后重试。",
            //             };
            //         }
            //         //检查验证码是否正确
            //         return this.redis
            //             .get(`captcha:${phone}`)
            //             .then((storeCaptcha) => {
            //                 console.log("storeCode:", storeCaptcha);
            //                 //验证码不存在(验证码过期了)
            //                 if (!storeCaptcha) {
            //                     throw {
            //                         code: 400,
            //                         message: "验证码已过期或不存在",
            //                     };
            //                 }
            //                 //验证验证码不通过
            //                 if (captcha !== storeCaptcha) {
            //                     //增加验证失败次数
            //                     return this.redis
            //                         .hincrby(
            //                             `phone:${phone}`,
            //                             "fail_attempts",
            //                             1
            //                         )
            //                         .then((failAttempts) => {
            //                             //达到最大失败次数，该手机号无法继续输入验证码并设置 30 分钟的冷却时间
            //                             if (
            //                                 failAttempts >=
            //                                 this.#MAX_FAILED_ATTEMPTS
            //                             ) {
            //                                 return Promise.all([
            //                                     this.redis.hset(
            //                                         `phone:${phone}`,
            //                                         {
            //                                             fail_attempts_cooldown: true,
            //                                         }
            //                                     ),
            //                                     this.redis.expire(
            //                                         `phone:${phone}`,
            //                                         this
            //                                             .#FAILED_ATTEMPTS_COOLDOWN
            //                                     ),
            //                                 ]).then(() => {
            //                                     throw {
            //                                         code: 429,
            //                                         message:
            //                                             "失败次数过多。请 30 分钟后重试。",
            //                                     };
            //                                 });
            //                             }
            //                             //没有达到最大失败次数,无效验证码
            //                             throw {
            //                                 code: 400,
            //                                 message: "无效验证码",
            //                             };
            //                         });
            //                 }
            //                 //验证码通过,删除 Redis 中的验证码和失败次数记录
            //                 return this.redis
            //                     .del([`captcha:${phone}`, `phone:${phone}`])
            //                     .then(() => {
            //                         resolve({ message: "验证码通过" });
            //                     });
            //             });
            //     })
            //     .catch((err) => {
            //         reject(err);
            //     });
        });
    }

    /**
     * 设置密码并创建用户
     *
     */
    setPasswordAndCreateUser(phone, password) {
        return new Promise((resolve, reject) => {
            //加密密码并保存用户到数据库中
            bcrypt.hash(password, this.#saltRounds).then((hashedPassword) => {
                User.createUser(phone, hashedPassword)
                    .then((user) => {
                        const payload = {
                            userId: user.user_id,
                            userName: user.user_name,
                            phone: user.phone,
                            createAt: user.create_at,
                            avatarUrl: user.avatar_url,
                        };
                        // 生成 Access Token
                        const accessToken = generateAccessToken(payload);
                        // 生成 Refresh Token
                        const refreshToken = generateRefreshToken(payload);
                        // 保存 Token 到 Redis 中
                        Promise.all([
                            this.redis.setex(
                                `user:${phone}:accessToken`,
                                this.#ACCESS_TOKEN_EXPIRES_IN,
                                accessToken
                            ),
                            this.redis.setex(
                                `user:${phone}:refreshToken`,
                                this.#REFRESH_TOKEN_EXPIRES_IN,
                                refreshToken
                            ),
                        ])
                            .then((data) => {
                                resolve({
                                    code: 201,
                                    message: "用户注册成功",
                                    data: { accessToken, refreshToken },
                                });
                            })
                            .catch((err) => {
                                console.log("保存 Token 到 Redis 中失败", err);
                            });
                    })
                    .catch((err) => {
                        reject({
                            code: 400,
                            message: "用户注册失败",
                            error: err,
                        });
                    });
            });
        });
    }
}

export default new AuthService();
