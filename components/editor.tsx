'use client';
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import '@/styles/editor.css';

// TODO:
// - opt this Component into SSR.
// - review the codes and do some refactoring.
// - add optional content JSON column type into Task table. Use the field instead of the existing `description` field.
// - integrate mutation.

export function Editor({
  content,
  onReady,
}: {
  content?: OutputData;
  onReady: (editor: EditorJS) => void;
}) {
  const editorRef = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState(false);
  const onEditorReady = useEffectEvent((editor: EditorJS) => onReady(editor));

  const initializeEditor = useCallback(async () => {
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

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          onEditorReady(editor);
          editorRef.current = editor;
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
    // Effect Events are not reactive and must be omitted from dependencies.
    // Ref - https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      initializeEditor();
      return () => {
        editorRef.current?.destroy();
        editorRef.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  if (!isMounted) {
    return null;
  }

  return <div id="editor" className="min-h-[400px] text-sm" />;
}
