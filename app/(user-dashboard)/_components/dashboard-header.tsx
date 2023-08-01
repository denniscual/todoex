import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import DashboadMainNav from '@/app/(user-dashboard)/_components/dashboard-main-nav';
import DashboardMobileNav from '@/app/(user-dashboard)/_components/dashboard-mobile-nav';
import DashboardSidebar from '@/app/(user-dashboard)/_components/dashboard-sidebar';

export default function DashboardHeader() {
  return (
    <header className="w-full px-6 py-2 border-b">
      <div className="flex items-center h-14 gap-x-6">
        <DashboadMainNav />
        <DashboardMobileNav sidebar={<DashboardSidebar />} />
        {/* TODO: Put here the Command Trigger Button. The trigger can also be a textfield. */}
        <nav className="flex items-center ml-auto gap-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/sign-in" />
        </nav>
      </div>
    </header>
  );
}
