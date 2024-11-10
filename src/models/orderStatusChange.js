import prisma from "../utils/prismaClient.js";

class OrderStatusChange {
    /**
     * 创建一条订单状态变化的记录
     * @param order_id 订单号
     * @param old_status 订单的旧状态
     * @param new_status 订单的新状态
     * @param change_reason 订单状态改变的原因
     */
    createOrderStatusChange(
        order_id,
        old_status = 0,
        new_status = 0,
        change_reason = ""
    ) {
        return new Promise((resolve, reject) => {
            console.log("=>(orderStatusChange.js:11) order_id", order_id);
            prisma.order_status_change
                .create({
                    data: {
                        order_id,
                        old_status,
                        new_status,
                        change_time: new Date(),
                        change_reason,
                    },
                })
                .then((data) => {
                    console.log(
                        "=>(orderStatusChange.js:21) 往数据库中插入一条订单状态变化记录成功",
                        data
                    );
                    resolve({
                        message: "往数据库中插入一条订单状态变化记录成功",
                    });
                })
                .catch((err) => {
                    console.log(
                        "=>(orderStatusChange.js:21) 往数据库中插入一条订单状态变化记录失败",
                        err
                    );
                    reject({
                        message: "往数据库中插入一条订单状态变化记录失败",
                    });
                });
        });
    }

    /**
     * 更新订单的状态
     * @param order_id 订单号
     * @param new_status 订单的新状态
     * @param change_reason 订单状态变化的原因
     * @returns {Promise<unknown>}
     */
    updateOrderStatus(order_id, new_status, change_reason) {
        return new Promise((resolve, reject) => {
            //该订单下的所有状态记录，以change_time降序排列
            prisma.order_status_change
                .findMany({
                    where: { order_id },
                    orderBy: { change_time: "desc" },
                })
                .then((records) => {
                    //获取第一条记录的new_status作为新纪录的old_status
                    const { new_status: old_status } = records[0];
                    //创建一条新的记录
                    return this.createOrderStatusChange(
                        order_id,
                        old_status,
                        new_status,
                        change_reason
                    );
                })
                .then((updateResult) => {
                    console.log(
                        "=>(orderStatusChange.js:69) 更新该订单的状态变化成功",
                        updateResult
                    );
                    resolve({ message: `更新该订单${order_id}的状态成功` });
                });
        });
    }
}

export default new OrderStatusChange();
