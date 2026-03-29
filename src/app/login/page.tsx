'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';

const DisciplineLogoLarge = () => (
  <div className="mx-auto h-16 w-16 flex items-center justify-center bg-primary rounded-[1.5rem] shadow-2xl rotate-3 border-b-8 border-black/20 mb-4">
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
      toast({
        title: "Discipline Engaged!",
        description: "Welcome back to GymBuddy!.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Invalid credentials. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <DisciplineLogoLarge />
          <h1 className="text-4xl font-black tracking-tighter text-primary italic uppercase">GYMBUDDY!</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-60">DISCIPLINE MODE</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Login</CardTitle>
            <CardDescription className="text-xs uppercase font-bold tracking-widest opacity-60">Identity Verification</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-14 font-bold border-2 rounded-2xl shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest opacity-40">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 font-bold border-2 rounded-2xl shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 p-8">
              <Button type="submit" className="w-full h-16 font-black text-xl uppercase italic rounded-2xl shadow-xl active:scale-95 transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : 'CONFIRM ACCESS'}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest">
                NO ACCOUNT?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  JOIN THE SQUAD
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
