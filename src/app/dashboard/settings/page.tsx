'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCcw, Calendar, History, LogOut, User, Moon, Sun, Languages } from "lucide-react";
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 no-scrollbar">
      <div className="flex items-center gap-4 pt-6 px-1">
        <div className="h-12 w-12 rounded-[1.25rem] bg-primary flex items-center justify-center text-primary-foreground shadow-lg rotate-3 border-b-4 border-black/20">
          <User className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">{t.settings}</h2>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Control Center</p>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic">
            <User className="h-5 w-5 text-primary" />
            {t.account}
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-muted/30 border-2 border-muted/50 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <div className="space-y-0.5">
                <p className="text-sm font-black uppercase italic tracking-tight">{t.darkMode}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-40">Elite Interface</p>
              </div>
            </div>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Hindi Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-muted/30 border-2 border-muted/50 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <div className="space-y-0.5">
                <p className="text-sm font-black uppercase italic tracking-tight">{t.hindiMode}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-40">Global Reach</p>
              </div>
            </div>
            <Switch 
              checked={lang === 'hi'} 
              onCheckedChange={toggleLanguage}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <Button 
            variant="outline" 
            className="w-full h-16 rounded-[1.5rem] gap-3 border-2 border-primary/20 hover:bg-primary/5 font-black uppercase italic tracking-widest text-xs active:scale-95 transition-all shadow-md" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            {t.signOut}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic">
            <History className="h-5 w-5 text-primary" />
            {t.workoutPreferences}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-1">{t.pplCycleReset}</h4>
            <Button 
              variant="outline" 
              className="w-full h-16 rounded-[1.5rem] gap-3 font-black uppercase italic tracking-widest text-xs border-2 active:scale-95 transition-all shadow-md" 
              onClick={handleResetCycle}
              disabled={isCycling}
            >
              {isCycling ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Calendar className="h-5 w-5" />}
              {t.setTodayDay1}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
