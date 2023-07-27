'use client';
import { useState, startTransition } from 'react';
import EditorJS from '@editorjs/editorjs';
import { Editor } from '@/components/editor';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { TaskWithProject } from '@/db';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@radix-ui/react-toast';

// TODO:
// - fix the problem of the removal of focus after updates
export default function EditContent({
  updateTaskByIdAction,
  task,
}: {
  updateTaskByIdAction: UpdateTaskByIdAction;
  task: TaskWithProject;
}) {
  const [editor, setEditor] = useState<EditorJS>();
  const { toast } = useToast();

  async function action() {
    if (!editor) {
      return;
    }

    try {
      const blocks = await editor.save();
      await updateTaskByIdAction({
        ...task,
        content: JSON.stringify(blocks),
      });
      toast({
        title: 'Content updated.',
        duration: 5000,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: 'There was a problem with your request.',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
        duration: 5000,
      });
      // TODO:
      // - revert Editor into its previous state if there is an error.
      console.error('Server Error: ', err);
    }
  }

  return (
    <Editor
      content={task.content as string}
      onEditorChange={() => {
        startTransition(() => {
          action();
        });
      }}
      onEditorReady={setEditor}
      className="text-sm"
    />
  );
}
