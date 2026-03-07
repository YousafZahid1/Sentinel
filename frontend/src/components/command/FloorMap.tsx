import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, Camera, Navigation } from "lucide-react";
import { alerts } from "@/components/command/AlertStack";
import { getPinPositionForLocation, clampPinToFloorPlanBounds } from "@/lib/incidentMap";

interface MapIncident {
  id: string;
  type: "fall" | "fight" | "collision" | "spill" | "crowd";
  severity: "critical" | "warning" | "info";
  label: string;
  x: number;
  y: number;
  active: boolean;
}

interface MapZone {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cameras: number;
  risk: "high" | "medium" | "low" | "clear";
}

const zones: MapZone[] = [
  { id: "z1", name: "MAIN HALLWAY", x: 15, y: 25, w: 70, h: 12, cameras: 3, risk: "high" },
  { id: "z2", name: "ENTRANCE", x: 5, y: 5, w: 25, h: 18, cameras: 2, risk: "medium" },
  { id: "z3", name: "CAFETERIA", x: 55, y: 50, w: 35, h: 28, cameras: 2, risk: "clear" },
  { id: "z4", name: "STAIRWELL A", x: 38, y: 5, w: 10, h: 18, cameras: 1, risk: "medium" },
  { id: "z5", name: "WEST WING", x: 5, y: 50, w: 28, h: 28, cameras: 2, risk: "clear" },
  { id: "z6", name: "PARKING B", x: 55, y: 5, w: 35, h: 18, cameras: 2, risk: "clear" },
  { id: "z7", name: "SERVER RM", x: 35, y: 55, w: 15, h: 14, cameras: 1, risk: "clear" },
  { id: "z8", name: "ADMIN", x: 5, y: 82, w: 20, h: 13, cameras: 1, risk: "clear" },
  { id: "z9", name: "MED OFFICE", x: 30, y: 82, w: 20, h: 13, cameras: 1, risk: "clear" },
];

const incidents: MapIncident[] = [
  { id: "i1", type: "fall", severity: "critical", label: "FALL DETECTED", x: 45, y: 30, active: true },
  { id: "i2", type: "fight", severity: "warning", label: "AGGRESSION", x: 15, y: 12, active: true },
  { id: "i3", type: "collision", severity: "warning", label: "COLLISION RISK", x: 42, y: 14, active: true },
  { id: "i4", type: "spill", severity: "info", label: "WET FLOOR", x: 70, y: 62, active: false },
];

const responderPins = [
  { id: "rp1", name: "Davis", x: 42, y: 28, role: "Security" },
  { id: "rp2", name: "Kim", x: 35, y: 80, role: "Medical" },
  { id: "rp3", name: "Martinez", x: 20, y: 50, role: "Security" },
];

/** When using floor plan, clamp responder positions inside outline bounds. */
function clampResponderPins(hasFloorPlan: boolean): typeof responderPins {
  if (!hasFloorPlan) return responderPins;
  return responderPins.map((rp) => {
    const c = clampPinToFloorPlanBounds(rp.x, rp.y);
    return { ...rp, x: c.x, y: c.y };
  });
}

const riskBorder: Record<string, string> = {
  high: "border-mc-red/30",
  medium: "border-mc-amber/20",
  low: "border-mc-cyan/10",
  clear: "border-mc-panel-border/50",
};

const riskBg: Record<string, string> = {
  high: "bg-mc-red/5",
  medium: "bg-mc-amber/3",
  low: "bg-mc-cyan/3",
  clear: "bg-transparent",
};

const sevColor: Record<string, string> = {
  critical: "bg-mc-red",
  warning: "bg-mc-amber",
  info: "bg-mc-cyan",
};

const sevPinSize: Record<string, string> = {
  critical: "w-5 h-5",
  warning: "w-4 h-4",
  info: "w-3 h-3",
};

const sevIconSize: Record<string, string> = {
  critical: "w-3 h-3",
  warning: "w-2.5 h-2.5",
  info: "w-2 h-2",
};

