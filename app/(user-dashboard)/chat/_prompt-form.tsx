'use client';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { useEnterSubmit } from '@/lib/hooks';
import { ElementRef, useRef, useEffect, FormEventHandler, ChangeEventHandler } from 'react';

export default function PromptForm({
  formAction,
  onInputChange,
  input,
  disabled = false,
}: {
  formAction?: () => void;
  onInputChange?: ChangeEventHandler<HTMLTextAreaElement>;
  input?: string;
  disabled?: boolean;
}) {
  const textareaRef = useRef<ElementRef<'textarea'>>(null);
  const { formRef, onKeyDown } = useEnterSubmit();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        formAction?.();
      }}
      ref={formRef}
      className="flex items-center p-4"
    >
      <Textarea
        ref={textareaRef}
        tabIndex={0}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Ask your questions (2 questions remaining today)"
        spellCheck={false}
        className="min-h-[30px] w-full resize-none bg-transparent focus-within:outline-none sm:text-sm"
      />
      <Button variant="outline" size="icon" disabled={disabled}>
        <PaperPlaneIcon className="w-4 h-4" />
      </Button>
    </form>
  );
}
