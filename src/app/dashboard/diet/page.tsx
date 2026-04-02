'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Utensils, Plus, CheckCircle2, XCircle, ArrowLeft, ChevronRight, Calendar, AlertCircle, Loader2, Trash2, Scale, TrendingUp, TrendingDown, Info, Flame, RotateCcw } from "lucide-react";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

type MealType = 'Breakfast' | 'Snacks' | 'Lunch' | 'Dinner';

interface LocalMeal {
  id: string; 
  mealType: MealType; 
  mealName: string; 
  timestamp: string; 
  date: string;
  checklist: Record<number, 'taken' | 'skipped'>; 
  amounts: Record<number, string>;
  calories: Record<number, string>;
}

export default function DietPage() {
  const { toast } = useToast();
  const [meals, setMeals] = useState<LocalMeal[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isOverallProgressOpen, setIsOverallProgressOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [mealName, setMealName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingMealId, setViewingMealId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [analysisMealId, setAnalysisMealId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fitstride_diet_logs_v3');
    if (saved) setMeals(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('fitstride_diet_logs_v3', JSON.stringify(meals));
  }, [meals, isLoaded]);

  const handleLogMeal = () => {
    if (!selectedType || !mealName.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newMeal: LocalMeal = {
        id: Math.random().toString(36).substr(2, 9),
        mealType: selectedType, mealName: mealName.trim().toUpperCase(),
        timestamp: new Date().toISOString(), date: format(new Date(), 'yyyy-MM-dd'),
        checklist: {}, amounts: {}, calories: {}
      };
      setMeals(prev => [newMeal, ...prev]);
      toast({ title: "Meal Tracked!", description: `${newMeal.mealType}: ${newMeal.mealName}` });
      setIsLogOpen(false); setStep(1); setMealName(""); setSelectedType(null); setIsSubmitting(false);
    }, 200);
  };

  const currentViewingMeal = meals.find(m => m.id === viewingMealId);
  const currentAnalysisMeal = meals.find(m => m.id === analysisMealId);

  const stats = (() => {
    let totalTaken = 0, totalSkipped = 0;
    meals.forEach(m => Object.values(m.checklist).forEach(s => s === 'taken' ? totalTaken++ : totalSkipped++));
    const totalDays = totalTaken + totalSkipped;
    return { totalTaken, totalSkipped, percentage: totalDays > 0 ? (totalTaken / totalDays) * 100 : 0 };
  })();

  const handleDeleteMeal = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setMeals(p => p.filter(m => m.id !== id));
    toast({ title: "Meal Removed", description: "Log history updated." });
  };

  if (!isLoaded) return <div className="flex justify-center items-center h-svh bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-6 pb-32 min-h-svh bg-background no-scrollbar">
      <div className="flex items-center justify-between pt-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-black">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-primary uppercase italic leading-none">DIET LOG</h2>
              <button className="text-xl" onClick={() => setIsOverallProgressOpen(true)}>📈</button>
            </div>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">PRECISION TRACKING</p>
          </div>
        </div>
        <Button size="icon" className="h-10 w-10 rounded-lg bg-primary active:scale-90" onClick={() => { setStep(1); setMealName(""); setSelectedType(null); setIsLogOpen(true); }}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {meals.map((meal) => (
          <Card key={meal.id} className="border border-white/5 rounded-2xl bg-card active:scale-[0.98] transition-transform overflow-hidden" onClick={() => setViewingMealId(meal.id)}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Utensils className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-lg uppercase italic leading-none truncate">{meal.mealType}: <span className="text-primary">{meal.mealName}</span></h4>
                  <p className="text-[9px] text-white/40 font-black uppercase mt-1.5 flex items-center gap-2 truncate">{format(new Date(meal.timestamp), 'MMM dd • h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteMeal(e, meal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-5 w-5 text-white/10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="w-[92%] max-w-sm rounded-2xl p-6 border-none bg-card">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase italic text-primary">{step === 1 ? 'CATEGORY' : 'LOG MEAL'}</DialogTitle></DialogHeader>
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3 py-4">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map(t => (
                <Button key={t} variant="outline" className="h-20 flex flex-col gap-2 rounded-xl border border-white/10 active:scale-95 group" onClick={() => { setSelectedType(t); setStep(2); }}>
                  <Utensils className="h-4 w-4 text-white/40 group-hover:text-primary" />
                  <span className="font-black text-[8px] uppercase">{t}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-4 space-y-6">
              <Input placeholder="E.G. STEAK & EGGS" value={mealName} onChange={e => setMealName(e.target.value)} className="h-14 font-black border border-white/10 rounded-xl text-center uppercase focus:ring-primary text-base" />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 h-14 font-black rounded-xl uppercase text-xs" onClick={() => setStep(1)}>BACK</Button>
                <Button className="flex-1 h-14 font-black rounded-xl uppercase text-base bg-primary" onClick={handleLogMeal} disabled={!mealName.trim() || isSubmitting}>CONFIRM</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={isOverallProgressOpen} onOpenChange={setIsOverallProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[70svh] border-none p-0 bg-background">
          <div className="h-full momentum-scroll p-6 space-y-8 pb-32">
            <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic text-primary text-center">DIET STATS</SheetTitle></SheetHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card border border-white/5 rounded-xl p-6 text-center shadow-sm"><p className="text-[8px] font-black uppercase mb-1 opacity-40">TAKEN</p><p className="text-3xl font-black italic text-primary">{stats.totalTaken}</p></Card>
                <Card className="bg-card border border-white/5 rounded-xl p-6 text-center shadow-sm"><p className="text-[8px] font-black uppercase mb-1 opacity-40">SKIPPED</p><p className="text-3xl font-black italic text-destructive">{stats.totalSkipped}</p></Card>
              </div>
              <Card className="p-6 rounded-2xl bg-card space-y-4 border border-white/5">
                <div className="flex justify-between items-end mb-2"><h3 className="text-[10px] font-black uppercase opacity-40">SUCCESS</h3><span className="text-xl font-black text-primary italic">{Math.round(stats.percentage)}%</span></div>
                <Progress value={stats.percentage} className="h-3 bg-white/5" />
              </Card>
              <Button className="w-full h-16 rounded-xl font-black uppercase italic text-lg bg-primary" onClick={() => setIsOverallProgressOpen(false)}>CLOSE REPORT</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {currentViewingMeal && (
        <ChecklistSheet 
          meal={currentViewingMeal} 
          onUpdate={(day: number, status: 'taken' | 'skipped', amount: string, calories: string) => {
            setMeals(p => p.map(m => m.id === currentViewingMeal.id ? { ...m, checklist: { ...m.checklist, [day]: status }, amounts: { ...m.amounts, [day]: amount }, calories: { ...m.calories, [day]: calories } } : m));
          }}
          onClear={(day: number) => {
            setMeals(p => p.map(m => m.id === currentViewingMeal.id ? { ...m, checklist: Object.fromEntries(Object.entries(m.checklist).filter(([d]) => parseInt(d) !== day)) as any, amounts: Object.fromEntries(Object.entries(m.amounts).filter(([d]) => parseInt(d) !== day)) as any, calories: Object.fromEntries(Object.entries(m.calories || {}).filter(([d]) => parseInt(d) !== day)) as any } : m));
          }}
          onReset={() => {
            setMeals(prev => prev.map(m => m.id === currentViewingMeal.id ? { ...m, checklist: {}, amounts: {}, calories: {} } : m));
            toast({ title: "Protocol Reset", description: "30-day grid cleared." });
          }}
          onClose={() => setViewingMealId(null)}
          onShowAnalysis={(id: string) => setAnalysisMealId(id)}
        />
      )}

      {currentAnalysisMeal && (
        <MealAnalysisSheet
          meal={currentAnalysisMeal}
          onClose={() => setAnalysisMealId(null)}
        />
      )}
    </div>
  );
}

function ChecklistSheet({ meal, onUpdate, onClear, onReset, onClose, onShowAnalysis }: { meal: LocalMeal, onUpdate: any, onClear: any, onReset: any, onClose: any, onShowAnalysis: any }) {
  return (
    <Sheet open={!!meal} onOpenChange={open => !open && onClose()}>
      <SheetContent side="bottom" className="h-[92svh] p-0 border-none rounded-t-2xl bg-background">
        <div className="h-full momentum-scroll p-6 space-y-8 pb-32">
          <SheetHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={onClose} className="h-10 w-10 rounded-lg border border-white/10 active:scale-90 bg-card"><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <SheetTitle className="text-xl font-black uppercase italic text-primary leading-none flex items-center gap-2">
                  <button onClick={() => onShowAnalysis(meal.id)} className="text-xl">📈</button>
                  {meal.mealName}
                </SheetTitle>
                <p className="text-[8px] font-black uppercase opacity-40">{meal.mealType} • 30-DAY BLOCK</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-destructive"><RotateCcw className="h-4 w-4" /></Button></AlertDialogTrigger>
              <AlertDialogContent className="bg-black border border-white/10 rounded-2xl p-6">
                <AlertDialogHeader><AlertDialogTitle className="text-destructive font-black uppercase italic text-xl">RESET GRID?</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-2 mt-4">
                  <AlertDialogAction onClick={onReset} className="h-12 bg-destructive text-white font-black uppercase rounded-xl">RESET</AlertDialogAction>
                  <AlertDialogCancel className="h-10 border-white/10 text-white/40 font-black uppercase rounded-xl">ABORT</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SheetHeader>
          <div className="grid grid-cols-5 gap-2" data-guide-id="diet-grid">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
              <DayDialog key={day} day={day} status={meal.checklist[day]} amount={meal.amounts[day] || ""} calories={meal.calories?.[day] || ""} onMark={(s: string, a: string, c: string) => onUpdate(day, s, a, c)} onClear={() => onClear(day)} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MealAnalysisSheet({ meal, onClose }: { meal: LocalMeal, onClose: any }) {
  const analysisData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const raw = meal.amounts[day] || "0";
      const value = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
      return { day, value };
    }).filter(d => meal.checklist[d.day] === 'taken');
  }, [meal]);

  return (
    <Sheet open={!!meal} onOpenChange={open => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[75svh] border-none p-0 bg-background">
        <div className="h-full momentum-scroll p-6 space-y-8 pb-32">
          <SheetHeader>
            <SheetTitle className="text-2xl font-black uppercase italic text-primary text-center">DIET MARKET</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <Card className="border border-white/5 rounded-2xl bg-card p-6 space-y-6">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisData}>
                    <XAxis dataKey="day" hide /><YAxis hide />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fill="hsl(var(--primary))" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Button className="w-full h-16 rounded-xl font-black uppercase italic text-lg bg-primary" onClick={onClose}>CLOSE ANALYSIS</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DayDialog({ day, status, amount, calories, onMark, onClear }: { day: number, status?: any, amount: string, calories: string, onMark: any, onClear: any }) {
  const [open, setOpen] = useState(false);
  const [tempAmount, setTempAmount] = useState(amount);
  const [tempCalories, setTempCalories] = useState(calories);

  useEffect(() => {
    setTempAmount(amount);
    setTempCalories(calories);
  }, [amount, calories]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("h-16 w-full p-0 flex flex-col items-center justify-center rounded-lg border active:scale-90 transition-transform relative", status === 'taken' && "bg-primary/5 border-primary text-primary", status === 'skipped' && "bg-destructive/5 border-destructive text-destructive", !status && "bg-white/5 border-white/10 opacity-40")}>
          <span className="text-[7px] font-black absolute top-1 left-1 opacity-20 italic">{day}</span>
          {status === 'taken' ? <CheckCircle2 className="h-4 w-4" /> : status === 'skipped' ? <XCircle className="h-4 w-4" /> : <div className="h-1 w-1 rounded-full bg-current opacity-20 mt-1" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[92%] max-w-sm rounded-2xl p-6 border-none bg-card">
        <DialogHeader><DialogTitle className="text-xl font-black uppercase italic text-center">DAY {day}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <Input placeholder="PORTION (E.G. 200G)" value={tempAmount} inputMode="decimal" onChange={e => setTempAmount(e.target.value.toUpperCase())} className="h-12 font-black border border-white/10 rounded-xl text-center uppercase text-base" />
          <Input placeholder="CALORIES (KCAL)" value={tempCalories} inputMode="numeric" onChange={e => setTempCalories(e.target.value.replace(/[^0-9]/g, ''))} className="h-12 font-black border border-white/10 rounded-xl text-center uppercase text-base" />
          <div className="flex flex-col gap-2">
            <Button className="h-14 font-black uppercase rounded-xl bg-primary text-black" onClick={() => { onMark('taken', tempAmount, tempCalories); setOpen(false); }}>LOG PORTION</Button>
            <Button variant="destructive" className="h-12 font-black uppercase rounded-xl" onClick={() => { onMark('skipped', "", ""); setOpen(false); }}>SKIP DAY</Button>
            <Button variant="ghost" className="h-9 font-black text-[8px] uppercase opacity-20" onClick={() => { onClear(); setOpen(false); }}>RESET DATA</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
