import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="h-14 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sentinel-green-soft text-sentinel-green">
              System Online
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 border border-border">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-36"
          />
          <kbd className="hidden lg:inline text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-sentinel-red rounded-full animate-pulse" />
        </button>

        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sentinel-blue to-sentinel-cyan flex items-center justify-center cursor-pointer">
          <span className="text-xs font-semibold text-primary-foreground">A</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
