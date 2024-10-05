import Redis from "ioredis";
import config from "../config/index.js";

const redis = new Redis({ ...config.redis });
export default redis;
