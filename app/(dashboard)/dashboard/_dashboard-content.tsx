'use client';
import { useState } from 'react';

export default function DashboardContent({ children }: any) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <button onClick={() => setShowInfo(!showInfo)} className="bg-blue-400">
        Show info
      </button>
      {showInfo && children}
    </div>
  );
}
