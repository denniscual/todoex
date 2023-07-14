import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import DashboadMainNav from './dashboard-main-nav';

export default function DashboardHeader() {
  return (
    <header className="w-full py-2 border-b">
      <div className="container flex items-center h-14">
        <DashboadMainNav />
        {/* Add here the mobile nav */}
        <div />
        <div className="flex items-center justify-between flex-1 space-x-2 md:justify-end">
          <nav className="flex items-center gap-x-4">
            <ThemeToggle />
            <UserButton afterSignOutUrl={`${process.env.NEXT_PUBLIC_HOST}/sign-in`} />
          </nav>
        </div>
      </div>
    </header>
  );
}
