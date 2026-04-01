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
import { triggerNativeInterstitial } from "@/lib/admob";

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
    }, 200);
  };

  const handleDeleteSplit = (e: React.MouseEvent, splitId: string) => {
    e.preventDefault(); e.stopPropagation();
    const splitToDelete = splits.find(s => s.id === splitId);
    if (!splitToDelete) return;
    const newSplits = splits.filter(s => s.id !== splitId);
    updateSplits(newSplits);
    toast({ title: "Split Removed", description: `${splitToDelete.name} deleted.`, action: <ToastAction altText="Undo" onClick={() => updateSplits([...newSplits, splitToDelete])}>Undo</ToastAction> });
  };

  const handleCategoryClick = async (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    await triggerNativeInterstitial();
    router.push(href);
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

  if (!isLoaded) return <div className="flex justify-center items-center h-full bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-6 pb-32 bg-background min-h-full">
      <div className="flex items-center justify-between pt-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-black">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-primary uppercase italic leading-none">WORKOUT</h2>
              <button className="text-xl" onClick={() => setIsProgressOpen(true)}>📈</button>
            </div>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">TRAINING BLOCKS</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-guide-id="add-split-btn" size="icon" className="h-10 w-10 rounded-lg bg-primary active:scale-90">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[92%] max-w-sm rounded-2xl p-6 border-none bg-card">
            <DialogHeader><DialogTitle className="text-xl font-black uppercase italic text-primary">NEW SPLIT</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
               <div className="space-y-1">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">SPLIT NAME</p>
                <Input value={formData.name} placeholder="E.G. UPPER BODY" onChange={(e) => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} className="h-12 font-black border border-white/10 rounded-xl focus:ring-primary uppercase text-base" />
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">MUSCLE FOCUS</p>
                <Input value={formData.focus} placeholder="E.G. CHEST & BACK" onChange={(e) => setFormData(p => ({ ...p, focus: e.target.value.toUpperCase() }))} className="h-12 font-black border border-white/10 rounded-xl focus:ring-primary uppercase text-base" />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 font-black uppercase italic text-base rounded-xl bg-primary" onClick={handleAddSplit} disabled={!formData.name.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CONFIRM SPLIT'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4" data-guide-id="split-list">
        {splits.map((split: any) => {
          const Icon = getIcon(split.name);
          return (
            <div key={split.id} onClick={(e) => handleCategoryClick(e, `/dashboard/workout/${split.id}`)} role="button" className="block w-full text-left active:scale-[0.98] transition-transform">
              <Card className="overflow-hidden border border-white/5 rounded-2xl bg-card relative">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-lg uppercase italic leading-none truncate">{split.name}</h4>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1.5 truncate">{split.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-white/10 hover:text-destructive" onClick={(e) => handleDeleteSplit(e, split.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-white/10" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[80svh] border-none p-0 bg-background">
          <div className="h-full momentum-scroll p-6 space-y-8 pb-32">
            <SheetHeader>
              <SheetTitle className="text-2xl font-black uppercase italic text-primary text-center">ANALYTICS HUB</SheetTitle>
            </SheetHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card border border-white/5 rounded-xl p-6 text-center">
                  <p className="text-[8px] font-black uppercase text-white/40 mb-1">COMPLETED</p>
                  <p className="text-3xl font-black italic text-primary">{stats.totalCompleted}</p>
                </Card>
                <Card className="bg-card border border-white/5 rounded-xl p-6 text-center">
                  <p className="text-[8px] font-black uppercase text-white/40 mb-1">SKIPPED</p>
                  <p className="text-3xl font-black italic text-destructive">{stats.totalSkipped}</p>
                </Card>
              </div>
              <Card className="p-6 rounded-2xl border border-white/5 bg-card space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">EFFICIENCY</h3>
                  <span className="text-xl font-black text-primary italic leading-none">{Math.round(stats.efficiencyPercentage)}%</span>
                </div>
                <Progress value={stats.efficiencyPercentage} className="h-3 bg-white/5 rounded-full" />
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {Object.values(stats.splitStats).map((split: any, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-end px-1">
                        <p className="text-[10px] font-black uppercase italic truncate max-w-[70%]">{split.name}</p>
                        <span className="text-[9px] font-black text-primary">{split.completed}/30</span>
                      </div>
                      <Progress value={(split.completed / 30) * 100} className="h-1.5 bg-white/5 rounded-full" />
                    </div>
                  ))}
                </div>
              </Card>
              <Button className="w-full h-16 rounded-xl font-black uppercase italic text-lg bg-primary" onClick={() => setIsProgressOpen(false)}>CLOSE REPORT</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}