import { useEffect, useState } from "react";
import { Video, AlertTriangle, Maximize2, MapPin, Activity, Loader2 } from "lucide-react";
import type { CameraState } from "@/hooks/useCameras";

interface CameraPanelProps {
  cameras: CameraState[];
}

const CameraPanel = ({ cameras }: CameraPanelProps) => {
  const [time, setTime] = useState(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const ts = time.toLocaleTimeString("en-US", { hour12: false });
  const liveCount = cameras.filter((c) => c.status !== "error").length;

  return (
    <div className="mc-panel h-full flex flex-col">
      <div className="mc-panel-header">
        <span className="mc-panel-label">Camera Feeds</span>
        <span className="font-mono text-[9px] text-mc-green">{liveCount} LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {cameras.map((cam) => {
          const riskScore = cam.result?.metadata.overall_risk_score ?? 0;
          const riskPct = Math.round(riskScore * 100);
          const isAlert = riskScore >= 0.5;
          const isExpanded = expandedId === cam.id;

          return (
            <div
              key={cam.id}
              className={`relative group cursor-pointer border ${
                isAlert ? "border-mc-red/40 mc-pulse-red" : "border-mc-panel-border"
              } bg-mc-panel transition-all duration-200 ${isExpanded ? "mc-glow-cyan" : ""}`}
              onClick={() => setExpandedId((prev) => (prev === cam.id ? null : cam.id))}
            >
              <div
                className={`relative bg-background mc-scanline flex items-center justify-center overflow-hidden ${
                  isExpanded ? "aspect-[16/10]" : "aspect-[16/9]"
                }`}
              >
                {cam.video_url && (
                  <video
                    src={cam.video_url}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}

                {cam.status === "analyzing" && (
                  <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-1 z-10">
                    <Loader2 className="w-4 h-4 text-mc-cyan animate-spin" />
                    <span className="font-mono text-[8px] text-mc-cyan">ANALYZING…</span>
                  </div>
                )}

                {cam.status === "error" && (
                  <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-1 z-10">
                    <Video className="w-4 h-4 text-mc-red/50" />
                    <span className="font-mono text-[8px] text-mc-red">ERROR</span>
                  </div>
                )}

                <div className="absolute top-1 left-1.5 flex items-center gap-1 z-20">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      cam.status === "analyzing"
                        ? "bg-mc-amber animate-pulse"
                        : cam.status === "error"
                        ? "bg-mc-red"
                        : isAlert
                        ? "bg-mc-red animate-pulse"
                        : "bg-mc-green"
                    }`}
                  />
                  <span className="font-mono text-[8px] font-bold text-foreground/90 drop-shadow">{cam.id}</span>
                </div>

                <span className="absolute top-1 right-1.5 font-mono text-[8px] text-foreground/40 tabular-nums z-20">
                  {ts}
                </span>

                {cam.status === "done" && isAlert && (
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-mc-red/90 px-1 py-0.5 z-20">
                    <AlertTriangle className="w-2.5 h-2.5 text-destructive-foreground" />
                    <span className="font-mono text-[8px] font-bold text-destructive-foreground">
                      RISK {riskPct}%
                    </span>
                  </div>
                )}

                <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5 bg-mc-red/70 px-1 py-0.5 z-20">
                  <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse" />
                  <span className="font-mono text-[7px] font-bold text-destructive-foreground tracking-widest">REC</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId((prev) => (prev === cam.id ? null : cam.id));
                  }}
                  className="absolute inset-0 bg-mc-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30"
                >
                  <Maximize2 className="w-4 h-4 text-mc-cyan/70" />
                </button>
              </div>

              <div className="px-1.5 py-1 flex items-center justify-between bg-mc-surface border-t border-mc-panel-border">
                <span className="font-mono text-[8px] text-muted-foreground truncate">{cam.id}</span>
                <div className="flex items-center gap-1">
                  {cam.status === "done" && (
                    <>
                      <div className="w-8 h-1 bg-background overflow-hidden">
                        <div
                          className={`h-full ${riskPct > 50 ? "bg-mc-red" : riskPct > 30 ? "bg-mc-amber" : "bg-mc-green"}`}
                          style={{ width: `${riskPct}%` }}
                        />
                      </div>
                      <span className={`font-mono text-[8px] font-bold ${riskPct > 50 ? "text-mc-red" : riskPct > 30 ? "text-mc-amber" : "text-mc-green"}`}>
                        {riskPct}%
                      </span>
                    </>
                  )}
                  {cam.status === "analyzing" && (
                    <span className="font-mono text-[8px] text-mc-amber animate-pulse">…</span>
                  )}
                </div>
              </div>

              {isExpanded && cam.status === "done" && cam.result && (
                <div className="px-1.5 pb-2 pt-1.5 bg-mc-surface border-t border-mc-panel-border/80 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-mc-cyan" />
                    <span className="font-mono text-[8px] text-muted-foreground/80 uppercase tracking-wider">
                      {cam.id} — {cam.result.metadata.people_detected} person(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-mc-amber" />
                    <span className="font-mono text-[8px] text-muted-foreground">
                      Outcome:{" "}
                      <span className="text-mc-amber font-semibold">
                        {cam.result.metadata.prediction.likely_outcome.replace(/_/g, " ")}
                      </span>{" "}
                      ({Math.round(cam.result.metadata.prediction.confidence * 100)}% conf)
                    </span>
                  </div>
                  <p className="font-mono text-[8px] text-foreground/70 leading-relaxed line-clamp-3">
                    {cam.result.conclusion}
                  </p>
                  {cam.result.recommended_actions.slice(0, 2).map((action, i) => (
                    <div key={i} className="flex gap-1 font-mono text-[7px] text-mc-cyan/80">
                      <span className="text-mc-amber">{i + 1}.</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {cameras.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <span className="font-mono text-[9px] text-muted-foreground">Connecting to cameras…</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPanel;
