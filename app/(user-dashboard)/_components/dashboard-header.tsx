import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import DashboadMainNav from './dashboard-main-nav';
import DashboardMobileNav from './dashboard-mobile-nav';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  return (
    <header className="w-full py-2 border-b">
      <div className="container flex items-center h-14 gap-x-8">
        <DashboadMainNav />
        <DashboardMobileNav />
        <Button size="lg" variant="gradient">
          Create
        </Button>
        <nav className="flex items-center ml-auto gap-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl={`${process.env.NEXT_PUBLIC_HOST}/sign-in`} />
        </nav>
      </div>
    </header>
  );
}
