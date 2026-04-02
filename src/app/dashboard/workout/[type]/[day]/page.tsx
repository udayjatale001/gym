"use client";

import { use, useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Dumbbell, CheckCircle2, Edit2, Ban, History, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Language, translations } from "@/lib/translations";
import { calculateWorkoutMetrics } from "@/lib/fitness-utils";
import { CaloriesBurnedCard } from "@/components/fitstride/CaloriesBurnedCard";

export default function WorkoutLogPage({ params }: { params: Promise<{ type: string, day: string }> }) {
  const { type, day } = use(params);
  const { toast } = useToast();
  const [exercises, setExercises] = useState([{ name: "", sets: [{ reps: "", weight: "" }] }]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedWorkout, setSavedWorkout] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [previousSession, setPreviousSession] = useState<any>(null);
  const [allExerciseNames, setAllExerciseNames] = useState<string[]>([]);
  
  // Fitness Logic Stats
  const [userWeight, setUserWeight] = useState(55); // Default as per requirements
  const [prevWeight, setPrevWeight] = useState<number | undefined>(undefined);

  const t = translations[lang];
  const storageKey = `fitstride_workout_${type}_day_${day}`;

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);

    // Load Weight Context
    const savedTarget = localStorage.getItem('fitstride_weight_target');
    const savedWeightLogs = localStorage.getItem('fitstride_weight_logs_v2');
    if (savedWeightLogs) {
      const logs = JSON.parse(savedWeightLogs);
      if (logs.length > 0) {
        setUserWeight(logs[0].weight);
        if (logs.length > 1) setPrevWeight(logs[1].weight);
      }
    }

    const savedSplits = localStorage.getItem('fitstride_splits');
    if (savedSplits) {
      const splits = JSON.parse(savedSplits);
      const found = splits.find((s: any) => s.id === type);
      setDisplayName(found ? found.name : type);
    } else { setDisplayName(type); }

    const localData = localStorage.getItem(storageKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      setSavedWorkout(parsed);
      if (parsed.status === 'completed') setExercises(parsed.exercises);
    } else {
      setIsEditing(true);
    }

    const currentDay = parseInt(day);
    let foundPrev = null;
    const names = new Set<string>();

    for (let i = currentDay - 1; i >= 1; i--) {
      const prevData = localStorage.getItem(`fitstride_workout_${type}_day_${i}`);
      if (prevData) {
        const parsed = JSON.parse(prevData);
        if (parsed.status === 'completed') {
          if (!foundPrev) foundPrev = parsed;
          parsed.exercises.forEach((ex: any) => names.add(ex.name.toUpperCase()));
        }
      }
    }
    setPreviousSession(foundPrev);
    setAllExerciseNames(Array.from(names));
    setIsLoaded(true);
  }, [type, day, storageKey]);

  const workoutMetrics = useMemo(() => {
    return calculateWorkoutMetrics(
      exercises,
      userWeight,
      savedWorkout?.timestamp // If existing session
    );
  }, [exercises, userWeight, savedWorkout]);

  const handleSave = () => {
    const valid = exercises.filter(ex => ex.name.trim() !== "" && ex.sets.some(s => s.reps.trim() !== ""));
    if (valid.length === 0) {
      toast({ variant: "destructive", title: "Empty session", description: "Add at least one movement to log." });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const data = { 
        workoutType: type, 
        day: parseInt(day), 
        exercises: valid, 
        status: 'completed', 
        timestamp: new Date().toISOString(),
        metrics: workoutMetrics 
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSavedWorkout(data); setIsEditing(false); setIsSubmitting(false);
      toast({ title: "Session Recorded", description: "Training data saved locally." });
    }, 400);
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const data = { workoutType: type, day: parseInt(day), status: 'skipped', timestamp: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSavedWorkout(data); setIsEditing(false); setIsSubmitting(false);
      toast({ variant: "destructive", title: "Workout Skipped", description: "Status marked as skipped." });
    }, 300);
  };

  const handleDeleteSession = () => {
    localStorage.removeItem(storageKey); setSavedWorkout(null);
    setExercises([{ name: "", sets: [{ reps: "", weight: "" }] }]); setIsEditing(true);
    toast({ title: "Deleted", description: "Session record removed." });
  };

  const handleClonePrevious = () => {
    if (!previousSession) return;
    const cloned = previousSession.exercises.map((ex: any) => ({
      name: ex.name,
      sets: ex.sets.map(() => ({ reps: "", weight: "" }))
    }));
    setExercises(cloned);
    toast({ title: t.cloneSuccess, description: `${displayName} Day ${previousSession.day} template applied.` });
  };

  if (!isLoaded) return <div className="flex justify-center items-center h-svh bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  const showView = savedWorkout && !isEditing;

  return (
    <div className="flex flex-col min-h-svh bg-background pb-32">
      <div className="p-4 border-b border-white/5 bg-background flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl active:scale-95 border border-white/10 shrink-0">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none truncate">{displayName}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">DAY {day} LOG</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!showView && !isSubmitting && (
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-destructive border border-white/5 active:scale-95" onClick={handleSkip}>
              <Ban className="h-5 w-5" />
            </Button>
          )}
          {showView ? (
            <Button size="sm" className="font-black rounded-2xl h-11 px-4 bg-primary text-black" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" /> MODIFY
            </Button>
          ) : (
            <Button size="sm" className="font-black rounded-2xl h-11 px-6 bg-primary text-black italic uppercase tracking-widest" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} CONFIRM
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Real-time Calories Burned Card */}
        <CaloriesBurnedCard 
          metrics={workoutMetrics} 
          currentWeight={userWeight} 
          previousWeight={prevWeight} 
        />

        {showView ? (
          <div className="space-y-6">
            <Card className={cn("border border-white/5 rounded-[2rem] p-6 flex justify-between items-center bg-white/5", savedWorkout.status === 'skipped' ? "border-destructive/20" : "border-primary/20")}>
               <div className="flex items-center gap-4 min-w-0">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-black shrink-0", savedWorkout.status === 'skipped' ? "bg-destructive" : "bg-primary")}>
                    {savedWorkout.status === 'skipped' ? <Ban className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none truncate">{savedWorkout.status === 'skipped' ? 'SKIPPED' : 'LOGGED'}</h3>
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-1.5 truncate">{format(new Date(savedWorkout.timestamp), 'MMM dd • h:mm a')}</p>
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="h-11 w-11 text-white/10 active:scale-95 shrink-0" onClick={handleDeleteSession}>
                 <Trash2 className="h-6 w-6" />
               </Button>
            </Card>
            {savedWorkout.status === 'completed' && savedWorkout.exercises.map((ex: any, i: number) => (
              <Card key={i} className="border border-white/5 rounded-[2rem] bg-white/5 border-l-4 border-l-primary p-6 space-y-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0"><Dumbbell className="h-5 w-5 text-primary" /></div>
                  <h4 className="font-black text-2xl uppercase italic tracking-tighter truncate">{ex.name}</h4>
                </div>
                <div className="space-y-2.5">
                  {ex.sets.map((set: any, idx: number) => (
                    <div key={idx} className="bg-white/5 px-6 py-4 rounded-2xl flex items-center justify-between border border-white/5">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">SET {idx+1}</span>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xl font-black italic text-white leading-none">{set.reps}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase">REPS</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black italic text-primary leading-none">{set.weight}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase">KG</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {previousSession && exercises.length <= 1 && !exercises[0].name && (
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-2xl border border-primary/20 bg-primary/5 font-black uppercase italic tracking-widest text-primary active:scale-95 transition-transform"
                onClick={handleClonePrevious}
              >
                <History className="h-5 w-5 mr-3" />
                {t.recallPrevious}
              </Button>
            )}

            <datalist id="exercise-suggestions">
              {allExerciseNames.map(name => <option key={name} value={name} />)}
            </datalist>

            {exercises.map((exercise, exIdx) => (
              <Card key={exIdx} className="border border-white/10 rounded-[2.5rem] bg-white/5 p-6 space-y-6 relative overflow-hidden shadow-none">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">MOVEMENT {exIdx + 1}</p>
                  {exercises.length > 1 && <Button variant="ghost" size="icon" className="h-10 w-10 text-white/10 active:scale-95" onClick={() => setExercises(p => p.filter((_, i) => i !== exIdx))}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <Input 
                  list="exercise-suggestions"
                  placeholder="E.G. BENCH PRESS" 
                  value={exercise.name} 
                  onChange={(e) => { const n = [...exercises]; n[exIdx].name = e.target.value.toUpperCase(); setExercises(n); }} 
                  className="h-16 font-black border border-white/10 text-lg rounded-2xl uppercase focus:ring-primary bg-background text-white" 
                />
                <div className="space-y-4">
                  {exercise.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex gap-2 items-center">
                       <div className="h-14 w-12 bg-primary text-black rounded-2xl flex items-center justify-center font-black italic shrink-0">#{setIdx+1}</div>
                       <Input placeholder="REPS" value={set.reps} inputMode="numeric" onChange={(e) => { const n = [...exercises]; n[exIdx].sets[setIdx].reps = e.target.value; setExercises(n); }} className="h-14 font-black border border-white/10 text-center text-xl rounded-2xl focus:ring-primary bg-background text-white" />
                       <Input placeholder="KG" value={set.weight} inputMode="decimal" onChange={(e) => { const n = [...exercises]; n[exIdx].sets[setIdx].weight = e.target.value; setExercises(n); }} className="h-14 font-black border border-white/10 text-center text-xl rounded-2xl focus:ring-primary bg-background text-white" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full h-14 border-dashed border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[8px] bg-transparent active:scale-95 transition-transform text-white/40" onClick={() => { const n = [...exercises]; n[exIdx].sets.push({ reps: "", weight: "" }); setExercises(n); }}>+ ADD SET</Button>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full h-20 border-dashed border border-primary/30 rounded-[2.5rem] bg-transparent flex flex-col items-center justify-center gap-2 active:scale-95" onClick={() => setExercises([...exercises, { name: "", sets: [{ reps: "", weight: "" }] }])}>
              <Plus className="h-6 w-6 text-primary" />
              <span className="font-black text-[8px] uppercase tracking-[0.3em] text-primary">NEW MOVEMENT</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
