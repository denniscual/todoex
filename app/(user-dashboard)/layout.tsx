import '../globals.css';
import NavLink from '@/components/nav-link';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Private',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <header className="basis-[70px] border-b border-slate-900/10 px-4">
        <nav className="container flex items-center h-full mx-auto gap-x-10">
          <NavLink disableActiveLink href="/">
            <span className="w-[40px] h-[40px] rounded-full inline-block bg-slate-500" />
          </NavLink>
          <div className="flex gap-x-6">
            <NavLink className="text-sm" href="/dashboard">
              Dashboard
            </NavLink>
          </div>
          <div className="ml-auto">
            <div className="flex gap-x-6">
              <ThemeToggle />
              <UserButton afterSignOutUrl={`${process.env.NEXT_PUBLIC_HOST}/sign-in`} />
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1 px-4 py-10 border-b border-slate-900/10">
        <div className="container mx-auto">{children}</div>
      </main>
      {/* <footer className="px-4 bg-gray-100 py-14">
        <div className="container mx-auto">Footer</div>
      </footer> */}
    </div>
  );
}
