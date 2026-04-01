'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Scale, Utensils, TrendingUp } from 'lucide-react';
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
    { label: t.home, icon: Home, href: '/dashboard', guideId: 'nav-home' },
    { label: t.workout, icon: Dumbbell, href: '/dashboard/workout', guideId: 'nav-workout' },
    { label: t.progress, icon: TrendingUp, href: '/dashboard/progress', guideId: 'nav-progress' },
    { label: t.diet, icon: Utensils, href: '/dashboard/diet', guideId: 'nav-diet' },
    { label: t.weight, icon: Scale, href: '/dashboard/weight', guideId: 'nav-weight' },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 w-full bg-[#000000] border-t border-white/5 flex items-center justify-around py-3 md:py-4 px-2 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            data-guide-id={item.guideId}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 group",
              isActive 
                ? "text-primary scale-105" 
                : "text-white/30 hover:text-primary/70"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 md:h-6 md:w-6 transition-all", 
              isActive ? "text-primary fill-primary/10" : "text-white/30 group-hover:text-primary/70"
            )} />
            <span className={cn(
              "text-[7px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all text-center",
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
