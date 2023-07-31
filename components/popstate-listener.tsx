'use client';
import { usePopstateListener } from '@/lib/hooks';

/**
 * A React Component that listens to the `popstate` event on the `window` object.
 * It invokes the provided callback function when the event is triggered.
 */
export function PopstateListener({ callback }: { callback: () => void }) {
  usePopstateListener(callback);
  return null;
}
