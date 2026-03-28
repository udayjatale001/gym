import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Scale, TrendingUp, Dumbbell } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-6">
      {/* Daily Summary */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <Flame className="h-6 w-6" />
            <div className="space-y-0.5">
              <p className="text-xs opacity-80 uppercase font-semibold">Calories</p>
              <p className="text-2xl font-bold">1,450</p>
              <p className="text-[10px] opacity-70">of 2,200 kcal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary text-secondary-foreground border-none">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <Activity className="h-6 w-6" />
            <div className="space-y-0.5">
              <p className="text-xs opacity-80 uppercase font-semibold">Protein</p>
              <p className="text-2xl font-bold">85g</p>
              <p className="text-[10px] opacity-70">of 140g</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Goal Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weight Goal Progress
            </CardTitle>
            <span className="text-xs font-medium text-primary">60% Done</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={60} className="h-3" />
          <div className="flex justify-between text-xs font-medium">
            <div className="space-y-1">
              <p className="text-muted-foreground">Current</p>
              <p className="text-lg font-bold">78.5 kg</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-muted-foreground">Target</p>
              <p className="text-lg font-bold">72.0 kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Plan */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
          <Dumbbell className="h-4 w-4" />
          Today's Workout
        </h2>
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-0 flex items-center">
            <div className="p-4 flex-1">
              <h3 className="font-bold">Push Day (A)</h3>
              <p className="text-xs text-muted-foreground">Chest, Shoulders & Triceps</p>
              <div className="mt-3 flex gap-4">
                <span className="text-[10px] font-bold bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">60 MINS</span>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">HIGH INTENSITY</span>
              </div>
            </div>
            <div className="h-24 w-24 bg-muted flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
