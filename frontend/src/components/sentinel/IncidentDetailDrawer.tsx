import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Clock, Eye, Target, CheckSquare, Square, User, ArrowRight, Radio, Zap } from "lucide-react";
import type { Alert } from "@/components/command/AlertStack";
import { cn } from "@/lib/utils";

interface IncidentDetailDrawerProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign?: () => void;
  onNotify?: () => void;
}

const sevConfig = {
  critical: { color: "text-mc-red", bg: "bg-mc-red/10", border: "border-mc-red/30", label: "CRITICAL" },
  warning: { color: "text-mc-amber", bg: "bg-mc-amber/10", border: "border-mc-amber/30", label: "WARNING" },
  info: { color: "text-mc-cyan", bg: "bg-mc-cyan/10", border: "border-mc-cyan/20", label: "INFO" },
};

const RESPONDER_STATES = ["Notified", "Acknowledged", "En route", "On scene"] as const;
type ResponderState = typeof RESPONDER_STATES[number];

const stateColor: Record<ResponderState, string> = {
  "Notified": "text-muted-foreground border-mc-panel-border",
  "Acknowledged": "text-mc-amber border-mc-amber/40 bg-mc-amber/10",
  "En route": "text-mc-cyan border-mc-cyan/40 bg-mc-cyan/10",
  "On scene": "text-mc-green border-mc-green/40 bg-mc-green/10",
};

