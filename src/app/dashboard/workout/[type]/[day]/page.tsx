"use client";

import { use, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Dumbbell, LayoutGrid, CheckCircle2, ListPlus, X, Edit2, TrendingUp, Ban, History } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Language, translations } from "@/lib/translations";

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
  const [isHeatCheckOpen, setIsHeatCheckOpen] = useState(false);

  const t = translations[lang];
  const storageKey = `fitstride_workout_${type}_day_${day}`;

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);

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

    // Find previous session for RECALL feature
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

  const heatCheckStats = useMemo(() => {
    let totalVolume = 0;
    exercises.forEach(ex => {
      ex.sets.forEach((s: any) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        totalVolume += w * r;
      });
    });
    const calories = (totalVolume / 100) * 1.5;
    return {
      recapCalories: Math.round(calories),
      recapVolume: totalVolume.toLocaleString('en-US'),
    };
  }, [exercises]);

  const handleSave = () => {
    const valid = exercises.filter(ex => ex.name.trim() !== "" && ex.sets.some(s => s.reps.trim() !== ""));
    if (valid.length === 0) {
      toast({ variant: "destructive", title: "Empty session", description: "Add at least one movement to log." });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const data = { workoutType: type, day: parseInt(day), exercises: valid, status: 'completed', timestamp: new Date().toISOString() };
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

  if (!isLoaded) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  const showView = savedWorkout && !isEditing;

  return (
    <div className="flex flex-col min-h-svh bg-background pb-32 animate-in fade-in duration-500">
      <div className="p-4 border-b bg-background/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl active:scale-90 border-2 border-muted shadow-sm">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none">{displayName}</h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">DAY {day} LOG</p>
              <span 
                data-guide-id="heat-check-btn"
                className="text-3xl animate-pulse cursor-pointer select-none active:scale-125 transition-transform"
                onClick={() => setIsHeatCheckOpen(true)}
              >
                🥵
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!showView && !isSubmitting && (
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-destructive border-2 border-destructive/10 active:scale-90" onClick={handleSkip}>
              <Ban className="h-5 w-5" />
            </Button>
          )}
          {showView ? (
            <Button size="sm" className="font-black rounded-2xl h-11 px-6 bg-primary shadow-lg" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" /> MODIFY
            </Button>
          ) : (
            <Button size="sm" className="font-black rounded-2xl h-11 px-8 shadow-xl italic uppercase tracking-widest" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} CONFIRM
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {showView ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card className={cn("border-4 rounded-[2.5rem] p-6 flex justify-between items-center bg-background shadow-none", savedWorkout.status === 'skipped' ? "border-destructive/20" : "border-primary/20")}>
               <div className="flex items-center gap-4">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", savedWorkout.status === 'skipped' ? "bg-destructive" : "bg-primary")}>
                    {savedWorkout.status === 'skipped' ? <Ban className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">{savedWorkout.status === 'skipped' ? 'SKIPPED SESSION' : 'LOGGED SESSION'}</h3>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">{format(new Date(savedWorkout.timestamp), 'MMM dd • h:mm a')}</p>
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground/30 active:scale-90" onClick={handleDeleteSession}>
                 <Trash2 className="h-6 w-6" />
               </Button>
            </Card>
            {savedWorkout.status === 'completed' && savedWorkout.exercises.map((ex: any, i: number) => (
              <Card key={i} className="border-4 border-muted rounded-[2.5rem] bg-background border-l-8 border-l-primary p-6 space-y-5 shadow-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center"><Dumbbell className="h-6 w-6 text-primary" /></div>
                    <h4 className="font-black text-2xl uppercase italic tracking-tighter">{ex.name}</h4>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {ex.sets.map((set: any, idx: number) => (
                    <div key={idx} className="bg-muted/30 px-6 py-4 rounded-2xl flex items-center justify-between border-2 border-transparent">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">SET {idx+1}</span>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xl font-black italic text-foreground leading-none">{set.reps}</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">REPS</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black italic text-primary leading-none">{set.weight}</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">KG</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-top-4">
            {previousSession && exercises.length <= 1 && !exercises[0].name && (
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-[1.5rem] border-4 border-primary/20 bg-primary/5 font-black uppercase italic tracking-widest text-primary shadow-sm hover:bg-primary/10"
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
              <Card key={exIdx} className="border-4 border-muted rounded-[2.5rem] bg-background p-6 space-y-6 relative overflow-hidden shadow-none">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">MOVEMENT {exIdx + 1}</p>
                  {exercises.length > 1 && <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/30 active:scale-90" onClick={() => setExercises(p => p.filter((_, i) => i !== exIdx))}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <Input 
                  list="exercise-suggestions"
                  placeholder="E.G. BENCH PRESS" 
                  value={exercise.name} 
                  onChange={(e) => { const n = [...exercises]; n[exIdx].name = e.target.value.toUpperCase(); setExercises(n); }} 
                  className="h-16 font-black border-4 border-muted text-lg rounded-2xl uppercase focus-visible:ring-primary shadow-inner bg-background" 
                />
                <div className="space-y-4">
                  {exercise.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex gap-3 items-center">
                       <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg shrink-0">#{setIdx+1}</div>
                       <Input placeholder="REPS" value={set.reps} inputMode="numeric" onChange={(e) => { const n = [...exercises]; n[exIdx].sets[setIdx].reps = e.target.value; setExercises(n); }} className="h-14 font-black border-2 border-muted text-center text-xl rounded-2xl focus-visible:ring-primary bg-background" />
                       <Input placeholder="KG" value={set.weight} inputMode="decimal" onChange={(e) => { const n = [...exercises]; n[exIdx].sets[setIdx].weight = e.target.value; setExercises(n); }} className="h-14 font-black border-2 border-muted text-center text-xl rounded-2xl focus-visible:ring-primary bg-background" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full h-14 border-dashed border-4 border-muted rounded-2xl font-black uppercase tracking-widest text-xs bg-background" onClick={() => { const n = [...exercises]; n[exIdx].sets.push({ reps: "", weight: "" }); setExercises(n); }}>+ ADD SET</Button>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full h-24 border-dashed border-4 border-primary/30 rounded-[2.5rem] bg-background flex flex-col gap-2 active:scale-95" onClick={() => setExercises([...exercises, { name: "", sets: [{ reps: "", weight: "" }] }])}>
              <Plus className="h-8 w-8 text-primary" />
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">NEW MOVEMENT</span>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isHeatCheckOpen} onOpenChange={setIsHeatCheckOpen}>
        <DialogContent className="bg-black border-none rounded-[3rem] p-0 overflow-hidden max-w-sm w-[92%] shadow-[0_0_50px_rgba(57,255,20,0.15)]">
          <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-[#39FF14] font-black italic uppercase tracking-tighter text-xl">
              SESSION HEAT CHECK 🥵
            </DialogTitle>
            <DialogClose className="text-white opacity-50 hover:opacity-100 transition-opacity">
              <X className="h-6 w-6" />
            </DialogClose>
          </DialogHeader>

          <div className="p-8 space-y-10 flex flex-col items-center">
            <div className="relative h-56 w-56 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="transparent"
                  stroke="rgba(57, 255, 20, 0.05)"
                  strokeWidth="12"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="transparent"
                  stroke="#39FF14"
                  strokeWidth="12"
                  strokeDasharray="628"
                  strokeDashoffset={628 - (628 * Math.min(heatCheckStats.recapCalories, 500)) / 500}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(57,255,20,0.5)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-6xl font-black text-white italic tracking-tighter">{heatCheckStats.recapCalories}</span>
                <span className="text-[#39FF14] text-[10px] font-black uppercase tracking-[0.2em] mt-1">KCAL BURNED</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] text-center shadow-inner">
                <p className="text-white text-xl font-black italic tracking-tighter">{heatCheckStats.recapVolume} kg</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1">💪 Total Volume</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] text-center shadow-inner">
                <p className="text-white text-xl font-black italic tracking-tighter">1.5x Factor</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1">⚡ Intensity</p>
              </div>
            </div>

            <p className="text-white/20 text-[8px] font-medium text-center px-4 leading-relaxed uppercase tracking-widest">
              Note: Estimate based on volume (70-80% accurate). Actual burn varies with personal metabolism and heart rate.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
