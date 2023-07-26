'use client';
import * as React from 'react';
import EditorJS from '@editorjs/editorjs';
import '@/styles/editor.css';

// TODO:
// - opt this Component into SSR.
// - review the codes and do some refactoring.
// - add optional content JSON column type into Task table. Use the field instead of the existing `description` field.
// - integrate mutation.
export function Editor({ title = '', content }: any) {
  const ref = React.useRef<EditorJS>();
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  const initializeEditor = React.useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    // @ts-expect-error no declaration file
    const Header = (await import('@editorjs/header')).default;
    // @ts-expect-error no declaration file
    const Embed = (await import('@editorjs/embed')).default;
    // @ts-expect-error no declaration file
    const List = (await import('@editorjs/list')).default;
    // @ts-expect-error no declaration file
    const Code = (await import('@editorjs/code')).default;
    // @ts-expect-error no declaration file
    const InlineCode = (await import('@editorjs/inline-code')).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor;
        },
        placeholder: 'Add the description here...',
        inlineToolbar: true,
        data: content,
        tools: {
          header: Header,
          list: List,
          code: Code,
          inlineCode: InlineCode,
          embed: Embed,
        },
      });
    }
  }, [content]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      initializeEditor();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  if (!isMounted) {
    return null;
  }

  return <div id="editor" className="min-h-[500px] text-sm" />;
}
