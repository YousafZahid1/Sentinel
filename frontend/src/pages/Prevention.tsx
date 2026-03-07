import { useState } from "react";
import TopBar from "@/components/sentinel/TopBar";
import EmptyStatePanel from "@/components/sentinel/EmptyStatePanel";
import { cn } from "@/lib/utils";

const nearMisses = [
  {
    id: "NM-001",
    risk_score: 78,
    risk_trend: [45, 52, 61, 78],
    location_name: "STAIRWELL A",
    detected_at: "02:15 ago",
    contributing_signals: ["crowd density", "velocity"],
    recommended_actions: [
      "Deploy temporary one-way flow signage in stairwell",
      "Stagger bell schedule to reduce simultaneous traffic",
      "Review camera angle to improve blind-corner visibility",
    ],
  },
  {
    id: "NM-002",
    risk_score: 62,
    risk_trend: [30, 42, 55, 62],
    location_name: "ENTRANCE LOBBY",
    detected_at: "05:42 ago",
    contributing_signals: ["aggression tone"],
    recommended_actions: [
      "Schedule de-escalation coverage at peak times",
      "Tune audio triggers to reduce false positives",
      "Place visible staff presence near queue bottlenecks",
    ],
  },
  {
    id: "NM-003",
    risk_score: 45,
    risk_trend: [20, 28, 38, 45],
    location_name: "CAFETERIA",
    detected_at: "12:30 ago",
    contributing_signals: ["spill proximity"],
    recommended_actions: [
      "Add additional matting around drink stations",
      "Increase spill-check frequency during lunch window",
      "Mark spill-prone tiles for resurfacing review",
    ],
  },
];

const topZones = [
  { zone_id: "z1", zone_name: "STAIRWELL A", risk_score: 78, risk_trend: "up" },
  { zone_id: "z2", zone_name: "ENTRANCE LOBBY", risk_score: 62, risk_trend: "up" },
  { zone_id: "z3", zone_name: "MAIN HALLWAY", risk_score: 55, risk_trend: "stable" },
  { zone_id: "z4", zone_name: "CAFETERIA", risk_score: 45, risk_trend: "down" },
];

const Prevention = () => {
  const [timeWindow, setTimeWindow] = useState<"1h" | "6h" | "24h">("24h");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar showSearch={false} />

      <div className="flex-1 flex min-h-0 p-4 gap-4">
        {/* Left: Heatmap + Legend */}
        <div className="flex-[1.2] flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <span className="mc-panel-label">Heatmap</span>
            <div className="flex gap-2">
              {(["1h", "6h", "24h"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setTimeWindow(w)}
                  className={cn(
                    "font-mono text-[9px] px-2 py-1 rounded border transition-all focus:outline-none focus:ring-2 focus:ring-mc-cyan",
                    timeWindow === w ? "bg-mc-cyan/20 border-mc-cyan/50 text-mc-cyan" : "border-mc-panel-border text-muted-foreground"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex-1 mc-panel border border-mc-panel-border overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, hsl(var(--mc-panel)) 0%, hsl(var(--mc-surface)) 50%, hsl(var(--mc-red) / 0.15) 100%)",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(var(--mc-cyan)/0.05) 20px, hsl(var(--mc-cyan)/0.05) 21px)",
            }} />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="font-mono text-[8px] text-muted-foreground">min_value: 0</span>
              <span className="font-mono text-[8px] text-muted-foreground">max_value: 100</span>
              <span className="font-mono text-[8px] text-muted-foreground">units: risk</span>
            </div>
          </div>
          <div className="flex items-center gap-4 px-2 py-1 bg-mc-surface border border-mc-panel-border rounded">
            <span className="font-mono text-[8px] text-muted-foreground uppercase">Heatmap Legend</span>
            <div className="flex gap-2">
              <span className="w-4 h-2 bg-mc-green/50" />
              <span className="w-4 h-2 bg-mc-amber/50" />
              <span className="w-4 h-2 bg-mc-red/50" />
            </div>
          </div>
        </div>

        {/* Right: Near-Miss Feed + Top Risky Zones */}
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-4">
          <div className="mc-panel flex-1 flex flex-col min-h-0">
            <div className="mc-panel-header flex items-center justify-between">
              <span className="mc-panel-label">Near-Miss Feed</span>
              <span className="font-mono text-[9px] text-muted-foreground">{nearMisses.length} total</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {nearMisses.map((nm) => (
                <div
                  key={nm.id}
                  className="p-3 bg-mc-surface border border-mc-panel-border hover:border-mc-cyan/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] font-bold">{nm.id}</span>
                    <span className={cn(
                      "font-mono text-[10px] font-bold",
                      nm.risk_score > 70 ? "text-mc-red" : nm.risk_score > 40 ? "text-mc-amber" : "text-mc-green"
                    )}>
                      {nm.risk_score}%
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2 items-end h-4">
                    {nm.risk_trend.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 min-w-[4px] bg-mc-amber/60 rounded-sm transition-all"
                        style={{ height: `${v}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">{nm.location_name}</span>
                    <span className="font-mono text-[8px] text-muted-foreground ml-2">{nm.detected_at}</span>
                  </div>
                  <div className="mt-2 border-t border-mc-panel-border/50 pt-1.5">
                    <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wide">
                      Potential actions
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {nm.recommended_actions.map((action) => (
                        <li key={action} className="font-mono text-[8px] text-foreground/75 flex gap-1">
                          <span className="text-mc-amber">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mc-panel flex flex-col">
            <div className="mc-panel-header">
              <span className="mc-panel-label">Top Risky Zones</span>
            </div>
            <div className="p-2 space-y-1">
              {topZones.map((z) => (
                <div
                  key={z.zone_id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                    selectedZone === z.zone_id && "bg-mc-cyan/10 border border-mc-cyan/30"
                  )}
                  onClick={() => setSelectedZone(selectedZone === z.zone_id ? null : z.zone_id)}
                >
                  <span className="font-mono text-[9px] font-semibold">{z.zone_name}</span>
                  <span className={cn(
                    "font-mono text-[9px] font-bold",
                    z.risk_score > 70 ? "text-mc-red" : "text-mc-amber"
                  )}>
                    {z.risk_score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prevention;
