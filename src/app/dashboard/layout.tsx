
import { BottomNav } from '@/components/fitstride/BottomNav';
import { Header } from '@/components/fitstride/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-svh max-w-md mx-auto bg-background relative shadow-xl overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
