
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Scale, TrendingUp, Dumbbell, Info } from "lucide-react";
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, query, collection, orderBy, limit } from "firebase/firestore";

export default function DashboardPage() {
  const db = useFirestore();
  const { user } = useUser();

  const userRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'weightLogs'), orderBy('date', 'desc'), limit(1));
  }, [db, user]);
  const { data: latestWeight } = useCollection(weightQuery);

  const dietQuery = useMemoFirebase(() => {
    if (!user) return null;
    const today = new Date().toISOString().split('T')[0];
    return query(collection(db, 'users', user.uid, 'dietLogs'), orderBy('date', 'desc'));
  }, [db, user]);
  const { data: dietLogs } = useCollection(dietQuery);

  const currentWeight = latestWeight?.[0]?.weight || profile?.currentWeight || 0;
  const targetWeight = profile?.targetWeight || 0;
  
  // Simple stats calculation from real logs
  const todayCalories = dietLogs?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;
  const todayProtein = dietLogs?.reduce((sum, item) => sum + (item.protein || 0), 0) || 0;

  const progress = targetWeight > 0 ? Math.min(100, Math.max(0, (currentWeight / targetWeight) * 100)) : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Daily Summary */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <Flame className="h-6 w-6" />
            <div className="space-y-0.5">
              <p className="text-xs opacity-80 uppercase font-semibold">Calories Today</p>
              <p className="text-2xl font-bold">{todayCalories}</p>
              <p className="text-[10px] opacity-70">based on your logs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary text-secondary-foreground border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <Activity className="h-6 w-6" />
            <div className="space-y-0.5">
              <p className="text-xs opacity-80 uppercase font-semibold">Protein</p>
              <p className="text-2xl font-bold">{todayProtein}g</p>
              <p className="text-[10px] opacity-70">daily intake</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Goal Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
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

      {/* Real Data Notification */}
      {currentWeight === 0 && (
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-accent" />
            <p className="text-xs text-muted-foreground">
              Your dashboard is empty. Head over to the Weight or Diet tabs to start logging real data!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Today's Plan (Static for now, but placeholder for real logs) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
          <Dumbbell className="h-4 w-4" />
          Active Training
        </h2>
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-4">
             <h3 className="font-bold">Log your sessions</h3>
             <p className="text-xs text-muted-foreground">Switch to the Workout tab to record your sets and reps.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
