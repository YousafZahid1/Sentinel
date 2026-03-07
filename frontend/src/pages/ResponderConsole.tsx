import { useState } from "react";
import TopBar from "@/components/sentinel/TopBar";
import EmptyStatePanel from "@/components/sentinel/EmptyStatePanel";
import { MapPin, Navigation, CheckCircle } from "lucide-react";
import { alerts } from "@/components/command/AlertStack";
import type { Alert } from "@/components/command/AlertStack";
import { cn } from "@/lib/utils";

const assignedAlerts = alerts.filter((a) => a.responder).slice(0, 3);

const ResponderConsole = () => {
  const [responderStatus, setResponderStatus] = useState<"available" | "en_route" | "on_scene">("available");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(assignedAlerts[0]?.id ?? null);
  const [ackStates, setAckStates] = useState<Record<string, boolean>>({});

  const selectedIncident = assignedAlerts.find((a) => a.id === selectedIncidentId);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar showSearch={false} />

      <div className="flex-1 flex min-h-0 p-4 gap-4">
        {/* Left: Assigned Incidents */}
        <div className="w-[280px] flex-shrink-0 flex flex-col">
          <div className="mc-panel flex-1 flex flex-col min-h-0">
            <div className="mc-panel-header">
              <span className="mc-panel-label">Assigned incidents</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {assignedAlerts.length === 0 ? (
                <EmptyStatePanel title="No assignments" message="No incidents assigned to you." />
              ) : (
                assignedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 border cursor-pointer transition-colors",
                      selectedIncidentId === alert.id ? "border-mc-cyan/50 bg-mc-cyan/5" : "border-mc-panel-border hover:border-mc-cyan/20"
                    )}
                    onClick={() => setSelectedIncidentId(alert.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-mono text-[7px] font-bold px-1 py-px uppercase",
                        alert.severity === "critical" && "bg-mc-red text-background",
                        alert.severity === "warning" && "bg-mc-amber text-background",
                        alert.severity === "info" && "bg-mc-cyan text-background"
                      )}>
                        {alert.severity}
                      </span>
                      <span className="font-mono text-[8px] text-muted-foreground">{alert.id}</span>
                    </div>
                    <h3 className="font-mono text-[10px] font-bold mt-1">{alert.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="font-mono text-[8px] text-muted-foreground">{alert.location}</span>
                    </div>
                    <span className="font-mono text-[8px] text-muted-foreground">{alert.time} AGO</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAckStates((a) => ({ ...a, [alert.id]: !a[alert.id] }));
                      }}
                      className={cn(
                        "mt-2 w-full font-mono text-[8px] py-1.5 border flex items-center justify-center gap-1",
                        ackStates[alert.id] ? "bg-mc-green-dim border-mc-green/30 text-mc-green" : "border-mc-panel-border hover:border-mc-cyan/30"
                      )}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {ackStates[alert.id] ? "Acknowledged" : "Acknowledge"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Segmented Control */}
          <div className="mt-4 mc-panel p-2">
            <span className="mc-panel-label block mb-2">Status</span>
            <div className="flex gap-1">
              {(["available", "en_route", "on_scene"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setResponderStatus(s)}
                  className={cn(
                    "flex-1 font-mono text-[8px] py-1.5 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-mc-cyan",
                    responderStatus === s ? "bg-mc-cyan/20 border-mc-cyan/50 text-mc-cyan" : "border-mc-panel-border text-muted-foreground"
                  )}
                >
                  {s === "en_route" ? "En route" : s === "on_scene" ? "On scene" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-2 flex gap-2">
            <button className="flex-1 font-mono text-[9px] py-2 bg-mc-cyan/20 border border-mc-cyan/50 text-mc-cyan flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3" />
              Route to nearest AED
            </button>
          </div>
        </div>

        {/* Right: Incident Detail + Map placeholder */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {selectedIncident ? (
            <>
              <div className="mc-panel p-4 flex-1 min-h-0 overflow-y-auto">
                <span className="mc-panel-label">Incident detail</span>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-muted-foreground">Confidence:</span>
                    <span className="font-mono text-[10px] font-bold">
                      {Math.round(selectedIncident.metadata.prediction.confidence * 100)}%
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-foreground/80">{selectedIncident.conclusion}</p>
                </div>
                <div className="mt-4 p-3 bg-mc-cyan-dim border border-mc-cyan/15">
                  <span className="font-mono text-[9px] text-mc-cyan">Route summary: OPS → {selectedIncident.location}</span>
                  <div className="mt-1 font-mono text-[8px] text-muted-foreground">ETA: ~45s | 120m</div>
                </div>
              </div>
              <div className="mc-panel flex-1 min-h-[200px] flex items-center justify-center">
                <span className="font-mono text-[9px] text-muted-foreground">Map placeholder</span>
              </div>
            </>
          ) : (
            <EmptyStatePanel title="Select an incident" message="Choose an assigned incident to view details." />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponderConsole;
