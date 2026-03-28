
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, History, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export default function WorkoutLogPage({ params }: { params: Promise<{ type: string, day: string }> }) {
  const { type, day } = use(params);
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [logText, setLogText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const docId = `${type}-day-${day}`;

  useEffect(() => {
    async function fetchWorkout() {
      if (!user) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'workoutLogs', docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setLogText(data.description || "");
        }
      } catch (e) {
        // Error handled silently or via global listener if preferred
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkout();
  }, [db, user, docId]);

  const handleSave = () => {
    if (!user) return;
    setIsSaving(true);

    const logData = {
      workoutType: type,
      day: parseInt(day),
      description: logText,
      timestamp: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    const logRef = doc(db, 'users', user.uid, 'workoutLogs', docId);

    setDoc(logRef, logData, { merge: true })
      .then(() => {
        toast({
          title: "Workout Saved",
          description: `Logged Day ${day}: ${type}.`,
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logRef.path,
          operation: 'write',
          requestResourceData: logData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="flex flex-col min-h-full bg-[#fdfdfd] relative">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Day {day}: {type}</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Training Notepad</p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="gap-2 font-bold shadow-lg bg-primary hover:bg-primary/90" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE
        </Button>
      </div>

      <div className="flex-1 p-4 pb-32 relative flex flex-col">
        {/* Notebook Lines Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-12 border-b border-black w-full" />
          ))}
          <div className="absolute top-0 left-8 h-full w-[1px] bg-red-400 opacity-20" />
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col">
            <Textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Write your workout details freely here... (e.g. Bench Press: 3x10 @ 60kg)"
              className="flex-1 min-h-[400px] bg-transparent border-none shadow-none focus-visible:ring-0 text-base leading-[3rem] font-medium resize-none p-0 pt-2 selection:bg-primary/20"
              style={{ lineHeight: '3rem' }}
            />
            
            {!logText && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-10">
                <History className="h-16 w-16 mb-4" />
                <p className="font-bold uppercase tracking-widest text-sm">Empty Journal</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
