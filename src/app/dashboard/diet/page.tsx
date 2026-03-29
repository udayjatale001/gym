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

  const handleDeleteMeal = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setMeals(p => p.filter(m => m.id !== id));
    toast({ title: "Meal Removed", description: "Log history updated." });
  };

  if (!isLoaded) return <div className="flex justify-center py-20 h-svh items-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-8 pb-32 min-h-svh animate-in fade-in slide-in-from-bottom-2 duration-500 no-scrollbar">
      <div className="flex items-center justify-between pt-6 px-1">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.5rem] md:rounded-[1.8rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 border-b-4 border-black/20">
            <Utensils className="h-7 w-7 md:h-9 md:w-9" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter italic leading-none">DIET LOG</h2>
              <button className="text-2xl active:scale-75 transition-transform" onClick={() => setIsOverallProgressOpen(true)}>📈</button>
            </div>
            <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">PRECISION TRACKING</p>
          </div>
        </div>
        <Button size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-[1.25rem] shadow-xl bg-primary active:scale-90" onClick={() => { setStep(1); setMealName(""); setSelectedType(null); setIsLogOpen(true); }}>
          <Plus className="h-7 w-7 md:h-8 md:w-8" />
        </Button>
      </div>

      <div className="flex flex-col gap-5 md:gap-6">
        {meals.map((meal) => (
          <Card key={meal.id} className="border-none shadow-xl rounded-[2.5rem] bg-card active:scale-[0.98] transition-all overflow-hidden group" onClick={() => setViewingMealId(meal.id)}>
            <CardContent className="p-6 md:p-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-active:bg-primary group-active:text-primary-foreground transition-all shadow-inner shrink-0">
                  <Utensils className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-xl md:text-2xl uppercase tracking-tighter italic leading-none truncate">{meal.mealType}: <span className="text-primary">{meal.mealName}</span></h4>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 opacity-60 flex items-center gap-2 truncate"><Calendar className="h-3 w-3 shrink-0" />{format(new Date(meal.timestamp), 'MMM dd • h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full text-muted-foreground/20 hover:text-destructive active:scale-90" onClick={(e) => handleDeleteMeal(e, meal.id)}>
                  <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        ))}
        {meals.length === 0 && <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-border/50 flex flex-col items-center gap-6"><Utensils className="h-10 w-10 text-muted-foreground/20" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">FUEL THE MACHINE...</p></div>}
      </div>

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="w-[92%] max-w-sm rounded-[3rem] p-8 md:p-10 shadow-2xl border-none bg-card">
          <DialogHeader><DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-center text-primary">{step === 1 ? 'CATEGORY' : 'LOG MEAL'}</DialogTitle></DialogHeader>
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 py-6 md:py-10">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map(t => (
                <Button key={t} variant="outline" className="h-28 md:h-32 flex flex-col gap-3 md:gap-4 rounded-[1.5rem] md:rounded-[2rem] border-4 active:scale-95 transition-all shadow-sm group hover:border-primary/40" onClick={() => { setSelectedType(t); setStep(2); }}>
                  <Utensils className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground group-hover:text-primary" />
                  <span className="font-black text-[9px] md:text-[11px] uppercase tracking-widest">{t}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-6 md:py-10 space-y-8 md:space-y-10 animate-in slide-in-from-right-6">
              <Input placeholder="E.G. STEAK & EGGS" value={mealName} onChange={e => setMealName(e.target.value)} className="h-16 md:h-20 font-black border-4 border-muted rounded-[1.5rem] md:rounded-[1.8rem] text-lg md:text-xl uppercase focus-visible:ring-primary shadow-inner px-6 md:px-8 text-base md:text-xl" />
              <div className="flex gap-3 md:gap-4">
                <Button variant="ghost" className="flex-1 h-16 md:h-20 font-black rounded-[1.5rem] md:rounded-[1.8rem] tracking-widest uppercase text-[10px] md:text-xs" onClick={() => setStep(1)}>BACK</Button>
                <Button className="flex-[2] h-16 md:h-20 font-black rounded-[1.5rem] md:rounded-[1.8rem] shadow-2xl italic uppercase text-lg md:text-xl" onClick={handleLogMeal} disabled={!mealName.trim() || isSubmitting}>CONFIRM</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={isOverallProgressOpen} onOpenChange={setIsOverallProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] md:rounded-t-[4rem] h-[85svh] border-none p-0 bg-background overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar p-8 md:p-10 space-y-10 md:space-y-12 pb-32">
            <SheetHeader><SheetTitle className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-primary text-center">DIET STATS</SheetTitle></SheetHeader>
            <div className="space-y-8 md:space-y-10">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-none rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl"><p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">TAKEN</p><p className="text-4xl md:text-5xl font-black italic text-primary">{stats.totalTaken}</p></Card>
                <Card className="bg-card border-none rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl"><p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">SKIPPED</p><p className="text-4xl md:text-5xl font-black italic text-destructive">{stats.totalSkipped}</p></Card>
              </div>
              <Card className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl bg-card space-y-6 md:space-y-8 border-none relative overflow-hidden">
                <div className="flex justify-between items-end mb-4"><h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-60 flex items-center gap-2 md:gap-3"><TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" /> SUCCESS</h3><span className="text-2xl md:text-3xl font-black text-primary italic leading-none">{Math.round(stats.percentage)}%</span></div>
                <Progress value={stats.percentage} className="h-6 md:h-8 bg-muted rounded-full shadow-inner" />
              </Card>
              <Button className="w-full h-20 md:h-24 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase italic text-xl md:text-2xl shadow-2xl bg-primary active:scale-95" onClick={() => setIsOverallProgressOpen(false)}>CLOSE REPORT</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {currentViewingMeal && (
        <ChecklistSheet 
          meal={currentViewingMeal} 
          onUpdate={(day: number, status: 'taken' | 'skipped', amount: string) => {
            setMeals(p => p.map(m => m.id === currentViewingMeal.id ? { ...m, checklist: { ...m.checklist, [day]: status }, amounts: { ...m.amounts, [day]: amount } } : m));
          }}
          onClear={(day: number) => {
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
      <SheetContent side="bottom" className="h-[95svh] p-0 overflow-hidden border-none rounded-t-[3rem] md:rounded-t-[4rem] bg-background">
        <div className="h-full overflow-y-auto no-scrollbar p-8 md:p-10 space-y-10 md:space-y-12 pb-32">
          <SheetHeader className="flex flex-row items-center gap-4 md:gap-6">
            <Button variant="outline" size="icon" onClick={onClose} className="h-12 w-12 md:h-14 md:w-14 rounded-[1.25rem] md:rounded-[1.5rem] border-4 active:scale-90 shadow-xl bg-card shrink-0"><ArrowLeft className="h-6 w-6 md:h-8 md:w-8" /></Button>
            <div className="space-y-1 min-w-0">
              <SheetTitle className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-primary leading-none truncate">{meal.mealName}</SheetTitle>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-50 truncate">{meal.mealType} • 30-DAY BLOCK</p>
            </div>
          </SheetHeader>
          <div className="grid grid-cols-5 gap-2.5 md:gap-4">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
              <DayDialog key={day} day={day} status={meal.checklist[day]} amount={meal.amounts[day] || ""} onMark={(s: string, a: string) => onUpdate(day, s, a)} onClear={() => onClear(day)} />
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
        <Button variant="outline" className={cn("h-16 md:h-20 w-full p-0 flex flex-col items-center justify-center rounded-[1rem] md:rounded-[1.5rem] border-4 active:scale-90 transition-all relative", status === 'taken' && "bg-primary/10 border-primary text-primary shadow-inner", status === 'skipped' && "bg-destructive/10 border-destructive text-destructive shadow-inner", !status && "bg-muted/30 border-muted/50 opacity-40")}>
          <span className="text-[8px] md:text-[10px] font-black absolute top-1 md:top-1.5 left-1.5 md:left-2 opacity-40 italic">{day}</span>
          {status === 'taken' ? <CheckCircle2 className="h-5 w-5 md:h-7 md:w-7" /> : status === 'skipped' ? <XCircle className="h-5 w-5 md:h-7 md:w-7" /> : <div className="h-1.5 w-1.5 rounded-full bg-current opacity-30 mt-2 md:mt-3" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[88%] max-w-xs rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl border-none bg-card">
        <DialogHeader><DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-center">DAY {day}</DialogTitle></DialogHeader>
        <div className="py-6 md:py-8 space-y-6 md:space-y-8">
          <div className="space-y-2">
            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2 opacity-60">PORTION SIZE</p>
            <Input placeholder="E.G. 200G" value={tempAmount} inputMode="decimal" onChange={e => setTempAmount(e.target.value.toUpperCase())} className="h-14 md:h-16 font-black border-4 border-muted rounded-[1.25rem] md:rounded-[1.5rem] text-center text-xl md:text-xl uppercase focus-visible:ring-primary shadow-inner text-base md:text-xl" />
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            <Button className="h-16 md:h-20 font-black uppercase italic rounded-[1.5rem] md:rounded-[1.8rem] shadow-2xl bg-primary text-base md:text-lg" onClick={() => { onMark('taken', tempAmount); setOpen(false); }}><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" /> LOG PORTION</Button>
            <Button variant="destructive" className="h-16 md:h-20 font-black uppercase italic rounded-[1.5rem] md:rounded-[1.8rem] shadow-2xl text-base md:text-lg" onClick={() => { onMark('skipped', ""); setOpen(false); }}><XCircle className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" /> SKIP DAY</Button>
            <Button variant="ghost" className="h-10 md:h-12 font-black text-[9px] md:text-[10px] uppercase opacity-40 tracking-widest" onClick={() => { onClear(); setOpen(false); }}>RESET DATA</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}