'use client';
import { useChat } from 'ai/react';

export default function TodoListPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/functions',
  });

  // console.log(JSON.parse(messages[9].content));

  return (
    <div>
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
          <div className="fixed bottom-0 w-full">
            <input
              className="w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl "
              value={input}
              placeholder="Retrieve all of my todos..."
              onChange={handleInputChange}
            />
            {isLoading && <span className="inline-block ml-4">Loading...</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

function replaceWithBr(content = '') {
  return content.replace(/\\n/g, '<br />').replace(/"/g, '');
}
