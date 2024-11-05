import { Router } from "express";
import OrderController from "../controllers/orderController.js";
import { verifyAccessToken } from "../middlewares/verifyToken.js";

const router = Router();

//创建订单
router.post("/orders", verifyAccessToken, OrderController.createOrder);

//查询该用户下的所有订单
router.get("/orders", verifyAccessToken, OrderController.queryOrder);

//取消该用户的某个订单
router.post("/orders/cancel", verifyAccessToken, OrderController.cancelOrder);
export default router;
