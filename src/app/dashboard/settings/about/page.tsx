'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Star, Rocket, Lightbulb, User, Mail, Heart } from "lucide-react";
import Link from 'next/link';

const DisciplineLogoLarge = () => (
  <div className="h-20 w-20 flex items-center justify-center bg-primary rounded-[1.8rem] shadow-2xl rotate-3 border-b-8 border-black/20 mb-6">
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="h-12 w-12 text-white" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  </div>
);

export default function AboutPage() {
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
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">ABOUT APP</h2>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">MY GYM BUDDY STORY</p>
        </div>
      </div>

      {/* Brand Section */}
      <div className="flex flex-col items-center text-center px-4">
        <DisciplineLogoLarge />
        <h1 className="text-4xl font-black tracking-tighter text-primary italic uppercase leading-none">MY GYM BUDDY</h1>
        <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed max-w-xs">
          Your personal fitness companion designed to make your gym journey simple, structured, and effective.
        </p>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-6">
        {/* Features Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-primary">
              <Rocket className="h-5 w-5" />
              WHAT THIS APP DOES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {[
              { text: "Track your daily workouts and progress", icon: "📊" },
              { text: "Organize training days like Push, Pull, Legs", icon: "🏋️‍♂️" },
              { text: "Save your exercises for effortless recall", icon: "⏱️" },
              { text: "Help you stay disciplined and consistent", icon: "✅" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-muted/20">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <p className="text-xs font-black uppercase italic tracking-tight opacity-80">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Why Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-primary">
              <Lightbulb className="h-5 w-5" />
              WHY MY GYM BUDDY?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 leading-relaxed">
            <p className="text-sm font-medium text-muted-foreground italic">
              Building a strong body requires consistency, planning, and tracking. This app is made to remove confusion and help you focus only on what matters — <span className="text-primary font-black uppercase tracking-tighter">YOUR PROGRESS 💯</span>
            </p>
          </CardContent>
        </Card>

        {/* Developer Section */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic">
              <User className="h-5 w-5" />
              DEVELOPER
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">PROUDLY DEVELOPED BY</p>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">UDAY JATALE</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-primary">
              <Mail className="h-5 w-5" />
              CONTACT & SUGGESTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <p className="text-xs font-medium text-muted-foreground opacity-80">
              For updates, suggestions, or improvements, feel free to reach out:
            </p>
            <Link href="mailto:jataleuday2@gmail.com">
              <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs bg-primary shadow-lg active:scale-95 transition-all">
                jataleuday2@gmail.com
              </Button>
            </Link>
            <p className="text-[10px] text-center font-black uppercase tracking-[0.3em] opacity-40">
              Your feedback helps make this app better 🙌
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 pt-6">
        <Heart className="h-6 w-6 text-primary animate-pulse fill-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">STAY CONSISTENT. STAY STRONG.</p>
      </div>
    </div>
  );
}
