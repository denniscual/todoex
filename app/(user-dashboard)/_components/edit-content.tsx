'use client';
import { useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { Editor } from '@/components/editor';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { TaskWithProject } from '@/db';

export default function EditContent({
  updateTaskByIdAction,
  task,
}: {
  updateTaskByIdAction: UpdateTaskByIdAction;
  task: TaskWithProject;
}) {
  const [editor, setEditor] = useState<EditorJS>();

  // const blocks = await editor.save();
  // console.log({ blocks });

  return <Editor onReady={setEditor} className="text-sm" />;
}
