'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Flame, Info, Activity, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkoutMetrics, getWeightFluctuationExplanation } from "@/lib/fitness-utils";

interface CaloriesBurnedCardProps {
  metrics: WorkoutMetrics;
  currentWeight: number;
  previousWeight?: number;
  className?: string;
}

export function CaloriesBurnedCard({ 
  metrics, 
  currentWeight, 
  previousWeight,
  className 
}: CaloriesBurnedCardProps) {
  const explanation = previousWeight 
    ? getWeightFluctuationExplanation(currentWeight, previousWeight, metrics.caloriesBurned) 
    : null;

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden relative active:scale-[0.99] transition-transform shadow-none">
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" />
                SESSION HEAT CHECK
              </p>
              <h3 className="text-4xl font-black italic text-white tracking-tighter leading-none">
                ~{metrics.caloriesBurned} <span className="text-xs text-primary not-italic">KCAL</span>
              </h3>
            </div>
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-lg transition-all",
              metrics.intensity === 'Vigorous' ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/10"
            )}>
              <Flame className={cn("h-7 w-7", metrics.intensity === 'Vigorous' && "animate-pulse")} />
            </div>
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

          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Info className="h-3 w-3 text-white/20" />
            <p className="text-[8px] font-medium text-white/20 uppercase tracking-widest leading-relaxed">
              MET Algorithm: {metrics.intensity === 'Vigorous' ? '6.0' : '4.0'} factor based on volume/weight ratio.
            </p>
          </div>
        </CardContent>
      </Card>

      {explanation && (
        <Card className="bg-primary/10 border border-primary/20 rounded-2xl p-5 animate-in slide-in-from-bottom-2 duration-500 shadow-none">
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
