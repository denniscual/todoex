import { cn } from '@/lib/utils';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import NavLink from '@/app/(user-dashboard)/_components/nav-link';
import AddProjectDialog from '@/app/(user-dashboard)/_components/add-project/add-project-dialog';
import { currentUser } from '@clerk/nextjs';
import { getUserProjects } from '@/db';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import TodayNavLink from './today-nav-link';

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export default function DashboardSidebar({ className, ...props }: SidebarProps) {
  return (
    <div {...props} className={cn('py-4 space-y-4', className)}>
      <div className="py-2 md:px-6">
        <div className="space-y-2">
          <TodayNavLink />
          {/* <NavLink href="/tasks" icon={<ReaderIcon className="w-4 h-5 mr-2 text-purple-500" />}>
            Tasks
          </NavLink> */}
          <NavLink href="/chat" icon={<ChatBubbleIcon className="w-4 h-5 mr-2 text-orange-500" />}>
            Chatbot
          </NavLink>
          {/* <NavLink
            href="/upcoming"
            icon={<CalendarIcon className="w-4 h-5 mr-2 text-orange-500" />}
          >
            Upcoming
          </NavLink> */}
        </div>
      </div>
      <div className="py-2 md:px-6">
        <h2 className="flex items-center justify-between pl-4 mb-4 text-lg font-semibold tracking-tight text-foreground/60">
          Projects
          <div>
            <AddProjectDialog />
          </div>
        </h2>
        <Suspense
          fallback={
            <div className="px-4 space-y-3">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          }
        >
          <div className="space-y-2">
            <Projects />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

async function Projects() {
  const user = await currentUser();
  const userId = user?.id ?? '';
  const projects = await getUserProjects(userId);

  return projects.map((project) => (
    <NavLink key={project.id} href={`/projects/${project.id}`}>
      {project.title}
    </NavLink>
  ));
}
