import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Search, Play, Pause, Clock, Lock, Maximize2, Minimize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  app_name?: string;
  facility_name?: string;
  role_name?: string;
  live_state?: boolean;
  last_updated_at?: Date;
  onLiveToggle?: () => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showLiveToggle?: boolean;
  focusMode?: boolean;
  onFocusToggle?: () => void;
}

const navItems = [
  { path: "/console/ops", label: "Ops Center" },
  { path: "/console/privacy", label: "Privacy & Data Controls" },
  { path: "/console/responder", label: "Responder Console" },
];

const TopBar = ({
  app_name = "SENTINEL",
  facility_name = "FACILITY A",
  role_name = "Operator",
  live_state = true,
  last_updated_at = new Date(),
  onLiveToggle,
  onSearch,
  showSearch = true,
  showLiveToggle = true,
  focusMode = false,
  onFocusToggle,
}: TopBarProps) => {
  const [time, setTime] = useState(new Date());
  const [query, setQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="h-10 bg-mc-surface border-b border-mc-panel-border flex items-center justify-between px-4 flex-shrink-0"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-mc-cyan" aria-hidden />
          <span className="font-mono text-xs font-bold text-mc-cyan tracking-wider">{app_name}</span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "font-mono text-[10px] px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-mc-cyan focus:ring-offset-2 focus:ring-offset-background",
                location.pathname === item.path
                  ? "bg-mc-cyan/20 text-mc-cyan font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-mc-surface"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="w-px h-5 bg-mc-panel-border" />

        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground">{facility_name}</span>
          <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 bg-mc-cyan/10 border border-mc-cyan/30 text-mc-cyan uppercase tracking-wide">
            {role_name}
          </span>
        </div>

        {/* Privacy status chip */}
        <Link
          to="/console/privacy"
          className="flex items-center gap-1 font-mono text-[8px] px-1.5 py-0.5 bg-mc-green/10 border border-mc-green/30 text-mc-green hover:bg-mc-green/20 transition-colors"
          title="Privacy controls"
        >
          <Lock className="w-2.5 h-2.5" />
          Privacy: OFF
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative w-44">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search incidents"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch?.(query)}
              className="h-7 pl-7 text-[10px] bg-mc-panel border-mc-panel-border"
              aria-label="Search incidents"
            />
          </div>
        )}

        {showLiveToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLiveToggle}
            className={cn(
              "h-7 px-2 font-mono text-[9px] gap-1",
              live_state ? "text-mc-green" : "text-muted-foreground"
            )}
            aria-pressed={live_state}
            aria-label={live_state ? "Live" : "Paused"}
          >
            {live_state ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {live_state ? "Live" : "Paused"}
          </Button>
        )}

        {onFocusToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFocusToggle}
            className={cn(
              "h-7 px-2 font-mono text-[9px] gap-1",
              focusMode ? "text-mc-amber border border-mc-amber/30 bg-mc-amber/10" : "text-muted-foreground"
            )}
            title={focusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            {focusMode ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            {focusMode ? "Exit Focus" : "Focus"}
          </Button>
        )}

        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" aria-hidden />
          <span className="font-mono text-[10px] font-semibold tabular-nums">
            {last_updated_at.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>

        <div className="w-px h-5 bg-mc-panel-border" />

        <span className="font-mono text-[11px] font-semibold tabular-nums">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          {time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase()}
        </span>
      </div>
    </header>
  );
};

export default TopBar;
