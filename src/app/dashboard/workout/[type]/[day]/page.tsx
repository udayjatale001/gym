
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Save, Trash2, Dumbbell, History, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp, setDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function WorkoutLogPage({ params }: { params: Promise<{ type: string, day: string }> }) {
  const { type, day } = use(params);
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing workout for this day
  useEffect(() => {
    async function fetchWorkout() {
      if (!user) return;
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'users', user.uid, 'workoutLogs'),
          where('workoutType', '==', type),
          where('day', '==', parseInt(day))
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setExercises(data.exercises || []);
        }
      } catch (e) {
        console.error("Error fetching workout:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkout();
  }, [db, user, type, day]);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 0, reps: 0, weight: 0 }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const logData = {
      workoutType: type,
      day: parseInt(day),
      exercises: exercises.filter(ex => ex.name.trim() !== ""),
      timestamp: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    try {
      // Find existing log to update or create new
      const q = query(
        collection(db, 'users', user.uid, 'workoutLogs'),
        where('workoutType', '==', type),
        where('day', '==', parseInt(day))
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const logDoc = snapshot.docs[0];
        await setDoc(doc(db, 'users', user.uid, 'workoutLogs', logDoc.id), logData, { merge: true });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'workoutLogs'), logData);
      }

      toast({
        title: "Workout Saved",
        description: `Successfully logged your ${type} workout for Day ${day}.`,
      });
    } catch (e) {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}/workoutLogs`,
        operation: 'write',
        requestResourceData: logData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-0 flex flex-col min-h-full bg-[#fdfdfd]">
      <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Day {day}: {type}</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Training Log</p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="gap-2 font-bold shadow-lg" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE
        </Button>
      </div>

      <div className="flex-1 p-4 pb-32">
        {isLoading ? (
          <div className="space-y-4 pt-10">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-6 relative">
            {/* Notepad Lines Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="h-12 border-b border-black w-full" />
              ))}
            </div>

            {exercises.map((ex, idx) => (
              <Card key={idx} className="border-none shadow-md bg-white/80 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-muted-foreground mb-1 uppercase">Exercise {idx + 1}</p>
                      <Input 
                        placeholder="e.g. Bench Press" 
                        value={ex.name}
                        onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                        className="font-bold border-none bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 mt-5"
                      onClick={() => removeExercise(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Sets</p>
                      <Input 
                        type="number" 
                        placeholder="3" 
                        value={ex.sets || ""}
                        onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                        className="text-center font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Reps</p>
                      <Input 
                        type="number" 
                        placeholder="12" 
                        value={ex.reps || ""}
                        onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                        className="text-center font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Weight (kg)</p>
                      <Input 
                        type="number" 
                        placeholder="60" 
                        value={ex.weight || ""}
                        onChange={(e) => updateExercise(idx, 'weight', parseFloat(e.target.value) || 0)}
                        className="text-center font-bold"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button 
              variant="outline" 
              className="w-full h-16 border-dashed border-2 gap-2 text-muted-foreground bg-transparent hover:bg-primary/5 hover:border-primary hover:text-primary transition-all"
              onClick={addExercise}
            >
              <Plus className="h-5 w-5" />
              Add Exercise
            </Button>

            {exercises.length === 0 && (
              <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                <History className="h-16 w-16" />
                <p className="font-bold uppercase tracking-widest text-sm">Log Empty</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
