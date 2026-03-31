'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Mail, AlertCircle, RefreshCw, Smartphone, Heart } from "lucide-react";
import Link from 'next/link';

export default function HelpPage() {
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
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic leading-none">HELP & SUPPORT</h2>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">GET ASSISTANCE</p>
        </div>
      </div>

      {/* Intro */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="h-20 w-20 flex items-center justify-center bg-primary/20 rounded-[1.8rem] mb-6 border-2 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <HelpCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-primary italic uppercase leading-none">NEED HELP? WE GOT YOU.</h1>
        <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed italic">
          Don't let technical issues stop your gains. We're here to help you stay on track.
        </p>
      </div>

      {/* Content Cards */}
      <div className="space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 italic text-primary">
              <AlertCircle className="h-5 w-5" />
              COMMON HELP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-muted/20">
              <RefreshCw className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">APP NOT SAVING DATA</p>
                <p className="text-xs font-black uppercase italic tracking-tight">RESTART THE APP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-muted/20">
              <Smartphone className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">SUGGESTIONS NOT SHOWING</p>
                <p className="text-xs font-black uppercase italic tracking-tight">UPDATE YOUR WORKOUT LIST</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-muted/20">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">SLOW PERFORMANCE</p>
                <p className="text-xs font-black uppercase italic tracking-tight">CHECK INTERNET OR CLEAR CACHE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
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
              Facing other issues or want new features? We respond as soon as possible.
            </p>
            <Link href="mailto:jataleuday2@gmail.com">
              <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs bg-black/20 hover:bg-black/30 border border-white/10 shadow-lg active:scale-95 transition-all">
                jataleuday2@gmail.com
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
