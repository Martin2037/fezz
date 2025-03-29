import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    NextSSEServerTransport, 
    createExpressResponse, 
    createExpressRequest 
} from "../../transport.js";
import { z } from "zod";
import { TokenSecurity, AddressSecurity, PhishingSiteDetect } from "./lib.js";


const server = new McpServer({
    name: "goplus-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {}
});


server.tool(
    "token-security-api",
    "Scan/Detect crypto token security, any token address will scan",
    {
        token_address: z.string().describe("The address of the token to scan"),
        chain_id: z.enum(["1", "56", "137", "8453"]).describe("Chain ID, supported values: 1(Ethereum), 56(BSC), 137(Polygon), 8453(Base)")
    },
    async ({token_address, chain_id}) => {
        console.log(token_address, chain_id);
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

server.tool(
    "address-security-api",
    "Scan/Detect address security, any address will scan",
    {
        address: z.string().describe("要检测的钱包或合约地址")
    },
    async ({address}) => {
        const data = await AddressSecurity(address);
        
        // 检查API返回是否成功
        if (!data || data.code !== 1) {
            return {
                content: [
                    {
                        type: "text",
                        text: "获取地址安全信息失败，请稍后重试。"
                    }
                ]
            };
        }
        
        const addressInfo = data.result;
        if (!addressInfo) {
            return {
                content: [
                    {
                        type: "text",
                        text: "未找到该地址的安全信息。"
                    }
                ]
            };
        }
        
        // 整理安全风险列表
        const risks = [];
        
        // 根据实际API返回值检查各种风险类型
        if (addressInfo.cybercrime === "1") risks.push("⚠️ 网络犯罪");
        if (addressInfo.money_laundering === "1") risks.push("⚠️ 洗钱活动");
        if (addressInfo.number_of_malicious_contracts_created !== "0" && addressInfo.number_of_malicious_contracts_created !== "") 
            risks.push(`⚠️ 创建过恶意合约: ${addressInfo.number_of_malicious_contracts_created}个`);
        if (addressInfo.gas_abuse === "1") risks.push("⚠️ Gas滥用");
        if (addressInfo.financial_crime === "1") risks.push("⚠️ 金融犯罪");
        if (addressInfo.darkweb_transactions === "1") risks.push("⚠️ 暗网交易");
        if (addressInfo.reinit === "1") risks.push("⚠️ 可重新初始化");
        if (addressInfo.phishing_activities === "1") risks.push("⚠️ 钓鱼活动");
        if (addressInfo.contract_address === "1") risks.push("⚠️ 合约地址");
        if (addressInfo.fake_kyc === "1") risks.push("⚠️ 虚假KYC");
        if (addressInfo.blacklist_doubt === "1") risks.push("⚠️ 黑名单嫌疑");
        if (addressInfo.fake_standard_interface === "1") risks.push("⚠️ 伪造标准接口");
        if (addressInfo.stealing_attack === "1") risks.push("⚠️ 窃取攻击");
        if (addressInfo.blackmail_activities === "1") risks.push("⚠️ 勒索活动");
        if (addressInfo.sanctioned === "1") risks.push("⚠️ 被制裁");
        if (addressInfo.malicious_mining_activities === "1") risks.push("⚠️ 恶意挖矿");
        if (addressInfo.mixer === "1") risks.push("⚠️ 混币服务");
        if (addressInfo.fake_token === "1") risks.push("⚠️ 假币");
        if (addressInfo.honeypot_related_address === "1") risks.push("⚠️ 蜜罐相关地址");
        
        // 数据来源信息
        const dataSource = addressInfo.data_source ? `数据来源: ${addressInfo.data_source}` : "";
        
        // 组装最终返回内容
        let resultText = `## 地址安全分析: ${address}\n\n`;
        
        // 安全状态总结
        if (risks.length === 0) {
            resultText += "### ✅ 未发现明显安全风险\n\n";
            resultText += "该地址未被GoPlus标记为已知的恶意或危险地址。\n\n";
        } else {
            resultText += "### ⚠️ 发现潜在安全风险\n\n";
            resultText += risks.join("\n") + "\n\n";
            resultText += "请谨慎与此地址交互，避免发送资金或授权交易。\n\n";
        }
        if (dataSource) {
            resultText += `${dataSource}\n\n`;
        }
        
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

server.tool(
    "phishing-site-detect-api",
    "Scan/Detect website security, any url will scan",
    {
        url: z.string().describe("要检测的URL地址或域名")
    },
    async ({url}) => {
        const data = await PhishingSiteDetect(url);
        
        // 检查API返回是否成功
        if (!data || data.code !== 1) {
            return {
                content: [
                    {
                        type: "text",
                        text: "检测URL失败，请稍后重试。"
                    }
                ]
            };
        }
        
        const siteInfo = data.result;
        
        // 组装最终返回内容
        let resultText = `## 网站安全分析: ${url}\n\n`;
        
        // 根据实际API返回格式检测结果
        if (siteInfo.phishing_site === 1) {
            resultText += "### ⚠️ 危险网站警告\n\n";
            resultText += "该网站被GoPlus标识为钓鱼或恶意网站。\n\n";
            
            // 检查是否有合约安全问题
            if (siteInfo.website_contract_security && siteInfo.website_contract_security.length > 0) {
                resultText += "### 网站关联合约安全问题\n\n";
                
                siteInfo.website_contract_security.forEach(contract => {
                    resultText += `- 合约地址: ${contract.contract_address}\n`;
                    
                    if (contract.risk_items && contract.risk_items.length > 0) {
                        resultText += "  风险项: \n";
                        contract.risk_items.forEach(risk => {
                            resultText += `  - ${risk}\n`;
                        });
                    }
                    
                    if (contract.risk_level) {
                        resultText += `  风险等级: ${contract.risk_level}\n`;
                    }
                    
                    resultText += "\n";
                });
            }
            
            resultText += "**安全建议**: 请立即关闭该网站，不要输入任何个人信息或连接钱包。\n\n";
        } else {
            resultText += "### ✅ 未检测到异常\n\n";
            resultText += "该URL未被GoPlus标记为已知的钓鱼或恶意网站。\n\n";
            
            if (siteInfo.website_contract_security && siteInfo.website_contract_security.length > 0) {
                resultText += "### ⚠️ 但存在网站关联合约安全问题\n\n";
                
                siteInfo.website_contract_security.forEach(contract => {
                    resultText += `- 合约地址: ${contract.contract_address}\n`;
                    
                    if (contract.risk_items && contract.risk_items.length > 0) {
                        resultText += "  风险项: \n";
                        contract.risk_items.forEach(risk => {
                            resultText += `  - ${risk}\n`;
                        });
                    }
                    
                    if (contract.risk_level) {
                        resultText += `  风险等级: ${contract.risk_level}\n`;
                    }
                    
                    resultText += "\n";
                });
                
                resultText += "**安全建议**: 虽然网站本身未被标记为钓鱼网站，但关联合约存在安全风险，请谨慎使用。\n\n";
            } else {
                resultText += "**注意**: 即使未被检测为钓鱼网站，仍需谨慎对待陌生网站，避免连接钱包或输入敏感信息。\n\n";
            }
        }
        
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
