'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ScrollHelper() {
  const scroll = (direction: 'up' | 'down') => {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;

    const scrollAmount = direction === 'up' ? 0 : mainContainer.scrollHeight;
    mainContainer.scrollTo({
      top: scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="fixed bottom-28 right-4 z-[60] flex flex-col gap-1">
      <div className="bg-black/80 backdrop-blur-xl border border-primary/30 rounded-full p-1 flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('up')}
          className="h-10 w-10 rounded-full text-white/40 hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <div className="h-px w-6 bg-white/5 mx-auto" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('down')}
          className="h-10 w-10 rounded-full text-white/40 hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
