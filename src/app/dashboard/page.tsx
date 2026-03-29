
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Info, Utensils, CheckCircle2, Calendar, Scale } from "lucide-react";
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

  // Real-time query for the latest weight entry
  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'weightLogs'), 
      orderBy('createdAt', 'desc'), 
      limit(1)
    );
  }, [db, user]);
  const { data: latestWeightData } = useCollection(weightQuery);

  const mealQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'mealLogs'), orderBy('timestamp', 'desc'), limit(5));
  }, [db, user]);
  const { data: recentMeals } = useCollection(mealQuery);

  // Priority: Latest Logged Weight > Profile Initial Weight > 0
  const currentWeight = latestWeightData?.[0]?.weight || profile?.currentWeight || 0;
  const targetWeight = profile?.targetWeight || 0;
  
  const progress = targetWeight > 0 ? Math.min(100, (currentWeight / targetWeight) * 100) : 0;
  const hasLoggedMealToday = recentMeals?.some(m => m.date === format(new Date(), 'yyyy-MM-dd'));

  // Workout Cycle Logic
  useEffect(() => {
    if (!user || !profile) return;

    let startDate: Date;
    if (profile.workoutStartDate) {
      startDate = startOfDay(new Date(profile.workoutStartDate));
    } else {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      startDate = startOfDay(new Date());
      setDoc(doc(db, 'users', user.uid), { workoutStartDate: todayStr }, { merge: true });
    }

    const today = startOfDay(new Date());
    const cycle = ["Push", "Pull", "Legs"];

    const getWorkout = (date: Date) => {
      const diff = differenceInDays(date, startDate);
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

      {/* Goal Progress - White Box Style */}
      <Card className="shadow-md border-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
              <Scale className="h-4 w-4" />
              Latest Weight Entry
            </CardTitle>
            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {currentWeight > 0 ? `${currentWeight} KG` : 'NO DATA'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-3 bg-muted" />
          <div className="flex justify-between items-end text-xs font-bold uppercase tracking-tight">
            <div className="space-y-1">
              <p className="text-muted-foreground opacity-70">Current Progress</p>
              <p className="text-xl font-black">{currentWeight > 0 ? `${currentWeight} kg` : '--'}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-muted-foreground opacity-70">Goal Target</p>
              <p className="text-xl font-black text-primary">{targetWeight > 0 ? `${targetWeight} kg` : '--'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consistency Quick Check */}
      <Card className={cn("border-l-4 shadow-sm", hasLoggedMealToday ? "border-l-primary bg-primary/5" : "border-l-muted bg-muted/10")}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className={cn("h-5 w-5", hasLoggedMealToday ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Diet Status</p>
              <p className="text-sm font-bold">
                {hasLoggedMealToday ? "Consistency maintained! ✔" : "No meals logged yet today"}
              </p>
            </div>
          </div>
          {hasLoggedMealToday && <CheckCircle2 className="h-5 w-5 text-primary" />}
        </CardContent>
      </Card>

      {/* Real Data Notification */}
      {currentWeight === 0 && (
        <Card className="bg-accent/10 border-dashed border-accent/40 border-2">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-accent" />
            <p className="text-xs font-medium text-muted-foreground leading-tight">
              Your dashboard is empty. Head to the Weight or Workout tabs to start logging real data!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
