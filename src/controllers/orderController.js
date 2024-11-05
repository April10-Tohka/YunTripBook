import { sendError, sendResponse } from "../utils/sendResponse.js";
import checkFunctions from "../utils/checkFunctions.js";
import OrderService from "../services/orderService.js";
class OrderController {
    //创建订单
    createOrder(req, res) {
        //
        try {
            const orderDetail = req.body;
            console.log("=>(orderController.js:34) req.user", req.user);
            const userID = req.user.user_id;
            console.log("=>(orderController.js:11) orderDetail", orderDetail);
            //校验数据
            if (!orderDetail.phone) {
                throw {
                    code: 400,
                    message: "请填写正确的手机号码，以便接收信息",
                };
            }
            if (!checkFunctions.isValidChinaMobile(orderDetail.phone)) {
                throw {
                    code: 400,
                    message: "请填写正确的手机号码，以便接收信息",
                };
            }
            if (!checkFunctions.validateIdentity(orderDetail.identity)) {
                throw { code: 400, message: "请填写登机证件上的证件号码" };
            }
            if (!orderDetail.name) {
                throw { code: 400, message: "请按照登机所持证件填写中文姓名" };
            }
            if (!checkFunctions.chineseNameReg(orderDetail.name)) {
                throw { code: 400, message: "请输入正确的中文姓名" };
            }
            OrderService.createOrderAndSaveToDB(orderDetail, userID)
                .then((data) => {
                    console.log("创建订单service完成", data);
                    sendResponse(res, data);
                })
                .catch((err) => {
                    console.log("创建订单service失败", err);
                    sendError(res, err);
                });
        } catch (err) {
            sendError(res, err);
        }
    }

    //查询用户的所有订单记录
    queryOrder(req, res) {
        const { user_id } = req.user;
        OrderService.getUserAllOrdersAndProcessData(user_id).then((data) => {
            sendResponse(res, data);
        });
    }

    //取消订单
    cancelOrder(req, res) {
        //获取order_id
        const { order_id } = req.body;
        OrderService.cancelUserOrder(order_id).then((data) => {
            sendResponse(res, data);
        });
    }
}

export default new OrderController();
