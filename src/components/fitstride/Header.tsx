
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src="https://picsum.photos/seed/user123/100/100" />
          <AvatarFallback>FS</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-bold text-primary leading-none">FitStride</h1>
          <p className="text-xs text-muted-foreground">Keep pushing, Rahul!</p>
        </div>
      </div>
      <button className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </button>
    </header>
  );
}
