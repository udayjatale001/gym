'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Utensils, Plus, CheckCircle2, XCircle, ArrowLeft, ChevronRight, Calendar, AlertCircle, Loader2, Trash2, Scale, TrendingUp } from "lucide-react";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type MealType = 'Breakfast' | 'Snacks' | 'Lunch' | 'Dinner';

interface LocalMeal {
  id: string; mealType: MealType; mealName: string; timestamp: string; date: string;
  checklist: Record<number, 'taken' | 'skipped'>; amounts: Record<number, string>;
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

  useEffect(() => {
    const saved = localStorage.getItem('fitstride_diet_logs_v2');
    if (saved) setMeals(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('fitstride_diet_logs_v2', JSON.stringify(meals));
  }, [meals, isLoaded]);

  const handleLogMeal = () => {
    if (!selectedType || !mealName.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newMeal: LocalMeal = {
        id: Math.random().toString(36).substr(2, 9),
        mealType: selectedType, mealName: mealName.trim().toUpperCase(),
        timestamp: new Date().toISOString(), date: format(new Date(), 'yyyy-MM-dd'),
        checklist: {}, amounts: {}
      };
      setMeals(prev => [newMeal, ...prev]);
      toast({ title: "Meal Tracked!", description: `${newMeal.mealType}: ${newMeal.mealName}` });
      setIsLogOpen(false); setStep(1); setMealName(""); setSelectedType(null); setIsSubmitting(false);
    }, 300);
  };

  const currentViewingMeal = meals.find(m => m.id === viewingMealId);
  const stats = (() => {
    let totalTaken = 0, totalSkipped = 0;
    meals.forEach(m => Object.values(m.checklist).forEach(s => s === 'taken' ? totalTaken++ : totalSkipped++));
    const totalDays = totalTaken + totalSkipped;
    return { totalTaken, totalSkipped, percentage: totalDays > 0 ? (totalTaken / totalDays) * 100 : 0 };
  })();

  if (!isLoaded) return <div className="flex justify-center py-20 h-svh items-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-6 pb-28 min-h-svh animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4 pt-2">
        <Button size="icon" className="h-12 w-12 rounded-[1.25rem] shadow-xl active:scale-90 bg-primary" onClick={() => { setStep(1); setMealName(""); setSelectedType(null); setIsLogOpen(true); }}>
          <Plus className="h-7 w-7" />
        </Button>
        <button className="text-3xl active:scale-75 transition-transform" onClick={() => setIsOverallProgressOpen(true)}>📈</button>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">DIET LOG</h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">PRECISION TRACKING</p>
        </div>
      </div>

