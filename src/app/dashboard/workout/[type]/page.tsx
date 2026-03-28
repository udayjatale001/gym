
"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Dumbbell, Calendar, Info } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const db = useFirestore();
  const { user } = useUser();

  const workoutLogsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'workoutLogs'),
      where('workoutType', '==', type)
    );
  }, [db, user, type]);

  const { data: logs, loading } = useCollection(workoutLogsQuery);

  const completedDays = logs?.map(l => l.day) || [];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/workout">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold capitalize">{type} Split</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-black">30-Day Progress Grid</p>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-primary">
            <Calendar className="h-4 w-4" />
            Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-primary">{completedDays.length}<span className="text-xs text-muted-foreground font-medium ml-1">/ 30 Days</span></p>
          </div>
          <div className="bg-white/50 px-3 py-1 rounded-full border border-primary/10">
            <p className="text-[10px] font-bold text-primary">
              {Math.round((completedDays.length / 30) * 100)}% Complete
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-2 pb-10">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const isCompleted = completedDays.includes(day);
          return (
            <Link key={day} href={`/dashboard/workout/${type}/${day}`}>
              <Button
                variant="outline"
                className={cn(
                  "h-16 w-full flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-95",
                  isCompleted 
                    ? "bg-primary/10 border-primary text-primary shadow-inner" 
                    : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                )}
              >
                <span className="text-[10px] font-black mb-1">DAY</span>
                <span className="text-lg font-black leading-none">{day}</span>
                {isCompleted && <CheckCircle2 className="h-3 w-3 mt-1" />}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 bg-muted/30 rounded-xl flex items-start gap-3 border border-dashed border-muted-foreground/20">
        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tap on a day to log your exercises. Days with logged workouts will be highlighted in green.
        </p>
      </div>
    </div>
  );
}
