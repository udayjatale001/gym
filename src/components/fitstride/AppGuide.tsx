'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  path?: string; // Optional: specify which page this step belongs to
}

const ALL_STEPS: GuideStep[] = [
  // --- HOME PAGE ---
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
    description: 'Shows today’s workout automatically based on your plan. Stay consistent. Show up no matter what.',
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
    description: 'Track your current weight, goal weight, and the gap remaining to reach your target.',
    targetId: 'weight-progress',
    position: 'top',
    path: '/dashboard'
  },
  {
    id: 'water',
    title: 'HYDRATION PROTOCOL 💧',
    description: 'Log your daily water intake and monitor hydration status in real-time.',
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
  },

  // --- WORKOUT PAGES ---
  {
    id: 'workout-add',
    title: 'NEW SPLIT ➕',
    description: 'Add your custom workout splits like Push, Pull, or Legs here.',
    targetId: 'add-split-btn',
    position: 'bottom',
    path: '/dashboard/workout'
  },
  {
    id: 'workout-list',
    title: 'TRAINING BLOCKS 📊',
    description: 'Select a workout split to view its 30-day block and log sessions.',
    targetId: 'split-list',
    position: 'top',
    path: '/dashboard/workout'
  },
  {
    id: 'heat-check',
    title: 'HEAT CHECK 🔥',
    description: 'Tap the emoji to view estimated calories burned based on your training volume.',
    targetId: 'heat-check-btn',
    position: 'bottom',
    path: '/dashboard/workout' // Matches nested workout pages too
  },

  // --- DIET PAGE ---
  {
    id: 'diet-grid',
    title: 'CONSISTENCY GRID 🍽️',
    description: 'Track whether you followed your dietary protocol each day of the block.',
    targetId: 'diet-grid',
    position: 'top',
    path: '/dashboard/diet'
  },
  {
    id: 'diet-stats',
    title: 'DIET ANALYTICS 📈',
    description: 'Analyze your overall diet consistency and adherence success rate.',
    targetId: 'diet-stats-btn',
    position: 'bottom',
    path: '/dashboard/diet'
  },

  // --- PROGRESS PAGE ---
  {
    id: 'calorie-input',
    title: 'ENERGY INTAKE 🍎',
    description: 'Log your daily fuel consumption. Entries sum up automatically.',
    targetId: 'calorie-input',
    position: 'bottom',
    path: '/dashboard/progress'
  },
  {
    id: 'calorie-chart',
    title: 'ENERGY TRENDS 📊',
    description: 'Track your calorie performance trends over the 30-day protocol.',
    targetId: 'calorie-chart',
    position: 'top',
    path: '/dashboard/progress'
  },

  // --- WEIGHT PAGE ---
  {
    id: 'weight-input',
    title: 'MASS LOGGING ⚖️',
    description: 'Record your body weight daily to track transformation progress.',
    targetId: 'weight-input',
    position: 'bottom',
    path: '/dashboard/weight'
  },
  {
    id: 'weight-metrics',
    title: 'MASS ANALYTICS 📈',
    description: 'Visualize your weight fluctuations and transformation gap.',
    targetId: 'weight-metrics',
    position: 'top',
    path: '/dashboard/weight'
  }
];

export function AppGuide() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Filter steps relevant to the current page
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
    const hasSeen = localStorage.getItem(`fitstride_has_seen_guide_${pathname}`);
    // Auto-start only on Dashboard for new users
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

  useEffect(() => {
    if (!active || pageSteps.length === 0) return;

    const updateRect = () => {
      const step = pageSteps[currentStepIndex];
      const el = document.querySelector(`[data-guide-id="${step.targetId}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    // Intersection observer might be better but window scroll is usually enough
    const scrollContainer = document.querySelector('main');
    scrollContainer?.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      scrollContainer?.removeEventListener('scroll', updateRect);
    };
  }, [active, currentStepIndex, pageSteps]);

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
        className="absolute inset-0 bg-black/75 transition-opacity duration-500 pointer-events-auto"
        onClick={handleSkip}
      />

      {targetRect && (
        <div 
          className="absolute z-[101] rounded-[1.5rem] transition-all duration-500 ease-in-out border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.75),0_0_30px_rgba(57,255,20,0.4)] pointer-events-none"
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
        className={cn(
          "absolute z-[102] w-[300px] bg-card border-2 border-primary/20 rounded-[2.5rem] p-6 shadow-2xl transition-all duration-500 ease-in-out pointer-events-auto flex flex-col gap-4 animate-in zoom-in-95 fade-in duration-300",
          currentStep.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={targetRect ? {
          top: currentStep.position === 'bottom' ? targetRect.bottom + 30 : undefined,
          bottom: currentStep.position === 'top' ? (window.innerHeight - targetRect.top) + 30 : undefined,
          left: Math.max(20, Math.min(window.innerWidth - 320, targetRect.left + (targetRect.width / 2) - 150))
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
            <h4 className="text-[11px] font-black italic tracking-tighter text-primary uppercase">{currentStep.title}</h4>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{currentStepIndex + 1}/{pageSteps.length}</span>
          </div>
          <p className="text-[13px] font-medium text-white/70 leading-relaxed italic">{currentStep.description}</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white"
            onClick={handleSkip}
          >
            SKIP
          </Button>
          <Button 
            className="flex-1 h-12 rounded-[1.25rem] bg-primary text-black font-black uppercase italic tracking-widest text-[11px] shadow-lg active:scale-95 transition-all hover:bg-primary/90"
            onClick={handleNext}
          >
            {currentStepIndex === pageSteps.length - 1 ? 'INITIALIZE' : 'NEXT STEP'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
