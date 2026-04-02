'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Scale, Plus, History, Loader2, Clock, Trash2, Calendar, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LocalWeightLog {
  id: string;
  weight: number;
  timestamp: string;
}

export default function WeightPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LocalWeightLog[]>([]);
  const [targetWeight, setTargetWeight] = useState<string>("");
  const [newWeight, setNewWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  useEffect(() => {
    const savedLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTarget) setTargetWeight(savedTarget);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fitstride_weight_logs_v2', JSON.stringify(logs));
      localStorage.setItem('fitstride_weight_target', targetWeight);
    }
  }, [logs, targetWeight, isLoaded]);

  const handleAddWeight = () => {
    const trimmedWeight = newWeight.trim();
    if (!trimmedWeight || isNaN(parseFloat(trimmedWeight))) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const weightVal = parseFloat(trimmedWeight);
      const newEntry: LocalWeightLog = { id: Math.random().toString(36).substr(2, 9), weight: weightVal, timestamp: new Date().toISOString() };
      setLogs(prev => [newEntry, ...prev]);
      setNewWeight(""); setIsSubmitting(false);
      toast({ title: "Recorded", description: `${weightVal} kg saved.` });
    }, 200);
  };

  const currentWeight = logs.length > 0 ? logs[0].weight : 0;
  const goalWeight = parseFloat(targetWeight) || 0;
  
  const progressValue = (() => {
    if (logs.length === 0 || goalWeight === 0) return 0;
    const startWeight = logs[logs.length - 1].weight;
    if (startWeight === goalWeight) return 100;
    const totalDist = Math.abs(startWeight - goalWeight);
    const covered = Math.abs(startWeight - currentWeight);
    return Math.min(100, Math.max(0, (covered / totalDist) * 100));
  })();

  if (!isLoaded) return <div className="flex justify-center items-center h-svh bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-6 pb-32 bg-background min-h-svh no-scrollbar">
      <div className="flex items-center justify-between pt-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-black">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-primary uppercase italic leading-none">BODY MASS</h2>
              <button className="text-xl" onClick={() => setIsProgressOpen(true)}>📈</button>
            </div>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">PRECISION TRACKING</p>
          </div>
        </div>
      </div>

      <Card data-guide-id="weight-input" className="border border-white/5 rounded-2xl bg-card active:scale-[0.99] transition-transform">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">CURRENT MASS (KG)</p>
            <div className="relative">
              <Input type="text" inputMode="decimal" placeholder="00.0" className="h-16 text-3xl font-black border border-white/10 rounded-xl focus:ring-primary pl-6 pr-14 bg-white/5 text-primary text-base" value={newWeight} onChange={(e) => setNewWeight(e.target.value.replace(/[^0-9.]/g, ''))} />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-black text-primary/30 italic">KG</span>
            </div>
          </div>
          <Button onClick={handleAddWeight} className="w-full h-16 text-base font-black uppercase italic rounded-xl bg-primary" disabled={isSubmitting || !newWeight.trim()}>
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'CONFIRM ENTRY'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4" data-guide-id="weight-metrics">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-2 italic"><History className="h-4 w-4" /> LOG HISTORY</h3>
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <Card key={log.id} className="border border-white/5 rounded-xl bg-card">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><Scale className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="text-xl font-black text-primary italic leading-none truncate">{log.weight}KG</p>
                    <p className="text-[8px] text-white/40 font-black uppercase mt-1 flex items-center gap-1.5">{format(new Date(log.timestamp), 'MMM dd • h:mm a')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => setLogs(p => p.filter(l => l.id !== log.id))}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[75svh] border-none p-0 bg-background">
          <div className="h-full momentum-scroll p-8 space-y-8 pb-32">
            <SheetHeader><SheetTitle className="text-2xl font-black uppercase italic text-primary text-center">GOAL METRICS</SheetTitle></SheetHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card border border-white/5 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">CURRENT</p>
                  <p className="text-3xl font-black italic text-primary">{currentWeight || "--"}KG</p>
                </Card>
                <Card className="bg-card border border-white/5 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">TARGET</p>
                  <div className="flex items-center justify-center gap-1">
                    <Input type="text" inputMode="decimal" placeholder="00.0" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value.replace(/[^0-9.]/g, ''))} className="text-center font-black text-xl h-8 border-none bg-transparent focus:ring-0 p-0 text-accent shadow-none w-16 text-base" />
                    <span className="text-[10px] font-black italic text-accent opacity-40">KG</span>
                  </div>
                </Card>
              </div>
              <Card className="p-6 rounded-2xl bg-card border border-white/5 space-y-6">
                 <div className="flex justify-between items-end mb-2"><h3 className="text-[10px] font-black uppercase opacity-40">DISCIPLINE</h3><span className="text-xl font-black text-primary italic">{Math.round(progressValue)}%</span></div>
                 <Progress value={progressValue} className="h-3 bg-white/5" />
              </Card>
              <Button className="w-full h-16 rounded-xl font-black uppercase italic text-lg bg-primary" onClick={() => { localStorage.setItem('fitstride_weight_target', targetWeight); setIsProgressOpen(false); toast({ title: "Goal Saved" }); }}>SAVE DISCIPLINE</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
