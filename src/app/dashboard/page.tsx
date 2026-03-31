
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Droplet, CheckCircle2, Calendar, Scale, TrendingUp, Loader2, Quote, Plus, RotateCcw, Moon, Footprints, Flame, Timer, RefreshCw, TrendingDown, Info, Activity, Heart, Copy, Check, ExternalLink } from "lucide-react";
import { format, isSameDay, differenceInMinutes, parse, differenceInDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Language, translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';

interface DailyTrackerData {
  date: string;
  water: number;
  sleep: number;
  steps: number;
  bedtime?: string;
  wakeTime?: string;
}

interface LocalWeightLog {
  id: string;
  weight: number;
  timestamp: string;
}

interface WorkoutSplit {
  id: string;
  name: string;
  focus: string;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [weightLogs, setWeightLogs] = useState<LocalWeightLog[]>([]);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [currentData, setCurrentData] = useState<DailyTrackerData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    water: 0,
    sleep: 0,
    steps: 0,
    bedtime: '',
    wakeTime: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [quote, setQuote] = useState("");
  const [currentWorkout, setCurrentWorkout] = useState<string>("REST");
  const [lang, setLang] = useState<Language>('en');
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const WATER_GOAL = 4000;
  const STEP_GOAL = 1000;
  const SLEEP_GOAL = 480; // 8 hours in minutes
  const UPI_ID = "7247089447@ybl";
  const MASKED_UPI = "7247••••@ybl";
  const PAYMENT_LINK = `upi://pay?pa=${UPI_ID}&pn=Uday%20Jatale&cu=INR`;

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const currentLang = savedLang || 'en';
    setLang(currentLang);
    const t = translations[currentLang];

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 1. Weight Data
    const savedWeightLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedWeightLogs) setWeightLogs(JSON.parse(savedWeightLogs));
    if (savedTarget) setTargetWeight(parseFloat(savedTarget) || 0);

    // 2. DAILY TRACKER LOGIC with History & Reset
    const savedDailyData = localStorage.getItem('fitstride_daily_trackers');
    let trackerHistory: DailyTrackerData[] = savedDailyData ? JSON.parse(savedDailyData) : [];
    
    const lastEntry = trackerHistory[trackerHistory.length - 1];
    if (lastEntry && !isSameDay(new Date(lastEntry.date), new Date())) {
      const newData: DailyTrackerData = {
        date: todayStr, water: 0, sleep: 0, steps: 0, bedtime: '', wakeTime: ''
      };
      trackerHistory.push(newData);
      localStorage.setItem('fitstride_daily_trackers', JSON.stringify(trackerHistory));
      setCurrentData(newData);
      setIsEditingSleep(true);
    } else if (lastEntry) {
      setCurrentData(lastEntry);
      setIsEditingSleep(!lastEntry.bedtime && lastEntry.sleep === 0);
    } else {
      const firstData = { date: todayStr, water: 0, sleep: 0, steps: 0, bedtime: '', wakeTime: '' };
      trackerHistory.push(firstData);
      localStorage.setItem('fitstride_daily_trackers', JSON.stringify(trackerHistory));
      setCurrentData(firstData);
      setIsEditingSleep(true);
    }

    // 3. DYNAMIC WORKOUT ROTATION LOGIC
    const savedSplits = localStorage.getItem('fitstride_splits');
    const splits: WorkoutSplit[] = savedSplits ? JSON.parse(savedSplits) : [
      { id: 'push', name: "PUSH", focus: "Chest, Shoulders" },
      { id: 'pull', name: "PULL", focus: "Back, Biceps" },
      { id: 'legs', name: "LEGS", focus: "Quads, Hams" }
    ];

    let cycleStart = localStorage.getItem('fitstride_cycle_start');
    if (!cycleStart) {
      cycleStart = todayStr;
      localStorage.setItem('fitstride_cycle_start', todayStr);
    }

    const daysSinceStart = Math.abs(differenceInDays(startOfDay(new Date()), startOfDay(new Date(cycleStart))));
    const splitIndex = daysSinceStart % (splits.length || 1);
    const todayWorkout = splits[splitIndex]?.name || t.rest;
    setCurrentWorkout(todayWorkout);

    // 4. DAILY QUOTE ROTATION
    const dateSeed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();
    const quoteIndex = dateSeed % t.quotes.length;
    setQuote(t.quotes[quoteIndex]);

    setIsLoaded(true);
  }, []);

  const updateDailyTracker = (updates: Partial<DailyTrackerData>) => {
    setCurrentData(prev => {
      const updated = { ...prev, ...updates };
      const savedDailyData = localStorage.getItem('fitstride_daily_trackers');
      let trackerHistory: DailyTrackerData[] = savedDailyData ? JSON.parse(savedDailyData) : [];
      const todayIndex = trackerHistory.findIndex(l => l.date === prev.date);
      if (todayIndex > -1) trackerHistory[todayIndex] = updated;
      localStorage.setItem('fitstride_daily_trackers', JSON.stringify(trackerHistory));
      return updated;
    });
  };

  const handleCalculateSleep = () => {
    if (!currentData.bedtime || !currentData.wakeTime) return;
    const bed = parse(currentData.bedtime, 'HH:mm', new Date());
    let wake = parse(currentData.wakeTime, 'HH:mm', new Date());
    if (wake < bed) wake = new Date(wake.getTime() + 24 * 60 * 60 * 1000);
    const minutes = differenceInMinutes(wake, bed);
    updateDailyTracker({ sleep: minutes });
    setIsEditingSleep(false);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setHasCopied(true);
    toast({
      title: t.idCopied,
      description: "Protocol ID Archived.",
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleAddNap = () => updateDailyTracker({ sleep: currentData.sleep + 60 });
  const handleResetSleep = () => setIsEditingSleep(true);
  const handleAddWater = () => updateDailyTracker({ water: Math.min(WATER_GOAL, currentData.water + 250) });
  const handleResetWater = () => updateDailyTracker({ water: 0 });
  const handleAddSteps = (s: number) => updateDailyTracker({ steps: currentData.steps + s });

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
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  const sleepProgress = Math.min(100, (currentData.sleep / SLEEP_GOAL) * 100);
  const stepProgress = Math.min(100, (currentData.steps / STEP_GOAL) * 100);
  const caloriesFromSteps = Math.round(currentData.steps * 0.04);

  if (!isLoaded) return <div className="flex justify-center items-center h-full bg-[#000000]"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 no-scrollbar bg-[#000000] min-h-svh">
      {/* Training Schedule Section (Auto-Rotating) */}
      <Card 
        data-guide-id="training-card"
        className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[3rem] overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        <CardHeader className="pb-1 pt-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 opacity-80">
            <Activity className="h-4 w-4" />
            {t.trainingSchedule}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="flex flex-col items-center text-center py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{t.todaysDiscipline}</p>
            <h3 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none drop-shadow-2xl">
              {currentWorkout}
            </h3>
            {quote && (
              <div className="mt-6 px-4 md:px-6 py-4 bg-black/15 rounded-[2rem] border border-white/5 w-full backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-2 flex items-center justify-center gap-2">
                  <Quote className="h-2.5 w-2.5" /> {t.disciplineDirective}
                </p>
                <p className="text-[11px] font-black uppercase tracking-widest italic leading-relaxed text-center text-white/90">
                  "{quote}"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* STRIDE PROGRESS TRACKERS (Finance-Style) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Sleep Stride (🌙) */}
        <Card 
          data-guide-id="sleep-stride"
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl"
        >
          {isEditingSleep ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">SLEEP STRIDE</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/20 px-1">BEDTIME</label>
                  <Input 
                    type="time" 
                    value={currentData.bedtime} 
                    onChange={(e) => updateDailyTracker({ bedtime: e.target.value })}
                    className="bg-white/5 border-white/10 h-14 rounded-2xl text-white font-black text-xl text-center focus:ring-primary" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/20 px-1">WAKE UP</label>
                  <Input 
                    type="time" 
                    value={currentData.wakeTime} 
                    onChange={(e) => updateDailyTracker({ wakeTime: e.target.value })}
                    className="bg-white/5 border-white/10 h-14 rounded-2xl text-white font-black text-xl text-center focus:ring-primary" 
                  />
                </div>
              </div>
              <Button 
                onClick={handleCalculateSleep} 
                className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest italic text-xs rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                disabled={!currentData.bedtime || !currentData.wakeTime}
              >
                CONFIRM RECOVERY
              </Button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Moon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">SLEEP STRIDE</p>
                  </div>
                  <h4 className="text-5xl font-black italic tracking-tighter text-primary">{formatSleep(currentData.sleep)}</h4>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 italic">RECOVERY STATUS: <span className="text-primary">{currentData.sleep >= SLEEP_GOAL ? 'OPTIMAL' : 'ACTIVE'}</span></p>
                </div>
                
                <div className="flex gap-2">
                   <Button 
                    onClick={handleResetSleep} 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white active:scale-90 transition-all"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleAddNap} 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(57,255,20,0.3)] active:scale-90 transition-all"
                  >
                    <Plus className="h-5 w-5 text-black" />
                  </Button>
                </div>
              </div>
              
              <div className="relative pt-4">
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-out rounded-full",
                      currentData.sleep >= SLEEP_GOAL ? "bg-primary shadow-[0_0_15px_#39FF14]" : "bg-primary/40"
                    )}
                    style={{ width: `${sleepProgress}%` }}
                  />
                </div>
                <div className="absolute top-0 left-[100%] h-6 w-0.5 bg-white/20 -translate-x-full" />
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20">RECOVERY PROGRESS</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary italic">{Math.round(sleepProgress)}%</p>
                </div>
              </div>
            </div>
          )}
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
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 italic">{t.bodyMassProgress}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-2 opacity-60">{t.current}</p>
            <p className="text-3xl md:text-4xl font-black italic text-primary leading-none">{currentWeight || "--"}<span className="text-xs ml-1 opacity-40 not-italic">KG</span></p>
          </Card>
          <Card className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center shadow-lg">
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-2 opacity-60">{t.target}</p>
            <p className="text-3xl md:text-4xl font-black italic text-accent leading-none">{targetWeight || "--"}<span className="text-xs ml-1 opacity-40 not-italic">KG</span></p>
          </Card>
        </div>

        <Card className="p-8 md:p-10 rounded-[3rem] shadow-2xl bg-white/5 border border-white/10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-30" />
          <div className="flex justify-between items-end">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 
              {t.transformation}
            </h3>
            <span className="text-3xl md:text-4xl font-black text-primary italic leading-none">{Math.round(progress)}%</span>
          </div>
          
          <div className="space-y-6">
            <div className="h-8 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10 relative">
               <div 
                 className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                 style={{ width: `${progress}%` }}
               />
            </div>
            
            {targetWeight > 0 && weightLogs.length > 0 && (
              <div className="text-center py-6 bg-white/5 rounded-[2rem] border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em] mb-2">{t.remainingGap}</p>
                <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
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
        currentData.water >= WATER_GOAL ? "bg-primary/10" : "bg-white/5 border border-white/10"
      )}>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0",
                  currentData.water >= WATER_GOAL ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-white/10 text-white/40"
                )}>
                  <Droplet className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 opacity-60 truncate">{t.waterIntake}</p>
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
                    className="h-10 w-10 rounded-xl border border-white/10 text-white/40 hover:text-destructive active:scale-90 transition-all"
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
                    className="h-10 px-3 md:px-4 rounded-xl font-black uppercase tracking-tighter text-[9px] italic shadow-lg active:scale-90 whitespace-nowrap bg-primary text-black"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> {t.addWater}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10">
                <div 
                  className={cn(
                    "h-full transition-all duration-700 ease-out rounded-full",
                    currentData.water >= WATER_GOAL ? "bg-primary" : "bg-primary/40"
                  )}
                  style={{ width: `${(currentData.water / WATER_GOAL) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{t.dailyGoal}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">{Math.round((currentData.water / WATER_GOAL) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SUPPORT DEVELOPER SECTION */}
      <div className="pt-6">
        <Sheet open={isSupportOpen} onOpenChange={setIsSupportOpen}>
          <SheetTrigger asChild>
            <Button 
              className="w-full h-20 rounded-[2.5rem] bg-white/5 border-2 border-primary/20 hover:border-primary/50 text-white font-black uppercase italic tracking-widest text-xs shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 relative z-10">
                <Heart className="h-5 w-5 text-primary animate-pulse fill-primary/20" />
                {t.supportDeveloper}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[85svh] border-none p-0 overflow-hidden bg-black shadow-[0_-10px_50px_rgba(57,255,20,0.15)]">
            <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10 pb-32">
              <SheetHeader>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/30 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                    <Heart className="h-10 w-10 text-primary fill-primary" />
                  </div>
                  <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary leading-none">
                    {t.supportTitle}
                  </SheetTitle>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">DISCIPLINE PROTOCOL</p>
                </div>
              </SheetHeader>

              <div className="space-y-8">
                <Card className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-inner">
                  <p className="text-sm font-medium text-white/70 leading-relaxed italic text-center">
                    "{t.supportMessage}"
                  </p>
                </Card>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 text-center italic">
                    {t.upiIdLabel}
                  </p>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
                    <div className="relative flex items-center justify-between bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
                      <span className="text-xl font-black text-white italic tracking-tight">{MASKED_UPI}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCopyUpi}
                        className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black transition-all active:scale-90"
                      >
                        {hasCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <Button 
                    className="w-full h-24 rounded-[2.5rem] bg-primary text-black font-black uppercase italic tracking-widest text-xl shadow-[0_0_30px_rgba(57,255,20,0.3)] active:scale-95 transition-all flex flex-col gap-1"
                    onClick={() => window.open(PAYMENT_LINK, '_blank')}
                  >
                    <span className="flex items-center gap-3">
                      <ExternalLink className="h-6 w-6" />
                      {t.payNow}
                    </span>
                    <span className="text-[9px] opacity-40 font-bold tracking-[0.2em] italic">via UPI SECURE PROTOCOL</span>
                  </Button>

                  <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">
                      {t.anyAmount} 🙏
                    </p>
                    <div className="h-px w-20 bg-white/10" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 text-center italic">
                      {t.trustNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
