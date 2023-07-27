'use client';
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  HTMLAttributes,
  useLayoutEffect,
} from 'react';
import EditorJS, { API, OutputData } from '@editorjs/editorjs';
import '@/styles/editor.css';
import { BlockMutationEvent } from '@editorjs/editorjs/types/events/block';

export function Editor({
  content,
  onEditorReady,
  onEditorChange,
  ...props
}: {
  content: string | null;
  onEditorReady?: (editor: EditorJS) => void;
  onEditorChange?: (api: API, event: BlockMutationEvent | BlockMutationEvent[]) => void;
} & HTMLAttributes<HTMLDivElement>) {
  const editorRef = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState(false);
  const _onEditorReady = useEffectEvent((editor: EditorJS) => onEditorReady?.(editor));
  const _onEditorChange = useEffectEvent(
    (api: API, event: BlockMutationEvent | BlockMutationEvent[]) => onEditorChange?.(api, event)
  );

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
          _onEditorReady?.(editor);
          editorRef.current = editor;
        },
        onChange: _onEditorChange,
        placeholder: 'Add the description here...',
        inlineToolbar: true,
        data: JSON.parse(content as any),
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
  }, []);

  useLayoutEffect(() => {
    if (editorRef.current) {
      editorRef.current?.render(JSON.parse(content as any));
    }
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

  return <div id="editor" {...props} />;
}
