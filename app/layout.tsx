import './globals.css';
import { fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { AppThemeProvider, AppClerkProvider } from '@/components/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <AppThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppClerkProvider>{children}</AppClerkProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
