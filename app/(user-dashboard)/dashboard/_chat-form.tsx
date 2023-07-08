'use client';
import { useState, useTransition } from 'react';
import {
  generate,
  SearchingReturnType,
  CreatingReturnType,
  UpdatingReturnType,
  DeletingReturnType,
  DroppingReturnType,
  SuggestingReturnType,
} from './_server-actions';
import { FunctionHandlers } from './_utils.shared';
import { useRouter } from 'next/navigation';

export default function ChatForm({ userId, projectId }: { userId: string; projectId: number }) {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  const [messages, setMessages] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [chatBox, setChatBox] = useState('');
  const router = useRouter();

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
              content: chatBox.trim(),
            };
            const newMessages: any[] = [...messages, newMessage];
            setMessages(newMessages);
            setChatBox('');

            startTransition(() => action());

            async function action() {
              const res = await generate({
                // Remove the jsx elements.
                messages: newMessages.map((message) => ({
                  role: message.role,
                  content: message.content,
                })),
                userId,
                projectId,
                userMeta: {
                  timeZone,
                },
              });
              const { handler, result } = res;
              let elements: React.ReactNode = null;

              switch (handler) {
                case FunctionHandlers.searching: {
                  elements = <TodoList {...res.result} />;
                  break;
                }
                case FunctionHandlers.creating: {
                  router.refresh();
                  elements = <CreatingTodo {...res.result} />;
                  break;
                }
                case FunctionHandlers.updating: {
                  router.refresh();
                  elements = <UpdatingTodo {...res.result} />;
                  break;
                }
                case FunctionHandlers.deleting: {
                  router.refresh();
                  elements = <DeletingTodo {...res.result} />;
                  break;
                }
                case FunctionHandlers.dropping: {
                  elements = <Dropping {...res.result} />;
                  break;
                }
                case FunctionHandlers.suggesting: {
                  router.refresh();
                  elements = <TodoSuggestion {...res.result} />;
                  break;
                }
                default: {
                  elements = <div>{result.message}</div>;
                }
              }

              const messagesWithAssistant = newMessages.concat({
                role: 'assistant',
                content: result.message,
                elements,
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

function Chat({ role, content, elements }: any) {
  return (
    <>
      <div>{role === 'user' ? 'User: ' : 'AI: '}</div>
      <div>{role === 'user' ? content : elements}</div>
    </>
  );
}

function TodoList({ rows }: SearchingReturnType) {
  if (rows.length === 0) {
    return <div>I am sorry, but I could not find any todo list.</div>;
  }
  return (
    <ul>
      {rows.map((row, idx) => (
        <li key={row.id}>
          <span className="font-medium">{idx + 1}.</span> Title: {row.title}
        </li>
      ))}
    </ul>
  );
}

function CreatingTodo({ message }: CreatingReturnType) {
  return <div>{message}</div>;
}

function UpdatingTodo({ message }: UpdatingReturnType) {
  return <div>{message}</div>;
}

function DeletingTodo({ message }: DeletingReturnType) {
  return <div>{message}</div>;
}

function Dropping({ message }: DroppingReturnType) {
  return <div>{message}</div>;
}

function TodoSuggestion({
  title,
  description,
  areThereDetailsNeededFromTheUser,
}: SuggestingReturnType) {
  if (areThereDetailsNeededFromTheUser) {
    return <div>{description}</div>;
  }

  return (
    <div>
      <p>Ok, here is a suggestion:</p>
      <p>Title: {title}</p>
      <p>Description: {description}</p>
    </div>
  );
}
