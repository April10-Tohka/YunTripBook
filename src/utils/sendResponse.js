/**
 *
 */

/**
 * 统一响应格式的函数
 * @param res
 * @param opts
      status：表示请求是否成功，通常是一个布尔值。
      code：表示响应的状态码，用于区分不同的响应状态，比如200表示成功，4xx表示客户端错误，5xx表示服务器错误。
      message：提供关于响应的简短描述信息，通常是对code的文本描述。
      data：如果请求成功，这里会包含请求的数据。
      error：如果请求失败，这里会包含错误信息。
      timestamp：响应生成的时间戳，有助于调试和记录日志。
 * }
 */

/**
 * Sends a standardized success response to the client.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {Object} opts - An options object that can contain the following properties:
 * @param {*} [opts.data=null] - The data to be sent in the response.
 * @param {number} [opts.code=200] - The HTTP status code to be used in the response.
 * @param {string} [opts.message='Success'] - A message describing the response.
 * @param {boolean} [opts.status=true] - Indicates if the request was successful.
 * @param {string} [opts.error=null] - An error message if the request failed.
 * @param {string} [opts.timestamp] - A timestamp for when the response was generated.
 */
export const sendResponse = (res, opts) => {
    const {
        data = null,
        code = 200,
        message = "Success",
        status = code >= 200 && code < 300,
        error = null,
        timestamp = new Date().toLocaleString(),
    } = opts;
    res.status(code).json({
        status,
        code,
        message,
        data,
        error,
        timestamp,
    });
};

/**
 * Sends a standardized error response to the client.
 *
 * @param {Object} res - The response object from the Express framework.
 * @param {Error|string} error - The error object or error message to be sent in the response.
 * @param {number} [code=500] - The HTTP status code to be used in the response.
 * @param {string} [message='Internal Server Error'] - A message describing the error.
 * @param {*} [data=null] - Additional data to be sent with the error response.
 */
export const sendError = (
    res,
    error,
    code = 500,
    message = "Internal Server Error",
    data = null
) => {
    res.status(code).json({
        status: false,
        code,
        message,
        data,
        error: error.message || error.toString(),
        timestamp: new Date().toISOString(),
    });
};