const IncidentDetailDrawer = ({
  alert,
  open,
  onOpenChange,
}: IncidentDetailDrawerProps) => {
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const [responderState, setResponderState] = useState<ResponderState>("Notified");
  const [timelineEvents, setTimelineEvents] = useState([
    { event_type: "alert", event_at: new Date().toLocaleTimeString("en-US", { hour12: false }), actor_name: "System", note: "Incident detected by Sentinel AI" },
    { event_type: "dispatch", event_at: new Date().toLocaleTimeString("en-US", { hour12: false }), actor_name: "Auto", note: "Responder notified automatically" },
  ]);

  if (!alert) return null;

  const sev = sevConfig[alert.severity];
  const riskPercent = Math.round(alert.metadata.overall_risk_score * 100);
  const confPercent = Math.round(alert.metadata.prediction.confidence * 100);

  const toggleAction = (i: number) => {
    setCheckedActions((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      if (next[i]) {
        setTimelineEvents((evs) => [
          ...evs,
          {
            event_type: "resolve",
            event_at: new Date().toLocaleTimeString("en-US", { hour12: false }),
            actor_name: "Operator",
            note: `Action completed: ${alert.recommended_actions[i]?.slice(0, 60)}…`,
          },
        ]);
      }
      return next;
    });
  };

  const advanceResponder = () => {
    const idx = RESPONDER_STATES.indexOf(responderState);
    if (idx < RESPONDER_STATES.length - 1) {
      const next = RESPONDER_STATES[idx + 1];
      setResponderState(next);
      setTimelineEvents((evs) => [
        ...evs,
        {
          event_type: "dispatch",
          event_at: new Date().toLocaleTimeString("en-US", { hour12: false }),
          actor_name: "Responder",
          note: `Status updated → ${next}`,
        },
      ]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-mc-panel border-mc-panel-border rounded-l overflow-hidden flex flex-col"
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-mono text-sm flex items-center gap-2">
            <span className={cn("font-mono text-[8px] font-bold px-1.5 py-0.5 uppercase", sev.bg, sev.color, "border", sev.border)}>
              {alert.severity}
            </span>
            {alert.id} — {alert.title}
          </SheetTitle>
        </SheetHeader>

        {/* Summary bar */}
        <div className={cn("flex-shrink-0 p-3 border mt-3", sev.border, sev.bg)}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
              <MapPin className="w-3 h-3" /> {alert.location}
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
              <Clock className="w-3 h-3" /> {alert.time} AGO
            </span>
            <span className={cn("font-mono text-[9px] font-bold", sev.color)}>
              RISK {riskPercent}% · CONF {confPercent}%
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-[8px] text-muted-foreground">Outcome:</span>
            <span className="font-mono text-[9px] font-semibold text-foreground">
              {alert.metadata.prediction.likely_outcome.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 mt-3">
          <TabsList className="w-full bg-mc-surface border border-mc-panel-border flex-shrink-0">
            <TabsTrigger value="overview" className="font-mono text-[9px] flex-1">Overview</TabsTrigger>
            <TabsTrigger value="assignments" className="font-mono text-[9px] flex-1">Assignments</TabsTrigger>
            <TabsTrigger value="timeline" className="font-mono text-[9px] flex-1">Timeline</TabsTrigger>
            <TabsTrigger value="resources" className="font-mono text-[9px] flex-1">Resources</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto mt-3 space-y-3">
            <div className="bg-mc-surface border border-mc-panel-border p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3 h-3 text-mc-cyan" />
                <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wide">AI Conclusion</span>
              </div>
              <p className="font-mono text-[10px] text-foreground/80 leading-relaxed">{alert.conclusion}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-3 h-3 text-mc-amber" />
                <span className="font-mono text-[9px] text-muted-foreground uppercase font-semibold tracking-wide">
                  Playbook — Recommended Actions
                </span>
              </div>
              <div className="space-y-1.5">
                {alert.recommended_actions.slice(0, 5).map((action, i) => (
                  <button
                    key={i}
                    onClick={() => toggleAction(i)}
                    className={cn(
                      "w-full flex items-start gap-2 bg-mc-surface border p-2 text-left transition-all",
                      checkedActions[i]
                        ? "border-mc-green/30 bg-mc-green/5 opacity-60"
                        : "border-mc-panel-border hover:border-mc-cyan/30"
                    )}
                  >
                    {checkedActions[i]
                      ? <CheckSquare className="w-3.5 h-3.5 text-mc-green flex-shrink-0 mt-px" />
                      : <Square className="w-3.5 h-3.5 text-mc-amber flex-shrink-0 mt-px" />
                    }
                    <span className={cn("font-mono text-[9px]", checkedActions[i] ? "line-through text-muted-foreground" : "text-foreground/80")}>
                      {action}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 font-mono text-[8px] py-2 bg-mc-cyan/10 border border-mc-cyan/30 text-mc-cyan hover:bg-mc-cyan/20 transition-colors flex items-center justify-center gap-1">
                <Radio className="w-3 h-3" /> Send to Responder
              </button>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-mc-surface border border-mc-panel-border">
                <ArrowRight className="w-3 h-3 text-mc-cyan" />
                <span className="font-mono text-[9px] text-mc-cyan font-semibold">→ {alert.routeTo}</span>
              </div>
            </div>
          </TabsContent>

          {/* Assignments */}
          <TabsContent value="assignments" className="flex-1 overflow-y-auto mt-3 space-y-3">
            <div className="bg-mc-surface border border-mc-panel-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-mc-cyan" />
                <span className="font-mono text-[9px] font-bold">RESPONDER ASSIGNED</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 border border-mc-panel-border bg-mc-panel">
                <span className="font-mono text-[8px] font-bold text-mc-amber bg-mc-amber/10 border border-mc-amber/30 px-1 py-px">
                  {alert.routeTo === "MEDICAL" ? "MED" : alert.routeTo === "SECURITY" ? "SEC" : alert.routeTo === "MAINTENANCE" ? "MNT" : "STF"}
                </span>
                <span className="font-mono text-[10px] font-semibold">
                  {alert.routeTo === "MEDICAL" ? "NURSE KIM" : alert.routeTo === "SECURITY" ? "OFFICER DAVIS" : "MARTINEZ"}
                </span>
                <span className={cn("ml-auto font-mono text-[8px] font-bold px-1.5 py-0.5 border", stateColor[responderState])}>
                  {responderState}
                </span>
              </div>

              {/* Progression stepper */}
              <div className="flex items-center gap-1">
                {RESPONDER_STATES.map((s, i) => {
                  const current = RESPONDER_STATES.indexOf(responderState);
                  const done = i <= current;
                  return (
                    <div key={s} className="flex items-center flex-1 gap-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0 transition-all",
                        i < current ? "bg-mc-green" : i === current ? "bg-mc-cyan animate-pulse" : "bg-mc-panel-border"
                      )} />
                      <span className={cn("font-mono text-[7px] truncate", done ? "text-foreground/70" : "text-muted-foreground/40")}>
                        {s}
                      </span>
                      {i < RESPONDER_STATES.length - 1 && (
                        <div className={cn("flex-1 h-px", i < current ? "bg-mc-green/50" : "bg-mc-panel-border")} />
                      )}
                    </div>
                  );
                })}
              </div>

              {responderState !== "On scene" && (
                <button
                  onClick={advanceResponder}
                  className="w-full font-mono text-[9px] py-1.5 bg-mc-cyan/10 border border-mc-cyan/30 text-mc-cyan hover:bg-mc-cyan/20 transition-colors"
                >
                  Mark as {RESPONDER_STATES[RESPONDER_STATES.indexOf(responderState) + 1]}
                </button>
              )}
              {responderState === "On scene" && (
                <div className="font-mono text-[9px] text-mc-green text-center py-1">✓ Responder on scene</div>
              )}
            </div>

            <div className="bg-mc-surface border border-mc-panel-border p-3">
              <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wide block mb-2">Route</span>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-mc-cyan">
                <ArrowRight className="w-3 h-3" />
                OPS CTRL → {alert.location}
              </div>
              <div className="mt-1 font-mono text-[8px] text-muted-foreground">ETA: ~45s · 120m</div>
            </div>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="flex-1 overflow-y-auto mt-3">
            <div className="space-y-0">
              {timelineEvents.map((ev, i) => (
                <div key={i} className="flex gap-2 px-2 py-2 border-b border-mc-panel-border/40 hover:bg-mc-surface/50 transition-colors">
                  <span className="font-mono text-[8px] text-muted-foreground tabular-nums flex-shrink-0 w-14">{ev.event_at}</span>
                  <span className={cn(
                    "font-mono text-[7px] font-bold px-1 py-px uppercase flex-shrink-0 self-start mt-px",
                    ev.event_type === "dispatch" ? "bg-mc-cyan/10 text-mc-cyan border border-mc-cyan/20" :
                    ev.event_type === "alert" ? "bg-mc-amber/10 text-mc-amber border border-mc-amber/20" :
                    ev.event_type === "resolve" ? "bg-mc-green/10 text-mc-green border border-mc-green/20" :
                    "bg-mc-surface text-muted-foreground border border-mc-panel-border"
                  )}>
                    {ev.event_type.slice(0, 4)}
                  </span>
                  <div>
                    <span className="font-mono text-[8px] font-semibold text-foreground/70 block">{ev.actor_name}</span>
                    <span className="font-mono text-[8px] text-muted-foreground leading-relaxed">{ev.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="flex-1 overflow-y-auto mt-3 space-y-2">
            {[
              { label: "AED Unit", location: "Main Hall — 23m", eta: "~18s", icon: "⚡" },
              { label: "First Aid Kit", location: "Break Room FL1 — 45m", eta: "~35s", icon: "🏥" },
              { label: "Fire Extinguisher", location: "Stairwell A — 60m", eta: "~45s", icon: "🧯" },
              { label: "Security Station", location: "Entrance Lobby — 80m", eta: "~60s", icon: "🛡" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3 bg-mc-surface border border-mc-panel-border p-2.5">
                <span className="text-sm flex-shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[9px] font-bold block">{r.label}</span>
                  <span className="font-mono text-[8px] text-muted-foreground">{r.location}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Zap className="w-2.5 h-2.5 text-mc-cyan" />
                  <span className="font-mono text-[8px] text-mc-cyan font-bold">{r.eta}</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default IncidentDetailDrawer;
