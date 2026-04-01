'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const DisciplineLogoSignup = () => (
  <div className="mx-auto h-16 w-16 flex items-center justify-center bg-primary rounded-[1.5rem] shadow-2xl rotate-3 border-b-8 border-black/20 mb-4 shrink-0">
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="h-10 w-10 text-white" 
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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('fitstride_is_logged_in') === 'true';
    if (isLoggedIn) router.replace('/dashboard');
  }, [router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast({
        variant: "destructive",
        title: "Invalid Access",
        description: "Please use a valid @gmail.com address.",
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const mockUser = {
        name: name.trim().toUpperCase(),
        email: email.toLowerCase(),
        joined: new Date().toISOString()
      };
      
      // Save identity and engagement status
      localStorage.setItem('gymbuddy_user', JSON.stringify(mockUser));
      localStorage.setItem('fitstride_is_logged_in', 'true');
      
      toast({ title: "Discipline Initiated!", description: `Welcome to the squad, ${mockUser.name}` });
      router.push('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center p-4 bg-[#000000] overflow-hidden">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500 flex flex-col">
        <div className="flex justify-between items-center px-1">
          <Link href="/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary gap-1 transition-all">
            <ArrowLeft className="h-4 w-4" />
            BACK
          </Link>
          <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary gap-1 transition-all">
            <Home className="h-3.5 w-3.5" />
            HOME
          </Link>
        </div>

        <div className="text-center space-y-2">
          <DisciplineLogoSignup />
          <h1 className="text-3xl font-black text-primary uppercase italic tracking-tighter leading-none">JOIN THE SQUAD</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-60">GYMBUDDY! REGISTRY</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/10 backdrop-blur-xl border border-white/5 overflow-hidden">
          <CardHeader className="pt-8 px-8 pb-4">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Register</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-2">Enroll for Discipline</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-40">Full Name</Label>
                <Input
                  id="name"
                  placeholder="JOHN DOE"
                  required
                  className="h-14 font-bold border-2 border-white/5 bg-white/5 text-white rounded-2xl focus:ring-primary focus:border-primary transition-all uppercase text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="NAME@GMAIL.COM"
                  required
                  className="h-14 font-bold border-2 border-white/5 bg-white/5 text-white rounded-2xl focus:ring-primary focus:border-primary transition-all uppercase text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest opacity-40">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-14 font-bold border-2 border-white/5 bg-white/5 text-white rounded-2xl focus:ring-primary focus:border-primary transition-all text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="p-8">
              <Button 
                type="submit" 
                className="w-full h-16 font-black text-xl uppercase italic rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.2)] bg-primary text-black hover:bg-primary/90 active:scale-95 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : 'INITIALIZE'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
