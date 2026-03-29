
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
  Edit2,
  TrendingUp,
  XCircle,
  Ban
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: [{ reps: "", weight: "" }] }]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedWorkout, setSavedWorkout] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `fitstride_workout_${type}_day_${day}`;

  // Load from local storage
  useEffect(() => {
    const savedSplits = localStorage.getItem('fitstride_splits');
    if (savedSplits) {
      const splits = JSON.parse(savedSplits);
      const found = splits.find((s: any) => s.id === type);
      setDisplayName(found ? found.name : type);
    } else {
      setDisplayName(type);
    }

    const localData = localStorage.getItem(storageKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      setSavedWorkout(parsed);
      if (parsed.status === 'completed') {
        setExercises(parsed.exercises);
      }
    }
    
    setIsLoaded(true);
  }, [type, day, storageKey]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ reps: "", weight: "" }] }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExerciseName = (index: number, name: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = name.toUpperCase();
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

    setTimeout(() => {
      const workoutData = {
        workoutType: type,
        day: parseInt(day),
        exercises: validExercises,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(workoutData));
      setSavedWorkout(workoutData);
      
      toast({
        title: "Session Recorded",
        description: "Training data saved to local history.",
      });
      
      setIsEditing(false);
      setIsSubmitting(false);
    }, 400);
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const workoutData = {
        workoutType: type,
        day: parseInt(day),
        status: 'skipped',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(workoutData));
      setSavedWorkout(workoutData);
      toast({
        variant: "destructive",
        title: "Workout Skipped",
        description: "Status marked as skipped for this day.",
      });
      setIsEditing(false);
      setIsSubmitting(false);
    }, 300);
  };

  const handleDeleteSession = () => {
    if (confirm("Permanently delete this record?")) {
      localStorage.removeItem(storageKey);
      setSavedWorkout(null);
      setExercises([{ name: "", sets: [{ reps: "", weight: "" }] }]);
      setIsEditing(true);
      toast({
        title: "Deleted",
        description: "Record removed.",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
      </div>
    );
  }

  const showViewMode = savedWorkout && !isEditing;
  const isSkipped = savedWorkout?.status === 'skipped';

  return (
    <div className="flex flex-col min-h-svh bg-background pb-32 animate-in fade-in duration-500">
      {/* Professional Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full active:scale-90 border-2 border-muted/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black uppercase tracking-tighter leading-none italic truncate max-w-[120px]">{displayName}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Block Day {day}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!showViewMode && !isSubmitting && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-destructive border-2 border-destructive/20 hover:bg-destructive/10 active:scale-90 transition-all"
              onClick={handleSkip}
              title="Skip Workout"
            >
              <Ban className="h-5 w-5" />
            </Button>
          )}

          {showViewMode ? (
            <Button 
              size="sm" 
              className="font-black rounded-full h-10 gap-2 active:scale-95 px-6 bg-primary shadow-lg shadow-primary/20"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
              MODIFY
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="gap-2 font-black shadow-xl px-8 rounded-full active:scale-95 h-10 italic uppercase tracking-widest" 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              CONFIRM
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {showViewMode ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Session Stats Header */}
            <Card className={cn(
              "border-2 rounded-[2rem] overflow-hidden",
              isSkipped ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/20"
            )}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                    isSkipped ? "bg-destructive" : "bg-primary"
                  )}>
                    {isSkipped ? <Ban className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">
                      {isSkipped ? 'Session Skipped' : 'Session Logged'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                      {new Date(savedWorkout.timestamp).toLocaleDateString()} • {new Date(savedWorkout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-muted-foreground hover:text-destructive active:scale-90"
                  onClick={handleDeleteSession}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
            
            {/* Exercise List */}
            {!isSkipped && (
              <div className="space-y-4">
                {savedWorkout.exercises.map((ex: any, i: number) => (
                  <Card key={i} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white border-l-[8px] border-l-primary group">
                    <CardContent className="p-6 space-y-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Dumbbell className="h-6 w-6" />
                          </div>
                          <h4 className="font-black text-2xl uppercase italic tracking-tighter text-foreground">{ex.name}</h4>
                        </div>
                        <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                          {ex.sets.length} SETS
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {ex.sets.map((set: any, setIdx: number) => (
                          <div key={setIdx} className="bg-muted/30 border-2 border-muted/20 px-6 py-4 rounded-[1.5rem] flex items-center justify-between hover:border-primary/20 transition-all">
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">SET {setIdx + 1}</span>
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-black italic text-foreground leading-none">{set.reps}</span>
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">REPS</span>
                              </div>
                              <div className="w-px h-6 bg-muted-foreground/10" />
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-black italic text-primary leading-none">{set.weight}</span>
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">KG</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isSkipped && (
              <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/30 flex flex-col items-center justify-center space-y-4">
                <Ban className="h-12 w-12 text-destructive/30" />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No training data recorded</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            {exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} className="border-4 border-muted rounded-[2.5rem] overflow-hidden shadow-2xl bg-white relative">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                <CardHeader className="p-6 border-b border-muted flex flex-row items-center justify-between space-y-0 relative z-10">
                  <CardTitle className="text-[12px] font-black uppercase tracking-[0.25em] flex items-center gap-3 text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    Movement {exerciseIndex + 1}
                  </CardTitle>
                  {exercises.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-muted-foreground hover:text-destructive active:scale-90"
                      onClick={() => handleRemoveExercise(exerciseIndex)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-6 relative z-10">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase opacity-60 tracking-[0.2em] px-2 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> NAME OF MOVEMENT
                    </Label>
                    <Input 
                      placeholder="e.g. BARBELL BENCH PRESS" 
                      value={exercise.name}
                      onChange={(e) => handleUpdateExerciseName(exerciseIndex, e.target.value)}
                      className="font-black border-4 border-muted h-16 text-lg uppercase rounded-[1.2rem] focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner bg-muted/5 placeholder:text-muted-foreground/20"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <p className="text-[11px] font-black uppercase opacity-60 tracking-[0.2em]">SETS & TARGETS</p>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                        {exercise.sets.length} Active
                      </span>
                    </div>
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-3 animate-in slide-in-from-right-2 duration-300">
                        <div className="h-14 w-14 flex items-center justify-center bg-primary text-white rounded-[1rem] text-xs font-black italic shadow-lg shrink-0">
                          #{setIndex + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="relative group">
                            <Input 
                              placeholder="00" 
                              value={set.reps}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                              className="h-14 font-black border-2 border-muted text-center text-xl rounded-[1rem] focus-visible:ring-primary shadow-sm"
                              inputMode="numeric"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30 uppercase tracking-widest group-focus-within:opacity-100 transition-opacity">REPS</span>
                          </div>
                          <div className="relative group">
                            <Input 
                              placeholder="0.0" 
                              value={set.weight}
                              onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                              className="h-14 font-black border-2 border-muted text-center text-xl rounded-[1rem] focus-visible:ring-primary shadow-sm"
                              inputMode="decimal"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30 uppercase tracking-widest group-focus-within:opacity-100 transition-opacity">KG</span>
                          </div>
                        </div>
                        {exercise.sets.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-14 w-10 text-muted-foreground active:scale-90"
                            onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full h-14 border-dashed border-4 border-muted hover:border-primary hover:bg-primary/5 text-[12px] font-black uppercase tracking-[0.2em] gap-3 active:scale-[0.98] transition-all rounded-[1.2rem]"
                      onClick={() => handleAddSet(exerciseIndex)}
                    >
                      <ListPlus className="h-5 w-5" />
                      ADD NEXT SET
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="space-y-6 pt-4">
              <Button 
                variant="outline" 
                className="w-full border-dashed border-4 border-primary/30 py-12 flex flex-col gap-4 rounded-[2.5rem] active:scale-[0.98] group hover:border-primary hover:bg-primary/5 transition-all shadow-xl"
                onClick={handleAddExercise}
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Plus className="h-8 w-8 transition-transform group-hover:rotate-90" />
                </div>
                <div className="space-y-1 text-center">
                  <span className="font-black text-xs uppercase tracking-[0.3em] block italic">ADD NEW MOVEMENT</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block opacity-50">Build your routine</span>
                </div>
              </Button>

              {isEditing && (
                <Button 
                  variant="ghost" 
                  className="w-full h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground opacity-40 hover:opacity-100"
                  onClick={() => setIsEditing(false)}
                >
                  DISCARD CHANGES
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
