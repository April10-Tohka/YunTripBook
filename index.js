import app from "./src/app.js";
import config from "./src/config/index.js";

const PORT = config.server.PORT || 3000;

app.listen(PORT, () => {
    console.log(`服务器启动！地址为:  http://localhost:${PORT}`);
});
