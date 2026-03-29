
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
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    focus: "",
    description: ""
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fitstride_splits');
    if (saved) {
      setSplits(JSON.parse(saved));
    } else {
      setSplits(defaultSplits);
      localStorage.setItem('fitstride_splits', JSON.stringify(defaultSplits));
    }
    setIsLoaded(true);
  }, []);

  // Update both state and localStorage
  const updateSplits = (newSplits: any[]) => {
    setSplits(newSplits);
    localStorage.setItem('fitstride_splits', JSON.stringify(newSplits));
  };

  const handleAddSplit = () => {
    const { name, focus, description } = formData;
    if (!name.trim() || !focus.trim() || !description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newSplit = {
        id: `split-${Date.now()}`,
        name: name.trim(),
        focus: focus.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString()
      };

      updateSplits([...splits, newSplit]);
      
      toast({
        title: "Split Added",
        description: `${name} has been saved locally.`,
      });
      
      setIsAddOpen(false);
      setFormData({ name: "", focus: "", description: "" });
      setIsSubmitting(false);
    }, 300);
  };

  const handleDeleteSplit = (e: React.MouseEvent, splitId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const splitToDelete = splits.find(s => s.id === splitId);
    if (!splitToDelete) return;

    const newSplits = splits.filter(s => s.id !== splitId);
    updateSplits(newSplits);

    toast({
      title: "Split Removed",
      description: `${splitToDelete.name} has been deleted permanently.`,
      action: (
        <ToastAction altText="Undo" onClick={() => {
          updateSplits([...newSplits, splitToDelete]);
        }}>
          Undo
        </ToastAction>
      ),
    });
  };

  const calculateOverallStats = () => {
    let totalCompleted = 0;
    let totalSkipped = 0;
    const splitStats: Record<string, { completed: number, skipped: number, name: string }> = {};
    const totalPossibleSlots = splits.length * 30; // Usually 90 for PPL
    
    splits.forEach(split => {
      splitStats[split.id] = { completed: 0, skipped: 0, name: split.name };
      for (let i = 1; i <= 30; i++) {
        const data = localStorage.getItem(`fitstride_workout_${split.id}_day_${i}`);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.status === 'completed') {
            totalCompleted++;
            splitStats[split.id].completed++;
          }
          if (parsed.status === 'skipped') {
            totalSkipped++;
            splitStats[split.id].skipped++;
          }
        }
      }
    });

    const totalLogged = totalCompleted + totalSkipped;
    const efficiencyPercentage = totalLogged > 0 ? (totalCompleted / totalLogged) * 100 : 0;
    const completionPercentage = totalPossibleSlots > 0 ? (totalCompleted / totalPossibleSlots) * 100 : 0;
    
    return { 
      totalCompleted, 
      totalSkipped, 
      efficiencyPercentage, 
      completionPercentage,
      totalLogged,
      totalPossibleSlots,
      splitStats
    };
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('push')) return iconMap.push;
    if (lower.includes('pull')) return iconMap.pull;
    if (lower.includes('leg')) return iconMap.legs;
    return iconMap.default;
  };

  const getColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('push')) return "bg-primary";
    if (lower.includes('pull')) return "bg-secondary";
    if (lower.includes('leg')) return "bg-accent";
    return "bg-muted-foreground";
  };

  const isFormValid = formData.name.trim() && formData.focus.trim() && formData.description.trim();
  const stats = calculateOverallStats();

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black flex items-center gap-2 text-primary uppercase italic tracking-tighter leading-none">
              <Dumbbell className="h-6 w-6" />
              Workout Tracker
            </h2>
            <button 
              className="text-3xl hover:scale-125 transition-transform active:scale-90 p-1"
              onClick={() => setIsProgressOpen(true)}
              title="View Overall Consistency"
            >
              📈
            </button>
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              className="rounded-full h-10 w-10 shadow-lg bg-primary hover:bg-primary/90 active:scale-90 transition-transform"
              onClick={() => {
                setFormData({ name: "", focus: "", description: "" });
                setIsSubmitting(false);
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-8 focus:outline-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-primary">Add Workout Split</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Split Name</p>
                <Input 
                  placeholder="e.g. CHEST + TRICEPS" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                  className="font-black border-2 h-14 uppercase rounded-[1rem] shadow-inner focus-visible:ring-primary"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Target Muscles</p>
                <Input 
                  placeholder="e.g. CHEST, TRICEPS" 
                  value={formData.focus}
                  onChange={(e) => setFormData(prev => ({ ...prev, focus: e.target.value.toUpperCase() }))}
                  className="font-black border-2 h-14 uppercase rounded-[1rem] shadow-inner focus-visible:ring-primary"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Description</p>
                <Textarea 
                  placeholder="FOCUS ON PUSHING MOVEMENTS..." 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value.toUpperCase() }))}
                  disabled={isSubmitting}
                  className="font-black border-2 rounded-[1rem] shadow-inner resize-none uppercase focus-visible:ring-primary"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full h-16 font-black uppercase tracking-widest italic rounded-[1.2rem] shadow-xl active:scale-95" 
                onClick={handleAddSplit} 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Saving...</>
                ) : (
                  'Confirm Split'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {splits.length > 0 ? (
          splits.map((split: any) => {
            const Icon = getIcon(split.name);
            const colorClass = getColor(split.name);
            
            return (
              <div key={split.id} className="relative group">
                <Link href={`/dashboard/workout/${split.id}`}>
                  <Card className="overflow-hidden border-2 border-muted hover:border-primary/40 transition-all cursor-pointer shadow-sm active:scale-[0.98] rounded-[1.5rem] bg-white">
                    <CardContent className="p-0 flex items-stretch min-h-[160px]">
                      <div className={cn(colorClass, "w-2 shrink-0")}></div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2.5 rounded-2xl flex items-center justify-center shadow-inner text-white", colorClass)}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <h4 className="font-black text-2xl tracking-tighter uppercase italic">{split.name}</h4>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                                onClick={(e) => handleDeleteSplit(e, split.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                              <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Focus Area</p>
                              <p className="text-xs font-bold text-muted-foreground uppercase">{split.focus}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Guidance</p>
                              <p className="text-xs text-muted-foreground leading-relaxed italic opacity-70 line-clamp-2">{split.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-muted/50 flex flex-col items-center justify-center space-y-4">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No Training Splits</p>
              <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">Tap the + to build your routine</p>
            </div>
          </div>
        )}
      </div>

      {/* Overall Progress Sheet */}
      <Sheet open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[85svh] border-none shadow-2xl p-0 overflow-hidden bg-background">
          <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-10 pb-20">
            <SheetHeader>
              <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary text-center leading-none">
                Elite Consistency Log
              </SheetTitle>
              <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                Aggregated Training Analytics (90-Day Block)
              </p>
            </SheetHeader>

            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-6 text-center shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Done</p>
                  <p className="text-5xl font-black italic text-primary leading-none">
                    {stats.totalCompleted}<span className="text-xs ml-1 opacity-40 not-italic">/{stats.totalPossibleSlots}</span>
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-2">Sessions Logged</p>
                </Card>
                <Card className="bg-destructive/5 border-2 border-destructive/20 rounded-[2rem] p-6 text-center shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Skipped</p>
                  <p className="text-5xl font-black italic text-destructive leading-none">{stats.totalSkipped}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-2">Missed Days</p>
                </Card>
              </div>

              <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-card space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" /> Training Efficiency
                    </h3>
                    <span className="text-3xl font-black text-primary italic leading-none">{Math.round(stats.efficiencyPercentage)}%</span>
                  </div>
                  <Progress value={stats.efficiencyPercentage} className="h-8 bg-muted rounded-full shadow-inner border-2 border-muted" />
                </div>
                
                <div className="space-y-6 relative z-10 border-t pt-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" /> Split Consistency Breakdown
                  </h4>
                  <div className="space-y-6">
                    {Object.values(stats.splitStats).map((split: any, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                          <p className="text-sm font-black uppercase italic tracking-tighter text-foreground">{split.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[9px] font-black text-primary uppercase">
                              <CheckCircle2 className="h-3 w-3" /> {split.completed}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-black text-destructive uppercase">
                              <Ban className="h-3 w-3" /> {split.skipped}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">/ 30</span>
                          </div>
                        </div>
                        <Progress value={(split.completed / 30) * 100} className="h-3 bg-muted rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center py-6 bg-muted/20 rounded-2xl border-2 border-dashed border-muted relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Total Block Engagement</p>
                  <p className="text-4xl font-black text-foreground italic leading-none">{stats.totalLogged} <span className="text-xs opacity-40">INTERACTIONS</span></p>
                  <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {stats.totalCompleted} Completed • {stats.totalSkipped} Skipped
                    </span>
                  </div>
                </div>
              </Card>

              <Button 
                className="w-full h-20 rounded-[1.8rem] font-black uppercase tracking-widest italic text-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/95 active:scale-95" 
                onClick={() => setIsProgressOpen(false)}
              >
                Return to Tracker
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
