import { useEffect, useState } from "react";
import { Video, AlertTriangle, Maximize2, MapPin, Activity, User } from "lucide-react";
import { getEventSummaryForLocation } from "@/lib/incidentMap";

interface Camera {
  id: string;
  name: string;
  location: string;
  risk: number;
  status: "live" | "alert" | "offline";
}

const cameras: Camera[] = [
  { id: "c1", name: "CAM-01", location: "MAIN HALL FL1", risk: 12, status: "live" },
  { id: "c2", name: "CAM-02", location: "ENTRANCE LOBBY", risk: 78, status: "alert" },
  { id: "c3", name: "CAM-03", location: "CAFETERIA", risk: 5, status: "live" },
  { id: "c4", name: "CAM-04", location: "STAIRWELL-A", risk: 65, status: "alert" },
  { id: "c5", name: "CAM-05", location: "PARKING LOT-B", risk: 23, status: "live" },
  { id: "c6", name: "CAM-06", location: "WEST CORRIDOR", risk: 8, status: "live" },
];

const CameraPanel = () => {
  const [time, setTime] = useState(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const ts = time.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div className="mc-panel h-full flex flex-col">
      <div className="mc-panel-header">
        <span className="mc-panel-label">Camera Feeds</span>
        <span className="font-mono text-[9px] text-mc-green">
          {cameras.filter(c => c.status !== "offline").length} LIVE
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {cameras.map((cam) => {
          const isAlert = cam.risk > 50;
          const isExpanded = expandedId === cam.id;
          return (
            <div
              key={cam.id}
              className={`relative group cursor-pointer border ${
                isAlert ? "border-mc-red/40 mc-pulse-red" : "border-mc-panel-border"
              } bg-mc-panel transition-all duration-200 ${isExpanded ? "mc-glow-cyan" : ""}`}
              onClick={() => setExpandedId(prev => (prev === cam.id ? null : cam.id))}
            >
              {/* Feed placeholder */}
              <div className={`relative bg-background mc-scanline flex items-center justify-center overflow-hidden ${
                isExpanded ? "aspect-[16/10]" : "aspect-[16/9]"
              }`}>
                <Video className="w-5 h-5 text-muted-foreground/15" />

                {/* Overlays */}
                <div className="absolute top-1 left-1.5 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? "bg-mc-red animate-pulse" : "bg-mc-green"}`} />
                  <span className="font-mono text-[8px] font-bold text-foreground/70">{cam.name}</span>
                </div>
                <span className="absolute top-1 right-1.5 font-mono text-[8px] text-foreground/30 tabular-nums">{ts}</span>

                {isAlert && (
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-mc-red/90 px-1 py-0.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-destructive-foreground" />
                    <span className="font-mono text-[8px] font-bold text-destructive-foreground">RISK {cam.risk}%</span>
                  </div>
                )}

                <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5 bg-mc-red/70 px-1 py-0.5">
                  <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse" />
                  <span className="font-mono text-[7px] font-bold text-destructive-foreground tracking-widest">REC</span>
                </div>

                {/* Hover expand */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setExpandedId(prev => (prev === cam.id ? null : cam.id));
                  }}
                  className="absolute inset-0 bg-mc-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Maximize2 className="w-4 h-4 text-mc-cyan/70" />
                </button>
              </div>

              {/* Info strip */}
              <div className="px-1.5 py-1 flex items-center justify-between bg-mc-surface border-t border-mc-panel-border">
                <span className="font-mono text-[8px] text-muted-foreground truncate">{cam.location}</span>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-1 bg-background overflow-hidden">
                    <div
                      className={`h-full ${cam.risk > 50 ? "bg-mc-red" : cam.risk > 30 ? "bg-mc-amber" : "bg-mc-green"}`}
                      style={{ width: `${cam.risk}%` }}
                    />
                  </div>
                  <span className={`font-mono text-[8px] font-bold ${cam.risk > 50 ? "text-mc-red" : cam.risk > 30 ? "text-mc-amber" : "text-mc-green"}`}>
                    {cam.risk}%
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="px-1.5 pb-2 pt-1.5 bg-mc-surface border-t border-mc-panel-border/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-mc-cyan" />
                      <span className="font-mono text-[8px] text-muted-foreground/80 uppercase tracking-wider">
                        Zone: {cam.location}
                      </span>
                    </div>
                    <span className="font-mono text-[8px] text-muted-foreground">
                      Stream: <span className="text-foreground/80">1080p / 30fps</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-mc-amber" />
                      <span className="font-mono text-[8px] text-muted-foreground">
                        Motion: <span className="text-mc-amber font-semibold">{cam.risk > 50 ? "Elevated" : "Stable"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-mc-cyan" />
                      <span className="font-mono text-[8px] text-muted-foreground">
                        Assigned: <span className="text-foreground/80">OFFICER DAVIS</span>
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-[8px]">
                    <span className="text-muted-foreground/80">What happened: </span>
                    <span className={cam.risk > 50 ? "text-mc-amber font-semibold" : "text-foreground/80"}>
                      {getEventSummaryForLocation(cam.location) ?? "Clear"}
                    </span>
                  </div>
                  <div className="font-mono text-[7px] text-muted-foreground/70 leading-relaxed">
                    Anomaly tracking and responder route overlays active.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CameraPanel;
