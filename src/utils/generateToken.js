import jwt from "jsonwebtoken";
import "dotenv/config";
import * as crypto from "crypto";

//密钥
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "Tohka";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "Tohka10xiang";
//过期时间
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "1d";

// 生成访问令牌
export const generateAccessToken = (payload) => {
    //如果payload存在属性password_hash，删除
    if (payload.password_hash) {
        delete payload.password_hash;
    }
    const accessTokenNonce = crypto.randomUUID();
    payload.nonce = accessTokenNonce;
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    return { accessToken, accessTokenNonce };
};

// 生成刷新令牌
export const generateRefreshToken = (payload) => {
    //如果payload存在属性password_hash，删除
    if (payload.password_hash) {
        delete payload.password_hash;
    }
    const refreshTokenNonce = crypto.randomUUID();
    payload.nonce = refreshTokenNonce;
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    return { refreshToken, refreshTokenNonce };
};
