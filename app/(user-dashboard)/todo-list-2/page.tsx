'use client';
import { useState, useTransition } from 'react';
import { generate, fakeServerAction } from './_server-action';

export default function TodoList2() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState<any>(null);

  return (
    <div className="space-y-8">
      <form
        action={(formData) => {
          startTransition(() => action());

          async function action() {
            try {
              const _messages = [
                ...messages,
                {
                  role: 'user',
                  content: formData.get('chat'),
                },
              ];
              const res = await generate(_messages);
              setResponse(res);
            } catch (err) {
              console.error('There is an error in action: ', (err as Error).message);
            }
          }
        }}
        className="space-x-4"
      >
        <input className="w" placeholder="Get my todos" type="text" name="chat" />
        <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
          Button
        </button>
        {isPending && <span>Loading...</span>}
      </form>
      <div>{response}</div>
    </div>
  );
}
