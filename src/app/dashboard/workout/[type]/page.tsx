
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Calendar, Info, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const db = useFirestore();
  const { user } = useUser();
  const [displayName, setDisplayName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fitstride_splits');
    if (saved) {
      const splits = JSON.parse(saved);
      const found = splits.find((s: any) => s.id === type);
      if (found) {
        setDisplayName(found.name);
      } else {
        setDisplayName(type);
      }
    } else {
      setDisplayName(type);
    }
    setIsLoaded(true);
  }, [type]);

  const workoutLogsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'workoutLogs'),
      where('workoutType', '==', type)
    );
  }, [db, user, type]);

  const { data: logs, loading } = useCollection(workoutLogsQuery);

  const completedDays = logs?.map(l => l.day) || [];

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/workout">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">{displayName} Split</h2>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-primary" />
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">30-Day Training Block</p>
          </div>
        </div>
      </div>

      <Card className="bg-primary shadow-lg border-none text-primary-foreground overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-24 bg-white/10 -skew-x-12 translate-x-12" />
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] opacity-80">
            <Trophy className="h-4 w-4" />
            Consistency Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex items-center justify-between relative z-10">
          <div>
            <p className="text-4xl font-black leading-none">
              {completedDays.length}
              <span className="text-sm font-bold opacity-60 ml-2">DAYS</span>
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-right">
            <p className="text-xs font-black">
              {Math.round((completedDays.length / 30) * 100)}%
            </p>
            <p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Complete</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const isCompleted = completedDays.includes(day);
          return (
            <Link key={day} href={`/dashboard/workout/${type}/${day}`}>
              <Button
                variant="outline"
                className={cn(
                  "h-20 w-full flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-90 relative",
                  isCompleted 
                    ? "bg-primary/10 border-primary text-primary shadow-inner" 
                    : "bg-white border-muted/50 hover:border-primary/40 text-muted-foreground"
                )}
              >
                <span className="text-[10px] font-black opacity-40 absolute top-2 left-2">#{day}</span>
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in-50 duration-300" />
                ) : (
                  <span className="text-lg font-black tracking-tighter opacity-20">LOG</span>
                )}
                {isCompleted && (
                  <span className="text-[8px] font-black uppercase mt-1 opacity-60">SAVED</span>
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-5 bg-muted/30 rounded-2xl flex items-start gap-3 border-2 border-dashed border-muted-foreground/10">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-foreground uppercase tracking-tight">How to log:</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Tap any box above to open your digital notepad. Once you save a workout entry, the box will turn green.
          </p>
        </div>
      </div>
    </div>
  );
}
