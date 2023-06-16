import { ClerkProvider, UserButton } from '@clerk/nextjs';

export const metadata = {
  title: 'Auth',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto">
      <h1>Auth layout</h1>
      {children}
    </div>
  );
}
