import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    NextSSEServerTransport, 
    createExpressResponse, 
    createExpressRequest 
} from "../../transport.js";
import { z } from "zod";
import { TokenSecurity } from "./lib.js";


const server = new McpServer({
    name: "goplus-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {}
});


server.tool(
    "token-security-api",
    "Scan crypto token security, any token address will scan",
    {
        token_address: z.string().describe("The address of the token to scan"),
        chain_id: z.enum(["1", "56", "137", "8453"]).describe("链ID，支持的值: 1(以太坊), 56(BSC), 137(Polygon), 8453(Base)")
    },
    async ({token_address, chain_id}) => {
        const data = await TokenSecurity(chain_id, token_address);
        
        // 检查API返回是否成功
        if (!data || data.code !== 1) {
            return {
                content: [
                    {
                        type: "text",
                        text: "获取Token安全信息失败，请稍后重试。"
                    }
                ]
            };
        }
        
        const tokenInfo = data.result[token_address.toLowerCase()];
        if (!tokenInfo) {
            return {
                content: [
                    {
                        type: "text",
                        text: "未找到该Token的安全信息。"
                    }
                ]
            };
        }
        
        // 整理安全风险列表
        const securityRisks = [];
        if (tokenInfo.is_honeypot === "1") securityRisks.push("⚠️ 蜜罐代币风险");
        if (tokenInfo.cannot_buy === "1") securityRisks.push("⚠️ 无法购买");
        if (tokenInfo.cannot_sell_all === "1") securityRisks.push("⚠️ 无法全部卖出");
        if (tokenInfo.slippage_modifiable === "1") securityRisks.push("⚠️ 滑点可修改");
        if (tokenInfo.is_blacklisted === "1") securityRisks.push("⚠️ 存在黑名单机制");
        if (tokenInfo.can_take_back_ownership === "1") securityRisks.push("⚠️ 可夺回所有权");
        if (tokenInfo.hidden_owner === "1") securityRisks.push("⚠️ 隐藏所有者");
        if (tokenInfo.selfdestruct === "1") securityRisks.push("⚠️ 合约可自毁");
        if (tokenInfo.external_call === "1") securityRisks.push("⚠️ 存在外部调用风险");
        
        // 税率信息
        const taxInfo = [];
        if (tokenInfo.buy_tax && parseFloat(tokenInfo.buy_tax) > 0) {
            taxInfo.push(`买入税: ${parseFloat(tokenInfo.buy_tax) * 100}%`);
        }
        if (tokenInfo.sell_tax && parseFloat(tokenInfo.sell_tax) > 0) {
            taxInfo.push(`卖出税: ${parseFloat(tokenInfo.sell_tax) * 100}%`);
        }
        
        // 基本信息
        const basicInfo = [
            `代币名称: ${tokenInfo.token_name || "未知"}`,
            `代币符号: ${tokenInfo.token_symbol || "未知"}`,
            `持有人数量: ${tokenInfo.holder_count || "未知"}`,
            `创建者地址: ${tokenInfo.creator_address || "未知"}`,
            `创建者持有比例: ${tokenInfo.creator_percent ? (parseFloat(tokenInfo.creator_percent) * 100).toFixed(2) + "%" : "未知"}`,
            `开源状态: ${tokenInfo.is_open_source === "1" ? "已开源" : "未开源"}`,
        ];
        
        // 组装最终返回内容
        let resultText = `## ${tokenInfo.token_name || "Token"} (${tokenInfo.token_symbol || ""}) 安全分析\n\n`;
        
        // 安全状态总结
        if (securityRisks.length === 0) {
            resultText += "### ✅ 未发现明显安全风险\n\n";
        } else {
            resultText += "### ⚠️ 发现潜在安全风险\n\n";
            resultText += securityRisks.join("\n") + "\n\n";
        }
        
        // 税率信息
        if (taxInfo.length > 0) {
            resultText += "### 代币税率\n";
            resultText += taxInfo.join("\n") + "\n\n";
        }
        
        // 基本信息
        resultText += "### 基本信息\n";
        resultText += basicInfo.join("\n") + "\n\n";
        
        // 链接到GoPlus
        resultText += `详细信息可查看: https://gopluslabs.io/token-security/${chain_id}/${token_address}`;
        
        return {
            content: [
                {
                    type: "text",
                    text: resultText
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
                    const expressRes = createExpressResponse(controller);
                    transport = new NextSSEServerTransport("/api/mcp/sse/goplus", expressRes);
                    server.connect(transport).catch(error => {
                        console.error("Error connecting to MCP server:", error);
                        controller.error(new Error(`Failed to connect to MCP server: ${error.message}`));
                    });
                    
                    console.log("GoPlus MCP Server running on SSE");
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
