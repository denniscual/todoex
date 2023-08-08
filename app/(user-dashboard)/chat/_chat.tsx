'use client';
import { OpenAIIcon } from '@/components/ui/icons';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import ChatPanel from './_chat-panel';
import { HTMLAttributes, PropsWithChildren, ReactNode, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PersonIcon, UpdateIcon } from '@radix-ui/react-icons';
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
import { Button } from '@/components/ui/button';
import UserTaskActions from '@/app/(user-dashboard)/_components/user-task-actions';

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
  const [isPending, setIsPending] = useState(false);

  async function generateResponse(chatMessages: ChatCompletionRequestMessageWithAssistantResult[]) {
    try {
      setIsPending(true);
      setError(null);
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
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="flex-1 px-2">
        {messages.filter(Boolean).length === 0 && <div className="mb-12">{children}</div>}
        {enableChat && (
          <>
            <ul className="space-y-6 md:space-y-10">
              {messages.map((message, idx) => {
                if (message.role === ChatCompletionRequestMessageRoleEnum.User) {
                  return (
                    <li key={idx}>
                      <UserChatMessage>{message.content}</UserChatMessage>
                    </li>
                  );
                }
                return (
                  <li key={idx}>
                    <AssistantChatMessage>{message.assistantResult}</AssistantChatMessage>
                  </li>
                );
              })}
              {isPending && (
                <li>
                  <AssistantChatMessage className="items-center">
                    <div className="w-3 h-4 animate-pulse bg-primary/50" />
                  </AssistantChatMessage>
                </li>
              )}
              {error && (
                <li>
                  <AssistantChatMessage hasError className="items-center">
                    An error occured.
                  </AssistantChatMessage>
                </li>
              )}
            </ul>
            <ChatScrollAnchor trackVisibility={false} />
          </>
        )}
      </div>
      {enableChat && (
        <ChatPanel>
          {!error ? (
            <PromptForm
              disabled={isPending || !!error}
              input={input}
              onInputChange={(event) => setInput(event.currentTarget.value)}
              onSubmit={(event) => {
                event.preventDefault();
                const trimmedInput = input.trim();

                if (trimmedInput === '') {
                  return;
                }

                const messagesWithNewChatMessage: ChatCompletionRequestMessageWithAssistantResult[] =
                  [
                    ...messages,
                    {
                      role: ChatCompletionRequestMessageRoleEnum.User,
                      content: input.trim(),
                    },
                  ];
                setMessages(messagesWithNewChatMessage);
                setInput('');
                generateResponse(messagesWithNewChatMessage);
              }}
            />
          ) : (
            <div className="flex justify-center p-4">
              <Button size="sm" variant="secondary" onClick={() => generateResponse(messages)}>
                <UpdateIcon className="w-4 h-4 mr-2" />
                Regenerate Response
              </Button>
            </div>
          )}
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
    <ul className="grid gap-6 list-none">
      {rows.map((row) => (
        <li key={row.id} className="flex justify-between pb-4 border-b">
          {row.title}
          <UserTaskActions
            taskPathname={`/tasks/${row.id}`}
            task={{
              id: row.id,
              projectId: row.projectId,
            }}
          />
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
  areThereDetailsNeededFromTheUser,
  dueDate,
  suggestMessage,
}: SuggestingReturnType & {
  suggestMessage: string;
}) {
  if (areThereDetailsNeededFromTheUser) {
    return <div>{suggestMessage}</div>;
  }

  return (
    <div>
      <p>{suggestMessage}</p>
      <p>Title: {title}</p>
      {!!dueDate && <p>Due date: {dueDate}</p>}
    </div>
  );
}

function UserChatMessage({ children }: PropsWithChildren) {
  return (
    <ChatMessage
      icon={
        <ChatIcon className="bg-primary">
          <PersonIcon className="w-4 h-4 text-primary-foreground" />
        </ChatIcon>
      }
    >
      {children}
    </ChatMessage>
  );
}

function AssistantChatMessage({
  children,
  className,
  hasError = false,
}: PropsWithChildren<{ className?: string; hasError?: boolean }>) {
  return (
    <Card className={cn(hasError ? 'border border-destructive bg-destructive/10' : undefined)}>
      <CardContent className="px-0 pt-6">
        <ChatMessage
          className={className}
          icon={
            <ChatIcon className="bg-green-400 dark:bg-green-600">
              <OpenAIIcon className="w-4 h-4 text-white" />
            </ChatIcon>
          }
        >
          {children}
        </ChatMessage>
      </CardContent>
    </Card>
  );
}

function ChatMessage({
  icon,
  children,
  className,
}: PropsWithChildren<{ icon?: ReactNode; className?: string }>) {
  return (
    <div className={cn('flex items-start px-6', className)}>
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
