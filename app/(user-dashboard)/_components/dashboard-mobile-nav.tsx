'use client';
import { ReactNode, useState } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { siteConfig } from '@/config/site';
import * as AccessibleIcon from '@radix-ui/react-accessible-icon';

type DashboardMobileNavProps = {
  sidebar?: ReactNode;
};

export default function DashboardMobileNav({ sidebar }: DashboardMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 mr-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <AccessibleIcon.Root label="Toggle Menu">
            <ViewVerticalIcon className="w-5 h-5" />
          </AccessibleIcon.Root>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <MobileLink href="/today" className="flex items-center mb-6" onOpenChange={setOpen}>
          {/* Add here the logo icon */}
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>
        {sidebar}
      </SheetContent>
    </Sheet>
  );
}

type MobileLinkProps = LinkProps<string> & {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

function MobileLink<T>({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push((href as any).toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
