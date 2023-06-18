'use client';
import { useChat } from 'ai/react';

export default function FunctionPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/functions',
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Open AI Functions</h1>
      <div className="flex flex-col w-full max-w-md py-24 mx-auto space-y-10 stretch">
        {messages.length > 0
          ? messages.map((m) => (
              <div key={m.id} className="whitespace-pre-wrap">
                <p>{m.role === 'user' ? 'User: ' : 'AI: '}</p>
                <p
                  dangerouslySetInnerHTML={{
                    __html: replaceWithBr(m.content),
                  }}
                />
              </div>
            ))
          : null}
        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}

function replaceWithBr(content = '') {
  return content.replace(/\\n/g, '<br />');
}
