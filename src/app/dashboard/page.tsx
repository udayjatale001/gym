
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, CheckCircle2, Calendar, Scale, TrendingUp, Zap, Loader2 } from "lucide-react";
import { format, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface LocalWeightLog {
  id: string;
  weight: number;
  timestamp: string;
}

interface LocalMeal {
  date: string;
}

export default function DashboardPage() {
  const [weightLogs, setWeightLogs] = useState<LocalWeightLog[]>([]);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [hasLoggedMealToday, setHasLoggedMealToday] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [suggestion, setSuggestion] = useState<{ today: string; yesterday: string; tomorrow: string }>({
    today: "Rest", yesterday: "Rest", tomorrow: "Rest"
  });

  useEffect(() => {
    // Load Weight Data
    const savedWeightLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedWeightLogs) setWeightLogs(JSON.parse(savedWeightLogs));
    if (savedTarget) setTargetWeight(parseFloat(savedTarget) || 0);

    // Load Diet Data
    const savedMeals = localStorage.getItem('fitstride_diet_logs_v2');
    if (savedMeals) {
      const meals: LocalMeal[] = JSON.parse(savedMeals);
      const today = format(new Date(), 'yyyy-MM-dd');
      setHasLoggedMealToday(meals.some(m => m.date === today));
    }

    // Set Training Schedule
    const getWorkout = (date: Date) => {
      const day = date.getDay();
      const map: Record<number, string> = { 0: "Rest", 1: "Push", 2: "Pull", 3: "Legs", 4: "Push", 5: "Pull", 6: "Legs" };
      return map[day];
    };
    const now = new Date();
    setSuggestion({
      today: getWorkout(now), yesterday: getWorkout(subDays(now, 1)), tomorrow: getWorkout(addDays(now, 1))
    });

    setIsLoaded(true);
  }, []);

  const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : 0;
  
  // Progress Calculation: (Start - Current) / (Start - Target)
  const progress = (() => {
    if (weightLogs.length === 0 || targetWeight === 0) return 0;
    const startWeight = weightLogs[weightLogs.length - 1].weight; // Oldest log
    if (startWeight === targetWeight) return 100;
    const totalDist = Math.abs(startWeight - targetWeight);
    const covered = Math.abs(startWeight - currentWeight);
    return Math.min(100, Math.max(0, (covered / totalDist) * 100));
  })();

  const remainingGap = Math.abs(currentWeight - targetWeight).toFixed(1);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Training Card */}
      <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 opacity-80">
            <Calendar className="h-4 w-4" />
            TRAINING SCHEDULE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="flex flex-col items-center text-center py-4">
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Today's Discipline</p>
            <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              {suggestion.today}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div className="text-left space-y-1">
              <p className="text-[9px] opacity-50 font-black uppercase tracking-widest">Yesterday</p>
              <p className="text-sm font-black italic uppercase">{suggestion.yesterday}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[9px] opacity-50 font-black uppercase tracking-widest">Tomorrow</p>
              <p className="text-sm font-black italic uppercase">{suggestion.tomorrow}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Metrics (Body Mass Progress) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Scale className="h-4 w-4 text-primary" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 uppercase italic">BODY MASS PROGRESS</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] p-5 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">CURRENT</p>
            <p className="text-3xl font-black italic text-primary">{currentWeight || "--"}<span className="text-xs ml-0.5">KG</span></p>
          </Card>
          <Card className="bg-accent/5 border-2 border-accent/10 rounded-[2rem] p-5 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">TARGET</p>
            <p className="text-3xl font-black italic text-accent">{targetWeight || "--"}<span className="text-xs ml-0.5">KG</span></p>
          </Card>
        </div>

        <Card className="p-8 rounded-[2.5rem] shadow-xl border-none bg-white space-y-6 group">
          <div className="flex justify-between items-end">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 
              TRANSFORMATION
            </h3>
            <span className="text-3xl font-black text-primary italic leading-none">{Math.round(progress)}%</span>
          </div>
          
          <div className="space-y-4">
            <Progress value={progress} className="h-6 bg-muted rounded-full shadow-inner" />
            
            {targetWeight > 0 && weightLogs.length > 0 && (
              <div className="text-center py-4 bg-muted/10 rounded-[1.5rem] border-2 border-dashed border-muted group-hover:border-primary/20 transition-colors">
                <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-1">REMAINING GAP</p>
                <p className="text-4xl font-black italic tracking-tighter">
                  {remainingGap} <span className="text-sm opacity-40 not-italic">KG</span>
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Diet Card */}
      <Card className={cn(
        "border-none shadow-lg rounded-[2rem] transition-all duration-500",
        hasLoggedMealToday ? "bg-primary/5 border-l-8 border-l-primary" : "bg-muted/30 border-l-8 border-l-muted"
      )}>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
              hasLoggedMealToday ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Dietary Loop</p>
              <p className="text-sm font-black italic uppercase">
                {hasLoggedMealToday ? "FUEL LOGGED • STREAK ACTIVE" : "AWAITING MEAL LOG..."}
              </p>
            </div>
          </div>
          {hasLoggedMealToday && <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-500" />}
        </CardContent>
      </Card>
    </div>
  );
}
