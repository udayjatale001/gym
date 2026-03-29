
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Dumbbell, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");

  const docId = `${type}-day-${day}`;

  useEffect(() => {
    // Load display name from local storage
    const saved = localStorage.getItem('fitstride_splits');
    if (saved) {
      const splits = JSON.parse(saved);
      const found = splits.find((s: any) => s.id === type);
      if (found) {
        setDisplayName(found.name);
      } else {
        setDisplayName(type);
      }
    } else {
      setDisplayName(type);
    }

    async function fetchWorkout() {
      if (!user) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'workoutLogs', docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setExercises(data.exercises || []);
        } else {
          // Start with one empty exercise if no log exists
          setExercises([{ name: "", sets: "", reps: "", weight: "" }]);
        }
      } catch (e) {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkout();
  }, [db, user, docId, type]);

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
    if (!user) return;
    
    // Validate: At least one exercise must have a name
    const validExercises = exercises.filter(ex => ex.name.trim() !== "");
    if (validExercises.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
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

    const logRef = doc(db, 'users', user.uid, 'workoutLogs', docId);

    setDoc(logRef, logData, { merge: true })
      .then(() => {
        toast({
          title: "Workout Saved",
          description: `Day ${day} logs updated successfully.`,
        });
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
      <div className="p-4 border-b bg-card flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">{displayName}</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Day {day} Routine</p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="gap-2 font-bold shadow-lg bg-primary hover:bg-primary/90 px-6 rounded-full" 
          onClick={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {exercises.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <Dumbbell className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm font-bold uppercase">No Exercises Added</p>
                </div>
              )}
              
              {exercises.map((exercise, index) => (
                <Card key={index} className="border-2 border-muted overflow-hidden">
                  <CardHeader className="p-3 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                      Exercise {index + 1}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase opacity-60">Exercise Name</Label>
                      <Input 
                        placeholder="e.g. Bench Press" 
                        value={exercise.name}
                        onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                        className="font-bold border-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-60">Sets</Label>
                        <Input 
                          placeholder="0" 
                          value={exercise.sets}
                          onChange={(e) => handleUpdateExercise(index, 'sets', e.target.value)}
                          className="font-bold border-2 text-center"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-60">Reps</Label>
                        <Input 
                          placeholder="0" 
                          value={exercise.reps}
                          onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                          className="font-bold border-2 text-center"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase opacity-60">Weight</Label>
                        <div className="relative">
                          <Input 
                            placeholder="0" 
                            value={exercise.weight}
                            onChange={(e) => handleUpdateExercise(index, 'weight', e.target.value)}
                            className="font-bold border-2 text-center pr-6"
                            type="text"
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
              className="w-full border-dashed border-2 py-8 flex flex-col gap-2 rounded-2xl hover:bg-primary/5 hover:border-primary/40 group transition-all"
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
