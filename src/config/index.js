import "dotenv/config";
const config = {
    server: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    },
    oss: {
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        region: process.env.OSS_REGION,
        authorizationV4: true,
        bucket: process.env.OSS_BUCKET,
    },
};

export default config;
