'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Droplet, CheckCircle2, Calendar, Scale, TrendingUp, Loader2, Quote, Plus, RotateCcw, Moon, Footprints, Flame, Timer, RefreshCw, TrendingDown, Info, Activity, Heart, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
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

  const WATER_GOAL = 4000;
  const STEP_GOAL = 1000;
  const SLEEP_GOAL = 480; 
  
  const UPI_ID = "7247089447@ybl";
  // PhonePe specific targeted deep link
  const PAYMENT_LINK = `phonepe://pay?pa=${UPI_ID}&pn=Uday%20Jatale&am=1&cu=INR`;

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const currentLang = savedLang || 'en';
    setLang(currentLang);
    const t = translations[currentLang];

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const savedWeightLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedWeightLogs) setWeightLogs(JSON.parse(savedWeightLogs));
    if (savedTarget) setTargetWeight(parseFloat(savedTarget) || 0);

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

  if (!isLoaded) return <div className="flex justify-center items-center h-full bg-[#000000]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-4 pb-32 bg-[#000000] min-h-full">
      <Card data-guide-id="training-card" className="bg-primary text-primary-foreground border-none rounded-2xl relative overflow-hidden active:scale-[0.98] transition-transform">
        <CardHeader className="pb-1 pt-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 opacity-80">
            <Activity className="h-4 w-4" />
            {t.trainingSchedule}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="flex flex-col items-center text-center py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{t.todaysDiscipline}</p>
            <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{currentWorkout}</h3>
            {quote && (
              <div className="mt-4 px-4 py-3 bg-black/10 rounded-xl border border-white/5 w-full">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">"{quote}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card data-guide-id="sleep-stride" className="bg-white/5 border border-white/10 rounded-2xl p-5 relative active:scale-[0.98] transition-transform">
          {isEditingSleep ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">SLEEP STRIDE</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-white/20">BEDTIME</label>
                  <Input type="time" value={currentData.bedtime} onChange={(e) => updateDailyTracker({ bedtime: e.target.value })} className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-black text-center text-base" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-white/20">WAKE UP</label>
                  <Input type="time" value={currentData.wakeTime} onChange={(e) => updateDailyTracker({ wakeTime: e.target.value })} className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-black text-center text-base" />
                </div>
              </div>
              <Button onClick={handleCalculateSleep} className="w-full h-12 bg-primary text-black font-black uppercase text-xs rounded-xl" disabled={!currentData.bedtime || !currentData.wakeTime}>CONFIRM RECOVERY</Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">SLEEP STRIDE</p>
                  </div>
                  <h4 className="text-4xl font-black italic text-primary leading-none">{formatSleep(currentData.sleep)}</h4>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleResetSleep} size="icon" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 text-white/40 active:scale-90"><RefreshCw className="h-4 w-4" /></Button>
                  <Button onClick={handleAddNap} size="icon" className="h-9 w-9 rounded-lg bg-primary text-black active:scale-90"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className={cn("h-full transition-all duration-300", currentData.sleep >= SLEEP_GOAL ? "bg-primary" : "bg-primary/40")} style={{ width: `${sleepProgress}%` }} />
              </div>
            </div>
          )}
        </Card>

        <Card data-guide-id="step-stride" className="bg-white/5 border border-white/10 rounded-2xl p-5 relative active:scale-[0.98] transition-transform" onClick={() => handleAddSteps(50)}>
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Footprints className="h-4 w-4 text-white" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">STEP STRIDE</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h4 className="text-4xl font-black italic text-white leading-none">{currentData.steps}</h4>
                <span className="text-sm font-black text-white/10 italic">/ {STEP_GOAL}</span>
              </div>
            </div>
            {currentData.steps >= STEP_GOAL && <CheckCircle2 className="h-6 w-6 text-primary" />}
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div className={cn("h-full transition-all duration-300", currentData.steps >= STEP_GOAL ? "bg-primary" : "bg-white/40")} style={{ width: `${stepProgress}%` }} />
          </div>
        </Card>
      </div>

      <div className="space-y-4" data-guide-id="weight-progress">
        <div className="flex items-center gap-2 px-1">
           <Scale className="h-4 w-4 text-primary" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">{t.bodyMassProgress}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-[8px] font-black uppercase text-white/40 mb-1">{t.current}</p>
            <p className="text-2xl font-black italic text-primary leading-none">{currentWeight || "--"}</p>
          </Card>
          <Card className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-[8px] font-black uppercase text-white/40 mb-1">{t.target}</p>
            <p className="text-2xl font-black italic text-accent leading-none">{targetWeight || "--"}</p>
          </Card>
        </div>
        <Card className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative">
          <div className="flex justify-between items-end">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-primary" /> 
              {t.transformation}
            </h3>
            <span className="text-xl font-black text-primary italic leading-none">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
             <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </Card>
      </div>

      <Card data-guide-id="water-card" className={cn("border-none rounded-2xl transition-all relative active:scale-[0.98]", currentData.water >= WATER_GOAL ? "bg-primary/5" : "bg-white/5 border border-white/10")}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", currentData.water >= WATER_GOAL ? "bg-primary text-black" : "bg-white/10 text-white/40")}>
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase text-white/40">{t.waterIntake}</p>
                <p className="text-base font-black italic text-primary leading-none mt-1">{(currentData.water / 1000).toFixed(1)}L</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {currentData.water > 0 && <Button onClick={handleResetWater} variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-white/10 text-white/40"><RotateCcw className="h-4 w-4" /></Button>}
              <Button onClick={handleAddWater} size="sm" className="h-9 px-3 rounded-lg font-black uppercase text-[8px] bg-primary text-black">{t.addWater}</Button>
            </div>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div className={cn("h-full transition-all duration-300", currentData.water >= WATER_GOAL ? "bg-primary" : "bg-primary/40")} style={{ width: `${(currentData.water / WATER_GOAL) * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 pb-24" data-guide-id="support-button">
        <Sheet open={isSupportOpen} onOpenChange={setIsSupportOpen}>
          <SheetTrigger asChild>
            <Button className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase italic text-xs active:scale-[0.98]">
              <Heart className="h-4 w-4 text-primary mr-2" />
              {t.supportDeveloper}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl h-[70svh] border-none p-0 bg-black">
            <div className="h-full momentum-scroll p-8 space-y-8 pb-32">
              <SheetHeader>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter text-primary">{t.supportTitle}</SheetTitle>
                </div>
              </SheetHeader>
              <div className="space-y-6">
                <Card className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/70 leading-relaxed italic text-center">"{t.supportMessage}"</Card>
                <Button className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase italic tracking-widest text-lg" onClick={() => window.open(PAYMENT_LINK, '_blank')}>
                  INITIALIZE CONTRIBUTION
                </Button>
                <p className="text-[9px] text-center font-black uppercase text-white/20">{t.anyAmount} 🙏</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
