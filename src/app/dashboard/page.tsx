
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, Utensils, CheckCircle2, Calendar, Scale, TrendingUp } from "lucide-react";
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, query, collection, orderBy } from "firebase/firestore";
import { format, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const db = useFirestore();
  const { user } = useUser();
  
  const [suggestion, setSuggestion] = useState<{ today: string; yesterday: string; tomorrow: string }>({
    today: "Rest", yesterday: "Rest", tomorrow: "Rest"
  });

  const userRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  // Fetch all weight logs to determine start vs current progress
  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'weightLogs'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  const { data: weightLogs } = useCollection(weightQuery);

  const mealQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'mealLogs'), orderBy('timestamp', 'desc'));
  }, [db, user]);
  const { data: recentMeals } = useCollection(mealQuery);

  const currentWeight = weightLogs?.[0]?.weight || profile?.currentWeight || 0;
  const targetWeight = profile?.targetWeight || 0;
  
  // Professional progress calculation: (Start - Current) / (Start - Target)
  const progress = (() => {
    if (!weightLogs || weightLogs.length === 0 || targetWeight === 0) return 0;
    const startWeight = weightLogs[weightLogs.length - 1].weight; // The oldest log
    if (startWeight === targetWeight) return 100;
    const totalDist = Math.abs(startWeight - targetWeight);
    const covered = Math.abs(startWeight - currentWeight);
    return Math.min(100, Math.max(0, (covered / totalDist) * 100));
  })();

  const remainingGap = Math.abs(currentWeight - targetWeight).toFixed(1);

  const hasLoggedMealToday = recentMeals?.some(m => m.date === format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const getWorkout = (date: Date) => {
      const day = date.getDay();
      const map: Record<number, string> = { 0: "Rest", 1: "Push", 2: "Pull", 3: "Legs", 4: "Push", 5: "Pull", 6: "Legs" };
      return map[day];
    };
    const now = new Date();
    setSuggestion({
      today: getWorkout(now), yesterday: getWorkout(subDays(now, 1)), tomorrow: getWorkout(addDays(now, 1))
    });
  }, []);

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
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">BODY MASS PROGRESS</h3>
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
            
            {targetWeight > 0 && currentWeight > 0 && (
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

      {currentWeight === 0 && (
        <Card className="bg-accent/5 border-2 border-dashed border-accent/20 rounded-[2rem] animate-pulse">
          <CardContent className="p-6 flex items-center gap-4">
            <Info className="h-6 w-6 text-accent shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">
              System is awaiting data. Initialize your profile in the Weight or Workout tabs to see real-time analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
