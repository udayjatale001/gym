'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flame, Info, Activity, TrendingDown, Weight, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkoutMetrics, calculateWorkoutMetrics, getWeightFluctuationExplanation } from "@/lib/fitness-utils";

interface CaloriesBurnedCardProps {
  exercises: any[];
  previousWeight?: number;
  className?: string;
}

export function CaloriesBurnedCard({ 
  exercises, 
  previousWeight,
  className 
}: CaloriesBurnedCardProps) {
  const [weight, setWeight] = useState<string>("55");
  const [duration, setDuration] = useState<string>("50");
  const [metrics, setMetrics] = useState<WorkoutMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleHeatCheck = () => {
    // Check if there is any valid data logged
    const hasData = exercises.some(ex => 
      ex.name.trim() !== "" && 
      ex.sets.some((s: any) => s.reps.trim() !== "" && s.weight.trim() !== "")
    );
    
    if (!hasData) {
      setError("Please log a set first!");
      setMetrics(null);
      return;
    }

    setError(null);
    const weightVal = parseFloat(weight) || 55;
    const durationVal = parseFloat(duration) || 50;
    
    const results = calculateWorkoutMetrics(exercises, weightVal, durationVal);
    setMetrics(results);
  };

  const explanation = (metrics && previousWeight) 
    ? getWeightFluctuationExplanation(parseFloat(weight), previousWeight, metrics.caloriesBurned) 
    : null;

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden relative shadow-none">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" />
                SESSION HEAT CHECK
              </p>
            </div>
            <Button 
              data-guide-id="heat-check-btn"
              onClick={handleHeatCheck}
              variant="ghost" 
              className="text-2xl h-12 w-12 p-0 hover:bg-primary/10 rounded-full transition-all active:scale-90"
            >
              🥵
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-white/20 flex items-center gap-1 px-1">
                <Weight className="h-2 w-2" /> BODY WEIGHT (KG)
              </label>
              <Input 
                value={weight} 
                inputMode="decimal"
                onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                className="h-10 bg-white/5 border-white/10 font-black text-center text-primary rounded-xl focus:ring-primary"
                placeholder="55"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-white/20 flex items-center gap-1 px-1">
                <Timer className="h-2 w-2" /> DURATION (MIN)
              </label>
              <Input 
                value={duration} 
                inputMode="numeric"
                onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ''))}
                className="h-10 bg-white/5 border-white/10 font-black text-center text-primary rounded-xl focus:ring-primary"
                placeholder="50"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-center">
              <p className="text-[10px] font-black uppercase text-destructive italic leading-none">{error}</p>
            </div>
          )}

          {metrics && (
            <div className="space-y-6">
              <div className="text-center py-2">
                <h3 className="text-5xl font-black italic text-white tracking-tighter leading-none">
                  ~{metrics.caloriesBurned} <span className="text-xs text-primary not-italic uppercase">KCAL</span>
                </h3>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mt-2">ESTIMATED ENERGY BURN</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                  <p className="text-[8px] font-black uppercase text-white/20 mb-1">TOTAL VOLUME</p>
                  <p className="text-lg font-black italic text-primary leading-none">{metrics.totalVolume.toLocaleString()} KG</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                  <p className="text-[8px] font-black uppercase text-white/20 mb-1">INTENSITY</p>
                  <p className="text-lg font-black italic text-white leading-none uppercase">{metrics.intensity}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Info className="h-3 w-3 text-white/20" />
            <p className="text-[8px] font-medium text-white/20 uppercase tracking-widest leading-relaxed">
              Tap the emoji to trigger dynamic calculation based on active sets.
            </p>
          </div>
        </CardContent>
      </Card>

      {explanation && (
        <Card className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-none">
          <div className="flex gap-4">
            <TrendingDown className="h-5 w-5 text-primary shrink-0" />
            <p className="text-[10px] font-bold text-primary italic leading-relaxed uppercase tracking-tight">
              {explanation}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
