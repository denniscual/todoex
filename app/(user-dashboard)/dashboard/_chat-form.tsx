'use client';
import { useState, useTransition } from 'react';
import { generate } from './_server-actions';
import { Task } from '@/db';

export default function ChatForm({ tasks }: { tasks: Task[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [chatBox, setChatBox] = useState('');

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-4">
        <textarea
          value={chatBox}
          onChange={(event) => {
            setChatBox(event.currentTarget.value);
          }}
          cols={40}
          rows={5}
          className="w"
          placeholder="E.g Get my todos"
          name="chat"
        />
        <button
          onClick={() => {
            const newMessage = {
              role: 'user',
              content: chatBox,
            };
            const newMessages: any[] = [...messages, newMessage];
            setMessages(newMessages);
            setChatBox('');

            startTransition(() => action());

            async function action() {
              const res = (await generate(
                // Remove the rsc.
                newMessages.map((message) => ({
                  role: message.role,
                  content: message.content,
                }))
              )) as any;
              const { rsc, message } = res;
              const messagesWithAssistant = newMessages.concat({
                role: 'assistant',
                content: message,
                rsc,
              });
              setMessages(messagesWithAssistant);
            }
          }}
          disabled={isPending}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Button
        </button>
        {isPending && <span>Loading...</span>}
      </div>
      {messages.length > 0
        ? messages.map((m, idx) => (
            <div key={idx} className="whitespace-pre-wrap">
              <p>{m.role === 'user' ? 'User: ' : 'AI: '}</p>
              <p>{m.role === 'user' ? m.content : m.rsc}</p>
            </div>
          ))
        : null}
    </div>
  );
}
