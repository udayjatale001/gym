
'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Plus, History, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { format } from "date-fns";

export default function WeightPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [newWeight, setNewWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'weightLogs'),
      // Order by date first, then by createdAt to handle multiple logs per day
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: logs, loading } = useCollection(weightQuery);

  const handleAddWeight = () => {
    if (!user || !newWeight) return;
    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal)) return;

    setIsSubmitting(true);
    const weightData = {
      weight: weightVal,
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: serverTimestamp()
    };

    const logsRef = collection(db, 'users', user.uid, 'weightLogs');

    // Non-blocking mutation for optimistic UI experience
    addDoc(logsRef, weightData)
      .then(() => {
        setNewWeight("");
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'create',
          requestResourceData: weightData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const chartData = logs 
    ? [...logs].reverse().map(l => ({ 
        day: l.date.split('-').slice(1).join('/'), 
        weight: l.weight 
      }))
    : [];

  // The latest log is the first item in our descending query
  const currentWeight = logs?.[0]?.weight || 0;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Weight Tracker
        </h2>
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Latest Entry</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-primary transition-all">
                {currentWeight || '--'}
              </span>
              <span className="text-lg font-bold text-primary/60">kg</span>
            </div>
          </div>
          <div className="flex gap-2 max-w-xs mx-auto">
            <Input 
              type="number" 
              inputMode="decimal"
              placeholder="e.g. 75.0" 
              className="h-12 text-center text-lg font-bold"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              disabled={isSubmitting}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
            />
            <Button 
              onClick={handleAddWeight} 
              className="h-12 px-6 gap-2 font-bold shadow-lg"
              disabled={isSubmitting || !newWeight}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Log
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Trend Analysis</h3>
        <Card className="p-4 h-[250px] flex items-center justify-center border-none shadow-sm overflow-hidden">
          {loading ? (
            <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
          ) : chartData.length > 0 ? (
            <ChartContainer config={{ weight: { label: "Weight", color: "hsl(var(--primary))" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700 }} 
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center space-y-2 opacity-40">
              <History className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold uppercase tracking-tighter">No History Available</p>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Logs</h3>
        </div>
        <div className="space-y-2 pb-24">
          {logs?.map((log, idx) => (
            <Card key={idx} className="border-none shadow-sm group hover:bg-primary/5 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                    {format(new Date(log.date), 'EEEE')}
                  </p>
                  <p className="text-sm font-black">{log.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary">{log.weight} <span className="text-[10px] opacity-60">kg</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!logs || logs.length === 0) && !loading && (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
               <p className="text-xs text-muted-foreground font-medium italic">Your weight journey starts here. Log your first weight!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
