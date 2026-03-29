
"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, History, Loader2, BookOpen } from "lucide-react";
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
  const [displayName, setDisplayName] = useState("");

  const docId = `${type}-day-${day}`;

  useEffect(() => {
    // Load display name from local storage (where splits are stored)
    const saved = localStorage.getItem('fitstride_splits');
    if (saved) {
      const splits = JSON.parse(saved);
      const found = splits.find((s: any) => s.id === type);
      if (found) {
        setDisplayName(found.name);
      } else {
        setDisplayName(type);
      }
    } else {
      setDisplayName(type);
    }

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
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkout();
  }, [db, user, docId, type]);

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
          title: "Log Saved",
          description: `Entry for Day ${day} updated successfully.`,
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
    <div className="flex flex-col min-h-svh bg-[#fdfdfd] relative overflow-hidden">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/workout/${type}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">{displayName} • Day {day}</h2>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3 w-3 text-primary" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Training Journal</p>
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          className="gap-2 font-bold shadow-lg bg-primary hover:bg-primary/90 px-6 rounded-full" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE
        </Button>
      </div>

      <div className="flex-1 relative p-0 flex flex-col bg-white">
        {/* Rule Lines Layer */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Vertical Margin Line */}
          <div className="absolute top-0 left-12 h-full w-[1.5px] bg-red-400 opacity-20" />
          {/* Horizontal Lines */}
          <div className="h-full w-full">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="h-10 border-b border-sky-100 w-full" />
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex flex-col">
            <Textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Write your session details here...&#10;Bench Press: 3x10 @ 80kg&#10;Felt strong today!"
              className="flex-1 min-h-full bg-transparent border-none shadow-none focus-visible:ring-0 text-base leading-10 font-medium resize-none pl-16 pr-6 pt-0 selection:bg-primary/20 placeholder:opacity-30"
              style={{ lineHeight: '2.5rem' }}
            />
            
            {!logText && !isLoading && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.05] mt-10">
                <History className="h-24 w-24" />
                <p className="font-bold uppercase tracking-[0.2em] text-lg mt-4">Empty Entry</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/20 border-t flex items-center justify-center gap-2">
        <History className="h-3 w-3 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
          {logText ? 'Autosave not active. Click SAVE to sync.' : 'Ready for your workout input'}
        </p>
      </div>
    </div>
  );
}
