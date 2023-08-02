import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserProjects } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ProjectSelect } from '@/components/project-select';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';

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

export default async function EmptyScreen() {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const projects = await getUserProjects(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Todoex AI Chatbot!</CardTitle>
        <CardDescription>
          Use generative AI powered by ChatGPT to manage and organize your project tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="select-project" className="text-sm">
            Please select a project to get started:
          </label>
          <div className="w-[400px]">
            <ProjectSelect name="project" id="select-project" projects={projects} />
          </div>
        </div>
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm leading-normal">
            You can now start a conversation or try the following examples:
          </p>
          {exampleMessages.map((message, idx) => (
            <Button key={idx} variant="link" className="h-auto p-0">
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              {message.heading}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
