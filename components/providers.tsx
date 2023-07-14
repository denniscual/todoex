'use client';
import { ComponentProps } from 'react';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function AppThemeProvider(props: ThemeProviderProps) {
  return <ThemeProvider {...props} />;
}

export function AppClerkProvider(props: ComponentProps<typeof ClerkProvider>) {
  return <ClerkProvider {...props} />;
}
