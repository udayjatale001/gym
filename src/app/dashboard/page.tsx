
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Utensils, CheckCircle2, Calendar, Scale, TrendingUp, Loader2, Quote } from "lucide-react";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Language, translations } from '@/lib/translations';

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
  const [quote, setQuote] = useState("");
  const [suggestion, setSuggestion] = useState<{ today: string }>({
    today: "Rest"
  });
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    // Load Language
    const savedLang = localStorage.getItem('language') as Language;
    const currentLang = savedLang || 'en';
    setLang(currentLang);
    const t = translations[currentLang];

    // Load Weight Data
    const savedWeightLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedWeightLogs) setWeightLogs(JSON.parse(savedWeightLogs));
    if (savedTarget) setTargetWeight(parseFloat(savedTarget) || 0);

    // Load Diet Data
    const savedMeals = localStorage.getItem('fitstride_diet_logs_v2');
    if (savedMeals) {
      const meals: LocalMeal[] = JSON.parse(savedMeals);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      setHasLoggedMealToday(meals.some(m => m.date === todayStr));
    }

    // Set Training Schedule (Today Only)
    const getWorkout = (date: Date) => {
      const day = date.getDay();
      const map: Record<number, string> = { 
        0: t.rest, 
        1: t.push, 
        2: t.pull, 
        3: t.legs, 
        4: t.push, 
        5: t.pull, 
        6: t.legs 
      };
      return map[day];
    };
    const now = new Date();
    setSuggestion({
      today: getWorkout(now)
    });

    // Daily Quote rotation at Midnight
    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const quoteIndex = dateSeed % t.quotes.length;
    setQuote(t.quotes[quoteIndex]);

    setIsLoaded(true);
  }, []);

  const t = translations[lang];

  const weightLogsSorted = [...weightLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const currentWeight = weightLogsSorted.length > 0 ? weightLogsSorted[0].weight : 0;
  
  const progress = (() => {
    if (weightLogsSorted.length === 0 || targetWeight === 0) return 0;
    const startWeight = weightLogsSorted[weightLogsSorted.length - 1].weight;
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
    <div className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* Training Card */}
      <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        <CardHeader className="pb-1 pt-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 opacity-80">
            <Calendar className="h-4 w-4" />
            {t.trainingSchedule}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="flex flex-col items-center text-center py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{t.todaysDiscipline}</p>
            <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              {suggestion.today}
            </h3>
            {quote && (
              <div className="mt-6 px-6 py-4 bg-black/10 rounded-2xl border border-white/5 relative group transition-all hover:bg-black/20 w-full">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1 flex items-center justify-center gap-2">
                  <Quote className="h-2.5 w-2.5" /> {t.disciplineDirective}
                </p>
                <p className="text-[11px] font-black uppercase tracking-widest italic leading-relaxed text-center text-white/80">
                  "{quote}"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goal Metrics (Body Mass Progress) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <Scale className="h-5 w-5 text-primary" />
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 italic">{t.bodyMassProgress}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-2 border-border/50 rounded-[2.5rem] p-6 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60">{t.current}</p>
            <p className="text-4xl font-black italic text-primary leading-none">{currentWeight || "--"}<span className="text-xs ml-1 opacity-40 not-italic">KG</span></p>
          </Card>
          <Card className="bg-card border-2 border-border/50 rounded-[2.5rem] p-6 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60">{t.target}</p>
            <p className="text-4xl font-black italic text-accent leading-none">{targetWeight || "--"}<span className="text-xs ml-1 opacity-40 not-italic">KG</span></p>
          </Card>
        </div>

        <Card className="p-10 rounded-[3rem] shadow-2xl border-none bg-card space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-30" />
          <div className="flex justify-between items-end">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 
              {t.transformation}
            </h3>
            <span className="text-4xl font-black text-primary italic leading-none">{Math.round(progress)}%</span>
          </div>
          
          <div className="space-y-6">
            <div className="h-8 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/30">
               <div 
                 className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                 style={{ width: `${progress}%` }}
               />
            </div>
            
            {targetWeight > 0 && weightLogs.length > 0 && (
              <div className="text-center py-6 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/50">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em] mb-2">{t.remainingGap}</p>
                <p className="text-5xl font-black italic tracking-tighter">
                  {remainingGap} <span className="text-sm opacity-30 not-italic tracking-normal">KG</span>
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Diet Card */}
      <Card className={cn(
        "border-none shadow-xl rounded-[2.5rem] transition-all duration-500 overflow-hidden",
        hasLoggedMealToday ? "bg-primary/10" : "bg-card border border-border/50"
      )}>
        <CardContent className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={cn(
              "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-inner",
              hasLoggedMealToday ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground"
            )}>
              <Utensils className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{t.dietaryLoop}</p>
              <p className="text-lg font-black italic uppercase tracking-tight">
                {hasLoggedMealToday ? t.fuelLogged : t.awaitingLog}
              </p>
            </div>
          </div>
          {hasLoggedMealToday ? (
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-muted-foreground opacity-30 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
