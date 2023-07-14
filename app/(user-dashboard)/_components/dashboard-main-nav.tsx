import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboadMainNav() {
  return (
    <div className="hidden md:flex">
      <Link href="/dashboard" className="flex items-center space-x-2">
        {/* Add here the logo icon */}
        <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
    </div>
  );
}
