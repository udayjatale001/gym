
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const defaultCategories = [
  { 
    id: "push", 
    name: "Push", 
    focus: "Chest, Shoulders, Triceps", 
    color: "bg-primary", 
    icon: Flame,
    description: "Focus on pushing movements and upper body strength.",
    isDefault: true
  },
  { 
    id: "pull", 
    name: "Pull", 
    focus: "Back, Biceps, Rear Delts", 
    color: "bg-secondary", 
    icon: Target,
    description: "Focus on pulling movements and back definition.",
    isDefault: true
  },
  { 
    id: "legs", 
    name: "Legs", 
    focus: "Quads, Hams, Glutes, Calves", 
    color: "bg-accent", 
    icon: Zap,
    description: "Complete lower body workout for power and stability.",
    isDefault: true
  },
];

export default function WorkoutPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSplitName, setNewSplitName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch custom splits with real-time updates
  const splitsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'workoutSplits'),
      orderBy('createdAt', 'asc')
    );
  }, [db, user]);

  const { data: customSplits, loading } = useCollection(splitsQuery);

  const handleAddSplit = () => {
    const trimmedName = newSplitName.trim();
    if (!user || !trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    
    // Intelligent mapping logic
    const nameLower = trimmedName.toLowerCase();
    let focus = "Custom Workout Split";
    let description = "Personalized training split.";

    if (nameLower.includes("push") || nameLower.includes("chest") || nameLower.includes("tricep")) {
      focus = "Chest, Shoulders, Triceps";
      description = "Focus on pushing movements and upper body strength.";
    } else if (nameLower.includes("pull") || nameLower.includes("back") || nameLower.includes("bicep")) {
      focus = "Back, Biceps, Rear Delts";
      description = "Focus on pulling movements and back definition.";
    } else if (nameLower.includes("legs") || nameLower.includes("squat") || nameLower.includes("quad")) {
      focus = "Quads, Hams, Glutes, Calves";
      description = "Complete lower body workout for power and stability.";
    }

    const splitData = {
      name: trimmedName,
      focus: focus,
      description: description,
      createdAt: serverTimestamp()
    };

    const splitsRef = collection(db, 'users', user.uid, 'workoutSplits');

    // Initiate write - UI will update instantly via useCollection
    addDoc(splitsRef, splitData)
      .then(() => {
        toast({
          title: "Split Added",
          description: `${trimmedName} is ready to log.`,
        });
        setIsAddOpen(false);
        setNewSplitName("");
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

  const handleDeleteSplit = (e: React.MouseEvent, splitId: string, splitName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
    
    deleteDoc(splitDocRef)
      .then(() => {
        toast({
          title: "Split Removed",
          description: `${splitName} has been deleted.`,
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: splitDocRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const allSplits = [
    ...defaultCategories,
    ...(customSplits || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      focus: s.focus || "Custom Split",
      color: "bg-muted-foreground",
      icon: Dumbbell,
      description: s.description || "Personalized training split.",
      isDefault: false
    }))
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" />
            Workout Tracker
          </h2>
          <p className="text-xs text-muted-foreground">Manage your splits and track your 30-day journey.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              className="rounded-full h-10 w-10 shadow-lg"
              onClick={() => {
                setNewSplitName("");
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
                <p className="text-xs font-bold text-muted-foreground uppercase">Split Name</p>
                <Input 
                  placeholder="e.g., Chest + Triceps" 
                  value={newSplitName}
                  onChange={(e) => setNewSplitName(e.target.value)}
                  autoFocus
                  disabled={isSubmitting}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSplit()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full font-bold" 
                onClick={handleAddSplit} 
                disabled={!newSplitName.trim() || isSubmitting}
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : (
          allSplits.map((cat) => (
            <div key={cat.id} className="relative group">
              <Link href={`/dashboard/workout/${cat.id}`}>
                <Card className="overflow-hidden group hover:border-primary transition-all cursor-pointer shadow-sm active:scale-[0.98]">
                  <CardContent className="p-0 flex items-stretch min-h-[140px]">
                    <div className={cn(cat.color, "w-3 shrink-0")}></div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-lg", cat.color.replace('bg-', 'bg-') + "/10")}>
                              <cat.icon className={cn("h-5 w-5", cat.color.replace('bg-', 'text-'))} />
                            </div>
                            <h4 className="font-bold text-xl">{cat.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {!cat.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                onClick={(e) => handleDeleteSplit(e, cat.id, cat.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Muscles</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase">{cat.focus}</p>
                        </div>
                        <div className="mt-2">
                           <p className="text-[10px] text-muted-foreground/80 leading-relaxed italic">{cat.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
