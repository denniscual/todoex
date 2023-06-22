'use client';
import { useState, useTransition } from 'react';
import { generate } from './_server-actions';
import { Task } from '@/db';

export default function ChatForm({ tasks, userId }: { tasks: Task[]; userId: string }) {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'system',
      content: `You are an AI Assistant assisting a user with their tasks. The current user id is: ${userId}`,
      hiddenInChat: true,
    },
    {
      role: 'user',
      content: `Here are the current user todos: ${JSON.stringify(tasks)}.`,
      hiddenInChat: true,
    },
  ]);
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
              const res = (await generate({
                // Remove the rsc.
                messages: newMessages.map((message) => ({
                  role: message.role,
                  content: message.content,
                })),
                userId,
              })) as any;
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
        ? messages.map((message, idx) => (
            <div key={idx} className="whitespace-pre-wrap">
              <Chat {...message} />
            </div>
          ))
        : null}
    </div>
  );
}

function Chat({ role, content, rsc, hiddenInChat }: any) {
  if (hiddenInChat) {
    return null;
  }

  return (
    <>
      <p>{role === 'user' ? 'User: ' : 'AI: '}</p>
      <p>{role === 'user' ? content : rsc}</p>
    </>
  );
}
