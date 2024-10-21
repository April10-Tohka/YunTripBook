import { Router } from "express";
import HomeController from "../controllers/homeController.js";
const router = Router();

// 获取低价速报的列表;
router.post("/low-price-report", HomeController.fetchLowPriceReport);

// 搜索框推荐城市
router.post(
    "/search-box-recommend",
    HomeController.fetchSearchBoxRecommendCity
);
export default router;
