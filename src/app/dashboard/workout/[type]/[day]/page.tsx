"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Dumbbell, 
  LayoutGrid, 
  CheckCircle2, 
  ListPlus, 
  X, 
  Edit2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

interface WorkoutSet {
  reps: string;
  weight: string;
}

interface Exercise {
  name: string;
  sets: WorkoutSet[];
}

export default function WorkoutLogPage({ params }: { params: Promise<{ type: string, day: string }> }) {
  const { type, day } = use(params);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: [{ reps: "", weight: "" }] }]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid, 'workoutLogs', `${type}-day-${day}`);
  }, [db, user, type, day]);

  const { data: savedLog, loading: isLoadingDoc } = useDoc(logRef);

  useEffect(() => {
    const saved = localStorage.getItem('fitstride_splits');
    if (saved) {
      const splits = JSON.parse(saved);
      const found = splits.find((s: any) => s.id === type);
      setDisplayName(found ? found.name : type);
    } else {
      setDisplayName(type);
    }
  }, [type]);

  useEffect(() => {
    if (savedLog && !isEditing) {
      setExercises(savedLog.exercises || []);
    }
  }, [savedLog, isEditing]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ reps: "", weight: "" }] }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExerciseName = (index: number, name: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = name;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: "", weight: "" });
    setExercises(newExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    if (newExercises[exerciseIndex].sets.length === 0) {
      newExercises[exerciseIndex].sets = [{ reps: "", weight: "" }];
    }
    setExercises(newExercises);
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!user || !logRef) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please sign in to save your progress." });
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim() !== "" && ex.sets.some(s => s.reps.trim() !== ""));
    if (validExercises.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty session",
        description: "Add at least one exercise and set to save.",
      });
      return;
    }

    setIsSubmitting(true);

    const logData = {
      workoutType: type,
      day: parseInt(day),
      exercises: validExercises,
      timestamp: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    setDoc(logRef, logData)
      .then(() => {
        toast({
          title: "Session Recorded",
          description: "Your training data is synced with the cloud.",
        });
        setIsEditing(false);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logRef.path,
          operation: 'write',
          requestResourceData: logData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteSession = () => {
    if (!logRef || !user) return;
    
    if (confirm("Permanently delete this session? This cannot be undone.")) {
      deleteDoc(logRef)
        .then(() => {
          toast({
            title: "Deleted",
            description: "Session record removed.",
          });
          setExercises([{ name: "", sets: [{ reps: "", weight: "" }] }]);
          setIsEditing(false);
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: logRef.path,
            operation: 'delete',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
      </div>
    );
  }

  const showViewMode = savedLog && !isEditing;

  return (
    <div className="flex flex-col min-h-full bg-background pb-28">
      <div className="p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight leading-none truncate max-w-[120px]">{displayName}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-wider">Day {day}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showViewMode ? (
            <Button 
              size="sm" 
              variant="outline"
              className="font-black rounded-full h-9 gap-1.5 active:scale-95 px-4"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              EDIT
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="gap-2 font-black shadow-lg px-6 rounded-full active:scale-95 h-9" 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              SAVE
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {showViewMode ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-2 text-primary bg-primary/5 p-4 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest">Training Logged</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive active:scale-90"
                onClick={handleDeleteSession}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {savedLog.exercises.map((ex: any, i: number) => (
                <div key={i} className="bg-card border-2 border-muted rounded-2xl p-4 shadow-sm border-l-4 border-l-primary relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-tight">{ex.name}</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {ex.sets.map((set: any, setIdx: number) => (
                      <div key={setIdx} className="bg-muted/30 border border-muted/20 px-4 py-2.5 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary/40 uppercase">Set {setIdx + 1}</span>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5">
                            <span className="text-foreground">{set.reps}</span>
                            <span className="text-muted-foreground opacity-60 text-[8px]">REPS</span>
                          </span>
                          <span className="w-px h-3 bg-muted-foreground/10" />
                          <span className="flex items-center gap-1.5">
                            <span className="text-foreground">{set.weight}</span>
                            <span className="text-muted-foreground opacity-60 text-[8px]">KG</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} className="border-2 border-muted overflow-hidden shadow-sm">
                <CardHeader className="p-3 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                    Movement {exerciseIndex + 1}
                  </CardTitle>
                  {exercises.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive active:scale-90"
                      onClick={() => handleRemoveExercise(exerciseIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Exercise Name</Label>
                    <Input 
                      placeholder="e.g. BENCH PRESS" 
                      value={exercise.name}
                      onChange={(e) => handleUpdateExerciseName(exerciseIndex, e.target.value)}
                      className="font-black border-2 h-12 text-sm uppercase"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Sets & Targets</p>
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-2">
                        <div className="h-11 w-11 flex items-center justify-center bg-primary/5 rounded-xl text-[10px] font-black text-primary border border-primary/10 shrink-0">
                          #{setIndex + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Input 
                              placeholder="REPS" 
                              value={set.reps}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                              className="h-11 font-black border-2 text-center text-sm"
                              inputMode="numeric"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[7px] font-black opacity-30">REP</span>
                          </div>
                          <div className="relative">
                            <Input 
                              placeholder="KG" 
                              value={set.weight}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                              className="h-11 font-black border-2 text-center text-sm"
                              inputMode="decimal"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] font-black opacity-30">KG</span>
                          </div>
                        </div>
                        {exercise.sets.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-11 w-8 text-muted-foreground active:scale-90"
                            onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-11 border-dashed border-2 text-[10px] font-black uppercase gap-2 active:scale-95"
                      onClick={() => handleAddSet(exerciseIndex)}
                    >
                      <ListPlus className="h-4 w-4" />
                      Add Set
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 py-8 flex flex-col gap-2 rounded-2xl active:scale-98"
                onClick={handleAddExercise}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest">Add Next Movement</span>
              </Button>

              {isEditing && (
                <Button 
                  variant="ghost" 
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
