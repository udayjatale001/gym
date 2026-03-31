'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, TrendingUp, Brain, ArrowUpRight, Flame, Plus, CheckCircle2, X, Edit2, Target, Calendar, ArrowLeft } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Language, translations } from '@/lib/translations';
import { predictFitnessProgressAndAdvice, type PredictFitnessProgressAndAdviceOutput } from '@/ai/flows/predict-fitness-progress-and-advice';
import { useToast } from '@/hooks/use-toast';

export default function ProgressPage() {
  const { toast } = useToast();
  const [lang, setLang] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);
  const [aiData, setAiData] = useState<PredictFitnessProgressAndAdviceOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Calorie State
  const [dailyCalories, setDailyCalories] = useState<number>(0);
  const [calorieGoal, setCalorieGoal] = useState<number>(2500);
  const [tempCalorieInput, setTempCalorieInput] = useState("");
  const [tempGoalInput, setTempGoalInput] = useState("");
  const [isCalorieDialogOpen, setIsCalorieDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [calorieHistory, setCalorieHistory] = useState<Record<number, number>>({});

  // Local Data State
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [targetWeight, setTargetWeight] = useState(0);
  const [dailyTrackers, setDailyTrackers] = useState<any[]>([]);

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);

    // 1. Load All Data
    const savedWeight = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    const savedTrackers = localStorage.getItem('fitstride_daily_trackers');
    const savedGoal = localStorage.getItem('fitstride_calorie_goal');
    const savedHistory = localStorage.getItem('fitstride_calorie_history');
    
    // 2. MIDNIGHT RESET LOGIC for Calories
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const savedCalorieDate = localStorage.getItem('fitstride_calorie_date');
    const savedCalories = localStorage.getItem('fitstride_daily_calories');

    if (savedCalorieDate !== todayStr) {
      setDailyCalories(0);
      localStorage.setItem('fitstride_daily_calories', '0');
      localStorage.setItem('fitstride_calorie_date', todayStr);
    } else {
      if (savedCalories) setDailyCalories(parseInt(savedCalories) || 0);
    }

    if (savedWeight) setWeightLogs(JSON.parse(savedWeight));
    if (savedTarget) setTargetWeight(parseFloat(savedTarget) || 0);
    if (savedTrackers) setDailyTrackers(JSON.parse(savedTrackers));
    if (savedGoal) setCalorieGoal(parseInt(savedGoal) || 2500);
    if (savedHistory) setCalorieHistory(JSON.parse(savedHistory));

    setIsLoaded(true);
  }, []);

  const chartData = useMemo(() => {
    return [...weightLogs]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-30)
      .map(log => ({
        date: format(new Date(log.timestamp), 'MMM dd'),
        weight: log.weight,
        rawDate: log.timestamp
      }));
  }, [weightLogs]);

  const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : 0;

  const handleSaveCalories = () => {
    const val = parseInt(tempCalorieInput);
    if (isNaN(val)) return;
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setDailyCalories(val);
    localStorage.setItem('fitstride_daily_calories', val.toString());
    localStorage.setItem('fitstride_calorie_date', todayStr);
    
    setIsCalorieDialogOpen(false);
    setTempCalorieInput("");
    toast({ title: "Fuel Logged", description: `${val} kcal added to daily total.` });
  };

  const handleSaveGoal = () => {
    const val = parseInt(tempGoalInput);
    if (isNaN(val) || val <= 0) return;
    setCalorieGoal(val);
    localStorage.setItem('fitstride_calorie_goal', val.toString());
    setIsGoalDialogOpen(false);
    toast({ title: "Target Calibrated", description: `Daily goal set to ${val} kcal.` });
  };

  const handleUpdateHistory = (day: number, calories: number) => {
    const updated = { ...calorieHistory, [day]: calories };
    setCalorieHistory(updated);
    localStorage.setItem('fitstride_calorie_history', JSON.stringify(updated));
    toast({ title: "Protocol Updated", description: `Day ${day} fuel logged at ${calories} kcal.` });
  };

  const runAnalysis = async () => {
    if (isAnalyzing || weightLogs.length === 0) return;
    setIsAnalyzing(true);
    
    try {
      const input = {
        currentWeight,
        targetWeight,
        height: 175,
        age: 25,
        gender: 'male' as const,
        activityLevel: 'moderately active' as const,
        weeklyWeightLogs: weightLogs.slice(0, 7).map(l => ({ date: l.timestamp.split('T')[0], weight: l.weight })),
        dailyCalorieIntakeLogs: [],
        workoutLogs: dailyTrackers.slice(0, 7).map(d => ({
          date: d.date,
          description: "General Session",
          durationMinutes: 60,
          intensity: 'medium' as const
        })),
        fitnessGoals: "Progressive Growth",
      };

      const result = await predictFitnessProgressAndAdvice(input);
      setAiData(result);
      toast({ title: "Analysis Complete", description: "Market data updated." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Sync Failed", description: "Try again later." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const caloriePercentage = Math.min(100, (dailyCalories / calorieGoal) * 100);

  if (!isLoaded) return <div className="flex justify-center items-center h-full bg-[#000000]"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 no-scrollbar bg-[#000000] min-h-svh">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 px-1">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-black shadow-2xl shadow-primary/30 border-b-4 border-black/20">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">{t.performanceAI}</h2>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em] opacity-60">PRECISION MARKET ANALYSIS</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-12 w-12 rounded-2xl bg-white/5 border border-white/10 active:scale-90", isAnalyzing && "animate-pulse")}
          onClick={runAnalysis}
          disabled={isAnalyzing}
        >
          <Brain className={cn("h-6 w-6 text-primary", isAnalyzing && "animate-spin")} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Calorie Stride Ring */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="flex flex-col items-center text-center space-y-2 relative">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20 active:scale-75 transition-all hover:bg-primary/20"
              >
                <Calendar className="h-6 w-6" />
              </button>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">CALORIE STRIDE</p>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <button className="text-white/20 hover:text-primary transition-colors active:scale-75" onClick={() => setTempGoalInput(calorieGoal.toString())}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-black border-none rounded-[3rem] p-8 max-w-sm w-[92%] shadow-[0_0_50px_rgba(57,255,20,0.1)]">
                  <DialogHeader>
                    <DialogTitle className="text-primary font-black italic uppercase tracking-tighter text-3xl text-center">SET GOAL</DialogTitle>
                  </DialogHeader>
                  <div className="py-8 space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2">TARGET KCAL</p>
                      <div className="relative">
                        <Input 
                          placeholder="2500" 
                          value={tempGoalInput} 
                          onChange={(e) => setTempGoalInput(e.target.value.replace(/[^0-9]/g, ''))}
                          className="h-20 bg-white/5 border-2 border-white/10 rounded-[1.8rem] text-4xl font-black text-center text-white focus:ring-primary focus:border-primary placeholder:text-white/5" 
                        />
                        <Target className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/20" />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveGoal}
                      className="w-full h-18 bg-primary text-black font-black uppercase italic tracking-widest text-lg rounded-[1.8rem] shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                    >
                      CALIBRATE
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic">FUEL CONSUMPTION</p>
          </div>

          <div className="relative h-56 w-56 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="transparent"
                stroke="rgba(57, 255, 20, 0.05)"
                strokeWidth="14"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                fill="transparent"
                stroke="#39FF14"
                strokeWidth="14"
                strokeDasharray="628"
                strokeDashoffset={628 - (628 * caloriePercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(57,255,20,0.4)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <Flame className={cn("h-8 w-8 mb-2 transition-all duration-500", dailyCalories > 0 ? "text-primary fill-primary/20 scale-110" : "text-white/10")} />
              <span className="text-5xl font-black text-white italic tracking-tighter leading-none">{dailyCalories}</span>
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-1">/ {calorieGoal} KCAL</span>
            </div>
          </div>

          <Dialog open={isCalorieDialogOpen} onOpenChange={setIsCalorieDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs text-white hover:bg-primary hover:text-black transition-all group-active:scale-95">
                <Plus className="h-4 w-4 mr-2" /> LOG DAILY FUEL
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-none rounded-[3rem] p-8 max-w-sm w-[92%] shadow-[0_0_50px_rgba(57,255,20,0.1)]">
              <DialogHeader>
                <DialogTitle className="text-primary font-black italic uppercase tracking-tighter text-3xl text-center">LOG CALORIES</DialogTitle>
              </DialogHeader>
              <div className="py-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2">KCAL INTAKE</p>
                  <div className="relative">
                    <Input 
                      placeholder="0000" 
                      value={tempCalorieInput} 
                      onChange={(e) => setTempCalorieInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="h-20 bg-white/5 border-2 border-white/10 rounded-[1.8rem] text-4xl font-black text-center text-white focus:ring-primary focus:border-primary placeholder:text-white/5" 
                    />
                    <Flame className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/20" />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveCalories}
                  className="w-full h-18 bg-primary text-black font-black uppercase italic tracking-widest text-lg rounded-[1.8rem] shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                >
                  SAVE FUEL
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Share Market Trend Chart */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="marketTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/90 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-1">{payload[0].payload.date}</p>
                          <p className="text-2xl font-black italic text-white">{payload[0].value} KG</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#39FF14" 
                  strokeWidth={5} 
                  fill="url(#marketTrend)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Calorie History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[92svh] border-none p-0 overflow-hidden bg-black shadow-[0_-10px_50px_rgba(57,255,20,0.15)]">
          <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10 pb-32">
            <SheetHeader>
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)} className="h-12 w-12 rounded-2xl border border-white/10 active:scale-90"><ArrowLeft className="h-6 w-6 text-primary" /></Button>
                <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary leading-none">ENERGY PROTOCOL</SheetTitle>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">30-DAY CALORIE STRIDE</p>
            </SheetHeader>
            
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                <DayCalorieDialog key={day} day={day} calories={calorieHistory[day] || 0} onSave={(val) => handleUpdateHistory(day, val)} />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DayCalorieDialog({ day, calories, onSave }: { day: number, calories: number, onSave: (val: number) => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(calories ? calories.toString() : "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn(
          "h-18 w-full flex flex-col items-center justify-center p-0 rounded-2xl border-2 transition-all active:scale-90 relative overflow-hidden",
          calories > 0 ? "bg-primary/10 border-primary text-primary shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]" : "bg-white/5 border-white/10 text-white/20"
        )}>
          <span className="text-[8px] font-black absolute top-1 left-1.5 opacity-40 italic">{day}</span>
          {calories > 0 ? (
            <div className="flex flex-col items-center gap-0.5">
              <Flame className="h-4 w-4 fill-primary" />
              <span className="text-[10px] font-black">{calories}</span>
            </div>
          ) : (
            <div className="h-1 w-1 rounded-full bg-current opacity-30 mt-2" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-none rounded-[3rem] p-8 max-w-sm w-[92%] shadow-[0_0_50px_rgba(57,255,20,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-primary font-black italic uppercase tracking-tighter text-3xl text-center">DAY {day} FUEL</DialogTitle>
        </DialogHeader>
        <div className="py-8 space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2 text-center">TOTAL CALORIES (KCAL)</p>
            <div className="relative">
              <Input 
                placeholder="0000" 
                value={input} 
                onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="h-20 bg-white/5 border-2 border-white/10 rounded-[1.8rem] text-4xl font-black text-center text-white focus:ring-primary focus:border-primary" 
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 italic">KCAL</span>
            </div>
          </div>
          <Button 
            onClick={() => { onSave(parseInt(input) || 0); setOpen(false); }}
            className="w-full h-18 bg-primary text-black font-black uppercase italic tracking-widest text-lg rounded-[1.8rem] shadow-[0_0_20px_rgba(57,255,20,0.2)]"
          >
            CONFIRM PROTOCOL
          </Button>
          <Button variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-white/20" onClick={() => { onSave(0); setInput(""); setOpen(false); }}>RESET DATA</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
