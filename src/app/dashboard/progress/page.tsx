'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Loader2, TrendingUp, Flame, Plus, Target, ArrowLeft, Edit2, AlertCircle, RotateCcw } from "lucide-react";
import { format, differenceInDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Language, translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';

export default function ProgressPage() {
  const { toast } = useToast();
  const [lang, setLang] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [dailyCalories, setDailyCalories] = useState<number>(0);
  const [calorieGoal, setCalorieGoal] = useState<number>(2500);
  const [tempCalorieInput, setTempCalorieInput] = useState("");
  const [tempGoalInput, setTempGoalInput] = useState("");
  const [isCalorieDialogOpen, setIsCalorieDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [calorieHistory, setCalorieHistory] = useState<Record<number, number>>({});
  const [currentCycleDay, setCurrentCycleDay] = useState<number>(1);

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);

    const savedGoal = localStorage.getItem('fitstride_calorie_goal');
    const savedHistory = localStorage.getItem('fitstride_calorie_history');
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let cycleStart = localStorage.getItem('fitstride_cycle_start');
    if (!cycleStart) {
      cycleStart = todayStr;
      localStorage.setItem('fitstride_cycle_start', todayStr);
    }
    
    const daysDiff = Math.abs(differenceInDays(startOfDay(new Date()), startOfDay(new Date(cycleStart))));
    const dayIndex = (daysDiff % 30) + 1;
    setCurrentCycleDay(dayIndex);

    const savedCalorieDate = localStorage.getItem('fitstride_calorie_date');
    const savedCalories = localStorage.getItem('fitstride_daily_calories');

    if (savedCalorieDate !== todayStr) {
      setDailyCalories(0);
      localStorage.setItem('fitstride_daily_calories', '0');
      localStorage.setItem('fitstride_calorie_date', todayStr);
    } else {
      if (savedCalories) setDailyCalories(parseInt(savedCalories) || 0);
    }

    if (savedGoal) setCalorieGoal(parseInt(savedGoal) || 2500);
    
    const history = savedHistory ? JSON.parse(savedHistory) : {};
    setCalorieHistory(history);

    setIsLoaded(true);
  }, []);

  const calorieChartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      return { day: `DAY ${day}`, calories: calorieHistory[day] || 0, dayNum: day };
    });
  }, [calorieHistory]);

  const handleSaveCalories = () => {
    const val = parseInt(tempCalorieInput);
    if (isNaN(val)) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newTotal = (dailyCalories || 0) + val;
    setDailyCalories(newTotal);
    localStorage.setItem('fitstride_daily_calories', newTotal.toString());
    localStorage.setItem('fitstride_calorie_date', todayStr);
    const updatedHistory = { ...calorieHistory, [currentCycleDay]: newTotal };
    setCalorieHistory(updatedHistory);
    localStorage.setItem('fitstride_calorie_history', JSON.stringify(updatedHistory));
    setIsCalorieDialogOpen(false);
    setTempCalorieInput("");
    toast({ title: newTotal > calorieGoal ? "Overload Alert ⚠️" : "Fuel Logged 🔥", description: `Today's total: ${newTotal} kcal.` });
  };

  const handleSaveGoal = () => {
    const val = parseInt(tempGoalInput);
    if (isNaN(val) || val <= 0) return;
    setCalorieGoal(val);
    localStorage.setItem('fitstride_calorie_goal', val.toString());
    setIsGoalDialogOpen(false);
    toast({ title: "Target Set", description: `Goal: ${val} kcal.` });
  };

  const caloriePercentage = Math.min(100, (dailyCalories / calorieGoal) * 100);
  const isOverGoal = dailyCalories > calorieGoal;

  if (!isLoaded) return <div className="flex justify-center items-center h-full bg-black"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-6 bg-black min-h-full pb-32">
      <div className="flex items-center gap-3 pt-4 px-1">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-black">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-primary uppercase italic leading-none">ANALYTICS</h2>
          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">PRECISION DATA</p>
        </div>
      </div>

      <Card className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsHistoryOpen(true)} className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90", isOverGoal ? "bg-destructive/10 border-destructive text-destructive" : "bg-primary/10 border-primary text-primary")}>
              <span className="text-2xl">🗓️</span>
            </button>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-white/40">CALORIE STRIDE</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className={cn("text-[9px] font-black uppercase italic", isOverGoal ? "text-destructive" : "text-primary")}>DAY {currentCycleDay}</p>
                <button className="text-white/20 hover:text-primary transition-colors" onClick={() => setIsGoalDialogOpen(true)}><Edit2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-44 w-44 flex items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle cx="88" cy="88" r="76" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" />
            <circle cx="88" cy="88" r="76" fill="transparent" stroke={isOverGoal ? "#FF3131" : "#39FF14"} strokeWidth="12" strokeDasharray="477" strokeDashoffset={477 - (477 * caloriePercentage) / 100} strokeLinecap="round" className="transition-all duration-300" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={cn("text-4xl font-black italic leading-none", isOverGoal ? "text-destructive" : "text-white")}>{dailyCalories}</span>
            <span className="text-white/20 text-[8px] font-black uppercase mt-1">/ {calorieGoal} KCAL</span>
          </div>
        </div>

        <Dialog open={isCalorieDialogOpen} onOpenChange={setIsCalorieDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-white/5 border border-white/10 rounded-xl font-black uppercase italic text-xs text-white">
              <Plus className="h-4 w-4 mr-2" /> LOG DAILY FUEL
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border border-white/10 rounded-2xl p-6 max-w-sm w-[92%]">
            <DialogHeader><DialogTitle className="text-primary font-black italic text-xl text-center">LOG CALORIES</DialogTitle></DialogHeader>
            <div className="py-4 space-y-6">
              <Input placeholder="0000" value={tempCalorieInput} inputMode="numeric" onChange={(e) => setTempCalorieInput(e.target.value.replace(/[^0-9]/g, ''))} className="h-16 bg-white/5 border border-white/10 rounded-xl text-3xl font-black text-center text-white focus:ring-primary text-base" />
              <Button onClick={handleSaveCalories} className="w-full h-16 bg-primary text-black font-black uppercase italic text-lg rounded-xl">SAVE FUEL</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      <Card className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-[9px] font-black uppercase text-white/40 italic">ENERGY PROTOCOL TREND</p>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calorieChartData}>
              <XAxis dataKey="dayNum" hide /><YAxis hide />
              <Area type="monotone" dataKey="calories" stroke="#39FF14" strokeWidth={3} fill="#39FF14" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="bg-black border border-white/10 rounded-2xl p-6 max-w-sm w-[92%]">
          <DialogHeader><DialogTitle className="text-primary font-black italic text-xl text-center">SET GOAL</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <Input placeholder="2500" value={tempGoalInput} inputMode="numeric" onChange={(e) => setTempGoalInput(e.target.value.replace(/[^0-9]/g, ''))} className="h-16 bg-white/5 border border-white/10 rounded-xl text-3xl font-black text-center text-white focus:ring-primary text-base" />
            <Button onClick={handleSaveGoal} className="w-full h-16 bg-primary text-black font-black uppercase italic text-lg rounded-xl">CALIBRATE</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}