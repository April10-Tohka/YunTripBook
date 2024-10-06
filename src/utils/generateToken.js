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
    // 清除 payload 中可能存在的敏感字段和时间字段
    const { password_hash, iat, exp, ...cleanPayload } = payload;
    const accessTokenNonce = crypto.randomUUID();
    cleanPayload.nonce = accessTokenNonce;
    const accessToken = jwt.sign(cleanPayload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    return { accessToken, accessTokenNonce };
};

// 生成刷新令牌
export const generateRefreshToken = (payload) => {
    // 清除 payload 中可能存在的敏感字段和时间字段
    const { password_hash, iat, exp, ...cleanPayload } = payload;
    const refreshTokenNonce = crypto.randomUUID();
    cleanPayload.nonce = refreshTokenNonce;
    const refreshToken = jwt.sign(cleanPayload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    return { refreshToken, refreshTokenNonce };
};
