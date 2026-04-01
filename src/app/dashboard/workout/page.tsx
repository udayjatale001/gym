'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame, Plus, Loader2, Trash2, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const defaultSplits = [
  { id: 'push-default', name: "Push", focus: "Chest, Shoulders, Triceps", description: "Focus on pushing movements and upper body strength." },
  { id: 'pull-default', name: "Pull", focus: "Back, Biceps, Rear Delts", description: "Focus on pulling movements and back definition." },
  { id: 'legs-default', name: "Legs", focus: "Quads, Hams, Glutes, Calves", description: "Complete lower body workout for power and stability." }
];

export default function WorkoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [splits, setSplits] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", focus: "", description: "" });
  
  // Interstitial Ad State
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

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

  const handleCategoryClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setPendingRoute(href);
    // Show Interstitial (Unit: ca-app-pub-6399399331218914/6509075397)
    setShowInterstitial(true);
  };

  const closeInterstitial = () => {
    setShowInterstitial(false);
    if (pendingRoute) {
      router.push(pendingRoute);
    }
  };

  const calculateOverallStats = () => {
    let totalCompleted = 0, totalSkipped = 0;
    const splitStats: Record<string, any> = {};
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
    return { totalCompleted, totalSkipped, efficiencyPercentage, splitStats };
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('push')) return Flame;
    if (lower.includes('pull')) return Target;
    if (lower.includes('leg')) return Zap;
    return Dumbbell;
  };

  const stats = calculateOverallStats();

  if (!isLoaded) return <div className="flex justify-center py-20 h-svh items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" /></div>;

  return (
    <div className="p-4 space-y-8 pb-32 min-h-svh animate-in fade-in slide-in-from-bottom-2 duration-500 no-scrollbar bg-background">
      {/* Interstitial Ad Simulation */}
      {showInterstitial && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <button 
            onClick={closeInterstitial}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="w-full max-w-sm aspect-square bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
            <span className="absolute top-4 left-6 text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">INTERSTITIAL PROTOCOL</span>
            {/* AdMob Interstitial Unit ID: ca-app-pub-6399399331218914/6509075397 */}
            <div className="text-center space-y-4">
               <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                 <Zap className="h-8 w-8 text-primary animate-pulse" />
               </div>
               <p className="text-sm font-black uppercase italic tracking-tighter text-white/60">AD LOADING...</p>
            </div>
          </div>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">MISSION WILL RESUME IN 3 SECONDS</p>
          <Button 
            variant="ghost" 
            className="mt-4 text-primary font-black uppercase italic tracking-widest text-xs"
            onClick={closeInterstitial}
          >
            SKIP AD
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 px-1">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.5rem] md:rounded-[1.8rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 border-b-4 border-black/20">
            <Dumbbell className="h-7 w-7 md:h-9 md:w-9" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter italic leading-none">WORKOUT</h2>
              <button className="text-2xl active:scale-75 transition-transform" onClick={() => setIsProgressOpen(true)}>📈</button>
            </div>
            <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">TRAINING BLOCKS</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-guide-id="add-split-btn" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-[1.25rem] shadow-xl bg-primary active:scale-90">
              <Plus className="h-7 w-7 md:h-8 md:w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[92%] max-w-sm rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl border-none bg-card">
            <DialogHeader><DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-center text-primary">NEW SPLIT</DialogTitle></DialogHeader>
            <div className="py-6 md:py-8 space-y-6 md:space-y-8">
               <div className="space-y-2">
                <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2 opacity-60">SPLIT NAME</p>
                <Input value={formData.name} placeholder="E.G. UPPER BODY" onChange={(e) => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} className="h-14 md:h-16 font-black border-4 border-muted rounded-[1.25rem] md:rounded-[1.5rem] shadow-inner focus-visible:ring-primary uppercase px-6 text-base md:text-lg" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2 opacity-60">MUSCLE FOCUS</p>
                <Input value={formData.focus} placeholder="E.G. CHEST & BACK" onChange={(e) => setFormData(p => ({ ...p, focus: e.target.value.toUpperCase() }))} className="h-14 md:h-16 font-black border-4 border-muted rounded-[1.25rem] md:rounded-[1.5rem] shadow-inner focus-visible:ring-primary uppercase px-6 text-base md:text-lg" />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-16 md:h-20 font-black uppercase tracking-widest italic text-lg md:text-xl rounded-[1.5rem] md:rounded-[1.8rem] shadow-2xl active:scale-95 bg-primary" onClick={handleAddSplit} disabled={!formData.name.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-6 w-6 md:h-7 md:w-7 animate-spin" /> : 'CONFIRM SPLIT'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-5 md:gap-6" data-guide-id="split-list">
        {splits.map((split: any) => {
          const Icon = getIcon(split.name);
          return (
            <button key={split.id} onClick={(e) => handleCategoryClick(e, `/dashboard/workout/${split.id}`)} className="block w-full text-left">
              <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-card hover:bg-muted/30 transition-all active:scale-[0.98] relative group">
                <CardContent className="p-6 md:p-8 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-inner shrink-0">
                      <Icon className="h-7 w-7 md:h-8 md:w-8" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xl md:text-2xl tracking-tighter uppercase italic leading-none truncate">{split.name}</h4>
                      <p className="text-[10px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest mt-2 opacity-60 truncate">{split.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full text-muted-foreground/20 hover:text-destructive active:scale-90" onClick={(e) => handleDeleteSplit(e, split.id)}>
                      <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] md:rounded-t-[3.5rem] h-[85svh] border-none p-0 overflow-hidden bg-background">
          <div className="h-full overflow-y-auto no-scrollbar p-8 md:p-10 space-y-10 md:space-y-12 pb-32">
            <SheetHeader>
              <SheetTitle className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-primary text-center">ANALYTICS HUB</SheetTitle>
              <p className="text-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">DISCIPLINE METRICS</p>
            </SheetHeader>
            <div className="space-y-8 md:space-y-10">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-none rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 opacity-60">COMPLETED</p>
                  <p className="text-4xl md:text-5xl font-black italic text-primary">{stats.totalCompleted}</p>
                </Card>
                <Card className="bg-card border-none rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 opacity-60">SKIPPED</p>
                  <p className="text-4xl md:text-5xl font-black italic text-destructive">{stats.totalSkipped}</p>
                </Card>
              </div>
              <Card className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl bg-card space-y-8 md:space-y-10 relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2 md:gap-3">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" /> 
                      EFFICIENCY
                    </h3>
                    <span className="text-2xl md:text-3xl font-black text-primary italic leading-none">{Math.round(stats.efficiencyPercentage)}%</span>
                  </div>
                  <Progress value={stats.efficiencyPercentage} className="h-6 md:h-8 bg-muted rounded-full shadow-inner" />
                </div>
                <div className="space-y-6 md:space-y-8 pt-6 md:pt-8 border-t border-border/50">
                  {Object.values(stats.splitStats).map((split: any, idx) => (
                    <div key={idx} className="space-y-2 md:space-y-3">
                      <div className="flex justify-between items-end px-1">
                        <p className="text-[10px] md:text-xs font-black uppercase italic tracking-tighter truncate max-w-[70%]">{split.name}</p>
                        <span className="text-[9px] md:text-[11px] font-black text-primary uppercase tracking-widest">{split.completed}/30</span>
                      </div>
                      <Progress value={(split.completed / 30) * 100} className="h-2.5 md:h-3 bg-muted rounded-full overflow-hidden" />
                    </div>
                  ))}
                </div>
              </Card>
              <Button className="w-full h-20 md:h-24 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest italic text-xl md:text-2xl shadow-2xl bg-primary active:scale-95" onClick={() => setIsProgressOpen(false)}>CLOSE REPORT</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
