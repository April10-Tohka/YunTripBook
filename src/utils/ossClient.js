import OSS from "ali-oss";
import config from "../config/index.js";
const client = new OSS({
    ...config.oss,
});

export default client;
