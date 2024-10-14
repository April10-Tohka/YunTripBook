import Redis from "ioredis";
import config from "../config/index.js";

const redis = new Redis({
    ...config.redis,
    reconnectOnError: (err) => {
        const targetErrors = ["READONLY", "ETIMEDOUT", "ECONNRESET"];
        if (targetErrors.includes(err.code)) {
            return true; // 自动重连
        }
        return false; // 否则不重连
    },
    maxRetriesPerRequest: null, // 确保不会因为重连失败抛出异常
    retryStrategy: (times) => {
        // 重连策略: times 表示重连的次数
        // 间隔逐渐增加，最多2秒
        return Math.min(times * 50, 2000);
    },
    connectTimeout: 10000, // 连接超时10秒
});

const checkRedisHealth = async () => {
    try {
        await redis.ping();
        console.log("Redis connection is healthy");
    } catch (err) {
        console.error("Redis connection is unhealthy, reconnecting...");
        redis.disconnect(); // 断开连接
        redis.connect(); // 重新连接
    }
};

// 每隔 60 秒进行一次健康检查
setInterval(checkRedisHealth, 60000);
export default redis;
