'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DisciplineLogoSplash = () => (
  <div className="h-20 w-20 flex items-center justify-center bg-primary rounded-[1.8rem] shadow-2xl rotate-3 border-b-8 border-black/20 animate-pulse">
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="h-12 w-12 text-white" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for explicit login persistence flag
    const isLoggedIn = localStorage.getItem('fitstride_is_logged_in') === 'true';
    const mockUser = localStorage.getItem('gymbuddy_user');

    if (isLoggedIn && mockUser) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-svh w-full items-center justify-center bg-[#000000] transition-colors duration-500">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
        <DisciplineLogoSplash />
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-black text-primary italic uppercase tracking-tighter leading-none">INITIALIZING...</h1>
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">DISCIPLINE MODE v1.0</p>
        </div>
      </div>
    </div>
  );
}
