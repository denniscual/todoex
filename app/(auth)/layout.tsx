import { ClerkProvider, UserButton } from '@clerk/nextjs';

export const metadata = {
  title: 'Login',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto">{children}</div>;
}
