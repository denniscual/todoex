'use client';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function NavLink<T extends string>({
  href,
  disableActiveLink = false,
  className = '',
  ...props
}: LinkProps<T> & { disableActiveLink?: boolean }) {
  const pathname = usePathname();
  const isActive = href !== '/' ? pathname.startsWith(href as string) : href === pathname;

  return (
    <Link
      className={clsx(
        className,
        !disableActiveLink
          ? isActive
            ? 'text-blue-500'
            : 'text-neutral-700 hover:text-neutral-950'
          : ''
      )}
      href={href}
      {...props}
    />
  );
}
