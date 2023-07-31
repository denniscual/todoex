import { redirect } from 'next/navigation';

export default function Home() {
  return redirect('/today', 'replace' as any);
}
