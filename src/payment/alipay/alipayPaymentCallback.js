import alipaySdk from "./alipayConfig.js";
import Order from "../../models/order.js";
import OrderStatusChange from "../../models/orderStatusChange.js";

const TRADE_SUCCESS = "TRADE_SUCCESS"; //交易支付成功
const PAYMENT_METHOD = "Alipay"; //支付方式
const SUCCESSFULLY_PAID_ORDER = 1; //支付成功订单
/**
 * 异步通知验签
 * @description 部分接口会设置回调地址，用于支付宝服务器向业务服务器通知业务情况（如交易成功）等。此时业务服务应该验证该回调的来源安全性，确保其确实由支付宝官方发起。 SDK 提供了对应的通知验签能力。
 * @param postData 支付宝异步通知
 * @returns {boolean} true | false
 */
export const signVerified = (postData) => {
    return alipaySdk.checkNotifySignV2(postData);
};

//支付宝异步通知的回调函数
const aliPaymentCallback = (req, res) => {
    const postData = req.body;
    console.log("=>(alipayPaymentCallback.js:17) postData", postData);
    //验签异步通知
    if (signVerified(postData) && postData.trade_status === TRADE_SUCCESS) {
        //获取订单号、交易号、交易状态
        const { out_trade_no: order_id, trade_no, trade_status } = postData;
        //更新订单
        Order.completeOrderPayment(
            order_id,
            trade_no,
            trade_status,
            PAYMENT_METHOD
        )
            //更新订单状态变化
            .then(() => {
                return OrderStatusChange.updateOrderStatus(
                    order_id,
                    SUCCESSFULLY_PAID_ORDER,
                    "支付成功"
                );
            });

        //写入日志
    }
};
export default aliPaymentCallback;
