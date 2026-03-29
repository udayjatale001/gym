
'use client';

import { useEffect, useState } from 'react';
import { Settings } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { Language, translations } from '@/lib/translations';

const DisciplineLogo = () => (
  <div className="h-10 w-10 flex items-center justify-center bg-primary rounded-xl shadow-lg rotate-3 border-b-4 border-black/20">
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="h-6 w-6 text-white" 
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

export function Header() {
  const { user } = useUser();
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang];
  
  return (
    <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-40 border-b border-border/30">
      <div className="flex items-center gap-3">
        <DisciplineLogo />
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tighter italic leading-none uppercase">GYMBUDDY!</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
            {t.disciplineMode}
          </p>
        </div>
      </div>
      <Link href="/dashboard/settings">
        <button className="h-11 w-11 rounded-2xl bg-muted/30 border-2 border-muted/50 shadow-sm flex items-center justify-center active:scale-90 transition-all hover:bg-muted/50">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </Link>
    </header>
  );
}
