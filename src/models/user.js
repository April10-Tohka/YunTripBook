import { PrismaClient } from "@prisma/client";

class User {
    constructor() {
        console.log("user模块初始化会实例化prisma");
        this.prisma = new PrismaClient();
    }

    /**
     * 创建一个用户
     * @param phone 手机号
     * @param hashedPassword 哈希处理过的密码
     * @returns {Promise<unknown>}
     */
    createUser(phone, hashedPassword) {
        return new Promise((resolve, reject) => {
            this.prisma.user
                .create({
                    data: {
                        phone,
                        password_hash: hashedPassword,
                    },
                })
                .then((user) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(false);
                });
        });
    }

    /**
     * 通过手机号来查询用户
     * @param phone 手机号
     */
    queryUserByPhone(phone) {
        return new Promise((resolve, reject) => {
            this.prisma.user
                .findUnique({
                    where: {
                        phone,
                    },
                })
                .then((user) => {
                    console.log("查询成功！user:", user);
                })
                .catch((err) => {
                    console.log("查询失败!err:", err);
                });
        });
    }
}

export default new User();
