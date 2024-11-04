import Order from "../models/order.js";
import OrderStatusChange from "../models/orderStatusChange.js";
import redis from "../utils/redisClient.js";
import { channel } from "../utils/rabbitMQ.js";
class OrderService {
    //创建订单记录并保存到数据库中
    createOrderAndSaveToDB(orderDetail, userID) {
        /**
         * 1. 检查redis中该用户是否在3s内重复下单
         * 2. 创建订单
         */
        const redisKey = `${userID}:/api/orders:${orderDetail.flight_no}`;
        const redisKeyExpire = 3; //键的过期时间
        return new Promise((resolve, reject) => {
            //设置锁
            redis
                .set(redisKey, true, "NX", "EX", redisKeyExpire)
                .then((result) => {
                    console.log("=>(orderService.js:15) result", result);
                    if (!result) {
                        //说明已经设置好锁了(代表已经3s内已经下过单了)
                        return Promise.reject({
                            code: 410,
                            message: "您已经提交了相同的订单，请勿重复操作。",
                            error: {
                                flightNo: orderDetail.flight_no,
                                userID,
                                departDate: orderDetail.depart_date,
                            },
                        });
                    }
                    //没有下过单，就生成订单
                    return Order.createOrder(orderDetail, userID);
                })
                .then(({ order_id, create_at }) => {
                    console.log(
                        "=>(orderService.js:35) 查看订单号order_id",
                        order_id,
                        create_at
                    );
                    return Promise.all([
                        OrderStatusChange.createOrderStatusChange(order_id),
                        this.addOrderToMQ(order_id, create_at),
                    ]);
                })
                .then((data) => {
                    console.log(
                        "=>(orderService.js:43) 记录好订单及订单状态变化和成功订单添加到MQ",
                        data
                    );
                    resolve({
                        code: 201,
                        message:
                            "下单成功,前往 我的订单 完成支付，即可预订成功",
                    });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * 将订单添加到消息队列中
     * @param order_id 订单id
     * @param create_at 订单创建时间
     */
    addOrderToMQ(order_id, create_at) {
        //
        const orderData = { order_id, create_at };
        const expiration = "900000"; //过期时间(ms为单位)
        return new Promise((resolve, reject) => {
            // 4.发送消息到死信队列
            channel.publish(
                "exchange_1",
                "",
                Buffer.from(JSON.stringify(orderData)),
                {
                    expiration,
                }
            );
            resolve();
        });
    }

    //获取该用户的所有订单记录
    getUserAllOrdersAndProcessData(userID) {
        function formatTime(timeStr) {
            const dateObj = new Date(timeStr);
            const hours = dateObj.getHours();
            const minutes = dateObj.getMinutes();

            const formattedHours = String(hours).padStart(2, "0");
            const formattedMinutes = String(minutes).padStart(2, "0");

            return `${formattedHours}:${formattedMinutes}`;
        }

        function formatDate(dateStr) {
            const dateObj = new Date(dateStr);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
        return new Promise((resolve, reject) => {
            Order.queryUserOrders(userID)
                .then((data) => {
                    //处理数据格式
                    for (let i = 0; i < data.length; i++) {
                        data[i].depart_date = formatDate(data[i].depart_date);
                        data[i].depart_time = formatTime(data[i].depart_time);
                        data[i].arrive_time = formatTime(data[i].arrive_time);
                        data[i].create_at = formatTime(data[i].create_at);
                    }
                    resolve({
                        code: 200,
                        data,
                        message: "查询该用户所有的订单记录成功",
                    });
                })
                .catch((err) => {
                    console.log(
                        "=>(orderService.js:93) 查询该用户所有订单记录失败",
                        err
                    );
                    reject({ code: 400, error: err });
                });
        });
    }
}

export default new OrderService();
