
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    focus: "",
    description: ""
  });

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
          description: `${name} is ready to log.`,
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

  const isFormValid = formData.name.trim() && formData.focus.trim() && formData.description.trim();

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
                  placeholder="e.g., Chest, Triceps, Shoulders" 
                  value={formData.focus}
                  onChange={(e) => setFormData(prev => ({ ...prev, focus: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</p>
                <Textarea 
                  placeholder="Focus on pushing movements and upper body strength." 
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : (
          allSplits.map((cat) => (
            <div key={cat.id} className="relative group">
              <Link href={`/dashboard/workout/${cat.id}`}>
                <Card className="overflow-hidden group hover:border-primary transition-all cursor-pointer shadow-sm active:scale-[0.98]">
                  <CardContent className="p-0 flex items-stretch min-h-[160px]">
                    <div className={cn(cat.color, "w-2 shrink-0")}></div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-lg", cat.color.replace('bg-', 'bg-') + "/10")}>
                              <cat.icon className={cn("h-5 w-5", cat.color.replace('bg-', 'text-'))} />
                            </div>
                            <h4 className="font-black text-xl tracking-tight uppercase">{cat.name}</h4>
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

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Muscles</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{cat.focus}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Description</p>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">{cat.description}</p>
                          </div>
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
