import prisma from "../utils/prismaClient.js";
class User {
    /**
     * 创建一个用户
     * @param phone 手机号
     * @param hashedPassword 哈希处理过的密码
     * @returns {Promise<unknown>}
     */
    createUser(phone, hashedPassword) {
        return new Promise((resolve, reject) => {
            prisma.user
                .create({
                    data: {
                        phone,
                        password_hash: hashedPassword,
                    },
                })
                .then((user) => {
                    resolve({ status: true, data: user });
                })
                .catch((err) => {
                    reject({ status: false, error: err });
                });
        });
    }

    /**
     * 通过手机号来查询用户
     * @param phone 手机号
     */
    queryUserByPhone(phone) {
        return new Promise((resolve, reject) => {
            prisma.user
                .findFirst({
                    where: {
                        phone,
                    },
                })
                .then((result) => {
                    console.log("数据库查询成功！结果为user|null:", result);
                    //数据库中存在该用户
                    if (result) {
                        resolve({ exit: true, user: result });
                    }
                    resolve({ exit: false, user: result });
                })
                .catch((err) => {
                    console.log("数据库查询失败!err:", err);
                    reject(err);
                });
        });
    }
}

export default new User();
