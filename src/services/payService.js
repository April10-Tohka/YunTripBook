import Order from "../models/order.js";
import { generateAlipayPaymentOrder } from "../payment/alipay/alipayPaymentGenerator.js";
class PayService {
    //生成支付宝的支付链接
    generateAlipayPaymentUrl(order_id) {
        return new Promise((resolve, reject) => {
            //从数据库中查询该订单的具体信息
            Order.queryOrder(order_id).then((order) => {
                //需要金额，
                const { price, depart, arrive, depart_date } = order;
                function formatDate(dateStr) {
                    const dateObj = new Date(dateStr);
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(
                        2,
                        "0"
                    );
                    const day = String(dateObj.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                }
                const orderInfo = {
                    out_trade_no: order_id,
                    total_amount: `${price}`,
                    subject: `${depart}-${arrive} ${formatDate(depart_date)}机票订单`,
                };
                const alipayPaymentUrl = generateAlipayPaymentOrder(orderInfo);
                resolve({
                    code: 200,
                    data: alipayPaymentUrl,
                    message: "生成支付宝的支付订单成功",
                });
            });
        });
    }
}

export default new PayService();
