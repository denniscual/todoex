import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return <SignIn afterSignInUrl="http://localhost:3000/dashboard" />;
}
