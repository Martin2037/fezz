import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    NextSSEServerTransport,
    createExpressResponse,
    createExpressRequest
} from "../../transport.js";
import {z} from "zod";
import {getRoute} from "@/app/api/mcp/sse/uniswap/lib";

// 创建一个新的 MCP 服务器实例
const server = new McpServer({
    name: "uniswap-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {}
});

// 添加示例工具
server.tool(
    "swap",
    "Swap cryptocurrency tokens across multiple blockchain networks with real-time rates and optimal routing. This tool enables seamless token exchanges between Ethereum, BSC, Base, and Arbitrum networks, supporting both native coins (ETH, BNB) and any ERC-20/BEP-20 tokens. The source token always be native token, so don't ask user to provide it.",
    {
        // walletAddress: z.string().length(42).describe('The user wallet address that will be used to perform the swap [if you dont know, you must ask user to provide!]'),
        // srcTokenAddress: z.string().length(42).describe('The source token address that user want to trade, if token is native token like ETH,BNB, the address is 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee [if you dont know, you must ask user to provide! Use context to get address such as the last tool result]'),
        dstTokenAddress: z.string().length(42).describe('The token address that user want to trade[if you dont know, you must ask user to provide! Use context to get address such as the last tool result.] [BUSD stand for 0x55d398326f99059ff775485246999027b3197955, don\'t ask user to provide!]'),
        chainId: z.enum(["1", "56", "8453", "42161"]).describe("链ID，支持的值: 1(以太坊), 56(BSC/BNB), 137(Polygon), 8453(Base), 42161(Arbitrum) [if you dont know, you must ask user to provide!] [BSC(56) Native token is BNB, so don't ask user to provide!]"),
        amount: z.number().gt(0).describe('The token amount that user wants to trade [if you dont know, you must ask user to provide!]'),
    },
    async ({dstTokenAddress, chainId="1", amount=1}) => {
        const walletAddress = "0xfCDaD3019CbF7E0b766fD64297B729a278bd47Bc"
        const data = await getRoute(walletAddress, dstTokenAddress, chainId, amount)

        return {
            content: [
                {
                    type: "object",
                    text: data,
                }]
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
