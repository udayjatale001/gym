'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position: 'bottom' | 'top' | 'center';
  path?: string;
}

const ALL_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'WELCOME WARRIOR 👋',
    description: 'Initializing Discipline Mode. Let\'s walk through your new command center.',
    targetId: 'brand-logo',
    position: 'bottom',
    path: '/dashboard'
  },
  {
    id: 'settings',
    title: 'COMMAND SETTINGS ⚙️',
    description: 'Manage your app preferences, language, and account protocols here.',
    targetId: 'settings-icon',
    position: 'bottom',
    path: '/dashboard'
  },
  {
    id: 'training',
    title: 'TRAINING ROTATION 🏋️‍♂️',
    description: 'Shows today’s workout automatically based on your plan. Stay consistent.',
    targetId: 'training-card',
    position: 'bottom',
    path: '/dashboard'
  },
  {
    id: 'sleep',
    title: 'RECOVERY STRIDE 😴',
    description: 'Enter your sleep and wake time to track total recovery hours automatically.',
    targetId: 'sleep-stride',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'steps',
    title: 'MOBILITY STRIDE 👣',
    description: 'Track your daily movement. Every step fuels your transformation.',
    targetId: 'step-stride',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'weight-mass',
    title: 'BODY MASS ⚖️',
    description: 'Track your current weight, goal weight, and the gap remaining.',
    targetId: 'weight-progress',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'water',
    title: 'HYDRATION PROTOCOL 💧',
    description: 'Log your daily water intake and monitor hydration status.',
    targetId: 'water-card',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'support',
    title: 'FUEL THE EVOLUTION 🔥',
    description: 'Support the app by contributing to help improve features and elite updates.',
    targetId: 'support-button',
    position: 'top',
    path: '/dashboard'
  }
];

export function AppGuide() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const pageSteps = useMemo(() => {
    return ALL_STEPS.filter(step => {
      if (!step.path) return true;
      if (step.path === '/dashboard') return pathname === '/dashboard';
      return pathname.startsWith(step.path);
    });
  }, [pathname]);

  const startGuide = useCallback(() => {
    if (pageSteps.length === 0) return;
    setCurrentStepIndex(0);
    setActive(true);
  }, [pageSteps]);

  useEffect(() => {
    const hasSeenKey = `fitstride_has_seen_guide_${pathname}`;
    const hasSeen = localStorage.getItem(hasSeenKey);
    
    if (!hasSeen && pathname === '/dashboard') {
      const timer = setTimeout(() => startGuide(), 1500);
      return () => clearTimeout(timer);
    }
  }, [startGuide, pathname]);

  useEffect(() => {
    const handleStartGuide = () => startGuide();
    window.addEventListener('start-app-guide', handleStartGuide);
    return () => window.removeEventListener('start-app-guide', handleStartGuide);
  }, [startGuide]);

  const updateRect = useCallback(() => {
    if (!active || pageSteps.length === 0) return;
    const step = pageSteps[currentStepIndex];
    const el = document.querySelector(`[data-guide-id="${step.targetId}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [active, currentStepIndex, pageSteps]);

  useEffect(() => {
    if (!active) return;
    
    // Auto-scroll to element when step changes
    const step = pageSteps[currentStepIndex];
    const el = document.querySelector(`[data-guide-id="${step.targetId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Update rect periodically to handle scrolling
    const interval = setInterval(updateRect, 50);
    window.addEventListener('resize', updateRect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
    };
  }, [active, currentStepIndex, pageSteps, updateRect]);

  const handleNext = () => {
    if (currentStepIndex < pageSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setActive(false);
    localStorage.setItem(`fitstride_has_seen_guide_${pathname}`, 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!active || pageSteps.length === 0) return null;

  const currentStep = pageSteps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Backdrop with Spotlight Effect */}
      <div 
        className="absolute inset-0 bg-black/75 transition-opacity duration-500 pointer-events-none"
      />

      {targetRect && (
        <div 
          className="absolute z-[101] rounded-[1.5rem] transition-all duration-300 ease-in-out border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.75),0_0_30px_rgba(57,255,20,0.4)] pointer-events-none"
          style={{
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        />
      )}

      {/* Tooltip Bubble */}
      <div 
        ref={tooltipRef}
        className={cn(
          "absolute z-[102] w-[280px] bg-card border-2 border-primary/20 rounded-[2rem] p-5 shadow-2xl transition-all duration-300 ease-in-out pointer-events-auto flex flex-col gap-3 animate-in zoom-in-95 fade-in",
          currentStep.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={targetRect ? {
          top: currentStep.position === 'bottom' ? targetRect.bottom + 25 : undefined,
          bottom: currentStep.position === 'top' ? (window.innerHeight - targetRect.top) + 25 : undefined,
          left: Math.max(20, Math.min(window.innerWidth - 300, targetRect.left + (targetRect.width / 2) - 140))
        } : {}}
      >
        {targetRect && (
          <div 
            className={cn(
              "absolute w-3 h-3 bg-card border-l-2 border-t-2 border-primary/20 rotate-45 transition-all duration-300",
              currentStep.position === 'bottom' ? "-top-1.5 left-1/2 -translate-x-1/2" : "-bottom-1.5 left-1/2 -translate-x-1/2 rotate-[225deg]"
            )}
          />
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black italic tracking-tighter text-primary uppercase">{currentStep.title}</h4>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{currentStepIndex + 1}/{pageSteps.length}</span>
          </div>
          <p className="text-[12px] font-medium text-white/70 leading-relaxed italic">{currentStep.description}</p>
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[103] w-[90%] max-w-sm pointer-events-auto">
        <div className="bg-card/90 backdrop-blur-xl border-2 border-primary/20 rounded-full p-2 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-10">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white px-6"
            onClick={handleSkip}
          >
            SKIP
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 mr-2">
              {pageSteps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 rounded-full transition-all", 
                    i === currentStepIndex ? "w-4 bg-primary" : "w-1 bg-white/10"
                  )} 
                />
              ))}
            </div>
            <Button 
              className="h-10 rounded-full px-8 bg-primary text-black font-black uppercase italic tracking-widest text-[10px] shadow-lg active:scale-95 transition-all hover:bg-primary/90"
              onClick={handleNext}
            >
              {currentStepIndex === pageSteps.length - 1 ? 'FINISH' : 'NEXT'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
