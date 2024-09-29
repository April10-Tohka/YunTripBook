import jwt from "jsonwebtoken";
import "dotenv/config";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "Tohka";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "Tohka10xiang";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

// 生成访问令牌
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
};

// 生成刷新令牌
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
};
