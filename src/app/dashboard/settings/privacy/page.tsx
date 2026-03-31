'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, CheckCircle2, Heart } from "lucide-react";
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="p-4 space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-4 pt-6 px-1">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1.25rem] border-2 border-muted active:scale-90 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">PRIVACY</h2>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">DATA PROTECTION</p>
        </div>
      </div>

      {/* Intro */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="h-20 w-20 flex items-center justify-center bg-primary/20 rounded-[1.8rem] mb-6 border-2 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-primary italic uppercase leading-none">YOUR PRIVACY MATTERS</h1>
        <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed italic">
          My Gym Buddy is built on trust. Your workout data is your own, and we treat it with the respect it deserves.
        </p>
      </div>

      {/* Content Cards */}
      <div className="space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-primary">
              <Lock className="h-5 w-5" />
              WHAT WE COLLECT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl bg-muted/30 border-2 border-muted/20">
              <p className="text-xs font-black uppercase italic tracking-tight opacity-80">
                - BASIC WORKOUT DATA (EXERCISES, SETS, REPS)
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border-2 border-muted/20">
              <p className="text-xs font-black uppercase italic tracking-tight opacity-80">
                - APP USAGE FOR IMPROVING PERFORMANCE
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-destructive">
              <EyeOff className="h-5 w-5" />
              WHAT WE DON'T COLLECT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl bg-destructive/5 border-2 border-destructive/10">
              <p className="text-xs font-black uppercase italic tracking-tight opacity-80">
                - NO PASSWORDS OR SENSITIVE PERSONAL INFO
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-destructive/5 border-2 border-destructive/10">
              <p className="text-xs font-black uppercase italic tracking-tight opacity-80">
                - NO UNNECESSARY TRACKING
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic">
              <CheckCircle2 className="h-5 w-5" />
              DATA SAFETY
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm font-black uppercase italic tracking-tight leading-relaxed">
              Your data is kept <span className="underline decoration-white/40">सुरक्षित (SAFE)</span> and is not shared with any third party. Ever.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 pt-6">
        <Heart className="h-6 w-6 text-primary animate-pulse fill-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">STAY CONSISTENT. STAY SECURE.</p>
      </div>
    </div>
  );
}
