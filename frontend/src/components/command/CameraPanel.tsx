import { useEffect, useState } from "react";
import { AlertTriangle, Maximize2, MapPin, Activity, Loader2, WifiOff, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { CameraState } from "@/hooks/useCameras";

// Deterministic trust state per camera id
const TRUST: Record<string, "verified" | "unverified" | "tamper"> = {
  "CAM-01": "verified",
  "CAM-02": "verified",
  "CAM-03": "unverified",
};
const TrustBadge = ({ id, status }: { id: string; status: CameraState["status"] }) => {
  const trust = status === "error" ? "tamper" : (TRUST[id] ?? "unverified");
  if (trust === "verified") return (
    <div className="flex items-center gap-0.5 bg-mc-green/10 border border-mc-green/30 px-1 py-px">
      <ShieldCheck className="w-2 h-2 text-mc-green" />
      <span className="font-mono text-[6px] text-mc-green font-bold">VERIFIED</span>
    </div>
  );
  if (trust === "tamper") return (
    <div className="flex items-center gap-0.5 bg-mc-red/10 border border-mc-red/30 px-1 py-px">
      <ShieldX className="w-2 h-2 text-mc-red" />
      <span className="font-mono text-[6px] text-mc-red font-bold">TAMPER?</span>
    </div>
  );
  return (
    <div className="flex items-center gap-0.5 bg-mc-amber/10 border border-mc-amber/30 px-1 py-px">
      <ShieldAlert className="w-2 h-2 text-mc-amber" />
      <span className="font-mono text-[6px] text-mc-amber font-bold">UNVERIFIED</span>
    </div>
  );
};

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
              {/* Video feed */}
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

                {/* Analyzing — subtle centered spinner, doesn't block video */}
                {cam.status === "analyzing" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10 pointer-events-none">
                    <div className="bg-background/60 px-2 py-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 text-mc-cyan animate-spin" />
                      <span className="font-mono text-[7px] text-mc-cyan">ANALYZING</span>
                    </div>
                  </div>
                )}

                {/* Error — small badge only, video still visible */}
                {cam.status === "error" && (
                  <div className="absolute top-6 right-1.5 flex items-center gap-0.5 bg-mc-red/80 px-1 py-0.5 z-20">
                    <WifiOff className="w-2 h-2 text-white" />
                    <span className="font-mono text-[7px] text-white font-bold">NO DATA</span>
                  </div>
                )}

                {/* CAM label + status dot */}
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

                {/* Risk badge (analysis done) */}
                {cam.status === "done" && isAlert && (
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-mc-red/90 px-1 py-0.5 z-20">
                    <AlertTriangle className="w-2.5 h-2.5 text-destructive-foreground" />
                    <span className="font-mono text-[8px] font-bold text-destructive-foreground">
                      RISK {riskPct}%
                    </span>
                  </div>
                )}

                {/* REC badge */}
                <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5 bg-mc-red/70 px-1 py-0.5 z-20">
                  <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse" />
                  <span className="font-mono text-[7px] font-bold text-destructive-foreground tracking-widest">REC</span>
                </div>

                {/* Expand hover */}
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

              {/* Info strip */}
              <div className="px-1.5 py-1 flex items-center justify-between bg-mc-surface border-t border-mc-panel-border">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[8px] text-muted-foreground truncate">{cam.id}</span>
                  <TrustBadge id={cam.id} status={cam.status} />
                </div>
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
                  {cam.status === "error" && (
                    <span className="font-mono text-[8px] text-mc-red">no data</span>
                  )}
                </div>
              </div>

              {/* Expanded detail — always show when clicked */}
              {isExpanded && (
                <div className="px-1.5 pb-2 pt-1.5 bg-mc-surface border-t border-mc-panel-border/80 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-mc-cyan" />
                    <span className="font-mono text-[8px] text-muted-foreground/80 uppercase tracking-wider">
                      Zone: {cam.id}
                    </span>
                    <span className="font-mono text-[8px] text-muted-foreground ml-auto">
                      Stream: <span className="text-foreground/80">1080p / 30fps</span>
                    </span>
                  </div>

                  {cam.status === "done" && cam.result ? (
                    <>
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
                    </>
                  ) : cam.status === "analyzing" ? (
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-mc-amber" />
                      <span className="font-mono text-[8px] text-mc-amber animate-pulse">
                        Analysis in progress — results will appear shortly…
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-[8px] text-muted-foreground">
                          Motion: <span className="text-foreground/80">Stable</span>
                        </span>
                      </div>
                      <div className="font-mono text-[7px] text-muted-foreground/70 leading-relaxed">
                        Analysis unavailable — ensure the backend is running and retry.
                      </div>
                    </div>
                  )}
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
