import alipaySdk from "./alipayConfig.js";

/**
 * 生成支付宝的支付订单,返回支付链接
 * @param orderInfo 订单信息(订单号，金额，订单标题)
 * @returns {string} 支付链接url
 */
export const generateAlipayPaymentOrder = (orderInfo) => {
    const paymentParams = {
        return_url: "http://localhost:5173/order",
        notify_url: "http://8.138.9.94:3000/api/pay/alipay/notify",
        bizContent: {
            out_trade_no: orderInfo.out_trade_no,
            total_amount: orderInfo.total_amount,
            subject: orderInfo.subject,
            product_code: "FAST_INSTANT_TRADE_PAY",
        },
    };
    return alipaySdk.pageExecute("alipay.trade.page.pay", "GET", paymentParams);
};
