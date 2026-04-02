import { BottomNav } from '@/components/fitstride/BottomNav';
import { Header } from '@/components/fitstride/Header';
import { AppGuide } from '@/components/fitstride/AppGuide';
import { AdBanner } from '@/components/fitstride/AdBanner';
import { ScrollHelper } from '@/components/fitstride/ScrollHelper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-svh w-full max-w-md mx-auto bg-background relative shadow-2xl overflow-hidden border-x border-border/10 overscroll-none">
      <Header />
      <main className="flex-1 momentum-scroll no-scrollbar relative bg-background pb-12">
        {children}
      </main>
      <ScrollHelper />
      <AdBanner />
      <BottomNav />
      <AppGuide />
    </div>
  );
}
