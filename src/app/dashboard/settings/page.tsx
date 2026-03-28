
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, RefreshCcw } from "lucide-react";
import { useFirestore, useUser } from '@/firebase';
import { doc, deleteDoc, collection, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { db } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleFullReset = async () => {
    if (!user || !db) return;
    
    setIsResetting(true);
    try {
      const batch = writeBatch(db);

      // 1. Reset User Profile
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        currentWeight: 0,
        targetWeight: 0,
        goal: ""
      });

      // 2. Clear subcollections (Note: Client-side deletion for small collections)
      const subcollections = ['weightLogs', 'workoutLogs', 'dietLogs'];
      
      for (const sub of subcollections) {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, sub));
        querySnapshot.forEach((document) => {
          batch.delete(doc(db, 'users', user.uid, sub, document.id));
        });
      }

      await batch.commit();
      
      toast({
        title: "System Reset Complete",
        description: "All your fitness data has been permanently cleared.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Could not clear all data. Please try again.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-xs text-muted-foreground">Manage your account and data.</p>
      </div>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-lg">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold">Full System Reset</h4>
            <p className="text-xs text-muted-foreground">
              Deletes all weight logs, workouts, and diet history. Resets your profile goals to zero.
            </p>
            <Button 
              variant="destructive" 
              className="w-full gap-2" 
              onClick={handleFullReset}
              disabled={isResetting}
            >
              {isResetting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear All My Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
