'use client';

import { use, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle2, Info, Loader2, Trophy, XCircle, Ban, TrendingUp, TrendingDown, Minus, Dumbbell, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

export default function WorkoutGridPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [displayName, setDisplayName] = useState("");
  const [dayStatuses, setDayStatuses] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    const loadData = () => {
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
    };

    loadData();
    setIsLoaded(true);
  }, [type]);

  const handleResetProtocol = () => {
    for (let i = 1; i <= 30; i++) {
      localStorage.removeItem(`fitstride_workout_${type}_day_${i}`);
    }
    setDayStatuses(Array.from({ length: 30 }, (_, i) => ({ day: i + 1, status: 'none' })));
  };

  const exerciseAnalysis = useMemo(() => {
    const analysisMap: Record<string, any[]> = {};
    dayStatuses.forEach((status) => {
      if (status.status === 'completed' && status.data?.exercises) {
        status.data.exercises.forEach((ex: any) => {
          const name = ex.name.toUpperCase();
          if (!analysisMap[name]) analysisMap[name] = [];
          let totalVolume = 0;
          ex.sets.forEach((set: any) => {
            const w = parseFloat(set.weight) || 0, r = parseInt(set.reps) || 0;
            totalVolume += w * r;
          });
          analysisMap[name].push({ day: status.day, volume: totalVolume });
        });
      }
    });
    return analysisMap;
  }, [dayStatuses]);

  if (!isLoaded) return <div className="flex justify-center items-center h-svh bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const completedCount = dayStatuses.filter(s => s.status === 'completed').length;

  return (
    <div className="p-4 space-y-6 pb-32 bg-background min-h-svh">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/workout">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg border border-white/10 bg-card active:scale-90"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black uppercase italic text-primary flex items-center gap-2 leading-none">
              <button onClick={() => setIsAnalysisOpen(true)}>📈</button>
              {displayName}
            </h2>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-1">30-DAY BLOCK</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-destructive"><RotateCcw className="h-4 w-4" /></Button></AlertDialogTrigger>
          <AlertDialogContent className="bg-black border border-white/10 rounded-2xl p-6">
            <AlertDialogHeader><AlertDialogTitle className="text-destructive font-black uppercase italic text-xl text-center">RESET DATA?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col gap-2 mt-4">
              <AlertDialogAction onClick={handleResetProtocol} className="h-12 bg-destructive text-white font-black uppercase rounded-xl">RESET</AlertDialogAction>
              <AlertDialogCancel className="h-10 border-white/10 text-white/40 font-black uppercase rounded-xl">ABORT</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="bg-primary border-none text-black rounded-2xl p-6 flex justify-between items-center">
        <div>
          <p className="text-5xl font-black italic leading-none">{completedCount}<span className="text-xs opacity-40 ml-1">/30</span></p>
          <p className="text-[8px] font-black uppercase opacity-60 mt-2">SESSIONS LOGGED</p>
        </div>
        <div className="bg-black/10 px-4 py-3 rounded-xl text-center">
          <p className="text-2xl font-black italic">{Math.round((completedCount / 30) * 100)}%</p>
          <p className="text-[7px] font-bold uppercase opacity-60">SUCCESS</p>
        </div>
      </Card>

      <div className="grid grid-cols-5 gap-2.5">
        {dayStatuses.map((item) => (
          <Link key={item.day} href={`/dashboard/workout/${type}/${item.day}`} className="block">
            <Button variant="outline" className={cn("h-16 w-full flex flex-col items-center justify-center p-0 border rounded-lg active:scale-90 relative", item.status === 'completed' && "bg-primary/5 border-primary text-primary", item.status === 'skipped' && "bg-destructive/5 border-destructive text-destructive", item.status === 'none' && "bg-white/5 border-white/10 text-white/10")}>
              <span className="text-[7px] font-black absolute top-1 left-1 opacity-20">{item.day}</span>
              {item.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : item.status === 'skipped' ? <Ban className="h-5 w-5" /> : <div className="h-1 w-1 rounded-full bg-current opacity-20 mt-1" />}
            </Button>
          </Link>
        ))}
      </div>

      <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[85svh] border-none p-0 bg-background">
          <div className="h-full momentum-scroll p-6 space-y-8 pb-32">
            <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic text-primary text-center">PERFORMANCE</SheetTitle></SheetHeader>
            <div className="flex flex-col gap-6">
              {Object.entries(exerciseAnalysis).map(([name, points]: [string, any]) => (
                <Card key={name} className="border border-white/5 rounded-2xl bg-card p-5 space-y-4">
                  <h4 className="text-xl font-black uppercase italic text-white/80">{name}</h4>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={points}>
                        <XAxis dataKey="day" hide /><YAxis hide />
                        <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={3} fill="hsl(var(--primary))" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ))}
            </div>
            <Button className="w-full h-16 rounded-xl font-black uppercase italic text-lg bg-primary" onClick={() => setIsAnalysisOpen(false)}>CLOSE REPORT</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}