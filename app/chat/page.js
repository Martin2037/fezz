'use client';

import { useChat } from '@ai-sdk/react';
import { MemoizedMarkdown } from '@/components/memoized-markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
          {messages.map(message => (
            <div key={message.id} className="whitespace-pre-wrap">
              <div className="flex justify-items-end text-right">
                {message.role === 'user' ? 'User: ' : 'AI: '}
              </div>

              <div className="prose space-y-2">
                <MemoizedMarkdown id={message.id} content={message.content} />
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit}>
            <input
              className="fixed bottom-10 left-10 right-10 flex border border-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
