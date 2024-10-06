import { sendError } from "../utils/sendResponse.js";
import jwt from "jsonwebtoken";
import redis from "../utils/redisClient.js";

// Token密钥
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// 验证 Access Token 的中间件
export const verifyAccessToken = (req, res, next) => {
    console.log("验证 Access Token 的中间件");
    try {
        //获取accessToken
        const accessToken =
            req.headers.authorization &&
            req.headers.authorization.split(" ")[1];
        console.log("access-token:", accessToken);
        //如果缺失accessToken
        if (!accessToken) {
            throw { code: 401, message: "缺少access token" };
        }
        //验证access Token的有效性
        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
            //JWT 校验失败
            if (err) {
                console.log("JWT校验出错!", JSON.stringify(err));
                throw { code: 401, message: err.message, error: err };
            }
            console.log(decoded);
            const { phone, nonce } = decoded;
            // Redis 校验
            redis
                .hget(`user:${phone}-accessToken`, "accessTokenNonce")
                .then((storeNonce) => {
                    //如果 Redis 中的 Access Token 不存在或不匹配：
                    if (nonce !== storeNonce) {
                        throw {
                            code: 401,
                            message: "Unauthorized",
                            error: { detail: "请重新登录" },
                        };
                    }
                    // 说明 Access Token 仍然有效。

                    req.user = decoded;
                    next();
                })
                .catch((err) => {
                    sendError(res, err);
                });
        });
    } catch (err) {
        console.log("校验access token中间件的catch", err);
        sendError(res, err);
    }
};

// 验证 Refresh Token 的中间件
export const verifyRefreshToken = (req, res, next) => {
    console.log("验证refresh token 的中间件");
    try {
        // 从cookie中获取refreshToken
        const refreshToken = req.headers.cookie.split("=")[1];
        console.log("refreshToken:", refreshToken);
        if (!refreshToken) {
            throw { code: 401, message: "缺少refresh token" };
        }
        //验证refreshToken的有效性 (JWT校验)
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
            //JWT 校验失败
            if (err) {
                console.log("JWT校验出错!", JSON.stringify(err));
                throw { code: 401, message: err.message, error: err };
            }
            console.log("decoded", decoded);
            const { phone, nonce } = decoded;
            // Redis 校验
            redis
                .hget(`user:${phone}-refreshToken`, "refreshTokenNonce")
                .then((storeNonce) => {
                    //如果 Redis 中的 Access Token 不存在或不匹配：
                    if (nonce !== storeNonce) {
                        throw {
                            code: 403,
                            message: "Forbidden",
                            error: { detail: "请重新登录" },
                        };
                    }
                    // 说明 Refresh Token 仍然有效。
                    console.log("说明 Refresh Token 仍然有效。");
                    delete decoded.exp;
                    req.user = decoded;
                    next();
                    // 下一步: 生成一个新的 Access Token 和 Refresh Token并返回给前端
                })
                .catch((err) => {
                    sendError(res, err);
                });
        });
    } catch (err) {
        console.log("校验refresh token中间件的catch", err);
        sendError(res, err);
    }
};
