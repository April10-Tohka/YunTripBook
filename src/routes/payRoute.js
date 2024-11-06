import { Router } from "express";
import PayController from "../controllers/payController.js";
const router = Router();

//生成支付宝支付请求
router.post("/pay/alipay", PayController.createAlipayPayment);

export default router;
