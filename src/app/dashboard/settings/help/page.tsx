'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, Mail, AlertCircle, RefreshCw, Smartphone, Heart, Flame, Scale, Utensils, Dumbbell, Activity, Calendar } from "lucide-react";
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="p-4 space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 no-scrollbar bg-background min-h-svh">
      {/* Header */}
      <div className="flex items-center gap-4 pt-6 px-1">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1.25rem] border-2 border-muted active:scale-90 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">COMMAND MANUAL</h2>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">MASTER THE DISCIPLINE</p>
        </div>
      </div>

      {/* Intro */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="h-20 w-20 flex items-center justify-center bg-primary/20 rounded-[1.8rem] mb-6 border-2 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <HelpCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-primary italic uppercase leading-none">ELITE OPERATIONS</h1>
        <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed italic">
          Welcome to the Command Center. Follow this manual to optimize your transformation cycle.
        </p>
      </div>

      {/* Detailed Manual Sections */}
      <div className="space-y-8">
        <Accordion type="single" collapsible className="w-full space-y-4">
          
          <AccordionItem value="analytics" className="border-none">
            <Card className="bg-card border-none shadow-xl rounded-[2rem] overflow-hidden">
              <AccordionTrigger className="px-6 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Flame className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black uppercase italic tracking-tighter">ANALYTICS HUB (CALORIES)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-xs font-medium text-muted-foreground leading-relaxed space-y-4">
                <p>The Analytics Hub is your daily energy command. It uses a <span className="text-primary font-black">CUMULATIVE PROTOCOL</span>.</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li><span className="text-foreground font-bold">Additive Logic</span>: Adding 100 then 500 kcal will sum to 600 kcal automatically.</li>
                  <li><span className="text-destructive font-bold">Overload Protocol</span>: If you exceed your target, the ring turns Neon Red to signal a caloric surplus.</li>
                  <li><span className="text-foreground font-bold">Elite Calendar (🗓️)</span>: Tap this to see your 30-Day Energy Protocol. You can view or log intake for any day in your current cycle.</li>
                </ul>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="training" className="border-none">
            <Card className="bg-card border-none shadow-xl rounded-[2rem] overflow-hidden">
              <AccordionTrigger className="px-6 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black uppercase italic tracking-tighter">TRAINING COMMAND (PPL)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-xs font-medium text-muted-foreground leading-relaxed space-y-4">
                <p>Training is managed via the <span className="text-primary font-black">PPL ROTATION SYSTEM</span>.</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li><span className="text-foreground font-bold">Auto-Rotation</span>: The dashboard cycles through Push, Pull, and Legs every midnight based on your Start Date.</li>
                  <li><span className="text-foreground font-bold">Session Recall</span>: Use the "Recall Previous" button while logging to clone your last session's exercises instantly.</li>
                  <li><span className="text-primary font-bold">Heat Check (🥵)</span>: Inside any workout log, tap the emoji to see estimated calories burned based on total volume.</li>
                </ul>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="strides" className="border-none">
            <Card className="bg-card border-none shadow-xl rounded-[2rem] overflow-hidden">
              <AccordionTrigger className="px-6 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black uppercase italic tracking-tighter">STRIDE TRACKERS</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-xs font-medium text-muted-foreground leading-relaxed space-y-4">
                <p>Optimize recovery and mobility with <span className="text-primary font-black">ACTIVE STRIDES</span>.</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li><span className="text-foreground font-bold">Sleep Stride</span>: Log Bedtime/Wake Time. The app flags "OPTIMAL" if you hit 8+ hours.</li>
                  <li><span className="text-foreground font-bold">Hydration Stride</span>: Log 250ml units. Aim for 4.0L daily.</li>
                  <li><span className="text-foreground font-bold">Midnight Reset</span>: Every midnight, your Daily Strides (Water, Steps, Calories) reset to 0 to keep the mission fresh.</li>
                </ul>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="diet" className="border-none">
            <Card className="bg-card border-none shadow-xl rounded-[2rem] overflow-hidden">
              <AccordionTrigger className="px-6 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black uppercase italic tracking-tighter">DIET PROTOCOL</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-xs font-medium text-muted-foreground leading-relaxed space-y-4">
                <p>Maintain meal consistency via the <span className="text-primary font-black">DIET LOG</span>.</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li><span className="text-foreground font-bold">30-Day Grid</span>: Each meal (e.g., Lunch) has a grid. Mark "Taken" or "Skipped" to track adherence.</li>
                  <li><span className="text-primary font-bold">Market Trend</span>: Tap the 📈 icon in a meal's grid to see portion size trends over the month.</li>
                </ul>
              </AccordionContent>
            </Card>
          </AccordionItem>

        </Accordion>

        {/* Support Section */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic">
              <Mail className="h-5 w-5" />
              CONTACT SUPPORT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <p className="text-xs font-black uppercase italic tracking-tight leading-relaxed">
              Facing issues or want new features? We respond as soon as possible.
            </p>
            <Link href="mailto:gymbuddy009@gmail.com">
              <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs bg-black/20 hover:bg-black/30 border border-white/10 shadow-lg active:scale-95 transition-all">
                gymbuddy009@gmail.com
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 pt-6">
        <Heart className="h-6 w-6 text-primary animate-pulse fill-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">TRAIN SMART. STAY CONSISTENT.</p>
      </div>
    </div>
  );
}