'use client';

import { use, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, CheckCircle2, Info, Loader2, Trophy, XCircle, Ban, TrendingUp, TrendingDown, Minus, Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [displayName, setDisplayName] = useState("");
  const [dayStatuses, setDayStatuses] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    const savedSplits = localStorage.getItem('fitstride_splits');
    if (savedSplits) {
      const splits = JSON.parse(savedSplits);
      const found = splits.find((s: any) => s.id === type);
      setDisplayName(found ? found.name : type);
    } else { setDisplayName(type); }

    const statuses = [];
    for (let i = 1; i <= 30; i++) {
      const data = localStorage.getItem(`fitstride_workout_${type}_day_${i}`);
      if (data) {
        const parsed = JSON.parse(data);
        statuses.push({ day: i, status: parsed.status || 'completed', data: parsed });
      } else { statuses.push({ day: i, status: 'none' }); }
    }
    setDayStatuses(statuses);
    setIsLoaded(true);
  }, [type]);

  const exerciseAnalysis = useMemo(() => {
    const analysisMap: Record<string, any[]> = {};
    dayStatuses.forEach((status) => {
      if (status.status === 'completed' && status.data?.exercises) {
        status.data.exercises.forEach((ex: any) => {
          const name = ex.name.toUpperCase();
          if (!analysisMap[name]) analysisMap[name] = [];
          let totalVolume = 0, maxWeight = 0, totalReps = 0;
          ex.sets.forEach((set: any) => {
            const w = parseFloat(set.weight) || 0, r = parseInt(set.reps) || 0;
            totalVolume += w * r; if (w > maxWeight) maxWeight = w; totalReps += r;
          });
          analysisMap[name].push({ day: status.day, volume: totalVolume, weight: maxWeight, reps: totalReps });
        });
      }
    });
    return analysisMap;
  }, [dayStatuses]);

  if (!isLoaded) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  const completedCount = dayStatuses.filter(s => s.status === 'completed').length;

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 pt-2">
        <Link href="/dashboard/workout">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl active:scale-90 border-2 border-muted shadow-sm">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-primary flex items-center gap-3 leading-none">
            <button className="text-2xl active:scale-75 transition-transform" onClick={() => setIsAnalysisOpen(true)}>📈</button>
            {displayName}
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.25em] opacity-60">30-DAY BLOCK PROGRESS</p>
        </div>
      </div>

      <Card className="bg-primary shadow-2xl border-none text-primary-foreground overflow-hidden rounded-[2.5rem] relative">
        <div className="absolute right-0 top-0 h-full w-32 bg-white/10 -skew-x-12 translate-x-16" />
        <CardContent className="p-8 flex items-center justify-between relative z-10">
          <div>
            <p className="text-6xl font-black leading-none italic tracking-tighter">
              {completedCount}<span className="text-sm font-bold opacity-40 ml-2 not-italic tracking-normal">/30</span>
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-3">SESSIONS LOGGED</p>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-6 py-5 rounded-[1.8rem] border border-white/10 text-right shadow-inner">
            <p className="text-3xl font-black italic leading-none">{Math.round((completedCount / 30) * 100)}%</p>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-1">SUCCESS</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-3.5 px-0.5">
        {dayStatuses.map((item) => (
          <Link key={item.day} href={`/dashboard/workout/${type}/${item.day}`} className="block">
            <Button variant="outline" className={cn(
              "h-20 w-full flex flex-col items-center justify-center p-0 transition-all border-2 active:scale-90 relative overflow-hidden rounded-2xl shadow-sm",
              item.status === 'completed' && "bg-primary/10 border-primary text-primary shadow-inner",
              item.status === 'skipped' && "bg-destructive/10 border-destructive text-destructive shadow-inner",
              item.status === 'none' && "bg-muted/30 border-muted/50 text-muted-foreground/20"
            )}>
              <span className="text-[9px] font-black opacity-40 absolute top-1.5 left-2">{item.day}</span>
              {item.status === 'completed' && <CheckCircle2 className="h-6 w-6" />}
              {item.status === 'skipped' && <Ban className="h-6 w-6" />}
              {item.status === 'none' && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 mt-3" />}
            </Button>
          </Link>
        ))}
      </div>

      <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[92svh] border-none p-0 overflow-hidden bg-background">
          <div className="h-full overflow-y-auto no-scrollbar p-6 space-y-10 pb-28">
            <SheetHeader>
              <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center leading-none">PERFORMANCE MARKET</SheetTitle>
              <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">PROGRESSIVE OVERLOAD ANALYSIS</p>
            </SheetHeader>
            <div className="space-y-8">
              {Object.entries(exerciseAnalysis).map(([name, points]: [string, any]) => {
                const lastPoint = points[points.length - 1];
                const prevPoint = points.length > 1 ? points[points.length - 2] : null;
                const volumeChange = prevPoint ? ((lastPoint.volume - prevPoint.volume) / prevPoint.volume) * 100 : 0;
                const isImproving = volumeChange > 0;
                return (
                  <Card key={name} className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black uppercase tracking-tighter italic">{name}</h4>
                        <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black", isImproving ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                          {isImproving ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(volumeChange).toFixed(1)}% TREND
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary italic leading-none">{lastPoint.volume.toFixed(0)}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">VOL (KG×REPS)</p>
                      </div>
                    </div>
                    <div className="h-44 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={points}>
                           <defs><linearGradient id={`grad-${name}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={isImproving ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.3}/><stop offset="95%" stopColor={isImproving ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0}/></linearGradient></defs>
                           <XAxis dataKey="day" hide /><YAxis hide />
                           <Area type="monotone" dataKey="volume" stroke={isImproving ? "hsl(var(--primary))" : "hsl(var(--destructive))"} strokeWidth={4} fill={`url(#grad-${name})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Button className="w-full h-20 rounded-[1.8rem] font-black uppercase tracking-widest italic text-xl shadow-2xl bg-primary active:scale-95" onClick={() => setIsAnalysisOpen(false)}>CLOSE ANALYSIS</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}