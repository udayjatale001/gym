'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  // Load meals from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fitstride_diet_logs');
    if (saved) {
      setMeals(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Save meals to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fitstride_diet_logs', JSON.stringify(meals));
    }
  }, [meals, isLoaded]);

  const handleLogMeal = () => {
    if (!selectedType || !mealName.trim()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newMeal: LocalMeal = {
        id: Math.random().toString(36).substr(2, 9),
        mealType: selectedType,
        mealName: mealName.trim(),
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
    }, 400);
  };

  const handleDeleteMeal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMeals(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Meal Deleted",
      description: "The meal has been removed from your local list.",
    });
  };

  const handleUpdateChecklist = (mealId: string, day: number, status: 'taken' | 'skipped') => {
    setMeals(prev => prev.map(m => 
      m.id === mealId 
        ? { ...m, checklist: { ...m.checklist, [day]: status } }
        : m
    ));
  };

  const currentViewingMeal = meals.find(m => m.id === viewingMealId);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header with + button in front */}
      <div className="flex items-center gap-3">
        <Button 
          size="icon" 
          className="h-10 w-10 rounded-full shadow-lg active:scale-90 transition-transform bg-primary hover:bg-primary/90"
          onClick={() => {
            setStep(1);
            setMealName("");
            setSelectedType(null);
            setIsLogOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">
            Log Your Diet
          </h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
            Precision Nutrition Tracking
          </p>
        </div>
      </div>

      {/* Meal List Section */}
      <section className="space-y-3">
        {meals.length > 0 ? (
          meals.map((meal) => (
            <Card 
              key={meal.id} 
              className="border-2 border-muted hover:border-primary/40 transition-all cursor-pointer group shadow-sm overflow-hidden active:scale-[0.98] rounded-2xl"
              onClick={() => setViewingMealId(meal.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-inner">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-tighter leading-tight">
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
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={(e) => handleDeleteMeal(e, meal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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

      {/* Log Meal Dialog */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-center text-primary">
              {step === 1 ? 'Select Category' : `Log ${selectedType}`}
            </DialogTitle>
          </DialogHeader>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3 py-6">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-28 flex flex-col gap-3 border-2 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group active:scale-95 shadow-sm"
                  onClick={() => {
                    setSelectedType(type);
                    setStep(2);
                  }}
                >
                  <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Utensils className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-transform group-hover:rotate-12" />
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-[0.2em]">{type}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Describe your meal</p>
                <Input 
                  placeholder="e.g. OATS & WHEY" 
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  autoFocus
                  className="font-black border-2 border-muted h-14 text-lg uppercase rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleLogMeal()}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 font-black text-[10px] uppercase rounded-2xl h-14 tracking-widest" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button 
                  className="flex-[2] font-black text-[10px] uppercase h-14 rounded-2xl tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95" 
                  onClick={handleLogMeal} 
                  disabled={!mealName.trim() || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Confirm Meal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checklist Sheet */}
      {currentViewingMeal && (
        <ChecklistSheet 
          meal={currentViewingMeal} 
          onUpdate={(day, status) => handleUpdateChecklist(currentViewingMeal.id, day, status)}
          onClose={() => setViewingMealId(null)} 
        />
      )}
    </div>
  );
}

function ChecklistSheet({ meal, onUpdate, onClose }: { meal: LocalMeal, onUpdate: (day: number, status: 'taken' | 'skipped') => void, onClose: () => void }) {
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleMarkDay = (day: number, status: 'taken' | 'skipped') => {
    setIsUpdating(day);
    onUpdate(day, status);
    setTimeout(() => setIsUpdating(null), 300);
  };

  const getDayStatus = (day: number) => meal.checklist[day];
  const checklistValues = Object.values(meal.checklist);
  const totalTaken = checklistValues.filter(s => s === 'taken').length;
  const totalSkipped = checklistValues.filter(s => s === 'skipped').length;

  return (
    <Sheet open={!!meal} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto no-scrollbar border-none shadow-2xl rounded-l-[3rem]">
        <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="icon" onClick={onClose} className="h-10 w-10 rounded-full border-2 border-muted hover:border-primary hover:text-primary active:scale-90 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-0.5">
                <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic text-primary leading-none">
                  {meal.mealName}
                </SheetTitle>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                  {meal.mealType} • 30-Day Cycle
                </p>
              </div>
            </div>
          </SheetHeader>

          <Card className="bg-primary/5 border-2 border-primary/20 shadow-lg rounded-[2rem] overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                <Calendar className="h-4 w-4" />
                Monthly Consistency
              </h3>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex items-center justify-between">
              <div className="flex gap-10">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Taken</p>
                  <p className="text-4xl font-black text-primary leading-none">{totalTaken}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Skipped</p>
                  <p className="text-4xl font-black text-destructive leading-none">{totalSkipped}</p>
                </div>
              </div>
              {totalSkipped > 3 && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-2xl flex items-center gap-2 max-w-[140px] border border-destructive/20 animate-pulse">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-[8px] font-black leading-tight uppercase tracking-tight">Warning: Consistency Gaps</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-5 gap-3 pb-12">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const status = getDayStatus(day);
              return (
                <Dialog key={day}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-16 flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-90 rounded-2xl shadow-sm",
                        status === 'taken' && "bg-primary/10 border-primary text-primary shadow-inner",
                        status === 'skipped' && "bg-destructive/10 border-destructive text-destructive shadow-inner",
                        !status && "bg-muted/30 border-muted/50 text-muted-foreground/30",
                        isUpdating === day && "animate-pulse"
                      )}
                    >
                      <span className="text-[9px] font-black mb-1 opacity-50">{day}</span>
                      {status === 'taken' && <CheckCircle2 className="h-4 w-4" />}
                      {status === 'skipped' && <XCircle className="h-4 w-4" />}
                      {!status && <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-center font-black uppercase tracking-tighter italic text-xl">Day {day} Status</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3 py-6">
                      <Button 
                        className="flex-1 font-black text-[10px] uppercase gap-2 h-14 rounded-2xl shadow-lg shadow-primary/20"
                        onClick={() => handleMarkDay(day, 'taken')}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Taken
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1 font-black text-[10px] uppercase gap-2 h-14 rounded-2xl shadow-lg shadow-destructive/20"
                        onClick={() => handleMarkDay(day, 'skipped')}
                      >
                        <XCircle className="h-4 w-4" /> Skipped
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { DialogTrigger } from '@/components/ui/dialog';