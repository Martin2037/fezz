import { openai } from '@ai-sdk/openai';
import { streamText, experimental_createMCPClient } from 'ai';

export const maxDuration = 30000;

const initMcpList = [];

// 分析工具调用结果的函数
async function analyzeToolCallResults(toolCalls, mcpClients) {
  const toolCallsResults = toolCalls.map(toolCall => {
    return {
      toolName: toolCall.name,
      toolInput: toolCall.input,
      toolResult: toolCall.result
    };
  });
  
  const analysisResult = streamText({
    model: openai('gpt-4o-mini'),
    system: '你是一个专业的Web3数据分析师，负责深入解析工具调用返回的数据。请详细分析以下工具调用结果，提供专业且易于理解的解释和见解。',
    prompt: `我需要你分析以下工具调用的结果并提供深入见解：${JSON.stringify(toolCallsResults, null, 2)}`,
    temperature: 0.1,
    onFinish: async ({ text, finishReason, usage }) => {
      console.log('工具调用分析完成:', finishReason);
      try {
        await Promise.all(mcpClients.map(async client => {
          try {
            await client.close();
          } catch (error) {
            console.warn(`[MCP] ${client.name} 关闭时出错:`, error.message);
          }
        }));
      } catch (error) {
        console.error("关闭MCP客户端时出错:", error);
      }
    }
  });
  
  return analysisResult.toDataStreamResponse();
}

export async function POST(req) {
  const { messages, mcp_list = initMcpList, userWalletAddress } = await req.json();
  console.log('messages', messages, "++++++++++",userWalletAddress);

  // 为用户消息添加钱包地址
  const processedMessages = messages.map(message => {
    if (message.role === 'user') {
      return {
        ...message,
        content: `${message.content}${userWalletAddress ? `\n用户钱包地址: ${userWalletAddress}` : ''}`
      };
    }
    return message;
  });

  const mcpClients = await Promise.all(
    mcp_list.map(async (mcp) => {
      const client = await experimental_createMCPClient({
        transport: {
          type: 'sse',
          url: mcp.url,
        },
        name: mcp.name,
        onUncaughtError: (error) => {
          console.error(
            `[MCP] ${mcp.name} Uncaught error:`,
            JSON.stringify(error, null, 2)
          );
        },
      });
      return client;
    })
  );

  const allTools = await Promise.all(
    mcpClients.map(async client => await client.tools())
  );

  const tools = allTools.reduce((acc, curr) => ({
    ...acc,
    ...curr
  }), {});

  // 用于收集工具调用和结果的数组
  const toolCallsCollection = [];
  let pendingToolCall = null;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    tools: tools,
    system: '你是一个专业的Web3助手，精通区块链、DeFi、NFT和加密货币领域。当你使用工具 & tools 获取数据时，你会详细解析结果并为用户提供深入的分析和见解返回content。你的回答应该既专业又易于理解，帮助用户更好地理解Web3生态系统。',
    messages: processedMessages,
    temperature: 0,
    onChunk: ({ chunk }) => {
      // 收集工具调用信息
      if (chunk.type === 'tool-call') {
        pendingToolCall = {
          name: chunk.toolName,
          input: chunk.toolInput
        };
      } 
      // 收集工具调用结果
      else if (chunk.type === 'tool-result' && pendingToolCall) {
        console.log('收集工具调用结果:', chunk);
        toolCallsCollection.push({
          ...pendingToolCall,
          result: chunk.result
        });
        pendingToolCall = null;
      }
    },
    onFinish: async ({ text, finishReason, usage, response }) => {
      console.log('初始响应完成:', finishReason);
      
      // 如果不是工具调用导致的结束或者没有工具调用结果，则关闭MCP客户端
      if (finishReason !== 'tool-calls' || toolCallsCollection.length === 0) {
        try {
          await Promise.all(mcpClients.map(async client => {
            try {
              await client.close();
            } catch (error) {
              console.warn(`[MCP] ${client.name} 关闭时出错:`, error.message);
            }
          }));
        } catch (error) {
          console.error("关闭MCP客户端时出错:", error);
        }
      }
    }
  });

  // 获取初始响应
  const initialResponse = result.toDataStreamResponse();
  
  // 收集整个流的数据以检查是否包含工具调用
  const responseHeaders = new Headers(initialResponse.headers);
  const transformStream = new TransformStream({
    async start() {
      // 监听finish回调可能不够及时，这里也监听finishReason的Promise
      result.finishReason.then(reason => {
        if (reason === 'tool-calls') {
          // 工具调用结束标记
          console.log('检测到工具调用结束');
        }
      });
    },
    async transform(chunk, controller) {
      // 直接传递原始数据
      controller.enqueue(chunk);
    },
    async flush(controller) {
      // 检查是否有工具调用结果需要分析
      if (toolCallsCollection.length > 0) {
        console.log('开始分析工具调用结果:', toolCallsCollection);
        
        try {
          // 创建分析工具调用结果的响应
          const analysisResponse = await analyzeToolCallResults(toolCallsCollection, mcpClients);
          
          // 从分析响应中读取内容并写入
          const reader = analysisResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('分析工具调用结果时出错:', error);
          
          // 确保即使分析失败也关闭MCP客户端
          try {
            await Promise.all(mcpClients.map(async client => {
              try {
                await client.close();
              } catch (error) {
                console.warn(`[MCP] ${client.name} 关闭时出错:`, error.message);
              }
            }));
          } catch (closingError) {
            console.error("关闭MCP客户端时出错:", closingError);
          }
        }
      }
    }
  });
  
  // 通过管道连接初始响应和转换流
  const combinedStream = initialResponse.body.pipeThrough(transformStream);
  
  // 返回组合后的响应
  return new Response(combinedStream, {
    headers: responseHeaders,
    status: initialResponse.status,
    statusText: initialResponse.statusText
  });
}