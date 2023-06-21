'use client';
import { useState, useTransition } from 'react';
import { generate } from './_server-actions';
import { Task } from '@/db';

// TODO:
// - need to append the new messages to create a chat. We can achieve this
//   through server action. Instead of returing rsc, return an object with the messages
//   and the rsc.
export default function ChatForm({ tasks }: { tasks: Task[] }) {
  console.log({ tasks });
  const [messages, setMessages] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState<any>(null);

  return (
    <div className="space-y-8">
      <form
        action={async (formData) => {
          startTransition(() => action());
          async function action() {
            const _messages = [
              ...messages,
              {
                role: 'user',
                content: formData.get('chat'),
              },
            ];
            const res = (await generate(_messages)) as any;
            setResponse(res);
          }
        }}
        className="flex items-end gap-4"
      >
        <textarea cols={40} rows={5} className="w" placeholder="E.g Get my todos" name="chat" />
        <button
          disabled={isPending}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Button
        </button>
        {isPending && <span>Loading...</span>}
      </form>
      <div>{response}</div>
    </div>
  );
}
