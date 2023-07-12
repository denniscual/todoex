'use client';
import { ReactNode, useState, useTransition } from 'react';
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
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';

type ChatCompletionRequestMessageWithAssistantResult = ChatCompletionRequestMessage & {
  assistantResult?: ReactNode;
};

export default function ChatForm({ userId, projectId }: { userId: string; projectId: number }) {
  const [messages, setMessages] = useState<ChatCompletionRequestMessageWithAssistantResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [chatBox, setChatBox] = useState('');
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  async function generateResponse(chatMessages: ChatCompletionRequestMessageWithAssistantResult[]) {
    try {
      const res = await generate({
        // Remove the jsx elements (assistantResult).
        messages: chatMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        userId,
        projectId,
      });
      const { handler, result } = res;
      let assistantResult: React.ReactNode = null;

      switch (handler) {
        case FunctionHandlers.searching: {
          assistantResult = <TodoList {...res.result} />;
          break;
        }
        case FunctionHandlers.creating: {
          router.refresh();
          assistantResult = <CreatingTodo {...res.result} />;
          break;
        }
        case FunctionHandlers.updating: {
          router.refresh();
          assistantResult = <UpdatingTodo {...res.result} />;
          break;
        }
        case FunctionHandlers.deleting: {
          router.refresh();
          assistantResult = <DeletingTodo {...res.result} />;
          break;
        }
        case FunctionHandlers.dropping: {
          assistantResult = <Dropping {...res.result} />;
          break;
        }
        case FunctionHandlers.suggesting: {
          router.refresh();
          assistantResult = <TodoSuggestion {...res.result} />;
          break;
        }
        default: {
          assistantResult = <div>{result.message}</div>;
        }
      }
      const messagesWithAssistant = chatMessages.concat({
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: result.message,
        assistantResult,
      });
      setMessages(messagesWithAssistant);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-4">
        {!error ? (
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
                const messagesWithNewChatMessage: ChatCompletionRequestMessageWithAssistantResult[] =
                  [
                    ...messages,
                    {
                      role: ChatCompletionRequestMessageRoleEnum.User,
                      content: chatBox.trim(),
                    },
                  ];
                setMessages(messagesWithNewChatMessage);
                setChatBox('');
                startTransition(() => generateResponse(messagesWithNewChatMessage));
              }}
              disabled={isPending}
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            >
              Button
            </button>
          </div>
        ) : (
          <div>
            <div>There was an issue processing your request.</div>
            <button
              disabled={isPending}
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
              onClick={() => startTransition(() => generateResponse(messages))}
            >
              Regenerate response
            </button>
          </div>
        )}
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

function Chat({ role, content, assistantResult }: ChatCompletionRequestMessageWithAssistantResult) {
  if (role === ChatCompletionRequestMessageRoleEnum.User) {
    return (
      <>
        <div>User:</div>
        <div>{content}</div>
      </>
    );
  }

  return (
    <>
      <div>AI:</div>
      <div>{assistantResult}</div>
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
  dueDate,
  suggestMessage,
}: SuggestingReturnType & {
  suggestMessage: string;
}) {
  if (areThereDetailsNeededFromTheUser) {
    return <div>{description}</div>;
  }

  return (
    <div>
      <p>{suggestMessage}</p>
      <p>Title: {title}</p>
      <p>Description: {description}</p>
      {!!dueDate && <p>Due date: {dueDate}</p>}
    </div>
  );
}
