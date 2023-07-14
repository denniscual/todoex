import '../globals.css';
import DashboardHeader from './_components/dashboard-header';

export const metadata = {
  title: 'Private',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader />
      <main className="flex-1 px-4 py-10 border-b border-slate-900/10">
        <div className="container mx-auto">{children}</div>
      </main>
      {/* <footer className="px-4 bg-gray-100 py-14">
        <div className="container mx-auto">Footer</div>
      </footer> */}
    </div>
  );
}
