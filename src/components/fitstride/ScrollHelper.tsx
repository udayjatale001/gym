'use client';

import React from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollHelper() {
  const scrollToTop = () => {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;
    mainContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="fixed bottom-28 right-4 z-[60]">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollToTop}
          className="h-7 w-7 rounded-full text-white/40 hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
