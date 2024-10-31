import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 连接池设置
prisma.$connect({
    maxPoolSize: 20, // 根据需要增加连接数
});
export default prisma;
