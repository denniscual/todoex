import './globals.css';
import { Inter } from 'next/font/google';
import NavLink from '@/components/nav-link';
import ServerContext from './server-context';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Todoex',
  description: 'A todo app for lazy developers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('Render RootLayout');
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased text-black bg-white">
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
                <NavLink className="text-sm" href="/dashboard/users/1">
                  User 1
                </NavLink>
                <NavLink className="text-sm" href="/dashboard/users/2">
                  User 2
                </NavLink>
              </div>
            </nav>
          </header>
          <main className="flex-1 px-4 py-10 border-b border-slate-900/10">
            <div className="container mx-auto">
              <ServerContext.Provider value="zion quinn">{children}</ServerContext.Provider>
            </div>
          </main>
          <footer className="px-4 bg-gray-100 py-14">
            <div className="container mx-auto">Footer</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
