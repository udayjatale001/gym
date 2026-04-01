'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCcw, Calendar, History, LogOut, User, Languages, Info, ChevronRight, ShieldCheck, HelpCircle, Dumbbell } from "lucide-react";
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Language, translations } from '@/lib/translations';
import Link from 'next/link';

export default function SettingsPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCycling, setIsCycling] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [mockUser, setMockUser] = useState<any>(null);

  useEffect(() => {
    // Check initial language
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLang(savedLang);

    // Load mock user
    const user = localStorage.getItem('gymbuddy_user');
    if (user) {
      setMockUser(JSON.parse(user));
    }
  }, []);

  const t = translations[lang];

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simulate elite logout
    setTimeout(() => {
      // Clear session persistence and user identity
      localStorage.removeItem('gymbuddy_user');
      localStorage.removeItem('fitstride_is_logged_in');
      
      // Reset Guide States for next login session (Full Purge Protocol)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('fitstride_has_seen_guide_')) {
          localStorage.removeItem(key);
        }
      });

      toast({
        title: "Session Terminated",
        description: "Your training discipline has been archived.",
      });
      router.replace('/login');
    }, 600);
  };

  const handleResetCycle = async () => {
    setIsCycling(true);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    try {
      localStorage.setItem('fitstride_cycle_start', todayStr);
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
    <div className="p-4 space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 no-scrollbar bg-background min-h-svh">
      <div className="flex items-center gap-4 pt-6 px-1">
        <div className="h-12 w-12 rounded-[1.25rem] bg-primary flex items-center justify-center text-black shadow-lg rotate-3 border-b-4 border-black/20">
          <User className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">{t.settings}</h2>
          <p className="text-[9px] text-white/40 font-black uppercase tracking-widest opacity-60">Control Center</p>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-white">
            <User className="h-5 w-5 text-primary" />
            {t.account}
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary italic">
            {mockUser?.name || 'TRAINING'} • {mockUser?.email || 'WARRIOR'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/5 border border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <div className="space-y-0.5">
                <p className="text-sm font-black uppercase italic tracking-tight text-white">{t.hindiMode}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">BILINGUAL STRENGTH</p>
              </div>
            </div>
            <Switch 
              checked={lang === 'hi'} 
              onCheckedChange={(checked) => {
                const newLang = checked ? 'hi' : 'en';
                setLang(newLang);
                localStorage.setItem('language', newLang);
                window.location.reload();
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <Button 
            variant="outline" 
            className="w-full h-16 rounded-[1.5rem] gap-3 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 font-black uppercase italic tracking-widest text-xs active:scale-95 transition-all" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            {t.signOut}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-white">
            <History className="h-5 w-5 text-primary" />
            {t.workoutPreferences}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">{t.pplCycleReset}</h4>
            <Button 
              variant="outline" 
              className="w-full h-16 rounded-[1.5rem] gap-3 font-black uppercase italic tracking-widest text-xs border border-white/10 bg-white/5 text-white active:scale-95 transition-all" 
              onClick={handleResetCycle}
              disabled={isCycling}
            >
              {isCycling ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Calendar className="h-5 w-5" />}
              {t.setTodayDay1}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-primary">
            <Info className="h-5 w-5" />
            APP INFO
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Link href="/dashboard/settings/about">
            <Button variant="outline" className="w-full h-20 rounded-[1.5rem] justify-between px-8 border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-left gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Dumbbell className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-black uppercase italic tracking-tight text-white">ABOUT MY GYM BUDDY</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">Version 1.0.0</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/20" />
            </Button>
          </Link>

          <Link href="/dashboard/settings/privacy">
            <Button variant="outline" className="w-full h-20 rounded-[1.5rem] justify-between px-8 border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-left gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-black uppercase italic tracking-tight text-white">PRIVACY POLICY</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">YOUR DATA SAFETY</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/20" />
            </Button>
          </Link>

          <Link href="/dashboard/settings/help">
            <Button variant="outline" className="w-full h-20 rounded-[1.5rem] justify-between px-8 border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-left gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><HelpCircle className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-black uppercase italic tracking-tight text-white">HELP & SUPPORT</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">GET ASSISTANCE</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/20" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}