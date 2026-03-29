
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle, RefreshCcw, Calendar, History, LogOut, User, Moon, Sun, Languages } from "lucide-react";
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, collection, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Language, translations } from '@/lib/translations';

export default function SettingsPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isResetting, setIsResetting] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
    // Check initial language
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang];

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = (checked: boolean) => {
    const newLang = checked ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
    window.location.reload(); // Reload to apply changes globally
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
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
        title: lang === 'hi' ? "वर्कआउट चक्र रीसेट" : "Workout Cycle Reset",
        description: lang === 'hi' ? "आपका PPL चक्र आज से फिर से शुरू हो गया है।" : "Your PPL cycle has been restarted from today.",
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

      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        currentWeight: 0,
        targetWeight: 0,
        goal: "",
        workoutStartDate: format(new Date(), 'yyyy-MM-dd')
      });

      const subcollections = ['weightLogs', 'workoutLogs', 'mealLogs', 'workoutSplits'];
      
      for (const sub of subcollections) {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, sub));
        querySnapshot.forEach((document) => {
          batch.delete(doc(db, 'users', user.uid, sub, document.id));
        });
      }

      await batch.commit();
      
      toast({
        title: lang === 'hi' ? "सिस्टम रीसेट पूरा हुआ" : "System Reset Complete",
        description: lang === 'hi' ? "आपका सारा डेटा साफ़ कर दिया गया है।" : "All your fitness and diet data has been permanently cleared.",
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
        <h2 className="text-xl font-bold">{t.settings}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t.account}
          </CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-muted">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <div className="space-y-0.5">
                <p className="text-sm font-bold">{t.darkMode}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Elite Interface</p>
              </div>
            </div>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleTheme}
            />
          </div>

          {/* Hindi Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-muted">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <div className="space-y-0.5">
                <p className="text-sm font-bold">{t.hindiMode}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Global Reach</p>
              </div>
            </div>
            <Switch 
              checked={lang === 'hi'} 
              onCheckedChange={toggleLanguage}
            />
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl gap-2 border-primary/20 hover:bg-primary/5 font-bold" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {t.signOut}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {t.workoutPreferences}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-bold">{t.pplCycleReset}</h4>
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl gap-2 font-bold" 
              onClick={handleResetCycle}
              disabled={isCycling}
            >
              {isCycling ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              {t.setTodayDay1}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-lg">{t.dangerZone}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold">{t.fullSystemReset}</h4>
            <Button 
              variant="destructive" 
              className="w-full h-14 rounded-2xl gap-2 font-bold" 
              onClick={handleFullReset}
              disabled={isResetting}
            >
              {isResetting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {t.clearAllData}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
