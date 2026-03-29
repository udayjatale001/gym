
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Calendar, Info, Loader2, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [displayName, setDisplayName] = useState("");
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Split Name
    const savedSplits = localStorage.getItem('fitstride_splits');
    if (savedSplits) {
      const splits = JSON.parse(savedSplits);
      const found = splits.find((s: any) => s.id === type);
      setDisplayName(found ? found.name : type);
    } else {
      setDisplayName(type);
    }

    // Check all 30 days for logs in localStorage
    const logged: number[] = [];
    for (let i = 1; i <= 30; i++) {
      const storageKey = `fitstride_workout_${type}_day_${i}`;
      if (localStorage.getItem(storageKey)) {
        logged.push(i);
      }
    }
    setCompletedDays(logged);
    setIsLoaded(true);
  }, [type]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/workout">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full active:scale-90 border-2 border-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">{displayName}</h2>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-primary" />
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">30-Day Training Block</p>
          </div>
        </div>
      </div>

      <Card className="bg-primary shadow-2xl border-none text-primary-foreground overflow-hidden relative rounded-[2rem]">
        <div className="absolute right-0 top-0 h-full w-32 bg-white/10 -skew-x-12 translate-x-16" />
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.25em] opacity-80">
            <Trophy className="h-4 w-4" />
            Block Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2 flex items-center justify-between relative z-10">
          <div>
            <p className="text-5xl font-black leading-none italic">
              {completedDays.length}
              <span className="text-sm font-bold opacity-60 ml-2 not-italic">/ 30</span>
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-right">
            <p className="text-xl font-black italic">
              {Math.round((completedDays.length / 30) * 100)}%
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-70">Success Rate</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const isCompleted = completedDays.includes(day);
          return (
            <Link key={day} href={`/dashboard/workout/${type}/${day}`} className="block">
              <Button
                variant="outline"
                className={cn(
                  "h-20 w-full flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-95 relative overflow-hidden rounded-[1.2rem] shadow-sm",
                  isCompleted 
                    ? "bg-primary/10 border-primary text-primary shadow-inner" 
                    : "bg-destructive/5 border-destructive/30 text-destructive/40 shadow-sm"
                )}
              >
                <span className="text-[9px] font-black opacity-40 absolute top-1.5 left-2">{day}</span>
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-300" />
                ) : (
                  <XCircle className="h-6 w-6 opacity-20" />
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-6 bg-muted/20 rounded-[2rem] flex items-start gap-4 border-2 border-dashed border-muted-foreground/10">
        <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none italic">Training Status</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            <span className="text-primary font-black">GREEN</span> indicates a logged session. <span className="text-destructive font-black">RED</span> indicates an open session. Data is persisted locally for offline performance.
          </p>
        </div>
      </div>
    </div>
  );
}
