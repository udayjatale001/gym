'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Utensils, Plus, CheckCircle2, XCircle, Calendar, Info, History, Flame } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DietPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mealNote, setMealNote] = useState("");

  const mealLogsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'mealLogs'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
  }, [db, user]);

  const { data: logs, loading } = useCollection(mealLogsQuery);

  const handleAddMeal = async () => {
    if (!user) return;
    const now = new Date();
    
    addDoc(collection(db, 'users', user.uid, 'mealLogs'), {
      timestamp: now.toISOString(),
      date: format(now, 'yyyy-MM-dd'),
      note: mealNote || "Meal Logged",
      createdAt: serverTimestamp()
    });
    
    setMealNote("");
    setIsDialogOpen(false);
  };

  // Generate last 30 days for checklist
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();
  const loggedDates = new Set(logs?.map(log => log.date) || []);
  
  const totalDaysTaken = last30Days.filter(day => loggedDates.has(format(day, 'yyyy-MM-dd'))).length;
  const totalDaysSkipped = last30Days.length - totalDaysTaken;
  
  const streak = (() => {
    let count = 0;
    for (let i = 0; i < last30Days.length; i++) {
        const checkDay = subDays(new Date(), i);
        if (loggedDates.has(format(checkDay, 'yyyy-MM-dd'))) {
            count++;
        } else {
            if (i === 0) continue; // Allow today to be missed in streak if not over yet
            break;
        }
    }
    return count;
  })();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Utensils className="h-5 w-5" />
          Diet Consistency
        </h2>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
            <Flame className="h-3 w-3" />
            {streak} DAY STREAK
          </div>
        )}
      </div>

      {/* Monthly Insight */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Monthly Insight
          </CardTitle>
          <CardDescription className="text-xs">Based on the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-background rounded-lg border border-primary/10">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Days Logged</p>
              <p className="text-2xl font-black text-primary">{totalDaysTaken}</p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-destructive/10">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Days Skipped</p>
              <p className="text-2xl font-black text-destructive">{totalDaysSkipped}</p>
            </div>
          </div>
          {totalDaysSkipped > 5 && (
            <div className="flex items-start gap-2 bg-destructive/10 text-destructive p-3 rounded-lg text-xs leading-tight">
              <Info className="h-4 w-4 shrink-0" />
              <p>You skipped {totalDaysSkipped} days — there might be a consistency issue here. Try to log at least one meal daily.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consistency Checklist */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Checklist System</h3>
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {last30Days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasLog = loggedDates.has(dateStr);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "aspect-square rounded flex flex-col items-center justify-center border transition-all",
                    hasLog ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-muted",
                    isToday && "ring-2 ring-primary ring-offset-1"
                  )}
                >
                  <span className="text-[8px] font-bold text-muted-foreground mb-0.5">
                    {format(day, 'dd')}
                  </span>
                  {hasLog ? (
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground/30" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-primary/20 border border-primary/40"></div> Meal Taken</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-muted/30 border border-muted"></div> No Entry</div>
          </div>
        </Card>
      </section>

      {/* Recent History */}
      <section className="space-y-3 pb-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Daily Logs</h3>
        <div className="space-y-2">
          {logs?.map((log, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                <div className="w-0.5 h-full bg-border mt-1"></div>
              </div>
              <div className="pb-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold leading-none">{log.note}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(log.timestamp), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!logs || logs.length === 0) && !loading && (
            <p className="text-center text-xs text-muted-foreground py-10 italic">No meals logged yet. Start your journey today!</p>
          )}
        </div>
      </section>

      {/* Floating Add Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-2xl z-50 p-0"
            size="icon"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="What did you eat? (e.g., Breakfast, Snack)"
              value={mealNote}
              onChange={(e) => setMealNote(e.target.value)}
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground mt-2 px-1">
              Logging a meal confirms your consistency for today.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleAddMeal} className="w-full">
              Confirm Meal Taken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
