# 云途订

# 文件命名规范



# 后端接口的响应设计
在后端接口的响应设计中，遵循一致的格式有助于前端处理响应并进行相应的逻辑处理。一个良好的响应格式通常包含以下信息：

常见的响应格式结构
```json
{
"status": "success",
"code": 200,
"message": "Operation completed successfully",
"data": {
// 具体的数据内容
},
"error": null,
"timestamp": "2024-08-17T12:00:00Z"
}
```

响应字段解释
status (字符串):

描述请求的状态。常见值包括 "success"（成功）或 "error"（失败）。
code (数字):

HTTP 状态码，如 200 表示成功，400 表示请求错误，404 表示资源未找到，500 表示服务器错误。
message (字符串):

提供一条简明的提示信息，描述请求的结果。对于成功的请求，可以是 "Operation completed successfully"；对于失败的请求，可以描述错误原因，如 "Invalid parameters"。
data (对象/数组):

包含返回的实际数据。对于成功的请求，这部分应该包含前端需要的所有数据。如果请求失败，可以为空或不包含。
error (对象/数组):

当请求失败时，包含错误的详细信息，如错误码、错误信息等。对于成功的请求，可以为空或不包含。
示例：
```json
    "error": {
    "code": "INVALID_REQUEST",
    "details": "The 'id' parameter is missing"
    }
```

timestamp (字符串):

响应的时间戳，用于前端进行日志记录或问题追踪。通常使用 ISO 8601 格式。
示例：成功响应
```json
{
    "status": "success",
    "code": 200,
    "message": "Data fetched successfully",
    "data": {
        "id": 1,
        "name": "Sample Item",
        "description": "This is a sample description."
    },
    "error": null,
    "timestamp": "2024-08-17T12:00:00Z"
}
```

示例：错误响应
```json
{
    "status": "error",
    "code": 400,
    "message": "Invalid request",
    "data": null,
    "error": {
        "code": "INVALID_REQUEST",
        "details": "The 'id' parameter is required"
    },
    "timestamp": "2024-08-17T12:00:00Z"
}
```

设计注意事项
一致性: 确保所有接口遵循相同的响应格式，使得前端更容易处理和解析响应。
冗余信息: 提供足够的信息，帮助前端理解响应的具体情况，但避免返回不必要的敏感信息。
国际化支持: 如果服务支持多语言，可以考虑让 message 支持多语言格式，以便更好地服务全球用户。
这种结构化的响应格式可以帮助前端更好地处理不同场景下的接口返回，提升用户体验和开发效率


# 后端文件统一命名格式
