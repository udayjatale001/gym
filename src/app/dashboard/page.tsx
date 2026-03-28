'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Info, Utensils, CheckCircle2, Calendar } from "lucide-react";
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, query, collection, orderBy, limit, setDoc } from "firebase/firestore";
import { format, differenceInDays, addDays, subDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [suggestion, setSuggestion] = useState<{ today: string; yesterday: string; tomorrow: string } | null>(null);

  const userRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'weightLogs'), orderBy('date', 'desc'), orderBy('createdAt', 'desc'), limit(1));
  }, [db, user]);
  const { data: latestWeight } = useCollection(weightQuery);

  const mealQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'mealLogs'), orderBy('timestamp', 'desc'), limit(5));
  }, [db, user]);
  const { data: recentMeals } = useCollection(mealQuery);

  const currentWeight = latestWeight?.[0]?.weight || profile?.currentWeight || 0;
  const targetWeight = profile?.targetWeight || 0;
  
  const progress = targetWeight > 0 ? Math.min(100, Math.max(0, (currentWeight / targetWeight) * 100)) : 0;
  const hasLoggedMealToday = recentMeals?.some(m => m.date === format(new Date(), 'yyyy-MM-dd'));

  // Workout Cycle Logic
  useEffect(() => {
    if (!user || !profile) return;

    let startDate: Date;
    if (profile.workoutStartDate) {
      startDate = startOfDay(new Date(profile.workoutStartDate));
    } else {
      // Initialize start date if it doesn't exist
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      startDate = startOfDay(new Date());
      setDoc(doc(db, 'users', user.uid), { workoutStartDate: todayStr }, { merge: true });
    }

    const today = startOfDay(new Date());
    const cycle = ["Push", "Pull", "Legs"];

    const getWorkout = (date: Date) => {
      const diff = differenceInDays(date, startDate);
      // Handle negative diff if startDate is in future
      const index = ((diff % 3) + 3) % 3;
      return cycle[index];
    };

    setSuggestion({
      today: getWorkout(today),
      yesterday: getWorkout(subDays(today, 1)),
      tomorrow: getWorkout(addDays(today, 1))
    });
  }, [user, profile, db]);

  return (
    <div className="p-4 space-y-6">
      {/* Workout Suggestion Card */}
      <Card className="bg-primary text-primary-foreground border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 opacity-90">
            <Calendar className="h-4 w-4" />
            Daily Workout Split
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center text-center py-2">
            <p className="text-xs opacity-70 mb-1">Today's Focus</p>
            <h3 className="text-3xl font-black tracking-tighter uppercase">
              {suggestion ? suggestion.today : "Calculating..."}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-primary-foreground/20 pt-4">
            <div className="text-left">
              <p className="text-[10px] opacity-60 font-bold uppercase">Yesterday</p>
              <p className="text-sm font-bold">{suggestion?.yesterday || '--'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-60 font-bold uppercase">Tomorrow</p>
              <p className="text-sm font-bold">{suggestion?.tomorrow || '--'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
              <TrendingUp className="h-4 w-4" />
              Weight Goal Progress
            </CardTitle>
            <span className="text-xs font-medium text-primary">
              {currentWeight > 0 ? `${progress.toFixed(1)}%` : 'No Data'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs font-medium">
            <div className="space-y-1">
              <p className="text-muted-foreground">Latest Log</p>
              <p className="text-lg font-bold">{currentWeight > 0 ? `${currentWeight} kg` : '--'}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-muted-foreground">Target</p>
              <p className="text-lg font-bold">{targetWeight > 0 ? `${targetWeight} kg` : '--'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consistency Quick Check */}
      <Card className={cn("border-l-4", hasLoggedMealToday ? "border-l-primary bg-primary/5" : "border-l-muted bg-muted/10")}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className={cn("h-5 w-5", hasLoggedMealToday ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diet Today</p>
              <p className="text-sm font-medium">
                {hasLoggedMealToday ? "Consistency maintained! ✔" : "No meals logged yet today"}
              </p>
            </div>
          </div>
          {hasLoggedMealToday && <CheckCircle2 className="h-5 w-5 text-primary" />}
        </CardContent>
      </Card>

      {/* Real Data Notification */}
      {currentWeight === 0 && (
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-accent" />
            <p className="text-xs text-muted-foreground">
              Your dashboard is empty. Head over to the Weight or Workout tabs to start logging real data!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}