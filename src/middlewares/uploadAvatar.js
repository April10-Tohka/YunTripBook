import multer from "multer";
import * as path from "path";
// 设置文件存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars"); // 文件保存路径
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
        ); // 自定义文件名
    },
});

// 设置上传图片的过滤器
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("无效文件类型.仅允许 JPEG, PNG 格式"));
    }
};
//设置上传头像中间件
const uploadAvatar = multer({
    storage,
    limits: { fileSize: 1024 * 3 * 1024 },
    fileFilter,
}).single("avatar");

export default uploadAvatar;
