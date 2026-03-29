'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame, Plus, Loader2, Trash2, TrendingUp, Calendar, LayoutGrid, CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const defaultSplits = [
  { id: 'push-default', name: "Push", focus: "Chest, Shoulders, Triceps", description: "Focus on pushing movements and upper body strength." },
  { id: 'pull-default', name: "Pull", focus: "Back, Biceps, Rear Delts", description: "Focus on pulling movements and back definition." },
  { id: 'legs-default', name: "Legs", focus: "Quads, Hams, Glutes, Calves", description: "Complete lower body workout for power and stability." }
];

const iconMap: Record<string, any> = {
  push: Flame,
  pull: Target,
  legs: Zap,
  default: Dumbbell
};

export default function WorkoutPage() {
  const { toast } = useToast();
  const [splits, setSplits] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", focus: "", description: "" });

  useEffect(() => {
    const saved = localStorage.getItem('fitstride_splits');
    if (saved) { setSplits(JSON.parse(saved)); }
    else { setSplits(defaultSplits); localStorage.setItem('fitstride_splits', JSON.stringify(defaultSplits)); }
    setIsLoaded(true);
  }, []);

  const updateSplits = (newSplits: any[]) => {
    setSplits(newSplits);
    localStorage.setItem('fitstride_splits', JSON.stringify(newSplits));
  };

  const handleAddSplit = () => {
    if (!formData.name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newSplit = { id: `split-${Date.now()}`, name: formData.name.trim(), focus: formData.focus.trim(), description: formData.description.trim(), createdAt: new Date().toISOString() };
      updateSplits([...splits, newSplit]);
      toast({ title: "Split Added", description: `${formData.name} saved locally.` });
      setIsAddOpen(false); setFormData({ name: "", focus: "", description: "" }); setIsSubmitting(false);
    }, 300);
  };

  const handleDeleteSplit = (e: React.MouseEvent, splitId: string) => {
    e.preventDefault(); e.stopPropagation();
    const splitToDelete = splits.find(s => s.id === splitId);
    if (!splitToDelete) return;
    const newSplits = splits.filter(s => s.id !== splitId);
    updateSplits(newSplits);
    toast({ title: "Split Removed", description: `${splitToDelete.name} deleted.`, action: <ToastAction altText="Undo" onClick={() => updateSplits([...newSplits, splitToDelete])}>Undo</ToastAction> });
  };

  const calculateOverallStats = () => {
    let totalCompleted = 0, totalSkipped = 0;
    const splitStats: Record<string, any> = {};
    const totalPossibleSlots = splits.length * 30;
    splits.forEach(split => {
      splitStats[split.id] = { completed: 0, skipped: 0, name: split.name };
      for (let i = 1; i <= 30; i++) {
        const data = localStorage.getItem(`fitstride_workout_${split.id}_day_${i}`);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.status === 'completed') { totalCompleted++; splitStats[split.id].completed++; }
          if (parsed.status === 'skipped') { totalSkipped++; splitStats[split.id].skipped++; }
        }
      }
    });
    const totalLogged = totalCompleted + totalSkipped;
    const efficiencyPercentage = totalLogged > 0 ? (totalCompleted / totalLogged) * 100 : 0;
    return { totalCompleted, totalSkipped, efficiencyPercentage, totalLogged, totalPossibleSlots, splitStats };
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('push')) return Flame;
    if (lower.includes('pull')) return Target;
    if (lower.includes('leg')) return Zap;
    return Dumbbell;
  };

  const stats = calculateOverallStats();

  if (!isLoaded) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black flex items-center gap-2 text-primary uppercase italic tracking-tighter leading-none">
            <Dumbbell className="h-7 w-7" />
            WORKOUT LOG
          </h2>
          <button className="text-3xl active:scale-75 transition-transform" onClick={() => setIsProgressOpen(true)}>📈</button>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-2xl h-11 w-11 shadow-xl bg-primary active:scale-90 transition-transform">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[92%] max-w-sm rounded-[2.5rem] border-none shadow-2xl p-8">
            <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-primary">New Training Split</DialogTitle></DialogHeader>
            <div className="py-6 space-y-6">
               <div className="space-y-1.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">SPLIT NAME</p>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} className="font-black border-2 h-14 rounded-2xl shadow-inner focus-visible:ring-primary uppercase" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">MUSCLE FOCUS</p>
                <Input value={formData.focus} onChange={(e) => setFormData(p => ({ ...p, focus: e.target.value.toUpperCase() }))} className="font-black border-2 h-14 rounded-2xl shadow-inner focus-visible:ring-primary uppercase" />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-16 font-black uppercase tracking-widest italic rounded-2xl active:scale-95" onClick={handleAddSplit} disabled={!formData.name.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirm Split'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {splits.map((split: any) => {
          const Icon = getIcon(split.name);
          return (
            <Link key={split.id} href={`/dashboard/workout/${split.id}`}>
              <Card className="overflow-hidden border-2 border-muted hover:border-primary/40 transition-all active:scale-[0.98] rounded-[2rem] bg-white shadow-md mb-4 group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl tracking-tighter uppercase italic leading-tight">{split.name}</h4>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{split.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/30 hover:text-destructive active:scale-90" onClick={(e) => handleDeleteSplit(e, split.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <ChevronRight className="h-6 w-6 text-muted-foreground opacity-40" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[85svh] border-none p-0 overflow-hidden bg-background">
          <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10">
            <SheetHeader>
              <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center">ANALYTICS HUB</SheetTitle>
              <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">90-DAY AGGREGATED STATS</p>
            </SheetHeader>
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] p-6 text-center shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">TOTAL SESSIONS</p>
                  <p className="text-4xl font-black italic text-primary">{stats.totalCompleted}</p>
                </Card>
                <Card className="bg-destructive/5 border-2 border-destructive/10 rounded-[2rem] p-6 text-center shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">MISSED DAYS</p>
                  <p className="text-4xl font-black italic text-destructive">{stats.totalSkipped}</p>
                </Card>
              </div>
              <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-card space-y-8 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> EFFICIENCY</h3>
                    <span className="text-2xl font-black text-primary italic">{Math.round(stats.efficiencyPercentage)}%</span>
                  </div>
                  <Progress value={stats.efficiencyPercentage} className="h-6 bg-muted rounded-full" />
                </div>
                <div className="space-y-6 pt-6 border-t">
                  {Object.values(stats.splitStats).map((split: any, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex justify-between items-end px-1">
                        <p className="text-xs font-black uppercase italic tracking-tighter">{split.name}</p>
                        <span className="text-[10px] font-black text-primary uppercase">{split.completed}/30</span>
                      </div>
                      <Progress value={(split.completed / 30) * 100} className="h-2 bg-muted rounded-full" />
                    </div>
                  ))}
                </div>
              </Card>
              <Button className="w-full h-20 rounded-[1.8rem] font-black uppercase tracking-widest italic text-xl shadow-2xl bg-primary active:scale-95" onClick={() => setIsProgressOpen(false)}>CLOSE REPORT</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}