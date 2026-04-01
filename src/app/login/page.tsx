'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Home } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('fitstride_is_logged_in') === 'true';
    if (isLoggedIn) router.replace('/dashboard');
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast({ variant: "destructive", title: "Gmail Required", description: "Please use your @gmail.com address." });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const mockUser = { name: email.split('@')[0].toUpperCase(), email: email.toLowerCase(), joined: new Date().toISOString() };
      localStorage.setItem('gymbuddy_user', JSON.stringify(mockUser));
      localStorage.setItem('fitstride_is_logged_in', 'true');
      router.push('/dashboard');
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center p-6 bg-black">
      <div className="w-full max-w-sm space-y-6 flex flex-col items-center">
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-primary italic uppercase leading-none">GYMBUDDY!</h1>
          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">DISCIPLINE MODE</p>
        </div>
        <Card className="w-full border border-white/5 rounded-2xl bg-white/5 overflow-hidden">
          <CardHeader className="pt-8 px-8 pb-4">
            <CardTitle className="text-xl font-black italic uppercase text-white">Login</CardTitle>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-8">
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase opacity-30">Email</Label>
                <Input type="email" placeholder="name@gmail.com" required className="h-12 border-white/10 bg-white/5 text-white rounded-xl focus:ring-primary text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase opacity-30">Password</Label>
                <Input type="password" placeholder="••••••••" required className="h-12 border-white/10 bg-white/5 text-white rounded-xl focus:ring-primary text-base" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-8">
              <Button type="submit" className="w-full h-14 font-black text-lg uppercase italic rounded-xl bg-primary text-black" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CONFIRM ACCESS'}
              </Button>
              <div className="text-[10px] text-center text-white/30 font-black uppercase tracking-widest space-y-3">
                <p>NO ACCOUNT? <Link href="/signup" className="text-primary">JOIN SQUAD</Link></p>
                <div className="h-px w-full bg-white/5" />
                <Link href="/dashboard" className="text-white/20">BYPASS TO HOME</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}