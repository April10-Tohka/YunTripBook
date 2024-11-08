import { Router } from "express";
import PayController from "../controllers/payController.js";
const router = Router();

//生成支付宝支付请求
router.post("/pay/alipay", PayController.createAlipayPayment);

// 交易成功后，支付宝通过 post 请求 notifyUrl（商户入参传入），返回异步通知参数
router.post("/pay/alipay/notify", (req, res) => {
    console.log("=>(payRoute.js:17) ", "/pay/alipay/notify");
    console.log(req.body);
});
export default router;