const FloorMap = () => {
  const [pulse, setPulse] = useState(false);
  const [floorPlan, setFloorPlan] = useState<{ name?: string | null; image?: string | null } | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 1200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sentinel.floorPlan");
      if (stored) {
        const parsed = JSON.parse(stored) as { name?: string | null; image?: string | null };
        setFloorPlan(parsed);
      }
    } catch {
      // ignore JSON / storage errors in demo
    }
  }, []);

  const hasFloorPlanImage = Boolean(floorPlan?.image);

  const incidentPins = useMemo(() => {
    if (hasFloorPlanImage) {
      return alerts
        .map((alert) => {
          const pos = getPinPositionForLocation(alert.location);
          if (!pos) return null;
          const clamped = clampPinToFloorPlanBounds(pos.x, pos.y);
          return {
            id: alert.id,
            type: (alert.title.toLowerCase().includes("fall") ? "fall" : alert.title.toLowerCase().includes("aggression") ? "fight" : alert.title.toLowerCase().includes("collision") ? "collision" : "spill") as MapIncident["type"],
            severity: alert.severity,
            label: alert.title.split(/[—\-]/)[0].trim(),
            x: clamped.x,
            y: clamped.y,
            active: alert.severity !== "info",
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);
    }
    return incidents;
  }, [hasFloorPlanImage]);

  const clampedResponderPins = useMemo(
    () => clampResponderPins(hasFloorPlanImage),
    [hasFloorPlanImage]
  );

  return (
    <div className="mc-panel h-full flex flex-col">
      <div className="flex-1 relative p-2">
        <div className="relative w-full h-full bg-background border border-mc-panel-border overflow-hidden">
          {/* Floor plan: imported image, darkened to match console */}
          {floorPlan?.image && (
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${floorPlan.image})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  filter: "brightness(0.7) contrast(1.1)",
                }}
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          )}

          {/* Grid overlay (subtle when floor plan is present) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
              linear-gradient(hsl(var(--mc-cyan) / ${hasFloorPlanImage ? 0.02 : 0.03}) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--mc-cyan) / ${hasFloorPlanImage ? 0.02 : 0.03}) 1px, transparent 1px)
            `,
              backgroundSize: "30px 30px",
            }}
          />

          {/* Floor plan label */}
          {floorPlan?.name && (
            <div className="absolute top-2 left-2 bg-mc-surface/90 border border-mc-panel-border px-2 py-1 flex items-center gap-2 z-20">
              <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-[0.15em]">
                Floor Plan
              </span>
              <span className="font-mono text-[8px] text-foreground/80 truncate max-w-[220px]">
                {floorPlan.name}
              </span>
            </div>
          )}

          {/* Zones: hide when floor plan is shown so pins adapt to the plan */}
          {!hasFloorPlanImage &&
            zones.map(z => (
            <div
              key={z.id}
              className={`absolute border ${riskBorder[z.risk]} ${riskBg[z.risk]} transition-colors cursor-pointer hover:bg-mc-cyan/5 group`}
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}
            >
              <div className="absolute top-0.5 left-1 flex items-center gap-1">
                <span className="font-mono text-[7px] text-muted-foreground/60 font-semibold group-hover:text-foreground/50 transition-colors">
                  {z.name}
                </span>
              </div>
              <div className="absolute bottom-0.5 right-1 flex items-center gap-1">
                <Camera className="w-2 h-2 text-muted-foreground/30" />
                <span className="font-mono text-[7px] text-muted-foreground/30">{z.cameras}</span>
              </div>
            </div>
          ))}

          {/* Incident pins (from alerts when floor plan present, else static) */}
          {incidentPins.map(inc => (
            <div
              key={inc.id}
              className="absolute z-10 cursor-pointer group"
              style={{ left: `${inc.x}%`, top: `${inc.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {/* Pulse ring */}
              {inc.active && (
                <div className={`absolute inset-0 -m-3 rounded-full ${sevColor[inc.severity]}/20 ${pulse ? "scale-150 opacity-0" : "scale-100 opacity-100"} transition-all duration-1000`} />
              )}
              <div className={`relative rounded-full ${sevPinSize[inc.severity]} ${sevColor[inc.severity]} flex items-center justify-center ${inc.active ? "" : "opacity-40"}`}>
                <AlertTriangle className={`${sevIconSize[inc.severity]} text-background`} />
              </div>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-20">
                <div className="bg-mc-surface border border-mc-panel-border px-2 py-1 whitespace-nowrap">
                  <span className="font-mono text-[8px] font-bold text-foreground">{inc.label}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Responder pins (clamped inside floor plan when present) */}
          {clampedResponderPins.map(rp => (
            <div
              key={rp.id}
              className="absolute z-10 group cursor-pointer"
              style={{ left: `${rp.x}%`, top: `${rp.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="w-4 h-4 rounded-full bg-mc-cyan flex items-center justify-center border border-mc-cyan/50">
                <Navigation className="w-2 h-2 text-background" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-20">
                <div className="bg-mc-surface border border-mc-panel-border px-2 py-1 whitespace-nowrap">
                  <span className="font-mono text-[8px] text-mc-cyan font-bold">{rp.name}</span>
                  <span className="font-mono text-[7px] text-muted-foreground ml-1">{rp.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloorMap;
