import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    NextSSEServerTransport, 
    createExpressResponse, 
    createExpressRequest 
} from "../../transport.js";
import { getTrendingTokens, getWalletPnlSummary, searchTokens, getTokensMetadata, getWalletTokens } from "./lib.js";
import { z } from "zod";

// 创建一个新的 MCP 服务器实例
const server = new McpServer({
    name: "moralis-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {}
});

// 添加获取热门代币工具
server.tool(
    "trending_tokens",
    "Get trending tokens on a specific blockchain network & chain id",
    {
        chain_id: z.enum(["1", "56", "8453"]).describe("Chain ID, supported values: 1(Ethereum), 56(BSC), 8453(Base)")
    },
    async (params) => {
        try {
            const chainIdMap = {
                "1": "eth",
                "56": "bsc",
                "8453": "base"
            };
            
            const chain = chainIdMap[params.chain_id] || "bsc";
            
            const result = await getTrendingTokens(chain);
            
            const formattedTokens = Array.isArray(result) && result.length > 0
                ? result.slice(0, 10).map(token => ({
                    chain_id: params.chain_id,
                    token_address: token?.address?.toLowerCase() || token?.tokenAddress?.toLowerCase(),
                    name: token.name,
                    uniqueName: `${token.name?.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 100)}`,
                    symbol: token.symbol,
                    decimals: token.decimals || 18,
                    usdPrice: token.usdPrice || 0,
                    createdAt: token.createdAt || Math.floor(Date.now() / 1000),
                    marketCap: token.marketCap || 0,
                    liquidityUsd: token.liquidityUsd || 0,
                    holders: token.holders || 0,
                    pricePercentChange: {
                        "1h": token.pricePercentChange?.["1h"] || token.price_change_1h || 0,
                        "4h": token.pricePercentChange?.["4h"] || token.price_change_4h || 0,
                        "12h": token.pricePercentChange?.["12h"] || token.price_change_12h || 0,
                        "24h": token.pricePercentChange?.["24h"] || token.price_change_24h || 0
                    },
                    totalVolume: {
                        "1h": token.totalVolume?.["1h"] || token.volume_1h || 0,
                        "4h": token.totalVolume?.["4h"] || token.volume_4h || 0,
                        "12h": token.totalVolume?.["12h"] || token.volume_12h || 0,
                        "24h": token.totalVolume?.["24h"] || token.volume_24h || 0
                    },
                    transactions: {
                        "1h": token.transactions?.["1h"] || 0,
                        "4h": token.transactions?.["4h"] || 0,
                        "12h": token.transactions?.["12h"] || 0,
                        "24h": token.transactions?.["24h"] || 0
                    },
                    buyTransactions: {
                        "1h": token.buyTransactions?.["1h"] || 0,
                        "4h": token.buyTransactions?.["4h"] || 0,
                        "12h": token.buyTransactions?.["12h"] || 0,
                        "24h": token.buyTransactions?.["24h"] || 0
                    },
                    sellTransactions: {
                        "1h": token.sellTransactions?.["1h"] || 0,
                        "4h": token.sellTransactions?.["4h"] || 0,
                        "12h": token.sellTransactions?.["12h"] || 0,
                        "24h": token.sellTransactions?.["24h"] || 0
                    },
                    buyers: {
                        "1h": token.buyers?.["1h"] || 0,
                        "4h": token.buyers?.["4h"] || 0,
                        "12h": token.buyers?.["12h"] || 0,
                        "24h": token.buyers?.["24h"] || 0
                    },
                    sellers: {
                        "1h": token.sellers?.["1h"] || 0,
                        "4h": token.sellers?.["4h"] || 0,
                        "12h": token.sellers?.["12h"] || 0,
                        "24h": token.sellers?.["24h"] || 0
                    }
                }))
                : [];
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(formattedTokens)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `获取热门代币失败: ${error.message}`
                    }
                ]
            };
        }
    }
);

