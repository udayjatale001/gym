'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";

export function Header() {
  const { user } = useUser();
  
  return (
    <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-40 border-b border-border/30">
      <div className="flex items-center gap-3">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid || 'user'}/100/100`} />
            <AvatarFallback className="font-black text-primary">FS</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="text-xl font-black text-primary tracking-tighter italic leading-none">FITSTRIDE</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
            {user ? `READY TO TRAIN` : 'GUEST MODE'}
          </p>
        </div>
      </div>
      <Link href="/dashboard/settings">
        <button className="h-11 w-11 rounded-2xl bg-white border-2 border-muted shadow-sm flex items-center justify-center active:scale-90 transition-all hover:bg-muted/50">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </Link>
    </header>
  );
}