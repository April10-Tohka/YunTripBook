"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = exports.failureResponse = exports.successfulResponse = void 0;
const successfulResponse = (res, code = 200, data, error = null, message = "Data fetched successfully") => {
    res.json({
        status: "success",
        code,
        message,
        data,
        error: null,
        timestamp: new Date().toLocaleString(),
    });
};
exports.successfulResponse = successfulResponse;
const failureResponse = (res, code = 400, message = "Invalid request", data = null, error) => {
    res.json({
        status: "error",
        code,
        message,
        data: null,
        error: {
            code: "INVALID_REQUEST",
            details: "The 'id' parameter is required",
        },
        timestamp: new Date().toLocaleString(),
    });
};
exports.failureResponse = failureResponse;
const sendResponse = ({ res, code, data, message = "Data fetched successfully", error = null, }) => {
    res.status(code).json({
        timestamp: new Date().toLocaleString(),
        status: code >= 200 && code < 300 ? "success" : "error",
        code,
        data,
        message,
        error,
    });
};
exports.sendResponse = sendResponse;