      <div className="space-y-4">
        {meals.map((meal) => (
          <Card key={meal.id} className="border-2 border-muted active:scale-[0.98] transition-all rounded-[1.5rem] bg-white shadow-md group" onClick={() => setViewingMealId(meal.id)}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-active:bg-primary group-active:text-white transition-all shadow-inner">
                  <Utensils className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase tracking-tighter italic leading-tight">{meal.mealType}: <span className="text-primary">{meal.mealName}</span></h4>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 opacity-60 flex items-center gap-1.5"><Calendar className="h-3 w-3" />{format(new Date(meal.timestamp), 'h:mm a • MMM dd')}</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground opacity-30" />
            </CardContent>
          </Card>
        ))}
        {meals.length === 0 && <div className="text-center py-24 bg-muted/10 rounded-[2.5rem] border-4 border-dashed border-muted/30 flex flex-col items-center gap-4"><Utensils className="h-10 w-10 text-muted-foreground/30" /><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">START TRACKING FUEL</p></div>}
      </div>

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="w-[92%] max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-center text-primary">{step === 1 ? 'SELECT CATEGORY' : 'LOG MEAL'}</DialogTitle></DialogHeader>
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4 py-8">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map(t => (
                <Button key={t} variant="outline" className="h-28 flex flex-col gap-3 rounded-2xl border-2 active:scale-95 transition-all shadow-sm" onClick={() => { setSelectedType(t); setStep(2); }}>
                  <Utensils className="h-6 w-6 text-muted-foreground" />
                  <span className="font-black text-[10px] uppercase tracking-widest">{t}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-8 space-y-8 animate-in slide-in-from-right-4">
              <Input placeholder="E.G. STEAK & EGGS" value={mealName} onChange={e => setMealName(e.target.value)} className="h-16 font-black border-4 border-muted rounded-2xl text-lg uppercase focus-visible:ring-primary shadow-inner" />
              <div className="flex gap-4">
                <Button variant="ghost" className="flex-1 h-16 font-black rounded-2xl" onClick={() => setStep(1)}>BACK</Button>
                <Button className="flex-[2] h-16 font-black rounded-2xl shadow-xl" onClick={handleLogMeal} disabled={!mealName.trim() || isSubmitting}>CONFIRM</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={isOverallProgressOpen} onOpenChange={setIsOverallProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[80svh] border-none p-8 space-y-10 bg-background overflow-hidden">
          <SheetHeader><SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center">OVERALL DIET STATS</SheetTitle></SheetHeader>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] p-6 text-center shadow-lg"><p className="text-[10px] font-black uppercase mb-2">TAKEN</p><p className="text-4xl font-black italic text-primary">{stats.totalTaken}</p></Card>
              <Card className="bg-destructive/5 border-2 border-destructive/10 rounded-[2rem] p-6 text-center shadow-lg"><p className="text-[10px] font-black uppercase mb-2">SKIPPED</p><p className="text-4xl font-black italic text-destructive">{stats.totalSkipped}</p></Card>
            </div>
            <Card className="p-8 rounded-[2.5rem] shadow-xl bg-white space-y-6">
              <div className="flex justify-between items-end mb-4"><h3 className="text-xs font-black uppercase tracking-widest opacity-60">SUCCESS METRIC</h3><span className="text-2xl font-black text-primary italic">{Math.round(stats.percentage)}%</span></div>
              <Progress value={stats.percentage} className="h-6 bg-muted rounded-full" />
            </Card>
            <Button className="w-full h-20 rounded-[1.8rem] font-black uppercase italic text-xl shadow-2xl bg-primary active:scale-95" onClick={() => setIsOverallProgressOpen(false)}>CLOSE REPORT</Button>
          </div>
        </SheetContent>
      </Sheet>

      {currentViewingMeal && (
        <ChecklistSheet 
          meal={currentViewingMeal} 
          onUpdate={(day, status, amount) => {
            setMeals(p => p.map(m => m.id === currentViewingMeal.id ? { ...m, checklist: { ...m.checklist, [day]: status }, amounts: { ...m.amounts, [day]: amount } } : m));
          }}
          onClear={(day) => {
            setMeals(p => p.map(m => m.id === currentViewingMeal.id ? { ...m, checklist: Object.fromEntries(Object.entries(m.checklist).filter(([d]) => parseInt(d) !== day)) as any, amounts: Object.fromEntries(Object.entries(m.amounts).filter(([d]) => parseInt(d) !== day)) as any } : m));
          }}
          onClose={() => setViewingMealId(null)} 
        />
      )}
    </div>
  );
}

function ChecklistSheet({ meal, onUpdate, onClear, onClose }: { meal: LocalMeal, onUpdate: any, onClear: any, onClose: any }) {
  return (
    <Sheet open={!!meal} onOpenChange={open => !open && onClose()}>
      <SheetContent side="bottom" className="h-[92svh] p-0 overflow-hidden border-none rounded-t-[3.5rem] bg-background">
        <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10 pb-20">
          <SheetHeader className="flex flex-row items-center gap-4">
            <Button variant="outline" size="icon" onClick={onClose} className="h-12 w-12 rounded-2xl border-2 active:scale-90 shadow-sm"><ArrowLeft className="h-6 w-6" /></Button>
            <div><SheetTitle className="text-2xl font-black uppercase italic tracking-tighter text-primary leading-none">{meal.mealName}</SheetTitle><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{meal.mealType} • 30-DAY BLOCK</p></div>
          </SheetHeader>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
              <DayDialog key={day} day={day} status={meal.checklist[day]} amount={meal.amounts[day] || ""} onMark={(s, a) => onUpdate(day, s, a)} onClear={() => onClear(day)} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DayDialog({ day, status, amount, onMark, onClear }: { day: number, status?: any, amount: string, onMark: any, onClear: any }) {
  const [open, setOpen] = useState(false);
  const [tempAmount, setTempAmount] = useState(amount);
  useEffect(() => setTempAmount(amount), [amount]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("h-16 w-full p-0 flex flex-col items-center justify-center rounded-xl border-2 active:scale-90 transition-all", status === 'taken' && "bg-primary/10 border-primary text-primary", status === 'skipped' && "bg-destructive/10 border-destructive text-destructive", !status && "bg-muted/30 border-muted opacity-40")}>
          <span className="text-[8px] font-black absolute top-1 left-1.5 opacity-40">{day}</span>
          {status === 'taken' ? <CheckCircle2 className="h-5 w-5" /> : status === 'skipped' ? <XCircle className="h-5 w-5" /> : <div className="h-1 w-1 rounded-full bg-current" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[88%] max-w-xs rounded-[2.5rem] p-8 shadow-2xl border-none">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-center">DAY {day} INTAKE</DialogTitle></DialogHeader>
        <div className="py-6 space-y-6">
          <Input placeholder="E.G. 200G" value={tempAmount} inputMode="decimal" onChange={e => setTempAmount(e.target.value.toUpperCase())} className="h-16 font-black border-4 border-muted rounded-2xl text-center text-lg uppercase focus-visible:ring-primary shadow-inner" />
          <div className="flex flex-col gap-3">
            <Button className="h-16 font-black uppercase italic rounded-2xl shadow-lg" onClick={() => { onMark('taken', tempAmount); setOpen(false); }}><CheckCircle2 className="h-5 w-5 mr-2" /> LOG PORTION</Button>
            <Button variant="destructive" className="h-16 font-black uppercase italic rounded-2xl shadow-lg" onClick={() => { onMark('skipped', ""); setOpen(false); }}><XCircle className="h-5 w-5 mr-2" /> SKIP DAY</Button>
            <Button variant="ghost" className="h-12 font-black text-[10px] uppercase opacity-40" onClick={() => { onClear(); setOpen(false); }}>RESET DATA</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}