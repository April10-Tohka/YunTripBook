import sharp from "sharp";
import ossClient from "../utils/ossClient.js";
import fs from "fs";
import * as path from "path";
class UploadService {
    /*
    压缩并上传头像逻辑
        //fileName--存储在本机的图片名
        //filePath--存储在本机的图片路径
     */
    compressAndUploadAvatar(fileName, filePath) {
        return new Promise((resolve, reject) => {
            const compressedImagePath = `uploads/avatars/compressed-${fileName}`; //压缩后的图片路径
            //压缩图片
            sharp(filePath)
                .toFormat("jpeg", { quality: 80 }) // 将图片转换为 JPEG 并设置压缩质量
                .toFile(compressedImagePath)
                .then(() => {
                    console.log("sharp成功！");
                    const userID = "tohka";
                    //定义oss路径及文件命名
                    const ossFileName = `avatars/avatar-${userID}.jpg`;
                    const header = {
                        // 指定PutObject操作时是否覆盖同名目标Object。此处设置为false，表示允许覆盖同名Object。
                        "x-oss-forbid-overwrite": "false",
                    };
                    return ossClient.put(
                        ossFileName,
                        compressedImagePath,
                        header
                    );
                })
                .then((data) => {
                    console.log("!!上传到oss成功!!:");
                    resolve(data);
                    /**
                     * bug:删除本机图片会失败，上传完立马手动删除也会报错，只有过一段时间删除就不会报错
                     */
                    fs.unlink(compressedImagePath, (err) => {
                        if (err) {
                            console.error("删除压缩失败！", err);
                            return;
                        }
                        console.log("删除压缩成功");
                        fs.unlink(filePath, (err1) => {
                            if (err1) {
                                console.log("删除本机失败");
                                return;
                            }
                            console.log("删除本机成功");
                        });
                    });
                });
        });
    }
}

export default new UploadService();
