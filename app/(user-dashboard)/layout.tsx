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
        <aside className="hidden w-[300px] md:block flex-none">
          <DashboardSidebar />
        </aside>
        <div className="w-full h-full px-6 py-6 mx-auto md:px-16 lg:px-24 md:border-l">
          {children}
        </div>
      </main>
    </div>
  );
}
