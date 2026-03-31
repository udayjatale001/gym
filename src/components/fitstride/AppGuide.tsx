'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  position: 'bottom' | 'top' | 'center';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'WELCOME WARRIOR 👋',
    description: 'Initializing Discipline Mode. Let\'s walk through your new command center.',
    targetId: 'brand-logo',
    position: 'bottom',
  },
  {
    id: 'training',
    title: 'TRAINING ROTATION 🏋️‍♂️',
    description: 'Your PPL (Push, Pull, Legs) cycle rotates automatically every midnight.',
    targetId: 'training-card',
    position: 'bottom',
  },
  {
    id: 'strides',
    title: 'RECOVERY STRIDES 🌙',
    description: 'Track your Sleep, Water, and Steps to optimize performance.',
    targetId: 'sleep-stride',
    position: 'top',
  },
  {
    id: 'nav-workout',
    title: 'WORKOUT BLOCKS 📊',
    description: 'Manage your training splits and exercises here.',
    targetId: 'nav-workout',
    position: 'top',
  },
  {
    id: 'nav-diet',
    title: 'DIETARY LOOP 🍎',
    description: 'Log meals and track cumulative calories with the Energy Protocol.',
    targetId: 'nav-diet',
    position: 'top',
  },
];

export function AppGuide() {
  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const startGuide = useCallback(() => {
    setCurrentStepIndex(0);
    setActive(true);
  }, []);

  useEffect(() => {
    const hasSeen = localStorage.getItem('fitstride_has_seen_guide');
    if (!hasSeen) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => startGuide(), 1000);
      return () => clearTimeout(timer);
    }
  }, [startGuide]);

  // Handle global event for starting guide from Header
  useEffect(() => {
    const handleStartGuide = () => startGuide();
    window.addEventListener('start-app-guide', handleStartGuide);
    return () => window.removeEventListener('start-app-guide', handleStartGuide);
  }, [startGuide]);

  useEffect(() => {
    if (!active) return;

    const updateRect = () => {
      const step = GUIDE_STEPS[currentStepIndex];
      const el = document.querySelector(`[data-guide-id="${step.targetId}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [active, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setActive(false);
    localStorage.setItem('fitstride_has_seen_guide', 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!active) return null;

  const currentStep = GUIDE_STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Backdrop with Spotlight */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity duration-500 pointer-events-auto"
        onClick={handleSkip}
      />

      {targetRect && (
        <div 
          className="absolute z-[101] rounded-2xl transition-all duration-500 ease-in-out border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.8),0_0_30px_rgba(57,255,20,0.4)] pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip Bubble */}
      <div 
        className={cn(
          "absolute z-[102] w-[280px] bg-card border-2 border-primary/20 rounded-[2rem] p-6 shadow-2xl transition-all duration-500 ease-in-out pointer-events-auto flex flex-col gap-4 animate-in zoom-in-95 fade-in duration-300",
          currentStep.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          targetRect && currentStep.position === 'bottom' && "mt-4",
          targetRect && currentStep.position === 'top' && "mb-4"
        )}
        style={targetRect ? {
          top: currentStep.position === 'bottom' ? targetRect.bottom + 20 : undefined,
          bottom: currentStep.position === 'top' ? (window.innerHeight - targetRect.top) + 20 : undefined,
          left: Math.max(20, Math.min(window.innerWidth - 300, targetRect.left + (targetRect.width / 2) - 140))
        } : {}}
      >
        {/* Tooltip Arrow */}
        {targetRect && (
          <div 
            className={cn(
              "absolute w-4 h-4 bg-card border-l-2 border-t-2 border-primary/20 rotate-45 transition-all duration-500",
              currentStep.position === 'bottom' ? "-top-2.5 left-1/2 -translate-x-1/2" : "-bottom-2.5 left-1/2 -translate-x-1/2 rotate-[225deg]"
            )}
          />
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black italic tracking-tighter text-primary uppercase">{currentStep.title}</h4>
            <span className="text-[10px] font-black text-muted-foreground opacity-40">{currentStepIndex + 1}/{GUIDE_STEPS.length}</span>
          </div>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">{currentStep.description}</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-white"
            onClick={handleSkip}
          >
            SKIP
          </Button>
          <Button 
            className="flex-1 h-10 rounded-xl bg-primary text-black font-black uppercase italic tracking-widest text-[10px] shadow-lg active:scale-95"
            onClick={handleNext}
          >
            {currentStepIndex === GUIDE_STEPS.length - 1 ? 'INITIALIZE' : 'NEXT'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
