'use client';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

type NavLinkProps<T> = LinkProps<T> & {
  icon?: ReactNode;
};

export default function NavLink<T extends string>({
  href,
  className = '',
  icon,
  children,
  ...props
}: NavLinkProps<T>) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href as string);

  return (
    <Button variant={isActive ? 'secondary' : 'ghost'} className="justify-start w-full" asChild>
      <Link href={href} {...props}>
        {icon}
        {children}
      </Link>
    </Button>
  );
}