// 添加获取钱包盈亏情况工具
server.tool(
    "wallet_pnl",
    "Get wallet profit/pnl summary",
    {
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("钱包地址，以0x开头的42位十六进制字符串"),
        chain_id: z.enum(["1", "56", "137", "8453"]).describe("区块链ID，支持的值: 1(Ethereum), 56(BSC), 137(Polygon), 8453(Base)")
    },
    async (params) => {
        try {
            const chainIdMap = {
                "1": "eth",
                "56": "bsc",
                "137": "polygon",
                "8453": "base"
            };
            
            const chain = chainIdMap[params.chain_id] || "eth";
            const result = await getWalletPnlSummary(params.address, chain);
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            address: params.address,
                            chain_id: params.chain_id,
                            chain_name: chain,
                            total_count_of_trades: result.total_count_of_trades || 0,
                            total_trade_volume: result.total_trade_volume || "0",
                            total_realized_profit_usd: result.total_realized_profit_usd || "0",
                            total_realized_profit_percentage: result.total_realized_profit_percentage || 0,
                            total_buys: result.total_buys || 0,
                            total_sells: result.total_sells || 0,
                            total_sold_volume_usd: result.total_sold_volume_usd || "0",
                            total_bought_volume_usd: result.total_bought_volume_usd || "0",
                            data_from: "Moralis API"
                        })
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `获取钱包盈亏数据失败: ${error.message}`
                    }
                ]
            };
        }
    }
);

// 添加批量获取代币元数据工具
server.tool(
    "tokens_metadata",
    "Get metadata for multiple ERC20 tokens",
    {
        addresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).min(1).max(20).describe("代币合约地址数组，每个地址必须是以0x开头的42位十六进制字符串"),
        chain_id: z.enum(["1", "56", "137", "8453"]).describe("区块链ID，支持的值: 1(Ethereum), 56(BSC), 137(Polygon), 8453(Base)")
    },
    async (params) => {
        try {
            const chainIdMap = {
                "1": "eth",
                "56": "bsc",
                "137": "polygon",
                "8453": "base"
            };
            
            const chain = chainIdMap[params.chain_id] || "eth";
            const result = await getTokensMetadata(params.addresses, chain);
            
            // 格式化返回数据，包含所有可能的字段
            const formattedTokens = Array.isArray(result) ? result.map(token => ({
                chain_id: params.chain_id,
                token_address: token.address?.toLowerCase(),
                address_label: token.address_label || null,
                name: token.name || "Unknown",
                symbol: token.symbol || "???",
                decimals: token.decimals || "18",
                logo: token.logo || null,
                logo_hash: token.logo_hash || null,
                thumbnail: token.thumbnail || null,
                total_supply: token.total_supply || null,
                total_supply_formatted: token.total_supply_formatted || null,
                fully_diluted_valuation: token.fully_diluted_valuation || null,
                block_number: token.block_number || null,
                validated: token.validated || 0,
                created_at: token.created_at || null,
                possible_spam: token.possible_spam || false,
                verified_contract: token.verified_contract || false,
                categories: token.categories || [],
                links: token.links || {
                    reddit: null,
                    twitter: null,
                    website: null,
                    slack: null,
                    github: null,
                    moralis: null
                },
                security_score: token.security_score || null,
                description: token.description || null,
                circulating_supply: token.circulating_supply || null,
                market_cap: token.market_cap || null
            })) : [];
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(formattedTokens)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `获取代币元数据失败: ${error.message}`
                    }
                ]
            };
        }
    }
);

// 添加获取钱包所有代币工具
server.tool(
    "wallet_tokens",
    "Get all tokens owned by a wallet address",
    {
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("钱包地址，以0x开头的42位十六进制字符串"),
        chain_id: z.enum(["1", "56", "137", "8453"]).describe("区块链ID，支持的值: 1(Ethereum), 56(BSC), 137(Polygon), 8453(Base)"),
        min_usd_value: z.number().optional().default(10).describe("代币最小美元价值，默认为10美元")
    },
    async (params) => {
        try {
            const chainIdMap = {
                "1": "eth",
                "56": "bsc",
                "137": "polygon",
                "8453": "base"
            };
            
            const chain = chainIdMap[params.chain_id] || "eth";
            const result = await getWalletTokens(params.address, chain, 50);
            
            // 如果结果包含错误信息则返回错误
            if (result.success === false) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `获取钱包代币失败: ${result.error}`
                        }
                    ]
                };
            }
            
            const minUsdValue = params.min_usd_value || 10;
            const filteredTokens = Array.isArray(result.result) 
                ? result.result.filter(token => {
                    const usdValue = parseFloat(token.usd_value || 0);
                    return usdValue >= minUsdValue;
                  })
                : [];
            
            // 返回标准化的结果
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            address: params.address,
                            chain_id: params.chain_id,
                            chain_name: chain,
                            cursor: result.cursor,
                            page: result.page,
                            page_size: result.page_size,
                            block_number: result.block_number,
                            min_usd_value: minUsdValue,
                            tokens: filteredTokens,
                            total_tokens_count: result.result?.length || 0,
                            filtered_tokens_count: filteredTokens.length,
                        })
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `获取钱包代币失败: ${error.message}`
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
                    transport = new NextSSEServerTransport("/api/mcp/sse/moralis", expressRes);
                    
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
