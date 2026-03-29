'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Scale, Plus, History, Loader2, Clock, Trash2, Calendar, Target, TrendingUp, ChevronRight } from "lucide-react";
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

  // Load from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('fitstride_weight_logs_v2');
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTarget) setTargetWeight(savedTarget);
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
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
      const newEntry: LocalWeightLog = {
        id: Math.random().toString(36).substr(2, 9),
        weight: weightVal,
        timestamp: new Date().toISOString(),
      };

      setLogs(prev => [newEntry, ...prev]);
      setNewWeight("");
      setIsSubmitting(false);

      toast({
        title: "Weight Recorded",
        description: `${weightVal} kg saved to local history.`,
      });
    }, 400);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
    toast({
      title: "Entry Removed",
      description: "Log deleted from local history.",
    });
  };

  const handleSaveTarget = () => {
    localStorage.setItem('fitstride_weight_target', targetWeight);
    toast({
      title: "Goal Saved",
      description: "Your target weight has been updated locally.",
    });
    setIsProgressOpen(false);
  };

  const currentWeight = logs.length > 0 ? logs[0].weight : 0;
  const goalWeight = parseFloat(targetWeight) || 0;
  
  const calculateProgress = () => {
    if (logs.length === 0 || goalWeight === 0) return 0;
    const startWeight = logs[logs.length - 1].weight;
    
    if (startWeight === goalWeight) return 100;
    
    const totalDistance = Math.abs(startWeight - goalWeight);
    const distanceCovered = Math.abs(startWeight - currentWeight);
    
    const percentage = (distanceCovered / totalDistance) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const progressValue = calculateProgress();
  const weightRemaining = goalWeight > 0 ? Math.abs(currentWeight - goalWeight).toFixed(1) : null;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-svh">
        <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between pt-6 px-1">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 -rotate-2 border-b-4 border-primary-foreground/20">
            <Scale className="h-9 w-9" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-black text-primary uppercase tracking-tighter italic leading-none">
                Weight Log
              </h2>
              
              <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                <SheetTrigger asChild>
                  <button className="text-3xl hover:scale-125 transition-transform active:scale-90" title="View Progress">
                    📈
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[3rem] h-[80svh] border-none shadow-2xl p-0 overflow-hidden">
                  <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10">
                    <SheetHeader>
                      <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center">
                        Goal Progress
                      </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-6 text-center shadow-lg">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Current</p>
                          <p className="text-4xl font-black italic text-primary">{currentWeight || "--"}<span className="text-sm">KG</span></p>
                        </Card>
                        <Card className="bg-accent/5 border-2 border-accent/20 rounded-[2rem] p-6 text-center shadow-lg">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Goal</p>
                          <Input 
                            type="text"
                            inputMode="decimal"
                            placeholder="SET GOAL"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="text-center font-black text-2xl h-10 border-none bg-transparent focus-visible:ring-0 p-0 text-accent placeholder:text-accent/20 shadow-none"
                          />
                        </Card>
                      </div>

                      <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                        <div className="space-y-2 relative z-10">
                          <div className="flex justify-between items-end mb-4">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" /> Success Metric
                            </h3>
                            <span className="text-2xl font-black text-primary italic">{Math.round(progressValue)}%</span>
                          </div>
                          <Progress value={progressValue} className="h-6 bg-muted rounded-full shadow-inner border-2 border-muted" />
                        </div>
                        
                        {weightRemaining && goalWeight > 0 && (
                          <div className="text-center py-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Remaining to reach goal</p>
                            <p className="text-3xl font-black text-foreground italic">{weightRemaining} <span className="text-sm opacity-40">KG</span></p>
                          </div>
                        )}

                        {!goalWeight && (
                          <div className="text-center py-6 flex flex-col items-center gap-2 opacity-40">
                            <Target className="h-8 w-8" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Set a goal weight to track progress</p>
                          </div>
                        )}
                      </Card>

                      <Button 
                        className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest italic text-lg shadow-xl shadow-primary/20" 
                        onClick={handleSaveTarget}
                      >
                        Save Target
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">
              Progress Tracking Precision
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[3rem] overflow-hidden bg-white relative">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        <CardContent className="p-10 space-y-8 relative z-10">
          <div className="space-y-4">
            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.25em] px-1">Record Body Mass (KG)</p>
            <div className="relative group">
              <Input 
                type="text" 
                inputMode="decimal"
                placeholder="00.0" 
                className="h-24 text-5xl font-black border-4 border-muted/30 rounded-[2rem] focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner pl-8 pr-20 bg-muted/5 placeholder:text-muted-foreground/20"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                disabled={isSubmitting}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/30 italic tracking-tighter">KG</span>
            </div>
          </div>
          <Button 
            onClick={handleAddWeight} 
            className="w-full h-20 text-xl font-black uppercase tracking-[0.2em] italic rounded-[1.8rem] shadow-2xl shadow-primary/30 active:scale-[0.96] transition-all bg-primary hover:bg-primary/95 group"
            disabled={isSubmitting || !newWeight.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <span className="flex items-center gap-3">
                <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
                Confirm Entry
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[13px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2.5">
            <History className="h-4 w-4 text-primary" /> Logged History
          </h3>
          {logs.length > 0 && (
            <span className="text-[11px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest border-2 border-primary/10">
              {logs.length} Entries
            </span>
          )}
        </div>

        <div className="space-y-5">
          {logs.length > 0 ? (
            logs.map((log) => (
              <Card 
                key={log.id} 
                className="border-none shadow-xl hover:shadow-2xl transition-all rounded-[2rem] overflow-hidden group active:scale-[0.98] bg-white border-l-[6px] border-l-primary"
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                      <Scale className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-primary italic leading-none tracking-tighter">
                        {log.weight} <span className="text-xs uppercase not-italic tracking-[0.2em] opacity-30 font-bold">kg</span>
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          <Calendar className="h-3.5 w-3.5" /> 
                          {format(new Date(log.timestamp), 'MMM dd')}
                        </span>
                        <span className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          <Clock className="h-3.5 w-3.5" /> 
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-28 bg-muted/10 rounded-[3.5rem] border-4 border-dashed border-muted/30 flex flex-col items-center justify-center space-y-5">
              <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                <Scale className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Zero Data Found</p>
                <p className="text-[11px] text-muted-foreground/30 font-bold uppercase tracking-widest">Your progress logs will appear here</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
