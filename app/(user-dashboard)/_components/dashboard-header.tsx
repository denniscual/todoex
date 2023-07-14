import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Suspense } from 'react';

export default function DashboardHeader() {
  return (
    <header className="w-full border-b supports-backdrop-blur:bg-background/60 bg-background/95 backdrop-blur">
      <div className="container flex items-center h-14">
        <div>Main nav</div>
        <div>Mobile nav</div>
        <div className="flex items-center justify-between flex-1 space-x-2 md:justify-end">
          <nav className="flex items-center gap-x-6">
            <ThemeToggle />
            <UserButton afterSignOutUrl={`${process.env.NEXT_PUBLIC_HOST}/sign-in`} />
          </nav>
        </div>
      </div>
    </header>
  );
}
