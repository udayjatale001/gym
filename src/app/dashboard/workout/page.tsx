
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Zap, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categories = [
  { 
    id: "push", 
    name: "Push", 
    focus: "Chest, Shoulders, Triceps", 
    color: "bg-primary", 
    icon: Flame,
    description: "Focus on pushing movements and upper body strength."
  },
  { 
    id: "pull", 
    name: "Pull", 
    focus: "Back, Biceps, Rear Delts", 
    color: "bg-secondary", 
    icon: Target,
    description: "Focus on pulling movements and back definition."
  },
  { 
    id: "legs", 
    name: "Legs", 
    focus: "Quads, Hams, Glutes, Calves", 
    color: "bg-accent", 
    icon: Zap,
    description: "Complete lower body workout for power and stability."
  },
];

export default function WorkoutPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Dumbbell className="h-6 w-6" />
          Workout Tracker
        </h2>
        <p className="text-xs text-muted-foreground">Select your split to start tracking your 30-day journey.</p>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/dashboard/workout/${cat.id}`}>
            <Card className="overflow-hidden group hover:border-primary transition-all cursor-pointer shadow-sm active:scale-[0.98] mb-4">
              <CardContent className="p-0 flex items-stretch h-32">
                <div className={`${cat.color} w-3`}></div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${cat.color}/10`}>
                          <cat.icon className={`h-5 w-5 ${cat.color.replace('bg-', 'text-')}`} />
                        </div>
                        <h4 className="font-bold text-xl">{cat.name} Day</h4>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">{cat.focus}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-1">{cat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
