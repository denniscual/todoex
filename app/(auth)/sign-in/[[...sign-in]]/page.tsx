import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return <SignIn afterSignInUrl={`${process.env.NEXT_PUBLIC_HOST}/dashboard`} />;
}
