
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

const defaultCategories = [
  { 
    id: "push", 
    name: "Push", 
    focus: "Chest, Shoulders, Triceps", 
    color: "bg-primary", 
    icon: Flame,
    description: "Focus on pushing movements and upper body strength."
  },
  { 
    id: "pull", 
    name: "Pull", 
    focus: "Back, Biceps, Rear Delts", 
    color: "bg-secondary", 
    icon: Target,
    description: "Focus on pulling movements and back definition."
  },
  { 
    id: "legs", 
    name: "Legs", 
    focus: "Quads, Hams, Glutes, Calves", 
    color: "bg-accent", 
    icon: Zap,
    description: "Complete lower body workout for power and stability."
  },
];

export default function WorkoutPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSplitName, setNewSplitName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch custom splits
  const splitsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'workoutSplits'),
      orderBy('createdAt', 'asc')
    );
  }, [db, user]);

  const { data: customSplits, loading } = useCollection(splitsQuery);

  const handleAddSplit = () => {
    if (!user || !newSplitName.trim()) return;

    setIsSubmitting(true);
    const splitData = {
      name: newSplitName.trim(),
      focus: "Custom Workout Split",
      createdAt: serverTimestamp()
    };

    const splitsRef = collection(db, 'users', user.uid, 'workoutSplits');

    addDoc(splitsRef, splitData)
      .then(() => {
        toast({
          title: "Split Added",
          description: `${splitData.name} has been added to your splits.`,
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

  const allSplits = [
    ...defaultCategories,
    ...(customSplits || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      focus: s.focus,
      color: "bg-muted-foreground",
      icon: Dumbbell,
      description: "Personalized training split."
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
          <p className="text-xs text-muted-foreground">Select a split to start your 30-day journey.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-10 w-10 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Workout Split</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Split Name</p>
                <Input 
                  placeholder="e.g., Chest + Triceps" 
                  value={newSplitName}
                  onChange={(e) => setNewSplitName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSplit()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full" 
                onClick={handleAddSplit} 
                disabled={!newSplitName.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Split
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
            <Link key={cat.id} href={`/dashboard/workout/${cat.id}`}>
              <Card className="overflow-hidden group hover:border-primary transition-all cursor-pointer shadow-sm active:scale-[0.98] mb-4">
                <CardContent className="p-0 flex items-stretch h-32">
                  <div className={`${cat.color} w-3`}></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${cat.color}/10`}>
                            <cat.icon className={`h-5 w-5 ${cat.color.replace('bg-', 'text-')}`} />
                          </div>
                          <h4 className="font-bold text-xl">{cat.name}</h4>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">{cat.focus}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
