
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
  
  // UI States
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [mealName, setMealName] = useState("");
  
  // Checklist States
  const [viewingMeal, setViewingMeal] = useState<any>(null);

  const mealLogsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'mealLogs'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: meals, loading } = useCollection(mealLogsQuery);

  const handleLogMeal = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    
    // Prevent empty input or missing type
    if (!selectedType || !mealName.trim()) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter a meal name." });
      return;
    }

    setIsSubmitting(true);

    const mealData = {
      mealType: selectedType,
      mealName: mealName.trim(),
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: serverTimestamp()
    };

    const logsRef = collection(db, 'users', user.uid, 'mealLogs');

    // Initiate write - Firestore will handle local/optimistic update
    addDoc(logsRef, mealData)
      .then(() => {
        toast({
          title: "Meal Logged",
          description: `${selectedType}: ${mealName.trim()} logged successfully.`,
        });
        // Reset and close UI immediately on success
        setStep(1);
        setSelectedType(null);
        setMealName("");
        setIsLogOpen(false);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'create',
          requestResourceData: mealData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Could not save your meal. Please try again.",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Utensils className="h-6 w-6" />
          Log Your Diet
        </h2>
        <p className="text-xs text-muted-foreground">Track your meals and maintain consistency.</p>
      </div>

      <section className="space-y-3 pb-24">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : meals && meals.length > 0 ? (
          meals.map((meal) => (
            <Card 
              key={meal.id} 
              className="hover:border-primary transition-all cursor-pointer group shadow-sm"
              onClick={() => setViewingMeal(meal)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{meal.mealType}: {meal.mealName}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Logged on {format(new Date(meal.timestamp), 'MMM dd, h:mm a')}
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
            <p className="text-sm font-medium text-muted-foreground">No meals logged yet.</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tap the + button to add your first meal.</p>
          </div>
        )}
      </section>

      {/* Add Meal Dialog */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-2xl z-50 p-0"
            size="icon"
            onClick={() => {
              setStep(1);
              setMealName("");
            }}
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{step === 1 ? 'Select Meal Type' : `Log ${selectedType}`}</DialogTitle>
          </DialogHeader>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3 py-4">
              {(['Breakfast', 'Snacks', 'Lunch', 'Dinner'] as MealType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => {
                    setSelectedType(type);
                    setStep(2);
                  }}
                >
                  <Utensils className="h-6 w-6" />
                  <span className="font-bold">{type}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <Input 
                placeholder="Enter meal name (e.g., Sprouts, Salad)" 
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                autoFocus
                disabled={isSubmitting}
                onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleLogMeal()}
              />
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  className="flex-1" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button 
                  className="flex-2 w-full" 
                  onClick={handleLogMeal} 
                  disabled={!mealName.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm Meal'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checklist Sheet */}
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
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <SheetTitle className="text-xl">{meal.mealType}: {meal.mealName}</SheetTitle>
            </div>
            <SheetDescription>Track your consistency over a 30-day period.</SheetDescription>
          </SheetHeader>

          {/* Monthly Insight */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Monthly Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Taken</p>
                  <p className="text-xl font-black text-primary">{totalTaken}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Skipped</p>
                  <p className="text-xl font-black text-destructive">{totalSkipped}</p>
                </div>
              </div>
              {totalSkipped > 3 && (
                <div className="bg-destructive/10 text-destructive p-2 rounded-md flex items-center gap-2 max-w-[150px]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-[8px] font-bold leading-tight">Consistency Issue Detected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 30 Day Grid */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const status = getDayStatus(day);
              return (
                <Dialog key={day}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-16 flex flex-col items-center justify-center p-0 transition-all border-2",
                        status === 'taken' && "bg-primary/10 border-primary text-primary",
                        status === 'skipped' && "bg-destructive/10 border-destructive text-destructive",
                        !status && "bg-muted/30 border-muted text-muted-foreground",
                        isUpdating === day && "animate-pulse"
                      )}
                    >
                      <span className="text-[10px] font-black opacity-50">{day}</span>
                      {status === 'taken' && <CheckCircle2 className="h-4 w-4" />}
                      {status === 'skipped' && <XCircle className="h-4 w-4" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle className="text-center">Day {day} Status</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 py-4">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90 gap-2"
                        onClick={() => handleMarkDay(day, 'taken')}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Taken
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1 gap-2"
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
