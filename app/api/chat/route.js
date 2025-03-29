import { openai } from '@ai-sdk/openai';
import { streamText, experimental_createMCPClient } from 'ai';

export const maxDuration = 30;

export async function POST(req) {
  const { messages, mcp_list } = await req.json();

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

  const result = streamText({
    model: openai('gpt-4o-mini'),
    tools: tools,
    system: 'You are a helpful assistant.',
    messages: messages,
    onFinish: async () => {
      await Promise.all(mcpClients.map(client => client.close()));
    }
  });

  return result.toDataStreamResponse();
}