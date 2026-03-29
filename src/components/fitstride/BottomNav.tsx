'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Scale, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Workout', icon: Dumbbell, href: '/dashboard/workout' },
  { label: 'Diet', icon: Utensils, href: '/dashboard/diet' },
  { label: 'Weight', icon: Scale, href: '/dashboard/weight' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 left-0 right-0 w-full bg-card/80 backdrop-blur-xl border-t border-border/40 flex items-center justify-around py-4 px-2 z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-90",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
            )}
          >
            <item.icon className={cn("h-6 w-6 transition-all", isActive && "fill-primary/20")} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.15em] transition-all",
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