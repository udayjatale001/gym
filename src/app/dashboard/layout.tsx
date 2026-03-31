import { BottomNav } from '@/components/fitstride/BottomNav';
import { Header } from '@/components/fitstride/Header';
import { AppGuide } from '@/components/fitstride/AppGuide';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-svh max-w-md mx-auto bg-background relative shadow-2xl overflow-hidden border-x border-border/10 overscroll-none">
      <Header />
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-background momentum-scroll">
        {children}
      </main>
      <BottomNav />
      <AppGuide />
    </div>
  );
}
