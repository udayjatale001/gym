'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplet, CheckCircle2, Calendar, Scale, TrendingUp, Loader2, Quote, Plus, RotateCcw, Moon, Footprints, Flame } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Language, translations } from '@/lib/translations';

interface LocalWeightLog {
  id: string;
  weight: number;
  timestamp: string;
}

interface DailyTrackerData {
  date: string;
  water: number;
  sleep: number;
  steps: number;
}

export default function DashboardPage() {
  const [weightLogs, setWeightLogs] = useState<LocalWeightLog[]>([]);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [currentData, setCurrentData] = useState<DailyTrackerData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    water: 0,
    sleep: 0,
    steps: 0
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [quote, setQuote] = useState("");
  const [suggestion, setSuggestion] = useState<{ today: string }>({ today: "Rest" });
  const [lang, setLang] = useState<Language>('en');

  const WATER_GOAL = 4000;
  const STEP_GOAL = 1000;
  const SLEEP_GOAL = 480; // 8 hours in minutes
  const NEON_GREEN = "#39FF14";

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const currentLang = savedLang || 'en';
    setLang(currentLang);
    const t = translations[currentLang];

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Weight Data
    const savedWeightLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedWeightLogs) setWeightLogs(JSON.parse(savedWeightLogs));
    if (savedTarget) setTargetWeight(parseFloat(savedTarget) || 0);

    // DAILY TRACKER LOGIC with History & Reset
    const savedDailyData = localStorage.getItem('fitstride_daily_trackers');
    let trackerHistory: DailyTrackerData[] = savedDailyData ? JSON.parse(savedDailyData) : [];
    
    // Check if we need to reset/archive
    const lastEntry = trackerHistory[trackerHistory.length - 1];
    if (lastEntry && !isSameDay(new Date(lastEntry.date), new Date())) {
      // It's a new day - Archive current and create new
      const newData: DailyTrackerData = {
        date: todayStr,
        water: 0,
        sleep: 0,
        steps: 0
      };
      trackerHistory.push(newData);
      localStorage.setItem('fitstride_daily_trackers', JSON.stringify(trackerHistory));
      setCurrentData(newData);
    } else if (lastEntry) {
      // Same day, load current
      setCurrentData(lastEntry);
    } else {
      // First time ever
      const firstData = { date: todayStr, water: 0, sleep: 0, steps: 0 };
      trackerHistory.push(firstData);
      localStorage.setItem('fitstride_daily_trackers', JSON.stringify(trackerHistory));
      setCurrentData(firstData);
    }

    // Suggestions & Quotes
    const now = new Date();
    const getWorkout = (date: Date) => {
      const day = date.getDay();
      const map: Record<number, string> = { 0: t.rest, 1: t.push, 2: t.pull, 3: t.legs, 4: t.push, 5: t.pull, 6: t.legs };
      return map[day];
    };
    setSuggestion({ today: getWorkout(now) });

    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const quoteIndex = dateSeed % t.quotes.length;
    setQuote(t.quotes[quoteIndex]);

    setIsLoaded(true);
  }, []);

  const updateDailyTracker = (key: keyof Omit<DailyTrackerData, 'date'>, value: number) => {
    setCurrentData(prev => {
      const updated = { ...prev, [key]: value };
      const savedDailyData = localStorage.getItem('fitstride_daily_trackers');
      let trackerHistory: DailyTrackerData[] = savedDailyData ? JSON.parse(savedDailyData) : [];
      const todayIndex = trackerHistory.findIndex(l => l.date === prev.date);
      if (todayIndex > -1) trackerHistory[todayIndex] = updated;
      localStorage.setItem('fitstride_daily_trackers', JSON.stringify(trackerHistory));
      return updated;
    });
  };

  const handleAddWater = () => updateDailyTracker('water', Math.min(WATER_GOAL, currentData.water + 250));
  const handleResetWater = () => updateDailyTracker('water', 0);
  const handleAddSleep = (min: number) => updateDailyTracker('sleep', currentData.sleep + min);
  const handleAddSteps = (s: number) => updateDailyTracker('steps', currentData.steps + s);

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

  const formatSleep = (min: number) => {
    const h = (min / 60).toFixed(1);
    return `${h}h`;
  };

  const sleepProgress = Math.min(100, (currentData.sleep / SLEEP_GOAL) * 100);
  const stepProgress = Math.min(100, (currentData.steps / STEP_GOAL) * 100);
  const caloriesFromSteps = Math.round(currentData.steps * 0.04);

  if (!isLoaded) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 no-scrollbar bg-[#000000]">
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
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              {suggestion.today}
            </h3>
            {quote && (
              <div className="mt-6 px-4 md:px-6 py-4 bg-black/10 rounded-2xl border border-white/5 w-full">
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

      {/* STRIDE PROGRESS TRACKERS (Finance Dashboard Style) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Sleep Stride (🌙) */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">SLEEP STRIDE</p>
              </div>
              <h4 className="text-5xl font-black italic tracking-tighter text-primary">{formatSleep(currentData.sleep)}</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">RESTED</p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-90 transition-all">
                  <Plus className="h-6 w-6 text-black" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-white/10 rounded-[2.5rem] w-[90%] max-w-xs p-8">
                <DialogHeader><DialogTitle className="text-primary font-black italic uppercase tracking-tighter text-center">LOG RECOVERY</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 gap-3 py-6">
                  <Button variant="outline" className="h-14 rounded-2xl border-white/10 text-white font-black uppercase text-xs" onClick={() => handleAddSleep(60)}>+ 1.0H NAP</Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-white/10 text-white font-black uppercase text-xs" onClick={() => handleAddSleep(480)}>+ 8.0H SLEEP</Button>
                  <Button variant="ghost" className="h-10 text-destructive/40 font-black uppercase text-[10px] mt-4" onClick={() => updateDailyTracker('sleep', 0)}>RESET RECOVERY</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative pt-2">
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out rounded-full",
                  currentData.sleep >= SLEEP_GOAL ? "bg-primary shadow-[0_0_15px_#39FF14]" : "bg-primary/40"
                )}
                style={{ width: `${sleepProgress}%` }}
              />
            </div>
            {/* Target Marker at 8h */}
            <div className="absolute top-0 left-[100%] h-6 w-0.5 bg-white/20 -translate-x-full" />
            <div className="flex justify-between items-center mt-2 px-1">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20">RECOVERY PROGRESS</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-primary italic">{Math.round(sleepProgress)}%</p>
            </div>
          </div>
        </Card>

        {/* Step Stride (👟) */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl" onClick={() => handleAddSteps(50)}>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Footprints className="h-4 w-4 text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">STEP STRIDE</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h4 className="text-5xl font-black italic tracking-tighter text-white">{currentData.steps}</h4>
                <span className="text-lg font-black text-white/10 italic">/ {STEP_GOAL}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Flame className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-black italic text-primary">{caloriesFromSteps} KCAL</span>
              </div>
            </div>
            {currentData.steps >= STEP_GOAL && (
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-7 w-7 text-primary shadow-[0_0_15px_#39FF14]" />
              </div>
            )}
          </div>

          <div className="relative pt-2">
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out rounded-full",
                  currentData.steps >= STEP_GOAL ? "bg-primary shadow-[0_0_20px_#39FF14] animate-pulse" : "bg-white/40"
                )}
                style={{ width: `${stepProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20">ACTIVE MOBILITY</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">{Math.round(stepProgress)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Goal Metrics (Body Mass Progress) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <Scale className="h-5 w-5 text-primary" />
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 italic">{t.bodyMassProgress}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-2 border-border/50 rounded-[2.5rem] p-6 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60">{t.current}</p>
            <p className="text-3xl md:text-4xl font-black italic text-primary leading-none">{currentWeight || "--"}<span className="text-xs ml-1 opacity-40 not-italic">KG</span></p>
          </Card>
          <Card className="bg-card border-2 border-border/50 rounded-[2.5rem] p-6 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60">{t.target}</p>
            <p className="text-3xl md:text-4xl font-black italic text-accent leading-none">{targetWeight || "--"}<span className="text-xs ml-1 opacity-40 not-italic">KG</span></p>
          </Card>
        </div>

        <Card className="p-8 md:p-10 rounded-[3rem] shadow-2xl border-none bg-card space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-30" />
          <div className="flex justify-between items-end">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 
              {t.transformation}
            </h3>
            <span className="text-3xl md:text-4xl font-black text-primary italic leading-none">{Math.round(progress)}%</span>
          </div>
          
          <div className="space-y-6">
            <div className="h-8 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/30 relative">
               <div 
                 className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                 style={{ width: `${progress}%` }}
               />
            </div>
            
            {targetWeight > 0 && weightLogs.length > 0 && (
              <div className="text-center py-6 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/50">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em] mb-2">{t.remainingGap}</p>
                <p className="text-4xl md:text-5xl font-black italic tracking-tighter">
                  {Math.abs(currentWeight - targetWeight).toFixed(1)} <span className="text-sm opacity-30 not-italic tracking-normal">KG</span>
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Water Intake Card */}
      <Card className={cn(
        "border-none shadow-xl rounded-[2.5rem] transition-all duration-500 overflow-hidden relative active:scale-[0.98]",
        currentData.water >= WATER_GOAL ? "bg-primary/10" : "bg-card border border-border/50"
      )}>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0",
                  currentData.water >= WATER_GOAL ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground"
                )}>
                  <Droplet className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 truncate">{t.waterIntake}</p>
                  <p className="text-lg md:text-xl font-black italic uppercase tracking-tight text-primary truncate">
                    {(currentData.water / 1000).toFixed(1)} <span className="text-[10px] not-italic opacity-40">/ 4.0 {t.liters}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {currentData.water > 0 && (
                  <Button 
                    onClick={handleResetWater} 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl border-2 border-muted/50 text-muted-foreground/40 hover:text-destructive active:scale-90 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                {currentData.water >= WATER_GOAL ? (
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <Button 
                    onClick={handleAddWater} 
                    size="sm" 
                    className="h-10 px-3 md:px-4 rounded-xl font-black uppercase tracking-tighter text-[9px] italic shadow-lg active:scale-90 whitespace-nowrap bg-primary"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> {t.addWater}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/10">
                <div 
                  className={cn(
                    "h-full transition-all duration-700 ease-out rounded-full",
                    currentData.water >= WATER_GOAL ? "bg-primary" : "bg-primary/40"
                  )}
                  style={{ width: `${(currentData.water / WATER_GOAL) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{t.dailyGoal}</p>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">{Math.round((currentData.water / WATER_GOAL) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
