
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
    
    // Simulate a brief local processing delay
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

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" />
            Workout Tracker
          </h2>
          <p className="text-xs text-muted-foreground">Manage your custom training splits locally.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              className="rounded-full h-10 w-10 shadow-lg"
              onClick={() => {
                setFormData({ name: "", focus: "", description: "" });
                setIsSubmitting(false);
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Workout Split</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Split Name</p>
                <Input 
                  placeholder="e.g., Chest + Triceps" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Muscles</p>
                <Input 
                  placeholder="e.g., Chest, Triceps" 
                  value={formData.focus}
                  onChange={(e) => setFormData(prev => ({ ...prev, focus: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</p>
                <Textarea 
                  placeholder="Focus on pushing movements..." 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isSubmitting}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full font-bold" 
                onClick={handleAddSplit} 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  'Save Split'
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
                  <Card className="overflow-hidden group hover:border-primary transition-all cursor-pointer shadow-sm active:scale-[0.98]">
                    <CardContent className="p-0 flex items-stretch min-h-[160px]">
                      <div className={cn(colorClass, "w-2 shrink-0")}></div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-2 rounded-lg", colorClass.replace('bg-', 'bg-') + "/10")}>
                                <Icon className={cn("h-5 w-5", colorClass.replace('bg-', 'text-'))} />
                              </div>
                              <h4 className="font-black text-xl tracking-tight uppercase">{split.name}</h4>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                                onClick={(e) => handleDeleteSplit(e, split.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Muscles</p>
                              <p className="text-xs font-bold text-muted-foreground uppercase">{split.focus}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Description</p>
                              <p className="text-xs text-muted-foreground leading-relaxed italic">{split.description}</p>
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
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
            <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto opacity-20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No splits found.</p>
            <p className="text-[10px] text-muted-foreground mt-1">Click the + button to add one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
