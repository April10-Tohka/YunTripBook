import HomeService from "../services/homeService.js";
import { sendResponse, sendError } from "../utils/sendResponse.js";

class HomeController {
    // 获取低价速报的列表
    fetchLowPriceReport(req, res) {
        console.log("=>(homeController.js:5) req.body", req.body);
        try {
            const departureCityCode = req.body.code; //获取出发城市代码
            HomeService.fetchCtripApiAndProcess(departureCityCode)
                .then((data) => {
                    console.log(
                        "=>(homeController.js:13) service返回的data:",
                        data
                    );
                    sendResponse(res, data);
                })
                .catch((err) => {
                    console.log(
                        "=>(homeController.js:16) service返回的err",
                        err
                    );
                    sendError(res, err);
                });
        } catch (err) {}
    }

    // 获取搜索框推荐城市数据
    fetchSearchBoxRecommendCity(req, res) {
        //
        console.log("=>(homeController.js:31) req.body", req.body);
        try {
            const { departureCityCode } = req.body || "BJS"; //获取出发城市代码
            HomeService.fetchCtripSearchRecommendCityData(departureCityCode)
                .then((data) => {
                    console.log("=>(homeController.js:37) data", data);
                    sendResponse(res, data);
                })
                .catch((err) => {
                    console.log("=>(homeController.js:41) err", err);
                    sendError(res, err);
                });
        } catch (err) {}
    }
}

export default new HomeController();
