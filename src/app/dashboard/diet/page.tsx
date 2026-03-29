'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Utensils, Plus, CheckCircle2, XCircle, ArrowLeft, ChevronRight, Calendar, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type MealType = 'Breakfast' | 'Snacks' | 'Lunch' | 'Dinner';

interface LocalMeal {
  id: string;
  mealType: MealType;
  mealName: string;
  timestamp: string;
  date: string;
  checklist: Record<number, 'taken' | 'skipped'>;
}

export default function DietPage() {
  const { toast } = useToast();
  
  const [meals, setMeals] = useState<LocalMeal[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [mealName, setMealName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingMealId, setViewingMealId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persistent local data
  useEffect(() => {
    const saved = localStorage.getItem('fitstride_diet_logs');
    if (saved) {
      setMeals(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Sync to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fitstride_diet_logs', JSON.stringify(meals));
    }
  }, [meals, isLoaded]);

  const handleLogMeal = () => {
    if (!selectedType || !mealName.trim()) return;

    setIsSubmitting(true);
    
    // Simulate brief interaction delay for smoothness
    setTimeout(() => {
      const newMeal: LocalMeal = {
        id: Math.random().toString(36).substr(2, 9),
        mealType: selectedType,
        mealName: mealName.trim().toUpperCase(),
        timestamp: new Date().toISOString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        checklist: {}
      };

      setMeals(prev => [newMeal, ...prev]);
      
      toast({
        title: "Meal Tracked!",
        description: `${newMeal.mealType}: ${newMeal.mealName}`,
      });
      
      setIsLogOpen(false);
      setStep(1);
      setMealName("");
      setSelectedType(null);
      setIsSubmitting(false);
    }, 300);
  };

  const handleDeleteMeal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMeals(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Entry Removed",
      description: "Meal deleted from your local history.",
    });
  };

  const handleUpdateChecklist = (mealId: string, day: number, status: 'taken' | 'skipped') => {
    setMeals(prev => prev.map(m => 
      m.id === mealId 
        ? { ...m, checklist: { ...m.checklist, [day]: status } }
        : m
    ));
  };

  const handleClearChecklist = (mealId: string, day: number) => {
    setMeals(prev => prev.map(m => 
      m.id === mealId 
        ? { 
            ...m, 
            checklist: Object.fromEntries(
              Object.entries(m.checklist).filter(([d]) => parseInt(d) !== day)
            ) as Record<number, 'taken' | 'skipped'>
          }
        : m
    ));
  };

  const currentViewingMeal = meals.find(m => m.id === viewingMealId);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-svh">
        <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Dynamic Header with + Button */}
      <div className="flex items-center gap-4 pt-2">
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-2xl shadow-xl active:scale-90 transition-transform bg-primary hover:bg-primary/90 shrink-0"
          onClick={() => {
            setStep(1);
            setMealName("");
            setSelectedType(null);
            setIsLogOpen(true);
          }}
        >
          <Plus className="h-7 w-7" />
        </Button>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-black text-primary uppercase tracking-tighter italic leading-none">
            Log Diet
          </h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
            Precision Nutrition Tracking
          </p>
        </div>
      </div>

      {/* Persistent Meal List */}
      <section className="space-y-3">
        {meals.length > 0 ? (
          meals.map((meal) => (
            <Card 
              key={meal.id} 
              className="border-2 border-muted hover:border-primary/40 transition-all cursor-pointer group shadow-sm overflow-hidden active:scale-[0.98] rounded-[1.5rem]"
              onClick={() => setViewingMealId(meal.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                    <Utensils className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter leading-tight italic">
                      {meal.mealType}: <span className="text-primary">{meal.mealName}</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(meal.timestamp), 'h:mm a • MMM dd')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={(e) => handleDeleteMeal(e, meal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="h-9 w-9 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-muted/50 flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
              <Utensils className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No Fuel Logged</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 font-bold uppercase tracking-widest">Tap the + to begin tracking</p>
            </div>
          </div>
        )}
      </section>

      {/* Log Meal Flow */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="w-[90%] sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-8 focus:outline-none">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic text-center text-primary">
              {step === 1 ? 'Select Category' : `Log ${selectedType}`}
            </DialogTitle>
          </DialogHeader>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4 py-8">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-32 flex flex-col gap-3 border-2 rounded-[1.5rem] hover:border-primary hover:bg-primary/5 transition-all group active:scale-95 shadow-sm"
                  onClick={() => {
                    setSelectedType(type);
                    setStep(2);
                  }}
                >
                  <div className="h-14 w-14 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Utensils className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-transform group-hover:rotate-12" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-[0.2em]">{type}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Describe your meal</p>
                <Input 
                  placeholder="e.g. STEAK & EGGS" 
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  autoFocus
                  className="font-black border-2 border-muted h-16 text-xl uppercase rounded-[1.2rem] focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleLogMeal()}
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 font-black text-xs uppercase rounded-[1.2rem] h-16 tracking-widest active:scale-95" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" /> Back
                </Button>
                <Button 
                  className="flex-[2] font-black text-xs uppercase h-16 rounded-[1.2rem] tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95" 
                  onClick={handleLogMeal} 
                  disabled={!mealName.trim() || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : 'Confirm Meal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checklist View Sheet */}
      {currentViewingMeal && (
        <ChecklistSheet 
          meal={currentViewingMeal} 
          onUpdate={(day, status) => handleUpdateChecklist(currentViewingMeal.id, day, status)}
          onClear={(day) => handleClearChecklist(currentViewingMeal.id, day)}
          onClose={() => setViewingMealId(null)} 
        />
      )}
    </div>
  );
}

function ChecklistSheet({ 
  meal, 
  onUpdate, 
  onClear, 
  onClose 
}: { 
  meal: LocalMeal, 
  onUpdate: (day: number, status: 'taken' | 'skipped') => void, 
  onClear: (day: number) => void,
  onClose: () => void 
}) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleMarkDay = (day: number, status: 'taken' | 'skipped') => {
    setIsUpdating(day);
    onUpdate(day, status);
    // Visual debounce for smoothness
    setTimeout(() => setIsUpdating(null), 300);
  };

  const handleClearDay = (day: number) => {
    onClear(day);
    toast({ title: "Status Cleared", description: `Day ${day} has been reset.` });
  };

  const getDayStatus = (day: number) => meal.checklist[day];
  const checklistValues = Object.values(meal.checklist);
  const totalTaken = checklistValues.filter(s => s === 'taken').length;
  const totalSkipped = checklistValues.filter(s => s === 'skipped').length;

  return (
    <Sheet open={!!meal} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[92svh] w-full p-0 overflow-hidden border-none shadow-2xl rounded-t-[3.5rem] focus:outline-none">
        <div className="h-full overflow-y-auto no-scrollbar pb-12">
          <div className="p-8 space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <SheetHeader className="text-left">
              <div className="flex items-center gap-4 mb-2">
                <Button variant="outline" size="icon" onClick={onClose} className="h-12 w-12 rounded-full border-2 border-muted hover:border-primary hover:text-primary active:scale-90 transition-all">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="space-y-0.5">
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter italic text-primary leading-none">
                    {meal.mealName}
                  </SheetTitle>
                  <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                    {meal.mealType} • 30-Day Consistency Cycle
                  </p>
                </div>
              </div>
            </SheetHeader>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-2 border-primary/20 shadow-lg rounded-[2rem] p-6 flex flex-col items-center justify-center space-y-2">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Days Logged</p>
                <p className="text-5xl font-black text-primary leading-none">{totalTaken}</p>
                <div className="h-1.5 w-12 rounded-full bg-primary/20" />
              </Card>
              <Card className="bg-destructive/5 border-2 border-destructive/20 shadow-lg rounded-[2rem] p-6 flex flex-col items-center justify-center space-y-2">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Days Skipped</p>
                <p className="text-5xl font-black text-destructive leading-none">{totalSkipped}</p>
                <div className="h-1.5 w-12 rounded-full bg-destructive/20" />
              </Card>
            </div>

            {/* Consistency Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Progress Grid
                </h3>
                {totalSkipped > 5 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-widest animate-pulse">
                    <AlertCircle className="h-3.5 w-3.5" /> Consistency Warning
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const status = getDayStatus(day);
                  return (
                    <Dialog key={day}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-20 flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-90 rounded-[1.2rem] shadow-sm relative overflow-hidden",
                            status === 'taken' && "bg-primary/10 border-primary text-primary shadow-inner",
                            status === 'skipped' && "bg-destructive/10 border-destructive text-destructive shadow-inner",
                            !status && "bg-muted/30 border-muted/50 text-muted-foreground/30",
                            isUpdating === day && "animate-pulse"
                          )}
                        >
                          <span className="text-[11px] font-black mb-1 opacity-50 absolute top-2">{day}</span>
                          {status === 'taken' && <CheckCircle2 className="h-6 w-6 mt-3 animate-in zoom-in duration-300" />}
                          {status === 'skipped' && <XCircle className="h-6 w-6 mt-3 animate-in zoom-in duration-300" />}
                          {!status && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20 mt-3" />}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[85%] sm:max-w-xs rounded-[2.5rem] border-none shadow-2xl p-8 focus:outline-none">
                        <DialogHeader>
                          <DialogTitle className="text-center font-black uppercase tracking-tighter italic text-2xl">Day {day} Status</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-8">
                          <Button 
                            className="w-full font-black text-xs uppercase gap-3 h-16 rounded-[1.2rem] shadow-lg shadow-primary/20 active:scale-95"
                            onClick={() => handleMarkDay(day, 'taken')}
                          >
                            <CheckCircle2 className="h-6 w-6" /> Mark as Taken
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="w-full font-black text-xs uppercase gap-3 h-16 rounded-[1.2rem] shadow-lg shadow-destructive/20 active:scale-95"
                            onClick={() => handleMarkDay(day, 'skipped')}
                          >
                            <XCircle className="h-6 w-6" /> Mark as Skipped
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full font-black text-[10px] uppercase opacity-40 mt-2 active:scale-95"
                            onClick={() => handleClearDay(day)}
                          >
                            Reset Status
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}