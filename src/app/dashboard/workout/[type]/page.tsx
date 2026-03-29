
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Calendar, Info, Loader2, Trophy, XCircle, Ban } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DayStatus {
  day: number;
  status: 'completed' | 'skipped' | 'none';
}

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [displayName, setDisplayName] = useState("");
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
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

    // Check all 30 days for statuses in localStorage
    const statuses: DayStatus[] = [];
    for (let i = 1; i <= 30; i++) {
      const storageKey = `fitstride_workout_${type}_day_${i}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        statuses.push({ day: i, status: parsed.status || 'completed' });
      } else {
        statuses.push({ day: i, status: 'none' });
      }
    }
    setDayStatuses(statuses);
    setIsLoaded(true);
  }, [type]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const completedCount = dayStatuses.filter(s => s.status === 'completed').length;

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 pt-2">
        <Link href="/dashboard/workout">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl active:scale-90 border-2 border-muted/50 shadow-sm">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-primary flex items-center gap-2 leading-none">
            <span className="not-italic text-2xl">📈</span>
            {displayName}
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-primary/30 rounded-full" />
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.25em]">
              30-Day Training Block
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-primary shadow-2xl border-none text-primary-foreground overflow-hidden relative rounded-[2.5rem]">
        <div className="absolute right-0 top-0 h-full w-32 bg-white/10 -skew-x-12 translate-x-16" />
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.25em] opacity-80">
            <Trophy className="h-4 w-4" />
            Block Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2 flex items-center justify-between relative z-10">
          <div>
            <p className="text-6xl font-black leading-none italic tracking-tighter">
              {completedCount}
              <span className="text-sm font-bold opacity-60 ml-2 not-italic tracking-normal">/ 30</span>
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-5 py-4 rounded-[1.5rem] border border-white/10 text-right shadow-inner">
            <p className="text-2xl font-black italic leading-none">
              {Math.round((completedCount / 30) * 100)}%
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-70 mt-1">Success Rate</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-3 px-1">
        {dayStatuses.map((item) => {
          const isCompleted = item.status === 'completed';
          const isSkipped = item.status === 'skipped';
          
          return (
            <Link key={item.day} href={`/dashboard/workout/${type}/${item.day}`} className="block">
              <Button
                variant="outline"
                className={cn(
                  "h-20 w-full flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-95 relative overflow-hidden rounded-[1.2rem] shadow-sm hover:border-primary/40",
                  isCompleted && "bg-primary/10 border-primary text-primary shadow-inner",
                  isSkipped && "bg-destructive/10 border-destructive text-destructive shadow-inner",
                  item.status === 'none' && "bg-muted/10 border-muted/30 text-muted-foreground/30 shadow-sm"
                )}
              >
                <span className="text-[9px] font-black opacity-40 absolute top-1.5 left-2">{item.day}</span>
                {isCompleted && <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-300" />}
                {isSkipped && <Ban className="h-6 w-6 text-destructive animate-in zoom-in duration-300" />}
                {item.status === 'none' && <XCircle className="h-6 w-6 opacity-10" />}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-8 bg-muted/20 rounded-[2.5rem] flex items-start gap-5 border-2 border-dashed border-muted-foreground/10 shadow-inner">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none italic">Training Intelligence</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            <span className="text-primary font-black">GREEN</span> sessions are logged. <span className="text-destructive font-black">RED</span> sessions are skipped. Track your cycle consistency for maximum gains.
          </p>
        </div>
      </div>
    </div>
  );
}
