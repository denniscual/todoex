export const metadata = {
  title: 'Auth',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto">{children}</div>;
}
