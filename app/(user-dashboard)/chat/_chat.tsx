'use client';
import { OpenAIIcon } from '@/components/ui/icons';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import ChatPanel from './_chat-panel';
import {
  FormEventHandler,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useState,
  useTransition,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PersonIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { FunctionHandlers } from './_utils.shared';
import { Project, User } from '@/db';
import {
  CreatingReturnType,
  DeletingReturnType,
  DroppingReturnType,
  SearchingReturnType,
  SuggestingReturnType,
  UpdatingReturnType,
  generateResponseAction,
} from './_server-actions';
import PromptForm from './_prompt-form';

type ChatCompletionRequestMessageWithAssistantResult = ChatCompletionRequestMessage & {
  assistantResult?: ReactNode;
};

export default function Chat({
  initialMessage,
  userId,
  children,
}: PropsWithChildren<{
  initialMessage?: string; // NOTE: If `enableChat` is true, then `initialMessage` has value.
  userId: User['id'];
}>) {
  const [messages, setMessages] = useState<ChatCompletionRequestMessageWithAssistantResult[]>([]);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('pid');
  const enableChat = !!projectId;

  // handle AI request.
  const [input, setInput] = useState(!!initialMessage ? initialMessage : '');
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  console.log({ error });

  async function generateResponse(chatMessages: ChatCompletionRequestMessageWithAssistantResult[]) {
    try {
      const res = await generateResponseAction({
        // Remove the jsx elements (assistantResult).
        messages: chatMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        userId,
        projectId: projectId as Project['id'],
      });
      const { handler, result } = res;
      let assistantResult: React.ReactNode = null;

      switch (handler) {
        case FunctionHandlers.searching: {
          assistantResult = <TodoList {...res.result} />;
          break;
        }
        case FunctionHandlers.creating: {
          assistantResult = <CreatingTodo {...res.result} />;
          break;
        }
        case FunctionHandlers.updating: {
          assistantResult = <UpdatingTodo {...res.result} />;
          break;
        }
        case FunctionHandlers.deleting: {
          assistantResult = <DeletingTodo {...res.result} />;
          break;
        }
        case FunctionHandlers.dropping: {
          assistantResult = <Dropping {...res.result} />;
          break;
        }
        case FunctionHandlers.suggesting: {
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
    <>
      <div className="flex-1 px-2">
        <div className="mb-12">{messages.filter(Boolean).length === 0 && children}</div>
        {enableChat && (
          <>
            <ul className="space-y-6 md:space-y-10">
              {messages.map((message, idx) => {
                if (message.role === ChatCompletionRequestMessageRoleEnum.User) {
                  return (
                    <li key={idx}>
                      <ChatMessage
                        icon={
                          <ChatIcon className="bg-primary">
                            <PersonIcon className="w-4 h-4 text-primary-foreground" />
                          </ChatIcon>
                        }
                      >
                        {message.content}
                      </ChatMessage>
                    </li>
                  );
                }
                return (
                  <li key={idx}>
                    <Card>
                      <CardContent className="px-0 pt-6">
                        <ChatMessage
                          icon={
                            <ChatIcon className="bg-green-400 dark:bg-green-600">
                              <OpenAIIcon className="w-4 h-4 text-white" />
                            </ChatIcon>
                          }
                        >
                          {message.assistantResult}
                        </ChatMessage>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
            <ChatScrollAnchor trackVisibility={false} />
          </>
        )}
      </div>
      {enableChat && (
        <ChatPanel>
          <PromptForm
            disabled={isPending}
            input={input}
            onInputChange={(event) => setInput(event.currentTarget.value)}
            formAction={() => {
              const messagesWithNewChatMessage: ChatCompletionRequestMessageWithAssistantResult[] =
                [
                  ...messages,
                  {
                    role: ChatCompletionRequestMessageRoleEnum.User,
                    content: input.trim(),
                  },
                ];
              console.log({ messagesWithNewChatMessage });
              setMessages(messagesWithNewChatMessage);
              setInput('');
              startTransition(() => generateResponse(messagesWithNewChatMessage));
            }}
          />
        </ChatPanel>
      )}
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

function ChatMessage({ icon, children }: PropsWithChildren<{ icon?: ReactNode }>) {
  return (
    <div className="flex items-start px-6">
      {icon}
      <div className="flex-1 px-1 ml-4">{children}</div>
    </div>
  );
}

function ChatIcon({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...props}
      className={cn(
        'flex items-center justify-center w-8 h-8 border rounded-md shadow select-none shrink-0',
        className
      )}
    >
      {children}
    </span>
  );
}
