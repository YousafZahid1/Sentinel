import { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/sentinel/TopBar";
import KpiIndicatorCard from "@/components/sentinel/KpiIndicatorCard";
import EmptyStatePanel from "@/components/sentinel/EmptyStatePanel";
import CameraPanel from "@/components/command/CameraPanel";
import AlertStack from "@/components/command/AlertStack";
import FloorMap from "@/components/command/FloorMap";
import BottomStrip from "@/components/command/BottomStrip";
import IncidentDetailDrawer from "@/components/sentinel/IncidentDetailDrawer";
import CommandPalette from "@/components/sentinel/CommandPalette";
import type { Alert } from "@/components/command/AlertStack";
import { useCameras } from "@/hooks/useCameras";
import { cn } from "@/lib/utils";

const OpsCenter = () => {
  const { cameras, alerts: liveAlerts } = useCameras();

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveState, setLiveState] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChips, setFilterChips] = useState<Record<string, boolean>>({
    critical: false,
    warning: false,
    info: false,
  });
  const [commandOpen, setCommandOpen] = useState(false);

  const activeAlerts: Alert[] = liveAlerts;

  const selectedAlert = activeAlerts.find((a) => a.id === selectedAlertId) || null;

  const filteredAlerts = activeAlerts.filter((a) => {
    if (
      searchQuery &&
      !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (filterChips.critical && a.severity !== "critical") return false;
    if (filterChips.warning && a.severity !== "warning") return false;
    if (filterChips.info && a.severity !== "info") return false;
    return true;
  });

  useEffect(() => {
    if (liveState) {
      const iv = setInterval(() => setLastUpdated(new Date()), 5000);
      return () => clearInterval(iv);
    }
  }, [liveState]);

  const handleSelectIncident = useCallback((id: string) => {
    setSelectedAlertId((prev) => (prev === id ? null : id));
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onAssign={() => setCommandOpen(false)}
        onNotify={() => setCommandOpen(false)}
        onResolve={() => setCommandOpen(false)}
        onOpenPrivacy={() => {
          setCommandOpen(false);
          window.location.href = "/console/privacy";
        }}
      />

      <TopBar
        live_state={liveState}
        last_updated_at={lastUpdated}
        onLiveToggle={() => setLiveState((l) => !l)}
        onSearch={setSearchQuery}
      />

      {/* KPI Row */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-mc-panel-border flex items-center gap-4">
        <div className="flex gap-3">
          <KpiIndicatorCard label="Active incidents" value={criticalCount + warningCount} delta_value={2} delta_direction="up" time_window="24h" />
          <KpiIndicatorCard label="Critical" value={criticalCount} />
          <KpiIndicatorCard label="Near-misses" value={12} delta_value={-3} delta_direction="down" time_window="24h" />
        </div>
        <div className="flex gap-3 ml-auto">
          {["critical", "warning", "info"].map((chip) => (
            <button
              key={chip}
              onClick={() => setFilterChips((f) => ({ ...f, [chip]: !f[chip] }))}
              className={cn(
                "font-mono text-[9px] px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-mc-cyan",
                filterChips[chip]
                  ? "bg-mc-cyan/20 border-mc-cyan/50 text-mc-cyan"
                  : "border-mc-panel-border text-muted-foreground hover:text-foreground"
              )}
            >
              Filter: {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0">
        <div className="w-[220px] flex-shrink-0 border-r border-mc-panel-border">
          <CameraPanel cameras={cameras} />
        </div>

        <div className="flex-[1.2] min-w-0 flex flex-col">
          <FloorMap />
        </div>

        <div className="w-[280px] flex-shrink-0 border-l border-mc-panel-border flex flex-col">
          <div className="mc-panel-header flex items-center justify-between">
            <span className="mc-panel-label">Incident Feed</span>
            <span className="font-mono text-[9px] text-muted-foreground">
              {filteredAlerts.length} / {activeAlerts.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <EmptyStatePanel
                title={activeAlerts.length === 0 ? "Analyzing cameras…" : "No incidents"}
                message={
                  activeAlerts.length === 0
                    ? "Results will appear as each camera finishes analysis."
                    : "No incidents match your filters."
                }
              />
            ) : (
              filteredAlerts.map((alert, i) => (
                <IncidentRow
                  key={alert.id}
                  alert={alert}
                  isSelected={selectedAlertId === alert.id}
                  onSelect={() => handleSelectIncident(alert.id)}
                  isNew={i === 0}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <BottomStrip />

      <IncidentDetailDrawer
        alert={selectedAlert}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAssign={() => {}}
        onNotify={() => {}}
      />
    </div>
  );
};

export default OpsCenter;

const IncidentRow = ({
  alert,
  isSelected,
  onSelect,
  isNew,
}: {
  alert: Alert;
  isSelected: boolean;
  onSelect: () => void;
  isNew?: boolean;
}) => {
  const sevStyles = {
    critical: { badge: "bg-mc-red text-background", pulse: "mc-pulse-red" },
    warning: { badge: "bg-mc-amber text-background", pulse: "mc-pulse-amber" },
    info: { badge: "bg-mc-cyan text-background", pulse: "" },
  };
  const sev = sevStyles[alert.severity];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={cn(
        "border-b border-mc-panel-border p-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-mc-cyan focus:ring-inset",
        isSelected && "bg-mc-surface ring-1 ring-inset ring-mc-cyan/30",
        isNew && "animate-in fade-in duration-300"
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "font-mono text-[7px] font-bold px-1 py-px uppercase border",
            sev.badge,
            alert.severity === "critical" && "border-mc-red/60 " + sev.pulse,
            alert.severity === "warning" && "border-mc-amber/50 " + sev.pulse
          )}
        >
          {alert.severity}
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">{alert.id}</span>
      </div>
      <h3 className="font-mono text-[10px] font-bold text-foreground mt-1">{alert.title}</h3>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="font-mono text-[8px] text-muted-foreground">{alert.location}</span>
        <span className="font-mono text-[8px] text-muted-foreground">{alert.time} AGO</span>
        {alert.responder && (
          <span className="font-mono text-[8px] text-mc-cyan font-semibold">{alert.responder}</span>
        )}
      </div>
      {/* Risk score + prediction */}
      <div className="flex items-center gap-2 mt-1">
        <span className={cn(
          "font-mono text-[8px] font-bold",
          alert.metadata.overall_risk_score >= 0.7 ? "text-mc-red" :
          alert.metadata.overall_risk_score >= 0.35 ? "text-mc-amber" : "text-mc-green"
        )}>
          RISK {Math.round(alert.metadata.overall_risk_score * 100)}%
        </span>
        <span className="font-mono text-[7px] text-muted-foreground">
          {alert.metadata.prediction.likely_outcome.replace(/_/g, " ")}
        </span>
      </div>
      <div className="flex gap-1 mt-2">
        <button className="font-mono text-[8px] px-2 py-0.5 bg-mc-surface border border-mc-panel-border hover:border-mc-cyan/30">
          Assign responder
        </button>
        <button className="font-mono text-[8px] px-2 py-0.5 bg-mc-surface border border-mc-panel-border hover:border-mc-cyan/30">
          Notify
        </button>
      </div>
    </div>
  );
};
