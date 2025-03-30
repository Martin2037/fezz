import { randomUUID } from "crypto";

/**
 * NextSSEServerTransport - 自定义的 Next.js App Router 兼容的 SSE 传输层
 * 根据官方的 SSEServerTransport 实现，保持相同的接口和功能
 */
export class NextSSEServerTransport {
    constructor(endpoint, res) {
        this.endpoint = endpoint; // 接收消息的路径，与官方实现一致
        this.res = res; // 模拟的响应对象
        this._sessionId = randomUUID(); // 会话ID，用于标识连接
        this.sseResponse = undefined; // SSE 响应对象，表示连接状态
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
    }

    async start() {
        if (this.sseResponse) {
            throw new Error(
                "SSEServerTransport already started! If using Server class, note that connect() calls start() automatically."
            );
        }

        try {
            // 设置 SSE 头部，已在外部 GET 路由中处理

            // 发送端点事件，告诉客户端要发送消息的地址
            this.res.enqueue(`event: endpoint\ndata: ${encodeURI(this.endpoint)}?sessionId=${this._sessionId}\n\n`);

            // 保存 SSE 响应对象
            this.sseResponse = this.res;

            // 设置关闭处理程序
            this.res.onClose = () => {
                this.sseResponse = undefined;
                if (this.onclose) {
                    this.onclose();
                }
            };

            console.log(`SSE transport started with sessionId: ${this._sessionId}`);
        } catch (error) {
            if (this.onerror) {
                this.onerror(new Error(`Failed to start transport: ${error.message}`));
            }
            throw error;
        }
    }

    async send(message) {
        if (!this.sseResponse) {
            throw new Error("Not connected");
        }

        try {
            // 发送消息事件，注意与官方实现保持一致
            this.res.enqueue(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
        } catch (error) {
            if (this.onerror) {
                this.onerror(new Error(`Failed to send message: ${error.message}`));
            }
        }
    }

    async close() {
        if (this.sseResponse) {
            try {
                this.res.close();
            } catch (error) {
                console.warn("关闭 SSE 响应时出错:", error.message);
                // 忽略已关闭的错误
            }
            this.sseResponse = undefined;
            if (this.onclose) {
                this.onclose();
            }
        }
    }

    /**
     * 处理来自客户端的 POST 消息，完全匹配官方的参数签名和功能
     */
    async handlePostMessage(req, res, parsedBody) {
        if (!this.sseResponse) {
            const message = "SSE connection not established";
            res.status = 500;
            res.statusText = message;
            return res.json({ error: message });
        }

        try {
            // 检查内容类型
            const contentType = req.headers["content-type"] || "";
            if (!contentType.includes("application/json")) {
                throw new Error(`Unsupported content-type: ${contentType}`);
            }

            // 获取请求体
            let body;
            try {
                body = parsedBody || await req.json();
            } catch (error) {
                res.status = 400;
                res.statusText = String(error);
                return res.json({ error: String(error) });
            }

            // 处理消息
            try {
                await this.handleMessage(body);
            } catch (error) {
                res.status = 400;
                res.statusText = `Invalid message: ${error.message}`;
                return res.json({ error: `Invalid message: ${error.message}` });
            }

            // 成功响应
            res.status = 202;
            res.statusText = "Accepted";
            return res.json({ status: "accepted" });
        } catch (error) {
            console.error("Error handling post message:", error);
            res.status = 500;
            return res.json({ error: error.message });
        }
    }

    /**
     * 处理客户端消息，无论它是如何到达的
     */
    async handleMessage(message) {
        try {
            // 在官方实现中有 JSON 验证，这里我们简化为基本类型检查
            if (typeof message !== 'object' || message === null) {
                throw new Error("Invalid JSON-RPC message");
            }

            if (this.onmessage) {
                this.onmessage(message);
            }
        } catch (error) {
            if (this.onerror) {
                this.onerror(error);
            }
            throw error;
        }
    }

    /**
     * 返回此传输的会话 ID
     */
    get sessionId() {
        return this._sessionId;
    }
}

/**
 * 创建 Next.js 适配的 ExpressResponse 对象
 * @param {ReadableStreamDefaultController} controller - 用于控制 ReadableStream 的控制器
 * @returns {Object} 模拟的 Express 响应对象
 */
export function createExpressResponse(controller) {
    let isClosed = false;
    return {
        // 向 SSE 流写入数据
        enqueue: (data) => {
            if (!isClosed) {
                controller.enqueue(data);
            }
        },
        
        // 关闭 SSE 流
        close: () => {
            if (!isClosed) {
                isClosed = true;
                controller.close();
            }
        },
        
        // 存储状态码和状态文本
        status: 200,
        statusText: "OK",
        
        // 模拟 Express 的 res.json 方法
        json: (data) => {
            // 在 SSE 上下文中，这只是为了兼容 API
            return data;
        },
        
        // 关闭处理程序
        onClose: null
    };
}

/**
 * 创建 Next.js 适配的 ExpressRequest 对象
 * @param {Request} request - Next.js 的请求对象
 * @returns {Object} 模拟的 Express 请求对象
 */
export function createExpressRequest(request) {
    return {
        // 原始请求对象
        originalRequest: request,
        
        // 获取 JSON 数据
        json: () => request.json(),
        
        // 请求头
        headers: Object.fromEntries(request.headers.entries()),
        
        // 请求方法
        method: request.method,
        
        // URL 和查询参数
        url: request.url,
        query: Object.fromEntries(new URL(request.url).searchParams)
    };
}

/**
 * 创建用于处理 SSE POST 请求的响应包装器
 * @returns {Object} 用于处理 POST 请求的响应对象
 */
export function createNextResponse() {
    return {
        status: 200,
        statusText: "OK",
        json: (data) => {
            return Response.json(data, { 
                status: this.status, 
                statusText: this.statusText 
            });
        }
    };
}
