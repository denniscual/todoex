import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from '@/components/external-link';
import { Button } from '@/components/ui/button';
import { UpdateIcon } from '@radix-ui/react-icons';
import { PropsWithChildren } from 'react';

export default function ChatPanel({ children }: PropsWithChildren) {
  return (
    <div className="sticky bottom-0 z-40 pt-14">
      <ButtonScrollToBottom />
      <div className="px-4 py-2 space-y-4 border-t shadow-lg supports-backdrop-blur:bg-background/60 bg-background/95 backdrop-blur sm:rounded-t-xl sm:border md:py-4">
        <Card className="flex flex-col flex-grow">
          <CardContent className="p-0">{children}</CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <p className="hidden px-2 text-xs leading-normal text-center text-muted-foreground sm:block">
            AI Chatbot built with{' '}
            <ExternalLink href="https://openai.com/chatgpt">ChatGPT</ExternalLink>
          </p>
          <Button size="sm" variant="secondary">
            <UpdateIcon className="w-4 h-4 mr-2" />
            Regenerate Response
          </Button>
        </div>
      </div>
    </div>
  );
}
