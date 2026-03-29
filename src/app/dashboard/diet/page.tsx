'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Utensils, Plus, CheckCircle2, XCircle, ArrowLeft, ChevronRight, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, query, orderBy, limit, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

type MealType = 'Breakfast' | 'Snacks' | 'Lunch' | 'Dinner';

export default function DietPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [mealName, setMealName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingMeal, setViewingMeal] = useState<any>(null);

  const mealLogsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'mealLogs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
  }, [db, user]);

  const { data: meals, loading } = useCollection(mealLogsQuery);

  const handleLogMeal = () => {
    if (!user || !selectedType || !mealName.trim()) return;

    setIsSubmitting(true);

    const mealData = {
      mealType: selectedType,
      mealName: mealName.trim(),
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: serverTimestamp()
    };

    const logsRef = collection(db, 'users', user.uid, 'mealLogs');

    addDoc(logsRef, mealData)
      .then(() => {
        toast({
          title: "Meal Tracked!",
          description: `${mealData.mealType}: ${mealData.mealName}`,
        });
        setIsLogOpen(false);
        setStep(1);
        setMealName("");
        setSelectedType(null);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'create',
          requestResourceData: mealData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button 
              size="icon" 
              className="h-10 w-10 rounded-full shadow-lg active:scale-95 transition-transform"
              onClick={() => {
                setStep(1);
                setMealName("");
                setSelectedType(null);
                setIsLogOpen(true);
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">
              Log Your Diet
            </h2>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pl-[52px]">
            Track meals and daily consistency
          </p>
        </div>
      </div>

      <section className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : meals && meals.length > 0 ? (
          meals.map((meal) => (
            <Card 
              key={meal.id} 
              className="hover:border-primary transition-all cursor-pointer group shadow-sm overflow-hidden active:scale-[0.98]"
              onClick={() => setViewingMeal(meal)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight">
                      {meal.mealType}: {meal.mealName}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                      {format(new Date(meal.timestamp), 'h:mm a • MMM dd')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
            <Utensils className="h-10 w-10 text-muted-foreground mx-auto opacity-20 mb-3" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-tight">No meals tracked yet.</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">Tap the + button to begin.</p>
          </div>
        )}
      </section>

      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              {step === 1 ? 'Select Meal Type' : `Log ${selectedType}`}
            </DialogTitle>
          </DialogHeader>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3 py-4">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all group"
                  onClick={() => {
                    setSelectedType(type);
                    setStep(2);
                  }}
                >
                  <Utensils className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-[10px] uppercase tracking-widest">{type}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">What did you eat?</p>
                <Input 
                  placeholder="e.g., OATS, PROTEIN SHAKE" 
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  autoFocus
                  className="font-black border-2 h-12 text-sm uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleLogMeal()}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  className="flex-1 font-black text-[10px] uppercase" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button 
                  className="flex-2 w-full font-black text-[10px] uppercase h-11" 
                  onClick={handleLogMeal} 
                  disabled={!mealName.trim() || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Meal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {viewingMeal && (
        <ChecklistSheet 
          meal={viewingMeal} 
          onClose={() => setViewingMeal(null)} 
        />
      )}
    </div>
  );
}

function ChecklistSheet({ meal, onClose }: { meal: any, onClose: () => void }) {
  const db = useFirestore();
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const checklistQuery = useMemoFirebase(() => {
    if (!user || !meal) return null;
    return query(collection(db, 'users', user.uid, 'mealLogs', meal.id, 'checklist'));
  }, [db, user, meal]);

  const { data: checklist } = useCollection(checklistQuery);

  const handleMarkDay = (day: number, status: 'taken' | 'skipped') => {
    if (!user || !meal) return;
    setIsUpdating(day);

    const dayId = `day-${day}`;
    const entryRef = doc(db, 'users', user.uid, 'mealLogs', meal.id, 'checklist', dayId);
    
    const data = { day, status };

    setDoc(entryRef, data)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: entryRef.path,
          operation: 'write',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsUpdating(null));
  };

  const getDayStatus = (day: number) => checklist?.find(e => e.day === day)?.status;
  const totalTaken = checklist?.filter(e => e.status === 'taken').length || 0;
  const totalSkipped = checklist?.filter(e => e.status === 'skipped').length || 0;

  return (
    <Sheet open={!!meal} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-6">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -ml-2 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <SheetTitle className="text-xl font-black uppercase tracking-tight">{meal.mealType}: {meal.mealName}</SheetTitle>
            </div>
            <SheetDescription className="text-[10px] font-bold uppercase tracking-widest">30-Day Consistency Tracking</SheetDescription>
          </SheetHeader>

          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground font-black uppercase">Taken</p>
                  <p className="text-3xl font-black text-primary leading-none">{totalTaken}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground font-black uppercase">Skipped</p>
                  <p className="text-3xl font-black text-destructive leading-none">{totalSkipped}</p>
                </div>
              </div>
              {totalSkipped > 3 && (
                <div className="bg-destructive/10 text-destructive p-2.5 rounded-xl flex items-center gap-2 max-w-[140px] border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-[8px] font-black leading-tight uppercase tracking-tight">Consistency Gaps Found</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-5 gap-2 pb-10">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const status = getDayStatus(day);
              return (
                <Dialog key={day}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-16 flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-90",
                        status === 'taken' && "bg-primary/10 border-primary text-primary shadow-inner",
                        status === 'skipped' && "bg-destructive/10 border-destructive text-destructive",
                        !status && "bg-muted/30 border-muted/50 text-muted-foreground",
                        isUpdating === day && "animate-pulse"
                      )}
                    >
                      <span className="text-[9px] font-black mb-1 opacity-50">{day}</span>
                      {status === 'taken' && <CheckCircle2 className="h-4 w-4" />}
                      {status === 'skipped' && <XCircle className="h-4 w-4" />}
                      {!status && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle className="text-center font-black uppercase tracking-tight">Day {day} Status</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 py-4">
                      <Button 
                        className="flex-1 font-black text-[10px] uppercase gap-2 h-11"
                        onClick={() => handleMarkDay(day, 'taken')}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Taken
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1 font-black text-[10px] uppercase gap-2 h-11"
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
