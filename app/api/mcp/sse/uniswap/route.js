import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    NextSSEServerTransport, 
    createExpressResponse, 
    createExpressRequest 
} from "../../transport.js";

// 创建一个新的 MCP 服务器实例
const server = new McpServer({
    name: "uniswap-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {}
});

// 添加示例工具
server.tool(
    "ping",
    "Responds with pong",
    {},
    async (params) => {
        console.log(`Received ping with params: ${JSON.stringify(params)}`);
        return {
            content: [
                {
                    type: "text",
                    text: "pong"
                }
            ]
        };
    }
);

// 全局传输层实例，用于在 GET 和 POST 之间共享
let transport = null;

// SSE 处理函数
export async function GET(request) {
    // 设置 SSE 响应
    const response = new Response(
        new ReadableStream({
            start(controller) {
                try {
                    // 创建模拟的响应对象
                    const expressRes = createExpressResponse(controller);
                    
                    // 创建 SSE 传输层
                    transport = new NextSSEServerTransport("/api/mcp/sse/uniswap", expressRes);
                    
                    // 连接到 MCP 服务器
                    server.connect(transport).catch(error => {
                        console.error("Error connecting to MCP server:", error);
                        controller.error(new Error(`Failed to connect to MCP server: ${error.message}`));
                    });
                    
                    console.log("Uniswap MCP Server running on SSE");
                } catch (error) {
                    console.error("Error starting SSE:", error);
                    controller.error(error);
                }
            },
            cancel() {
                // 当客户端断开连接时清理资源
                if (transport) {
                    transport.close();
                    transport = null;
                }
                console.log("SSE connection closed");
            }
        }),
        {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        }
    );

    return response;
}

// 处理消息的 POST 请求
export async function POST(request) {
    try {
        // 检查是否有活跃的 SSE 连接
        if (!transport) {
            return Response.json(
                { error: "No SSE connection established" },
                { status: 400 }
            );
        }

        // 创建模拟的请求和响应对象
        const expressReq = createExpressRequest(request);
        const nextRes = {
            status: 200,
            statusText: "OK",
            json: (data) => {
                return Response.json(data, { 
                    status: nextRes.status, 
                    statusText: nextRes.statusText 
                });
            }
        };

        // 处理消息
        await transport.handlePostMessage(expressReq, nextRes);
        
        // 返回响应
        return nextRes.json({});
    } catch (error) {
        console.error("Error in POST handler:", error);
        return Response.json(
            { error: `Internal server error: ${error.message}` },
            { status: 500 }
        );
    }
}
