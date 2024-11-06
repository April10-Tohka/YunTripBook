import { sendResponse } from "../utils/sendResponse.js";
import PayService from "../services/payService.js";
class PayController {
    createAlipayPayment(req, res) {
        //获取商户订单号
        const { order_id } = req.body;
        //调用Service的生成
        PayService.generateAlipayPaymentUrl(order_id).then((data) => {
            sendResponse(res, data);
        });
    }
}

export default new PayController();
