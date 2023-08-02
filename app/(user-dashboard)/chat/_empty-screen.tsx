import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, getUserProjects } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import RootEmptyScreenProjectSelect from './_empty-screen-project-select';
import { PropsWithChildren, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function EmptyScreen({ children }: PropsWithChildren) {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Todoex AI Chatbot!</CardTitle>
        <CardDescription>
          Use generative AI powered by ChatGPT to manage and organize your project tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Suspense
          fallback={
            <div
              className="space-y-2"
              style={{
                marginTop: 0,
              }}
            >
              <Skeleton className="w-[150px] h-4" />
              <Skeleton className="w-[300px] h-9" />
            </div>
          }
        >
          <EmptyScreenProjectSelect userId={user.id} />
        </Suspense>
        {children}
      </CardContent>
    </Card>
  );
}

async function EmptyScreenProjectSelect({ userId }: { userId: User['id'] }) {
  const projects = await getUserProjects(userId);
  return <RootEmptyScreenProjectSelect projects={projects} />;
}
