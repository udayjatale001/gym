'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Plus, History, Loader2, Clock, Trash2, Calendar } from "lucide-react";
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
  const [newWeight, setNewWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fitstride_weight_logs_v2');
    if (saved) {
      setLogs(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fitstride_weight_logs_v2', JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  const handleAddWeight = () => {
    const trimmedWeight = newWeight.trim();
    if (!trimmedWeight || isNaN(parseFloat(trimmedWeight))) return;

    setIsSubmitting(true);
    
    // Professional delay simulation
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-svh">
        <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-center gap-4 pt-4 px-1">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3">
          <Scale className="h-8 w-8" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-black text-primary uppercase tracking-tighter italic leading-none">
            Weight Log
          </h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
            Progress Tracking Precision
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Record Body Mass (KG)</p>
            <div className="relative group">
              <Input 
                type="number" 
                inputMode="decimal"
                placeholder="00.0" 
                className="h-20 text-4xl font-black border-4 border-muted/50 rounded-[1.5rem] focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner pl-6 pr-16"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                disabled={isSubmitting}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-muted-foreground/40 italic">KG</span>
            </div>
          </div>
          <Button 
            onClick={handleAddWeight} 
            className="w-full h-16 text-lg font-black uppercase tracking-[0.15em] italic rounded-[1.2rem] shadow-xl shadow-primary/20 active:scale-[0.97] transition-all"
            disabled={isSubmitting || !newWeight.trim()}
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6 mr-2" />}
            Confirm Entry
          </Button>
        </CardContent>
      </Card>

      {/* History List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
            <History className="h-4 w-4" /> Entry History
          </h3>
          {logs.length > 0 && (
            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
              {logs.length} Logs
            </span>
          )}
        </div>

        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => (
              <Card 
                key={log.id} 
                className="border-none shadow-md hover:shadow-lg transition-all rounded-[1.5rem] overflow-hidden group active:scale-[0.98]"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                      <Scale className="h-7 w-7" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-3xl font-black text-primary italic leading-none tracking-tighter">
                        {log.weight} <span className="text-xs uppercase not-italic tracking-widest opacity-40">kg</span>
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                          <Calendar className="h-3.5 w-3.5" /> 
                          {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                          <Clock className="h-3.5 w-3.5" /> 
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-24 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-muted/50 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Scale className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No Weight History</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 font-bold uppercase tracking-widest">Logs appear here after entry</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
