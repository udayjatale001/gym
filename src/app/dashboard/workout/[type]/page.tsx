
"use client";

import { use, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Loader2, 
  Trophy, 
  XCircle, 
  Ban, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Dumbbell,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DayStatus {
  day: number;
  status: 'completed' | 'skipped' | 'none';
  data?: any;
}

interface ExercisePoint {
  day: number;
  volume: number;
  weight: number;
  reps: number;
  rawSets: any[];
}

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [displayName, setDisplayName] = useState("");
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

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
        statuses.push({ day: i, status: parsed.status || 'completed', data: parsed });
      } else {
        statuses.push({ day: i, status: 'none' });
      }
    }
    setDayStatuses(statuses);
    setIsLoaded(true);
  }, [type]);

  // Aggregate Exercise Data for Analysis
  const exerciseAnalysis = useMemo(() => {
    const analysisMap: Record<string, ExercisePoint[]> = {};

    dayStatuses.forEach((status) => {
      if (status.status === 'completed' && status.data?.exercises) {
        status.data.exercises.forEach((ex: any) => {
          const name = ex.name.toUpperCase();
          if (!analysisMap[name]) analysisMap[name] = [];

          let totalVolume = 0;
          let maxWeight = 0;
          let totalReps = 0;

          ex.sets.forEach((set: any) => {
            const w = parseFloat(set.weight) || 0;
            const r = parseInt(set.reps) || 0;
            totalVolume += w * r;
            if (w > maxWeight) maxWeight = w;
            totalReps += r;
          });

          analysisMap[name].push({
            day: status.day,
            volume: totalVolume,
            weight: maxWeight,
            reps: totalReps,
            rawSets: ex.sets
          });
        });
      }
    });

    return analysisMap;
  }, [dayStatuses]);

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
            <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
              <SheetTrigger asChild>
                <button className="text-2xl hover:scale-125 transition-transform active:scale-90" title="View Detailed Analysis">
                  📈
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[92svh] border-none shadow-2xl p-0 overflow-hidden bg-background">
                <div className="h-full overflow-y-auto no-scrollbar p-6 space-y-10 pb-20">
                  <SheetHeader>
                    <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center">
                      Performance Market
                    </SheetTitle>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                      Progressive Overload Analysis
                    </p>
                  </SheetHeader>

                  <div className="space-y-8">
                    {Object.entries(exerciseAnalysis).length > 0 ? (
                      Object.entries(exerciseAnalysis).map(([name, points]) => {
                        const lastPoint = points[points.length - 1];
                        const prevPoint = points.length > 1 ? points[points.length - 2] : null;
                        
                        const volumeChange = prevPoint 
                          ? ((lastPoint.volume - prevPoint.volume) / prevPoint.volume) * 100 
                          : 0;
                        
                        const isImproving = volumeChange > 0;
                        const isRegressing = volumeChange < 0;

                        return (
                          <Card key={name} className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card">
                            <CardHeader className="p-6 pb-2">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <CardTitle className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
                                    {name}
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                      Day {lastPoint.day} Performance
                                    </span>
                                    {prevPoint && (
                                      <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1",
                                        isImproving ? "bg-primary/10 text-primary" : isRegressing ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                                      )}>
                                        {isImproving ? <TrendingUp className="h-3 w-3" /> : isRegressing ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                        {Math.abs(volumeChange).toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-primary italic uppercase tracking-tighter">Vol: {lastPoint.volume.toFixed(0)}</p>
                                  <p className="text-[8px] font-bold text-muted-foreground uppercase">KG × REPS</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="h-48 w-full mt-4">
                                <ChartContainer config={{ 
                                  volume: { label: "Total Volume", color: isImproving ? "hsl(var(--primary))" : isRegressing ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }
                                }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={points}>
                                      <defs>
                                        <linearGradient id={`grad-${name}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor={isImproving ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor={isImproving ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--muted-foreground), 0.1)" />
                                      <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }}
                                        label={{ value: 'Day', position: 'insideBottom', offset: -5, fontSize: 8, fontWeight: 900 }}
                                      />
                                      <YAxis hide />
                                      <ChartTooltip content={<ChartTooltipContent />} />
                                      <Area 
                                        type="monotone" 
                                        dataKey="volume" 
                                        stroke={isImproving ? "hsl(var(--primary))" : isRegressing ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"} 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill={`url(#grad-${name})`} 
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </ChartContainer>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-muted/50">
                                <div className="space-y-1">
                                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Max Intensity</p>
                                  <p className="text-sm font-black italic">{lastPoint.weight} KG</p>
                                </div>
                                <div className="text-right space-y-1">
                                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Reps</p>
                                  <p className="text-sm font-black italic">{lastPoint.reps} REPS</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/30 flex flex-col items-center justify-center space-y-4">
                        <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No workout data found for analysis</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest italic text-lg shadow-xl shadow-primary/20" 
                    onClick={() => setIsAnalysisOpen(false)}
                  >
                    Close Analysis
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
            <span className="text-primary font-black">GREEN</span> sessions are logged. <span className="text-destructive font-black">RED</span> sessions are skipped. Tap the <span className="text-primary">📈</span> to view detailed exercise trends.
          </p>
        </div>
      </div>
    </div>
  );
}
