'use client';
import { experimental_useEffectEvent as useEffectEvent, useEffect } from 'react';

export default function Button() {
  const sample = useEffectEvent((name: string) => {
    console.log(name);
  });

  useEffect(() => {
    sample('zion quinn');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <button>Sample button</button>;
}
