import prisma from "../utils/prismaClient.js";
import * as crypto from "crypto";

const CANCEL_ORDER = -1; //取消订单
const SUCCESSFULLY_PAID_ORDER = 1; //支付成功订单
class Order {
    //生成唯一的数字编号
    generateUniqueNumber() {
        // 使用crypto.randomBytes()生成随机字节序列，然后将其转换为十六进制字符串，再进一步转换为数字形式来作为一种类似唯一编号的表示。
        const randomBytes = crypto.randomBytes(8); // 生成8个字节的随机字节序列
        const hexString = randomBytes.toString("hex");
        return String(parseInt(hexString, 16));
    }
    //创建一个订单记录并插入到order表
    createOrder(orderDetail, userID) {
        const { name, identity, phone, ...flightData } = orderDetail;
        const {
            aircraft_type,
            depart_city_code,
            depart_port_code,
            depart_terminal,
            arrive_city_code,
            arrive_port_code,
            arrive_terminal,
            on_time_rate,
            airline_code,
            current_week_schedule,
            stop_city_name,
            week_schedule_str,
            airline_logo,
            ...flightDetail
        } = flightData;
        flightDetail.depart_time = new Date(
            `1970-01-01T${flightDetail.depart_time}:00Z`
        );
        flightDetail.arrive_time = new Date(
            `1970-01-01T${flightDetail.arrive_time}:00Z`
        );
        flightDetail.depart_date = new Date(
            flightDetail.depart_date
        ).toISOString();
        //todo:对身份证进行脱敏
        const order_id = this.generateUniqueNumber();
        return new Promise((resolve, reject) => {
            prisma.order
                .create({
                    data: {
                        order_id,
                        user_id: userID,
                        passenger_name: name,
                        passenger_identity: identity,
                        passenger_phone: phone,
                        ...flightDetail,
                    },
                })
                .then((record) => {
                    console.log("创建订单成功");
                    resolve({
                        order_id,
                        create_at: record.create_at,
                        message: "往数据库插入一条订单记录成功",
                    });
                })
                .catch((err) => {
                    console.log("创建订单失败，查看原因", err);
                    reject({
                        error: err,
                        message: "往数据库插入一条订单记录失败",
                    });
                });
        });
    }

    //查询用户的所有订单记录
    queryUserOrders(userID) {
        //查询用户的所有订单记录
        return new Promise((resolve, reject) => {
            prisma.order
                .findMany({
                    where: { user_id: userID },
                })
                .then((findResult) => {
                    resolve(findResult);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //查询某一个订单
    queryOrder(order_id) {
        return new Promise((resolve, reject) => {
            prisma.order.findUnique({ where: { order_id } }).then(resolve);
        });
    }

    //取消该订单
    cancelOrder(order_id) {
        return new Promise((resolve, reject) => {
            //取消订单
            prisma.order
                .update({
                    where: { order_id },
                    data: { order_status: CANCEL_ORDER },
                })
                .then(resolve);
        });
    }

    //成功支付订单
    completeOrderPayment(order_id, trade_no, trade_status, payment_method) {
        return new Promise((resolve, reject) => {
            prisma.order
                .update({
                    where: { order_id },
                    data: {
                        trade_no,
                        trade_status,
                        order_status: SUCCESSFULLY_PAID_ORDER,
                        payment_method,
                    },
                })
                .then(resolve);
        });
    }
}

export default new Order();
