'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Scale, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, translations } from '@/lib/translations';

export function BottomNav() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang];

  const navItems = [
    { label: t.home, icon: Home, href: '/dashboard' },
    { label: t.workout, icon: Dumbbell, href: '/dashboard/workout' },
    { label: t.diet, icon: Utensils, href: '/dashboard/diet' },
    { label: t.weight, icon: Scale, href: '/dashboard/weight' },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 w-full bg-card/80 backdrop-blur-xl border-t border-border/40 flex items-center justify-around py-3 md:py-4 px-2 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 group",
              isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-primary/70"
            )}
          >
            <item.icon className={cn("h-5 w-5 md:h-6 md:w-6 transition-all", isActive && "fill-primary/20")} />
            <span className={cn(
              "text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}