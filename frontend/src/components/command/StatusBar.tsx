import { useEffect, useState } from "react";
import { Shield, Activity, Clock, Eye, Wifi, AlertTriangle, Radio } from "lucide-react";

const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-10 bg-mc-surface border-b border-mc-panel-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: Logo + System */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-mc-cyan" />
          <span className="font-mono text-xs font-bold text-mc-cyan tracking-wider">SENTINEL</span>
          <span className="font-mono text-[9px] text-muted-foreground px-1.5 py-0.5 bg-mc-panel border border-mc-panel-border">v2.1.0</span>
        </div>

        <div className="w-px h-5 bg-mc-panel-border" />

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-mc-green animate-pulse" />
          <span className="font-mono text-[10px] text-mc-green font-semibold">SYSTEM OPERATIONAL</span>
        </div>
      </div>

      {/* Center: Key Metrics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-mc-red" />
          <span className="font-mono text-[10px] text-mc-red font-bold">2 ACTIVE INCIDENTS</span>
        </div>

        <div className="w-px h-5 bg-mc-panel-border" />

        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-mc-amber" />
          <span className="font-mono text-[10px] text-mc-amber font-semibold">3 ALERTS</span>
        </div>

        <div className="w-px h-5 bg-mc-panel-border" />

        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-mc-cyan" />
          <span className="font-mono text-[10px] text-foreground">AVG RESPONSE: <span className="text-mc-green font-bold">1.2s</span></span>
        </div>

        <div className="w-px h-5 bg-mc-panel-border" />

        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-mc-green" />
          <span className="font-mono text-[10px] text-foreground">RESPONDERS: <span className="text-mc-green font-bold">8</span> ON DUTY</span>
        </div>
      </div>

      {/* Right: Time + Privacy */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-mc-green-dim border border-mc-green/20">
          <Eye className="w-3 h-3 text-mc-green" />
          <span className="font-mono text-[9px] text-mc-green font-semibold">PRIVACY MODE: ON</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-mc-green" />
          <span className="font-mono text-[10px] text-muted-foreground">24 CAM</span>
        </div>

        <div className="w-px h-5 bg-mc-panel-border" />

        <span className="font-mono text-[11px] text-foreground font-semibold tabular-nums">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          {time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
