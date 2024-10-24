const origin = "http://localhost:5173";
export const setResponseHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS,PUT"); // 允许的请求方法
    res.setHeader("Access-Control-Allow-Headers", [
        "Content-Type",
        "authorization",
    ]); // 允许的请求头
    next();
};
