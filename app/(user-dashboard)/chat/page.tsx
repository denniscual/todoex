import { currentUser } from '@clerk/nextjs';
import EmptyScreen from './_empty-screen';
import ExampleMessages from './_example-messages';
import Chat from './_chat';
import { redirect } from 'next/navigation';

export default async function RootChat({
  searchParams,
}: {
  searchParams: {
    pid?: string;
    initialMessage?: string;
  };
}) {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in', 'replace' as any);
  }

  const { pid, initialMessage: initialMessageIdx } = searchParams;
  const initialMessage = !!initialMessageIdx ? exampleMessages[parseInt(initialMessageIdx)] : null;
  const hasProjectId = !!pid;

  return (
    <section className="relative flex flex-col h-full">
      <Chat initialMessage={initialMessage?.message} userId={user.id} key={initialMessageIdx}>
        <EmptyScreen>{hasProjectId && <ExampleMessages messages={exampleMessages} />}</EmptyScreen>
      </Chat>
    </section>
  );
}

const exampleMessages = [
  {
    heading: 'Suggest a task for today',
    message: 'Suggest a task for today',
  },
  {
    heading: 'Show all of the tasks for this week.',
    message: 'Show all of the tasks for this week.',
  },
  {
    heading: 'Add "Clean my bedroom"',
    message: 'Add "Clean my bedroom"',
  },
];
