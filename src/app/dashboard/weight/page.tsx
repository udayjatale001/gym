
'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Plus, History, Loader2, Clock } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function WeightPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [newWeight, setNewWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time query for all logs, sorted by most recent first
  const weightQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'weightLogs'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [db, user]);

  const { data: logs, loading } = useCollection(weightQuery);

  const handleAddWeight = () => {
    const trimmedWeight = newWeight.trim();
    if (!user || !trimmedWeight || isNaN(parseFloat(trimmedWeight))) return;

    setIsSubmitting(true);
    const weightVal = parseFloat(trimmedWeight);
    
    const weightData = {
      weight: weightVal,
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: serverTimestamp()
    };

    const logsRef = collection(db, 'users', user.uid, 'weightLogs');

    // Optimistic reset
    setNewWeight("");

    addDoc(logsRef, weightData)
      .then(() => {
        toast({
          title: "Weight Logged",
          description: `${weightVal} kg saved successfully.`,
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'create',
          requestResourceData: weightData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        // Fallback: put value back if error
        setNewWeight(weightVal.toString());
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Scale className="h-6 w-6" />
          Weight Tracker
        </h2>
      </div>

      {/* Redesigned Input Section */}
      <Card className="border-primary/20 shadow-md bg-white">
        <CardContent className="p-4 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Log New Weight</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                type="number" 
                inputMode="decimal"
                placeholder="00.0" 
                className="h-12 pl-4 pr-10 text-lg font-bold border-2 focus-visible:ring-primary"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                disabled={isSubmitting}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">kg</span>
            </div>
            <Button 
              onClick={handleAddWeight} 
              className="h-12 px-6 gap-2 font-bold shadow-lg"
              disabled={isSubmitting || !newWeight.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List (Top = Latest) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent History</h3>
          {logs && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{logs.length} Logs</span>}
        </div>

        <div className="space-y-2 pb-24">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : logs && logs.length > 0 ? (
            logs.map((log: any) => (
              <Card key={log.id} className="border-none shadow-sm hover:bg-primary/5 transition-colors overflow-hidden group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-primary leading-tight">
                        {log.weight} <span className="text-[10px] font-bold opacity-60 uppercase">kg</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <p className="text-[11px] font-bold uppercase tracking-tight">
                      {log.createdAt?.toDate 
                        ? format(log.createdAt.toDate(), 'MMM dd, yyyy • h:mm a')
                        : format(new Date(), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
               <History className="h-10 w-10 text-muted-foreground mx-auto opacity-20 mb-3" />
               <p className="text-xs text-muted-foreground font-medium italic">No weight history found. Start logging today!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
