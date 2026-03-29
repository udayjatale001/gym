
'use client';

import { useState } from "react";
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
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, addDoc, deleteDoc, doc, serverTimestamp, setDoc, orderBy } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

const iconMap: Record<string, any> = {
  push: Flame,
  pull: Target,
  legs: Zap,
  default: Dumbbell
};

export default function WorkoutPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const splitsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'workoutSplits'),
      orderBy('createdAt', 'asc')
    );
  }, [db, user]);

  const { data: splits, loading } = useCollection(splitsQuery);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    focus: "",
    description: ""
  });

  const handleAddSplit = () => {
    const { name, focus, description } = formData;
    if (!user || !name.trim() || !focus.trim() || !description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const splitData = {
      name: name.trim(),
      focus: focus.trim(),
      description: description.trim(),
      createdAt: serverTimestamp()
    };

    const splitsRef = collection(db, 'users', user.uid, 'workoutSplits');

    addDoc(splitsRef, splitData)
      .then(() => {
        toast({
          title: "Split Added",
          description: `${name} has been saved to your plan.`,
        });
        setIsAddOpen(false);
        setFormData({ name: "", focus: "", description: "" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: splitsRef.path,
          operation: 'create',
          requestResourceData: splitData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteSplit = (e: React.MouseEvent, splitId: string, splitName: string, splitData: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const splitRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);

    // Permanent Deletion from Firestore
    deleteDoc(splitRef)
      .then(() => {
        toast({
          title: "Split Removed",
          description: `${splitName} has been deleted permanently.`,
          action: (
            <ToastAction altText="Undo" onClick={() => {
              // Restore data back to Firestore
              setDoc(splitRef, splitData);
            }}>
              Undo
            </ToastAction>
          ),
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: splitRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
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

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" />
            Workout Tracker
          </h2>
          <p className="text-xs text-muted-foreground">Manage your custom training splits.</p>
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
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : splits && splits.length > 0 ? (
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
                                onClick={(e) => handleDeleteSplit(e, split.id, split.name, split)}
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
