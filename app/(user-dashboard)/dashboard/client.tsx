'use client';
import { useAuth, useUser } from '@clerk/nextjs';

export default function Client() {
  console.log('client current user', useUser());
  console.log('client auth', useAuth());
  return <div>Client</div>;
}
