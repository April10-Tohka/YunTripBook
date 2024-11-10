import amqb from "amqplib";
import Order from "../models/order.js";
import OrderStatusChange from "../models/orderStatusChange.js";
let channel;

//死信队列
const deadLetterQueue = "dead-letter-queue";
//延迟队列
const delayQueue = "delay-queue";
//初始化MQ
const initRabbitMQ = () => {
    return new Promise(async (resolve, reject) => {
        //1.连接MQ
        const connection = await amqb.connect(
            "amqp://Tohka:Tohka10xiang@8.138.9.94:5672"
        );
        // 2.创建一个频道
        channel = await connection.createChannel();
        // 3.创建一个发送消息给死信队列的交换机
        channel.assertExchange("exchange_1", "direct", {
            durable: true,
        });
        // 创建一个接受死信队列的消息并发送给延迟队列的交换机
        channel.assertExchange("exchange_2", "direct", {
            durable: true,
        });
        //4.创建一个死信队列
        channel.assertQueue(deadLetterQueue, {
            durable: true,
            arguments: {
                "x-message-ttl": 900000, // 15分钟过期
                "x-dead-letter-exchange": "exchange_2",
            },
        });
        //创建一个延迟队列
        channel.assertQueue(delayQueue, {
            durable: true,
        });
        //绑定死信队列和交换机
        channel.bindQueue(deadLetterQueue, "exchange_1", "");
        //绑定延迟队列和交换机
        channel.bindQueue(delayQueue, "exchange_2", "");
        //延迟队列的消费者逻辑
        channel.consume(delayQueue, delayQueueConsumer);
        console.log("=>(rabbitMQ.js:43) rabbitMQ初始化完成");
        resolve();
    });
};

//延迟队列的消费者逻辑
const delayQueueConsumer = (msg) => {
    console.log("=>(rabbitMQ.js:53) ", JSON.parse(msg.content.toString()));
    const PENDINGPAY = 0; //待支付
    const CANCELLED = -1; //已取消
    const PAID = 1; //已支付
    //获取订单id
    const { order_id } = JSON.parse(msg.content.toString());
    //查询该订单
    Order.queryOrder(order_id).then((order) => {
        //获取该订单的支付状态(0-待支付,1-已支付,-1代表已取消)
        const { order_status } = order;
        switch (order_status) {
            case PENDINGPAY:
                console.log("15分钟过去了，该订单过期了还待支付，取消该订单");
                //取消订单
                Order.cancelOrder(order_id)
                    .then(() =>
                        //更新订单状态
                        OrderStatusChange.updateOrderStatus(
                            order_id,
                            CANCELLED,
                            "支付超时，订单自动取消"
                        )
                    )
                    .then(() => {
                        console.log(
                            "取消订单和更新订单状态完成后，确认该消息已处理"
                        );
                        //确认消息已处理
                        channel.ack(msg);
                    });
                break;
        }
    });
};
export { initRabbitMQ, channel };
