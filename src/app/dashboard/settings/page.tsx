
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, RefreshCcw, Calendar, History, LogOut, User } from "lucide-react";
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, collection, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function SettingsPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isResetting, setIsResetting] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not sign out. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleResetCycle = async () => {
    if (!user || !db) return;
    setIsCycling(true);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    try {
      await setDoc(doc(db, 'users', user.uid), { 
        workoutStartDate: todayStr 
      }, { merge: true });
      
      toast({
        title: "Workout Cycle Reset",
        description: "Your PPL cycle has been restarted from today (Day 1: Push).",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset workout cycle.",
      });
    } finally {
      setIsCycling(false);
    }
  };

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
        goal: "",
        workoutStartDate: format(new Date(), 'yyyy-MM-dd')
      });

      // 2. Clear subcollections
      const subcollections = ['weightLogs', 'workoutLogs', 'mealLogs', 'workoutSplits'];
      
      for (const sub of subcollections) {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, sub));
        querySnapshot.forEach((document) => {
          batch.delete(doc(db, 'users', user.uid, sub, document.id));
        });
      }

      await batch.commit();
      
      toast({
        title: "System Reset Complete",
        description: "All your fitness and diet data has been permanently cleared.",
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
    <div className="p-4 space-y-6 pb-24">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-xs text-muted-foreground">Manage your account and data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account
          </CardTitle>
          <CardDescription>Logged in as {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full gap-2 border-primary/20 hover:bg-primary/5" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Workout Preferences
          </CardTitle>
          <CardDescription>Adjust your workout cycle timing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-bold">PPL Cycle Reset</h4>
            <p className="text-xs text-muted-foreground">
              Restarts your Push-Pull-Legs split from Today (makes today Day 1).
            </p>
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={handleResetCycle}
              disabled={isCycling}
            >
              {isCycling ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Set Today as Day 1
            </Button>
          </div>
        </CardContent>
      </Card>

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
              Deletes all weight logs, diet logs, and workout history.
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
