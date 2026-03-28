
'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Plus, Calendar, History } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

export default function WeightPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [newWeight, setNewWeight] = useState("");

  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'weightLogs'),
      orderBy('date', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: logs, loading } = useCollection(weightQuery);

  const handleAddWeight = async () => {
    if (!user || !newWeight) return;
    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal)) return;

    await addDoc(collection(db, 'users', user.uid, 'weightLogs'), {
      weight: weightVal,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    setNewWeight("");
  };

  const chartData = logs 
    ? [...logs].reverse().map(l => ({ day: l.date.split('-').slice(1).join('/'), weight: l.weight }))
    : [];

  const currentWeight = logs?.[0]?.weight || 0;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Weight Tracker
        </h2>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Latest Entry</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-primary">{currentWeight || '--'}</span>
              <span className="text-lg font-bold text-primary/60">kg</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="75.0" 
              className="h-10 text-center"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
            <Button onClick={handleAddWeight} className="gap-2">
              <Plus className="h-4 w-4" /> Log
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Trend Graph</h3>
        <Card className="p-4 h-[250px] flex items-center justify-center">
          {loading ? (
            <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
          ) : chartData.length > 0 ? (
            <ChartContainer config={{ weight: { label: "Weight", color: "hsl(var(--primary))" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
            <div className="text-center space-y-2">
              <History className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
              <p className="text-xs text-muted-foreground">No data to display yet.</p>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent History</h3>
        </div>
        <div className="space-y-2">
          {logs?.map((log, idx) => (
            <Card key={idx} className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{log.date}</p>
                </div>
                <p className="text-lg font-black text-primary">{log.weight} kg</p>
              </CardContent>
            </Card>
          ))}
          {(!logs || logs.length === 0) && !loading && (
            <p className="text-center text-xs text-muted-foreground py-10 italic">Start tracking your weight to see history.</p>
          )}
        </div>
      </section>
    </div>
  );
}
