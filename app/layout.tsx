import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
