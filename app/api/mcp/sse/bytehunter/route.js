import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    NextSSEServerTransport, 
    createExpressResponse, 
    createExpressRequest 
} from "../../transport.js";
import { analyzeTransaction } from "./lib.js";
import { z } from "zod";

// 创建一个新的 MCP 服务器实例
const server = new McpServer({
    name: "bytehunter-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {}
});

// 攻击类型映射
const ATTACK_TYPE_MAP = {
    1: "Private Key Leak",
    2: "Seaport Contract Order Forgery",
    3: "Blur Contract Order Forgery",
    4: "Approve Authorization (ERC20)",
    5: "ApprovalForAll Authorization (ERC721)",
    6: "Permit Authorization",
    7: "Address Poisoning",
    8: "Token Risk",
    9: "Swap Risk",
    10: "Transfer Address Risk"
};


server.tool(
    "analyze-transaction-if-scam",
    "analyze a transaction to determine if it is a scam",
    {
        transaction_hash: z.string().describe("transaction hash"),
        chain_id: z.string().describe("chain id")
    },
    async (params) => {
        try {
            const result = await analyzeTransaction(params);
            
            // 解析攻击类型
            let analysisResult = {
                ...result
            };
            
            if (result.code === 200 && result.data && result.data.event_info) {
                const attackType = result.data.event_info.attack_type;
                const attackTypeName = ATTACK_TYPE_MAP[attackType] || "未知攻击类型";
                
                // 增强返回结果
                analysisResult = {
                    analysis: {
                        attackType,
                        attackTypeName,
                        isScam: attackType > 0,
                        details: {
                            event: result.data.event_info.event || "",
                            network: result.data.event_info.network || "",
                            occurrenceTime: result.data.event_info.occurrence_time || ""
                        }
                    }
                };
            }
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(analysisResult, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error("交易分析失败:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `分析交易失败: ${error.message}`
                    }
                ]
            };
        }
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
                    transport = new NextSSEServerTransport("/api/mcp/sse/bytehunter", expressRes);
                    
                    // 连接到 MCP 服务器
                    server.connect(transport).catch(error => {
                        console.error("Error connecting to MCP server:", error);
                        controller.error(new Error(`Failed to connect to MCP server: ${error.message}`));
                    });
                    
                    console.log("ByteHunter MCP Server running on SSE");
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
