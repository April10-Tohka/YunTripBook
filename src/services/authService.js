import bcrypt from "bcrypt";
import User from "../models/user.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateToken.js";
import redis from "../utils/redisClient.js";
class AuthService {
    #CODE_EXPIRE_TIME = 300; // 验证码有效期：5分钟
    #SEND_COOLDOWN_TIME = 60; // 验证码发送冷却时间：60秒
    #MAX_DAILY_SEND_ATTEMPTS = 5; // 每日最多发送验证码次数
    #MAX_FAILED_ATTEMPTS = 5; // 最大验证失败次数
    #FAILED_ATTEMPTS_COOLDOWN = 1800; // 冷却时间：30分钟
    #saltRounds = 10; // 哈希盐值
    #ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // accessToken过期时间15min
    #REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24; // refreshToken过期时间1d

    /*
    生成验证码并发送
     */
    generateCaptchaAndSend(phone) {
        return new Promise((resolve, reject) => {
            // 检查该手机号是否在冷却期内
            redis
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
                    return redis.get(`send_attempts:${phone}`);
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

                    //存储验证码到 Redis，设置5分钟过期时间
                    //设置该手机号获取验证码冷却时间 60 秒
                    //更新发送验证码次数
                    //设置每日发送验证码次数的过期时间
                    return Promise.all([
                        redis.setex(
                            `captcha:${phone}`,
                            this.#CODE_EXPIRE_TIME,
                            code
                        ),
                        redis.setex(
                            `cooldown:${phone}`,
                            this.#SEND_COOLDOWN_TIME,
                            true
                        ),
                        redis.incr(`send_attempts:${phone}`),
                        redis.expire(`send_attempts:${phone}`, 86400),
                    ]).then(() => {
                        //todo:模拟发送验证码(后续未来使用外部API)
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

    /**
     * 查询缓存中的手机验证码并校验
     */
    verifyCaptchaInRedis(phone, captcha) {
        return new Promise((resolve, reject) => {
            // 检查该手机号是否因验证失败次数过多而被冷却
            redis
                .hget(`phone:${phone}`, "fail_attempts_cooldown")
                .then((isCooldown) => {
                    console.log(`该手机号${phone}是否被冷却:${isCooldown}`);
                    if (isCooldown) {
                        throw {
                            code: 429,
                            message: "失败次数过多。请 30 分钟后重试。",
                        };
                    }
                    //查询缓存中的手机验证码
                    return redis.get(`captcha:${phone}`);
                })
                .then((storeCaptcha) => {
                    console.log(
                        "=>(authService.js:153) storeCaptcha",
                        storeCaptcha
                    );
                    //如果缓存中未查询到验证码
                    if (!storeCaptcha) {
                        console.log("//如果缓存中未查询到验证码");
                        throw {
                            code: 400,
                            message: "验证码错误，请重新输入或重新发送",
                        };
                    }
                    //校验验证码不通过
                    if (captcha !== storeCaptcha) {
                        console.log("//校验验证码不通过");
                        //增加验证失败次数
                        return redis
                            .hincrby(`phone:${phone}`, "fail_attempts", 1)
                            .then((failAttempts) => {
                                //达到最大失败次数，该手机号无法继续输入验证码并设置 30 分钟的冷却时间
                                if (failAttempts >= this.#MAX_FAILED_ATTEMPTS) {
                                    return Promise.all([
                                        redis.hset(`phone:${phone}`, {
                                            fail_attempts_cooldown: true,
                                        }),
                                        redis.expire(
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
                                    message: "验证码错误，请重新输入或重新发送",
                                };
                            });
                    }
                    //校验验证码通过,删除 Redis 中的验证码和失败次数记录
                    console.log(
                        "//校验验证码通过,删除 Redis 中的验证码和失败次数记录"
                    );
                    return redis.del([`captcha:${phone}`, `phone:${phone}`]);
                })
                .then(() => {
                    resolve({ message: "验证码通过" });
                })
                .catch((err) => {
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
                    return redis.hget(
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
                    return redis.get(`captcha:${phone}`);
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
                        return redis
                            .hincrby(`phone:${phone}`, "fail_attempts", 1)
                            .then((failAttempts) => {
                                //达到最大失败次数，该手机号无法继续输入验证码并设置 30 分钟的冷却时间
                                if (failAttempts >= this.#MAX_FAILED_ATTEMPTS) {
                                    return Promise.all([
                                        redis.hset(`phone:${phone}`, {
                                            fail_attempts_cooldown: true,
                                        }),
                                        redis.expire(
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
                    return redis
                        .del([`captcha:${phone}`, `phone:${phone}`])
                        .then(() => {
                            resolve({ message: "验证码通过" });
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * 设置密码并创建用户
     *
     */
    setPasswordAndCreateUser(phone, password) {
        return new Promise((resolve, reject) => {
            //加密密码并保存用户到数据库中
            bcrypt
                .hash(password, this.#saltRounds)
                .then((hashedPassword) => {
                    return User.createUser(phone, hashedPassword);
                })
                .then(({ data }) => {
                    console.log("创建用户之后,", data);
                    const payload = data;
                    // 生成 Access Token
                    const { accessToken, accessTokenNonce } =
                        generateAccessToken(payload);
                    // 生成 Refresh Token
                    const { refreshToken, refreshTokenNonce } =
                        generateRefreshToken(payload);
                    // 保存 Token 到 Redis 中
                    return Promise.all([
                        redis.hset(`user:${phone}-accessToken`, {
                            accessToken,
                            accessTokenNonce,
                        }),
                        redis.hset(`user:${phone}-refreshToken`, {
                            refreshToken,
                            refreshTokenNonce,
                        }),
                        redis.expire(
                            `user:${phone}-accessToken`,
                            this.#ACCESS_TOKEN_EXPIRES_IN
                        ),
                        redis.expire(
                            `user:${phone}-refreshToken`,
                            this.#REFRESH_TOKEN_EXPIRES_IN
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
                            return Promise.reject(err);
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
    }

    /**
     * 刷新accessToken 和 refreshToken
     */
    refreshAccessTokenAndRefreshToken(user) {
        return new Promise((resolve, reject) => {
            // 重新生成新的 Access Token 和 Refresh Token
            const { accessToken, accessTokenNonce } = generateAccessToken(user);
            const { refreshToken, refreshTokenNonce } =
                generateRefreshToken(user);
            //将新的 Access Token 和 Refresh Token 更新到 Redis中
            Promise.all([
                redis.hset(`user:${user.phone}-accessToken`, {
                    accessToken,
                    accessTokenNonce,
                }),
                redis.hset(`user:${user.phone}-refreshToken`, {
                    refreshToken,
                    refreshTokenNonce,
                }),
                redis.expire(
                    `user:${user.phone}-accessToken`,
                    this.#ACCESS_TOKEN_EXPIRES_IN
                ),
                redis.expire(
                    `user:${user.phone}-refreshToken`,
                    this.#REFRESH_TOKEN_EXPIRES_IN
                ),
            ])
                .then(() => {
                    console.log("更新新的双token到Redis 成功");
                    resolve({ accessToken, refreshToken });
                })
                .catch((err) => {
                    console.log("更新新的双token到Redis 失败");
                    reject({
                        code: 510,
                        message: "新双token保存到Redis失败",
                        error: err,
                    });
                });
        });
    }

    /**
     * 验证手机号密码和生成token
     */
    verifyPhonePasswordAndGenerateToken(phone, hashedPassword) {
        console.log("验证手机号密码和生成token");
        return new Promise((resolve, reject) => {
            let user;
            //通过 phone 检查用户是否存在
            User.queryUserByPhone(phone)
                .then((queryResult) => {
                    console.log("通过 phone 检查用户是否存在", queryResult);
                    //  如果用户不存在，返回模糊错误信息（如“手机号或密码错误”）
                    if (!queryResult.exit) {
                        throw { code: 400, message: "手机号或密码错误" };
                    }
                    user = queryResult.user;
                    console.log("查看该用户user:", user);
                    // 如果用户存在，检查账户是否被锁定或处于冷却期
                    return redis.hget(`user:${phone}`, "isLocked");
                })
                .then((isLocked) => {
                    console.log("该手机号是否被锁住", isLocked);
                    if (isLocked) {
                        throw {
                            code: 400,
                            message: "已被锁定,请30分钟后再重试",
                        };
                    }
                    // 使用强哈希算法（如 bcrypt）校验传递的密码和数据库中存储的哈希密码是否匹配
                    return bcrypt.compare(hashedPassword, user.password_hash);
                })
                .then((result) => {
                    console.log("比对密码结果：", result);
                    // 如果密码不匹配，记录一次失败尝试，返回模糊错误信息（如“手机号或密码错误”）。
                    if (!result) {
                        // 增加验证失败次数
                        return redis
                            .hincrby(`user:${phone}`, "fail_attempts_login", 1)
                            .then((failAttempts) => {
                                console.log("返回验证失败次数", failAttempts);
                                // 达到最大失败次数，锁定该手机号，并设置 30 分钟的冷却时间
                                if (failAttempts >= this.#MAX_FAILED_ATTEMPTS) {
                                    return Promise.all([
                                        redis.hset(`user:${phone}`, {
                                            isLocked: true,
                                        }),
                                        redis.expire(
                                            `user:${phone}`,
                                            this.#FAILED_ATTEMPTS_COOLDOWN
                                        ),
                                    ]).then(() => {
                                        throw {
                                            code: 400,
                                            message:
                                                "登录失败次数过多。请 30 分钟后重试",
                                        };
                                    });
                                }

                                // 没有达到最大失败次数，返回模糊错误信息
                                throw {
                                    code: 400,
                                    message: "手机号或密码错误",
                                };
                            });
                    }

                    // 密码匹配，删除 Redis 中 失败次数记录

                    console.log("密码匹配成功！准备删除失败次数记录");
                    return redis.del(`user:${phone}`);
                })
                .then(() => {
                    // 生成双token，存储在Redis中，并返回给前端
                    const { accessToken, accessTokenNonce } =
                        generateAccessToken(user);
                    const { refreshToken, refreshTokenNonce } =
                        generateRefreshToken(user);
                    // 保存 Token 到 Redis 中,并设置过期时间
                    return Promise.all([
                        redis.hset(`user:${phone}-accessToken`, {
                            accessToken,
                            accessTokenNonce,
                        }),
                        redis.hset(`user:${phone}-refreshToken`, {
                            refreshToken,
                            refreshTokenNonce,
                        }),
                        redis.expire(
                            `user:${phone}-accessToken`,
                            this.#ACCESS_TOKEN_EXPIRES_IN
                        ),
                        redis.expire(
                            `user:${phone}-refreshToken`,
                            this.#REFRESH_TOKEN_EXPIRES_IN
                        ),
                    ])
                        .then((saveResult) => {
                            console.log("保存token到Redis中成功", saveResult);
                            //删除通过数据库获取到用户信息的password_hash
                            delete user.password_hash;
                            resolve({
                                code: 200,
                                message: "用户登陆成功",
                                data: { accessToken, refreshToken, user },
                            });
                        })
                        .catch((err) => {
                            console.log("保存 token到Redis失败", err);
                            throw {
                                code: 500,
                                message: "保存 token到Redis失败",
                                error: err,
                            };
                        });
                })
                .catch((err) => {
                    console.log("catch:", err);
                    reject(err);
                });
        });
    }

    /**
     * 验证手机号验证码和生成token
     * @param phone
     * @param captcha
     * @returns {Promise<unknown>}
     */
    verifyPhoneCaptchaAndGenerateToken(phone, captcha) {
        return new Promise((resolve, reject) => {
            let user;
            //根据手机号查询用户是否存在
            User.queryUserByPhone(phone)
                .then((queryResult) => {
                    console.log(
                        "=>(authService.js:406) queryResult",
                        queryResult
                    );
                    if (queryResult.exit) {
                        user = queryResult.user;
                        //查询缓存中的手机验证码并校验
                        return this.verifyCaptchaInRedis(phone, captcha);
                    }
                })
                .then(() => {
                    //校验通过 jwt生成双token
                    const { accessToken, accessTokenNonce } =
                        generateAccessToken(user);
                    const { refreshToken, refreshTokenNonce } =
                        generateRefreshToken(user);
                    // 设置token缓存,key为user:${phone}-accessToken value为token及其nonce
                    return Promise.all([
                        redis.hset(`user:${phone}-accessToken`, {
                            accessToken,
                            accessTokenNonce,
                        }),
                        redis.hset(`user:${phone}-refreshToken`, {
                            refreshToken,
                            refreshTokenNonce,
                        }),
                        redis.expire(
                            `user:${phone}-accessToken`,
                            this.#ACCESS_TOKEN_EXPIRES_IN
                        ),
                        redis.expire(
                            `user:${phone}-refreshToken`,
                            this.#REFRESH_TOKEN_EXPIRES_IN
                        ),
                    ])
                        .then((saveResult) => {
                            console.log("保存token到Redis中成功", saveResult);
                            //删除通过数据库获取到用户信息的password_hash
                            delete user.password_hash;
                            //返回token给controller层
                            resolve({
                                code: 200,
                                message: "用户登陆成功",
                                data: { accessToken, refreshToken, user },
                            });
                        })
                        .catch((err) => {
                            console.log("保存 token到Redis失败", err);
                            throw {
                                code: 500,
                                message: "保存 token到Redis失败",
                                error: err,
                            };
                        });
                })
                .catch((err) => {
                    console.log("=>(authService.js:490) err", err);
                    reject(err);
                });
        });
    }

    //退出登录并清除JWT
    logoutAndClearJWT(phone) {
        return new Promise((resolve, reject) => {
            //清除JWT
            redis
                .del([
                    `user:${phone}-accessToken`,
                    `user:${phone}-refreshToken`,
                ])
                .then(() => {
                    resolve({ code: 200, message: "清除该手机号JWT成功" });
                });
        });
    }
}

export default new AuthService();
