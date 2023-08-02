import DashboardHeader from '@/app/(user-dashboard)/_components/dashboard-header';
import DashboardSidebar from '@/app/(user-dashboard)/_components/dashboard-sidebar';

export const metadata = {
  title: 'Private',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader />
      <main className="flex flex-1">
        <aside className="hidden w-[300px] md:block flex-none border-r">
          <DashboardSidebar />
        </aside>
        <div className="w-full h-full max-w-3xl px-6 py-8 mx-auto">{children}</div>
      </main>
    </div>
  );
}
