
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Plus, Calendar } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

const mockWeightData = [
  { day: "Mon", weight: 79.2 },
  { day: "Tue", weight: 79.0 },
  { day: "Wed", weight: 78.8 },
  { day: "Thu", weight: 78.9 },
  { day: "Fri", weight: 78.6 },
  { day: "Sat", weight: 78.5 },
  { day: "Sun", weight: 78.4 },
];

export default function WeightPage() {
  const [currentWeight, setCurrentWeight] = useState("78.5");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Weight Tracker
        </h2>
        <Button size="sm" className="rounded-full shadow-lg h-9 w-9 p-0">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Current Average</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-primary">78.5</span>
            <span className="text-lg font-bold text-primary/60">kg</span>
          </div>
          <p className="text-[10px] text-primary font-bold uppercase mt-2">−0.8kg since last week</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Weekly Trend</h3>
        <Card className="p-4 h-[250px]">
          {mounted ? (
            <ChartContainer config={{ weight: { label: "Weight", color: "hsl(var(--primary))" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockWeightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Logs</h3>
          <span className="text-[10px] text-primary flex items-center gap-1 font-bold">
            <Calendar className="h-3 w-3" /> Last 7 Days
          </span>
        </div>
        <div className="space-y-2">
          {mockWeightData.slice().reverse().map((log, idx) => (
            <Card key={idx} className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{log.day}</p>
                  <p className="text-[10px] text-muted-foreground">Oct {24 - idx}, 2023</p>
                </div>
                <p className="text-lg font-black text-primary">{log.weight} kg</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
