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
      toast({ title: "Weight Recorded", description: `${weightVal} kg saved locally.` });
    }, 400);
  };

  const handleSaveTarget = () => {
    localStorage.setItem('fitstride_weight_target', targetWeight);
    toast({ title: "Goal Saved", description: "Target weight updated." });
    setIsProgressOpen(false);
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

  if (!isLoaded) return <div className="flex justify-center items-center h-svh bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-10 pb-32 min-h-svh animate-in fade-in slide-in-from-bottom-4 duration-500 no-scrollbar bg-background">
      <div className="flex items-center justify-between pt-6 px-1">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 border-b-4 border-black/20">
            <Scale className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">BODY MASS</h2>
              <button className="text-2xl active:scale-75 transition-transform" onClick={() => setIsProgressOpen(true)}>📈</button>
            </div>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">PRECISION TRACKING</p>
          </div>
        </div>
      </div>

      <Card data-guide-id="weight-input" className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card relative active:scale-[0.99] transition-all">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />
        <CardContent className="p-8 space-y-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] px-2 opacity-60">CURRENT MASS (KG)</p>
            <div className="relative">
              <Input 
                type="text" 
                inputMode="decimal" 
                placeholder="00.0" 
                className="h-24 text-5xl font-black border-4 border-muted rounded-[2rem] focus-visible:ring-primary shadow-inner pl-8 pr-20 bg-muted/5 placeholder:text-muted-foreground/10 text-primary text-base" 
                value={newWeight} 
                onChange={(e) => setNewWeight(e.target.value.replace(/[^0-9.]/g, ''))} 
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/30 italic">KG</span>
            </div>
          </div>
          <Button onClick={handleAddWeight} className="w-full h-20 text-xl font-black uppercase italic rounded-[2rem] shadow-2xl active:scale-95 transition-all bg-primary" disabled={isSubmitting || !newWeight.trim()}>
            {isSubmitting ? <Loader2 className="h-7 w-7 animate-spin" /> : <span className="flex items-center gap-4"><Plus className="h-7 w-7" /> CONFIRM ENTRY</span>}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6" data-guide-id="weight-metrics">
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3 opacity-60 px-3 italic"><History className="h-5 w-5" /> LOG HISTORY</h3>
        <div className="flex flex-col gap-4">
          {logs.map((log) => (
            <Card key={log.id} className="border-none shadow-xl active:scale-[0.98] rounded-[2.5rem] bg-card border-l-8 border-l-primary overflow-hidden transition-all hover:bg-muted/30">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0"><Scale className="h-7 w-7" /></div>
                  <div className="min-w-0">
                    <p className="text-3xl font-black text-primary italic leading-none truncate">{log.weight}<span className="text-[10px] uppercase not-italic opacity-30 ml-2 font-bold tracking-widest">KG</span></p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase mt-2 opacity-50 flex items-center gap-2 tracking-widest truncate"><Calendar className="h-3 w-3 shrink-0" />{format(new Date(log.timestamp), 'MMM dd • h:mm a')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground/20 hover:text-destructive active:scale-90 shrink-0" onClick={() => setLogs(p => p.filter(l => l.id !== log.id))}><Trash2 className="h-5 w-5" /></Button>
              </CardContent>
            </Card>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-border/50 flex flex-col items-center gap-4">
              <Scale className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic text-center">Awaiting discipline...</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85svh] border-none p-0 overflow-hidden bg-background">
          <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10 pb-32">
            <SheetHeader><SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center">GOAL METRICS</SheetTitle></SheetHeader>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card border-none rounded-[2rem] p-6 text-center shadow-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">CURRENT</p>
                  <p className="text-4xl font-black italic text-primary leading-none">{currentWeight || "--"}<span className="text-xs italic opacity-40 ml-1">KG</span></p>
                </Card>
                <Card className="bg-card border-none rounded-[2rem] p-6 text-center shadow-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">TARGET</p>
                  <div className="flex items-center justify-center gap-1">
                    <Input 
                      type="text" 
                      inputMode="decimal" 
                      placeholder="00.0" 
                      value={targetWeight} 
                      onChange={(e) => setTargetWeight(e.target.value.replace(/[^0-9.]/g, ''))} 
                      className="text-center font-black text-2xl h-10 border-none bg-transparent focus-visible:ring-0 p-0 text-accent placeholder:text-accent/20 shadow-none w-20 text-base" 
                    />
                    <span className="text-xs font-black italic text-accent opacity-40 shrink-0">KG</span>
                  </div>
                </Card>
              </div>
              <Card className="p-8 rounded-[2.5rem] shadow-2xl bg-card border-none space-y-8 relative overflow-hidden">
                 <div className="flex justify-between items-end mb-4"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> DISCIPLINE</h3><span className="text-2xl font-black text-primary italic leading-none">{Math.round(progressValue)}%</span></div>
                 <Progress value={progressValue} className="h-6 bg-muted rounded-full shadow-inner" />
                 {goalWeight > 0 && (
                  <div className="text-center py-6 bg-muted/10 rounded-[1.5rem] border-4 border-dashed border-border/50">
                    <p className="text-[9px] font-black uppercase opacity-50 tracking-[0.4em] mb-2">REMAINING GAP</p>
                    <p className="text-4xl font-black italic tracking-tighter leading-none">{Math.abs(currentWeight - goalWeight).toFixed(1)} <span className="text-sm italic opacity-30 tracking-normal">KG</span></p>
                  </div>
                 )}
              </Card>
              <Button className="w-full h-20 rounded-[1.5rem] font-black uppercase italic text-xl shadow-2xl bg-primary active:scale-95" onClick={handleSaveTarget}>SAVE DISCIPLINE</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}