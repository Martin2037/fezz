'use client';

import { useChat } from '@ai-sdk/react';
import { MemoizedMarkdown } from '@/components/memoized-markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: { mcp_list: [
        {
          name: 'current_time',
          url: 'http://localhost:3071/api/mcp/sse/goplus'
        }
      ]
    },
  });

  return (
    <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 mb-50">
        {messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap">
            {/* <div className="flex justify-items-end text-right">
                {message.role === 'user' ? 'User: ' : 'AI: '}
              </div> */}
            {
              message.role === 'user' && (
                <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role="user">
                  <div className="flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit">
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex flex-row gap-2 items-start">
                        <div className="flex flex-col gap-4 bg-primary text-primary-foreground px-3 py-2 rounded-xl">
                          <p>{message.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            {
              message.role !== 'user' && (
                <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role="assistant">
                  <div className="flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit">
                    <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                      <div className="translate-y-px">
                        AI
                      </div>
                    </div>
                    <div class="flex flex-col gap-4 w-full justify-center">
                      <MemoizedMarkdown id={message.id} content={message.content} />
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        ))}

      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-10 left-10 right-10 flex border border-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <div className="fixed bottom-0 bg-white h-9 w-full left-0 right-0"/>
      </form>
    </div>
  );
}
