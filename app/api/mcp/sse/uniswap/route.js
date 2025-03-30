import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    NextSSEServerTransport,
    createExpressResponse,
    createExpressRequest
} from "../../transport.js";
import {z} from "zod";
import {ethers} from "ethers";
import {chainIdToMoralis, ChainRpc} from "@/app/const/server";
import {CurrencyAmount, Percent, Token, TradeType} from "@uniswap/sdk-core";
import {FeeAmount} from "@uniswap/v3-sdk";
import {AlphaRouter, SwapType} from "@uniswap/smart-order-router";
import {getTokensMetadata} from "@/app/api/mcp/sse/moralis/lib";
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
    "Swap coins through UniswapV3",
    {
        walletAddress: z.string().length(42).describe('The user wallet address that trade token'),
        inTokenAddress: z.string().length(42).describe('The token address that user want to trade out'),
        outTokenAddress: z.string().length(42).describe('The token address that user want to trade in'),
        chainId: z.enum(["1", "56", "8453"]).describe("链ID，支持的值: 1(以太坊), 56(BSC), 137(Polygon), 8453(Base)"),
        amountIn: z.number().gt(0).describe('The token amount that user trade out'),
    },
    async ({walletAddress='0xd1cc053f804cdc7bdf4f7cf40296661098126fbf', inTokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', outTokenAddress = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', chainId="1", amountIn=1}) => {
        const data = await getRoute(walletAddress, inTokenAddress, outTokenAddress, chainId, amountIn)

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
