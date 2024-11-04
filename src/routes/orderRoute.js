import { Router } from "express";
import OrderController from "../controllers/orderController.js";
import { verifyAccessToken } from "../middlewares/verifyToken.js";
import orderController from "../controllers/orderController.js";

const router = Router();

//创建订单
router.post("/orders", verifyAccessToken, OrderController.createOrder);

//查询该用户下的所有订单
router.get("/orders", verifyAccessToken, orderController.queryOrder);
export default router;
