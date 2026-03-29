
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Dumbbell, LayoutGrid, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { cn } from "@/lib/utils";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
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
      setExercises([{ name: "", sets: "", reps: "", weight: "" }]);
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
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!user || !logRef) return;
    
    const validExercises = exercises.filter(ex => ex.name.trim() !== "");
    if (validExercises.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Log",
        description: "Please add at least one exercise name.",
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
              <Card key={i} className="border-2 border-muted overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-tight">{ex.name}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase">
                      <span>Sets: <span className="text-foreground">{ex.sets}</span></span>
                      <span>Reps: <span className="text-foreground">{ex.reps}</span></span>
                      <span>Weight: <span className="text-foreground">{ex.weight} kg</span></span>
                    </div>
                  </div>
                  <Dumbbell className="h-5 w-5 text-muted/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Edit Mode: Structured Form */
          <>
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <Card key={index} className="border-2 border-muted overflow-hidden shadow-sm">
                  <CardHeader className="p-3 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                      Exercise {index + 1}
                    </CardTitle>
                    {exercises.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveExercise(index)}
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
                        onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                        className="font-bold border-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider text-center block">Sets</Label>
                        <Input 
                          placeholder="0" 
                          value={exercise.sets}
                          onChange={(e) => handleUpdateExercise(index, 'sets', e.target.value)}
                          className="font-bold border-2 text-center"
                          type="text"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider text-center block">Reps</Label>
                        <Input 
                          placeholder="0" 
                          value={exercise.reps}
                          onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                          className="font-bold border-2 text-center"
                          type="text"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider text-center block">Weight</Label>
                        <div className="relative">
                          <Input 
                            placeholder="0" 
                            value={exercise.weight}
                            onChange={(e) => handleUpdateExercise(index, 'weight', e.target.value)}
                            className="font-bold border-2 text-center pr-6"
                            type="text"
                            inputMode="decimal"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30">KG</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-10 flex flex-col gap-2 rounded-2xl hover:bg-primary/5 hover:border-primary/40 group transition-all"
              onClick={handleAddExercise}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Add Next Exercise</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
