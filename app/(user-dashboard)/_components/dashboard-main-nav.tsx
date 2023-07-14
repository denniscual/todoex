import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboadMainNav() {
  return (
    <div className="hidden md:flex">
      <Link href="/" className="flex items-center mr-8 space-x-2">
        {/* Add here the logo icon */}
        <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Button
          size="lg"
          className="dark:text-foreground dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 hover:dark:from-cyan-600 hover:dark:to-blue-600"
        >
          Create
        </Button>
      </nav>
    </div>
  );
}
