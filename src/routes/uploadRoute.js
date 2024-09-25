import { Router } from "express";
import uploadAvatar from "../middlewares/uploadAvatar.js";
import UploadController from "../controllers/uploadController.js";

const router = Router();

//上传头像
router.post("/upload/avatar", uploadAvatar, UploadController.uploadAvatar);

export default router;
