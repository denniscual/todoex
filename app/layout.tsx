import '@/styles/globals.css';
import { fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { AppThemeProvider } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <AppThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider>
            {children}
            <Toaster />
          </ClerkProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
