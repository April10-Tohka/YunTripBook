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
    const response = {
        data: opts.data || null,
        code: opts.code || 200,
        message: opts.message || "Success",
        status: opts.code >= 200 && opts.code < 300,
        error: null,
        timestamp: new Date().toLocaleString(),
    };
    res.status(response.code).json(response);
};

export const sendError = (res, opts) => {
    const error = {
        data: null,
        code: opts.code || 500,
        message: opts.message || "Internal Server Error",
        status: false,
        error: opts.error || opts.message,
        timestamp: new Date().toLocaleString(),
    };
    res.status(error.code).json(error);
};
