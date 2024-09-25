import { sendError, sendResponse } from "../utils/sendResponse.js";
import UploadService from "../services/uploadService.js";
class UploadController {
    /*
    处理上传头像逻辑
     */
    uploadAvatar(req, res) {
        console.log("调用了文件上传");
        console.log(req.file);
        if (!req.file) {
            const err = new Error("没有上传文件，请重新上传");
            sendError(res, err, 410, err);
            return;
        }
        const fileName = req.file.filename; //存储在本机的图片名
        const filePath = req.file.path.replace(/\\/g, "/"); //存储在本机的图片路径,路径统一为正斜杠
        UploadService.compressAndUploadAvatar(fileName, filePath).then(
            (data) => {
                sendResponse(res, { data });
            }
        );
    }
}
export default new UploadController();
