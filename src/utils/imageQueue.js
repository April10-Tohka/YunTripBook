import config from "../config/index.js";
import Queue from "bull";
import bcrypt from "bcrypt";
import sharp from "sharp";
import ossClient from "./ossClient.js";
//处理队列中压缩图片和上传任务
const imageQueue = new Queue("compress image", {
    redis: {
        ...config.redis,
    },
});

const saltRounds = 10; //哈希盐值

imageQueue.process((job) => {
    return new Promise((resolve, reject) => {
        console.log("do something！");
        const { fileName, filePath } = job.data;
        console.log("filename:", fileName);
        console.log("filePath:", filePath); //本机存储图片路径
        const compressedImagePath = `./uploads/avatars/compressed-${fileName}`; //压缩后的图片路径
        console.log("compressedImagePath", compressedImagePath);
        //压缩图片
        sharp(filePath)
            .toFormat("jpeg", { quality: 80 }) // 将图片转换为 JPEG 并设置压缩质量
            .toFile(compressedImagePath)
            .then((data) => {
                console.log("sharp成功！");
                //todo:上传图片到云服务器,上传成功后删除本地压缩图片和本地存储的图片
                let userID = "tohka";
                return bcrypt.hash(userID, saltRounds).then((hashUserID) => {
                    console.log("hashUserID:", hashUserID);
                    console.log("userID:", userID);
                    return { hashUserID, userID };
                });
                /*
                const hashUserID = bcrypt.hashSync(userID, saltRounds);
                console.log("hashUserID:", hashUserID);
                //定义oss路径及文件命名
                const ossFileName = `avatars/avatar-${hashUserID}.jpg`;
                const header = {
                    // 指定PutObject操作时是否覆盖同名目标Object。此处设置为false，表示允许覆盖同名Object。
                    "x-oss-forbid-overwrite": "false",
                };
                return ossClient.put(ossFileName, compressedImagePath, header);
                */
            })
            .then((result) => {
                console.log("上传到oss返回result", result);
                resolve(result);
            })
            .catch((err) => {
                console.log("sharp失败", err);
                reject(err);
            });
    });
});
export default imageQueue;
