import app from "./src/app.js";
import config from "./src/config/index.js";
import { initRabbitMQ } from "./src/utils/rabbitMQ.js";
const PORT = config.server.PORT || 3000;

const startServer = () => {
    initRabbitMQ().then(() => {
        app.listen(PORT, () => {
            console.log(`服务器启动！地址为:  http://localhost:${PORT}`);
        });
    });
};

startServer();
