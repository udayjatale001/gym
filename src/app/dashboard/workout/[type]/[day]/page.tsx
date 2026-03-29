
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Dumbbell, LayoutGrid, CheckCircle2, ListPlus, X } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { cn } from "@/lib/utils";

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
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const docId = `${type}-day-${day}`;
  const logRef = useMemoFirebase(() => 
    user ? doc(db, 'users', user.uid, 'workoutLogs', docId) : null, 
    [db, user, docId]
  );
  
  const { data: savedLog, loading: isLoading } = useDoc(logRef);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Sync state with saved data once loaded
  useEffect(() => {
    if (savedLog && savedLog.exercises) {
      setExercises(savedLog.exercises);
      setIsEditing(false);
    } else {
      setExercises([{ name: "", sets: [{ reps: "", weight: "" }] }]);
      setIsEditing(true);
    }
  }, [savedLog]);

  // Load split name from local storage
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
    if (!user || !logRef) return;
    
    const validExercises = exercises.filter(ex => ex.name.trim() !== "" && ex.sets.some(s => s.reps.trim() !== ""));
    if (validExercises.length === 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Log",
        description: "Please add at least one exercise and its reps.",
      });
      return;
    }

    setIsSaving(true);

    const logData = {
      workoutType: type,
      day: parseInt(day),
      exercises: validExercises,
      timestamp: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    setDoc(logRef, logData, { merge: true })
      .then(() => {
        toast({
          title: "Workout Saved",
          description: `Day ${day} progress has been recorded.`,
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
        setIsSaving(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh bg-background pb-24">
      {/* Dynamic Header */}
      <div className="p-4 border-b bg-card flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">{displayName}</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Day {day} Session</p>
          </div>
        </div>
        
        {!isEditing && savedLog ? (
          <Button 
            size="sm" 
            variant="outline"
            className="font-bold border-2"
            onClick={() => setIsEditing(true)}
          >
            EDIT LOG
          </Button>
        ) : (
          <Button 
            size="sm" 
            className="gap-2 font-bold shadow-lg bg-primary hover:bg-primary/90 px-6 rounded-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            SAVE
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* View Mode: Professional List */}
        {!isEditing && savedLog ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary bg-primary/10 p-3 rounded-xl border border-primary/20">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-wide">Session Completed</p>
            </div>
            {savedLog.exercises.map((ex: Exercise, i: number) => (
              <Card key={i} className="border-2 border-muted overflow-hidden bg-white shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="font-black text-base uppercase tracking-tight flex items-center justify-between">
                    {ex.name}
                    <Dumbbell className="h-4 w-4 text-primary opacity-40" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center justify-between py-1.5 border-b border-muted last:border-0">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">Set {setIdx + 1}</span>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase">
                        <span className="text-muted-foreground">Reps: <span className="text-foreground">{set.reps}</span></span>
                        <span className="text-muted-foreground">Weight: <span className="text-foreground">{set.weight} kg</span></span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Edit Mode: Structured Form */
          <>
            <div className="space-y-6">
              {exercises.map((exercise, exerciseIndex) => (
                <Card key={exerciseIndex} className="border-2 border-muted overflow-hidden shadow-sm">
                  <CardHeader className="p-3 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                      Exercise {exerciseIndex + 1}
                    </CardTitle>
                    {exercises.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveExercise(exerciseIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Exercise Name</Label>
                      <Input 
                        placeholder="e.g. Bench Press" 
                        value={exercise.name}
                        onChange={(e) => handleUpdateExerciseName(exerciseIndex, e.target.value)}
                        className="font-bold border-2 focus-visible:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-wider">Sets & Progression</p>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-2 group animate-in slide-in-from-right-2 duration-200">
                          <div className="h-10 w-10 flex items-center justify-center bg-muted/50 rounded-lg text-[10px] font-black shrink-0">
                            #{setIndex + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="relative">
                              <Input 
                                placeholder="Reps" 
                                value={set.reps}
                                onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                                className="h-10 font-bold border-2 text-center"
                                type="text"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="relative">
                              <Input 
                                placeholder="Weight" 
                                value={set.weight}
                                onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                                className="h-10 font-bold border-2 text-center pr-6"
                                type="text"
                                inputMode="decimal"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30">KG</span>
                            </div>
                          </div>
                          {exercise.sets.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-9 border-dashed text-[10px] font-black uppercase gap-2 hover:bg-primary/5 hover:border-primary/40"
                        onClick={() => handleAddSet(exerciseIndex)}
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                        Add Set
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-8 flex flex-col gap-2 rounded-2xl hover:bg-primary/5 hover:border-primary/40 group transition-all mt-4"
              onClick={handleAddExercise}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">Add New Exercise</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
