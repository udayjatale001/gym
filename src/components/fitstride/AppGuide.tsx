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
  // --- HOME PAGE ---
  {
    id: 'welcome',
    title: 'WELCOME WARRIOR 👋',
    description: 'Initializing Discipline Mode. This is your high-performance Command Center.',
    targetId: 'brand-logo',
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
    description: 'Log Bedtime/Wake Time to track total recovery hours automatically.',
    targetId: 'sleep-stride',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'steps',
    title: 'MOBILITY STRIDE 👣',
    description: 'Track daily steps. Every movement fuels your transformation.',
    targetId: 'step-stride',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'weight-mass',
    title: 'BODY MASS ⚖️',
    description: 'Monitor current weight, goals, and the gap remaining in your transformation.',
    targetId: 'weight-progress',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'water',
    title: 'HYDRATION PROTOCOL 💧',
    description: 'Log daily water and monitor hydration status with visual tracking.',
    targetId: 'water-card',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'support',
    title: 'FUEL THE EVOLUTION 🔥',
    description: 'Support the mission by contributing any amount you like to help improve elite updates.',
    targetId: 'support-button',
    position: 'top',
    path: '/dashboard'
  },
  // --- WORKOUT PAGES ---
  {
    id: 'workout-add',
    title: 'CREATE SPLITS ➕',
    description: 'Add your custom workout splits (Push, Pull, Legs, etc.) here.',
    targetId: 'add-split-btn',
    position: 'bottom',
    path: '/dashboard/workout'
  },
  {
    id: 'workout-list',
    title: 'TRAINING BLOCKS 📋',
    description: 'Select a split to start logging your exercises and tracking performance.',
    targetId: 'split-list',
    position: 'top',
    path: '/dashboard/workout'
  },
  {
    id: 'heat-check',
    title: 'HEAT CHECK 🥵',
    description: 'Tap the emoji to see estimated calories burned based on lifted volume.',
    targetId: 'heat-check-btn',
    position: 'bottom',
    path: '/dashboard/workout/'
  },
  // --- DIET PAGE ---
  {
    id: 'diet-stats',
    title: 'DIET ANALYTICS 📈',
    description: 'Analyze your diet consistency and success rate over the month.',
    targetId: 'diet-stats-btn',
    position: 'bottom',
    path: '/dashboard/diet'
  },
  {
    id: 'diet-grid',
    title: 'CONSISTENCY GRID 📅',
    description: 'Mark your meals as Taken or Skipped to track dietary discipline.',
    targetId: 'diet-grid',
    position: 'top',
    path: '/dashboard/diet'
  },
  // --- PROGRESS (CALORIES) PAGE ---
  {
    id: 'calorie-input',
    title: 'ENERGY INTAKE 🔋',
    description: 'Log your daily calories. The protocol sums them automatically.',
    targetId: 'calorie-input',
    position: 'bottom',
    path: '/dashboard/progress'
  },
  {
    id: 'calorie-chart',
    title: 'PERFORMANCE TRENDS 📊',
    description: 'Visualize your caloric intake patterns over the 30-day cycle.',
    targetId: 'calorie-chart',
    position: 'top',
    path: '/dashboard/progress'
  },
  // --- WEIGHT PAGE ---
  {
    id: 'weight-entry',
    title: 'MASS LOG ⚖️',
    description: 'Record your daily body weight with precision decimals.',
    targetId: 'weight-input',
    position: 'bottom',
    path: '/dashboard/weight'
  },
  {
    id: 'weight-metrics',
    title: 'MARKET TRENDS 📈',
    description: 'Track your body mass changes like a high-end trading platform.',
    targetId: 'weight-metrics',
    position: 'top',
    path: '/dashboard/weight'
  },
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
    // Session-based check
    const hasSeenKey = `fitstride_has_seen_guide_${pathname}`;
    const hasSeen = localStorage.getItem(hasSeenKey);
    
    if (!hasSeen && pageSteps.length > 0) {
      const timer = setTimeout(() => startGuide(), 1000);
      return () => clearTimeout(timer);
    }
  }, [startGuide, pathname, pageSteps]);

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
    
    // Auto-scroll to element smoothly
    const step = pageSteps[currentStepIndex];
    const el = document.querySelector(`[data-guide-id="${step.targetId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // High-frequency rect update to handle scrolling fluidly
    const interval = setInterval(updateRect, 30);
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
      {/* Spotlight Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-none transition-all duration-500" />

      {targetRect && (
        <div 
          className="absolute z-[101] rounded-[1.5rem] border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.8),0_0_50px_rgba(57,255,20,0.6)] transition-all duration-300 pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Bubble Tooltip */}
      <div 
        ref={tooltipRef}
        className={cn(
          "absolute z-[102] w-[280px] bg-card border-2 border-primary/40 rounded-[2rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 pointer-events-auto flex flex-col gap-3 animate-in zoom-in-95 fade-in",
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
              "absolute w-3 h-3 bg-card border-l-2 border-t-2 border-primary/40 rotate-45 transition-all duration-300",
              currentStep.position === 'bottom' ? "-top-1.5 left-1/2 -translate-x-1/2" : "-bottom-1.5 left-1/2 -translate-x-1/2 rotate-[225deg]"
            )}
          />
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black italic tracking-tighter text-primary uppercase">{currentStep.title}</h4>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{currentStepIndex + 1}/{pageSteps.length}</span>
          </div>
          <p className="text-[13px] font-bold text-white leading-relaxed italic">{currentStep.description}</p>
        </div>
      </div>

      {/* Sticky Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[103] w-[92%] max-w-sm pointer-events-auto">
        <div className="bg-black/95 backdrop-blur-3xl border-2 border-primary/50 rounded-full p-2.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(57,255,20,0.1)] animate-in slide-in-from-bottom-10">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 px-6 active:scale-90 transition-all"
            onClick={handleSkip}
          >
            SKIP
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 mr-2">
              {pageSteps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300", 
                    i === currentStepIndex ? "w-5 bg-primary" : "w-1.5 bg-white/10"
                  )} 
                />
              ))}
            </div>
            <Button 
              className="h-11 rounded-full px-8 bg-primary text-black font-black uppercase italic tracking-widest text-[11px] shadow-[0_0_15px_rgba(57,255,20,0.4)] active:scale-95 transition-all hover:bg-primary/90"
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
