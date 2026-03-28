
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Clock, Zap, ArrowRight, Play, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Push Day", focus: "Chest, Delts, Tris", duration: "60m", intensity: "High", color: "bg-primary" },
  { name: "Pull Day", focus: "Back, Rear Delts, Bis", duration: "55m", intensity: "Med", color: "bg-secondary" },
  { name: "Leg Day", focus: "Quads, Hams, Calves", duration: "70m", intensity: "High", color: "bg-accent" },
];

export default function WorkoutPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Dumbbell className="h-6 w-6" />
          Workout Tracker
        </h2>
        <p className="text-xs text-muted-foreground">Log your sessions or start a plan.</p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="plans" className="rounded-md">Plans</TabsTrigger>
          <TabsTrigger value="history" className="rounded-md">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="mt-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Your Library</h3>
          {plans.map((plan, idx) => (
            <Card key={idx} className="overflow-hidden group hover:border-primary transition-all">
              <CardContent className="p-0 flex items-stretch">
                <div className={`${plan.color} w-2`}></div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{plan.name}</h4>
                      <p className="text-xs text-muted-foreground">{plan.focus}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {plan.duration}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="h-3 w-3 text-secondary" />
                      {plan.intensity} Intensity
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="w-full rounded-full border-dashed border-2 py-8 flex flex-col gap-1 text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowRight className="h-4 w-4 rotate-45" />
            </div>
            <span className="text-xs">Create Custom Plan</span>
          </Button>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground px-1">
            <History className="h-4 w-4" />
            October 2023
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="border-none shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">Push Day (A)</p>
                    <p className="text-[10px] text-muted-foreground">Oct {24 - item}, 07:30 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">6 Exercises</p>
                    <p className="text-[10px] text-muted-foreground">425 kcal burned</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
