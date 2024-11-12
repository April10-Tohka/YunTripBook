import config from "../config/index.js";
const origin =
    config.server.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "http://8.138.9.94";
export const setResponseHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS,PUT"); // 允许的请求方法
    res.setHeader("Access-Control-Allow-Headers", [
        "Content-Type",
        "Authorization",
        "RefreshToken",
    ]);
    next();
};
