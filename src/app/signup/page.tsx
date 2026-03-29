'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const DisciplineLogoSignup = () => (
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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Validation Error", description: "Passwords do not match." });
      return;
    }
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: name,
        email: email,
        currentWeight: 0,
        targetWeight: 0,
        createdAt: new Date().toISOString()
      });

      router.push('/dashboard');
      toast({
        title: "Discipline Initiated!",
        description: "Welcome to GymBuddy!.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not create account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <Link href="/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          BACK TO LOGIN
        </Link>

        <div className="text-center space-y-2">
          <DisciplineLogoSignup />
          <h1 className="text-3xl font-black text-primary uppercase italic tracking-tighter">JOIN THE SQUAD</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-60">GYMBUDDY! REGISTRY</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Register</CardTitle>
            <CardDescription className="text-xs uppercase font-bold tracking-widest opacity-60">Enroll for Discipline</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-40">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="h-14 font-bold border-2 rounded-2xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-14 font-bold border-2 rounded-2xl"
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
                  className="h-14 font-bold border-2 rounded-2xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest opacity-40">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 font-bold border-2 rounded-2xl"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="p-8">
              <Button type="submit" className="w-full h-16 font-black text-xl uppercase italic rounded-2xl shadow-xl active:scale-95 transition-all" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : 'INITIALIZE'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
