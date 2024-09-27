import log4js from "log4js";

log4js.configure({
    appenders: {
        console: {
            type: "console",
            layout: {
                type: "pattern",
                pattern: "%d{yyyy-MM-dd hh:mm:ss} %-5p %m%n",
            },
        },
        file: {
            type: "file",
            filename: "./logs/api-calls.log",
            layout: {
                type: "pattern",
                pattern: "%d{yyyy-MM-dd hh:mm:ss} %-5p %m%n",
            },
        },
    },
    categories: {
        default: { appenders: ["console", "file"], level: "info" },
    },
});
const logger = log4js.getLogger();
export const loggerMiddleWare = (req, res, next) => {
    logger.info("[ API call started ]", { method: req.method, url: req.url });
    next();
};

export const loggerErrorMiddleWare = (err, req, res, next) => {
    logger.error("[ API call failed ]", { method: req.method, url: req.url });
};
