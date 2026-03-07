import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Clock, User, ArrowRight, Target, Eye } from "lucide-react";
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
  critical: { color: "text-mc-red", bg: "bg-mc-red-dim", border: "border-mc-red/30", label: "CRITICAL" },
  warning: { color: "text-mc-amber", bg: "bg-mc-amber-dim", border: "border-mc-amber/30", label: "WARNING" },
  info: { color: "text-mc-cyan", bg: "bg-mc-cyan-dim", border: "border-mc-cyan/20", label: "INFO" },
};

const timelineEvents = [
  { event_type: "alert", event_at: "14:32:05", actor_name: "System", note: "Incident detected" },
  { event_type: "dispatch", event_at: "14:32:06", actor_name: "Auto", note: "Nurse Kim dispatched" },
  { event_type: "ack", event_at: "14:32:12", actor_name: "Nurse Kim", note: "Acknowledged, en route" },
];

const IncidentDetailDrawer = ({
  alert,
  open,
  onOpenChange,
}: IncidentDetailDrawerProps) => {
  if (!alert) return null;

  const sev = sevConfig[alert.severity];
  const riskPercent = Math.round(alert.metadata.overall_risk_score * 100);
  const confPercent = Math.round(alert.metadata.prediction.confidence * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-mc-panel border-mc-panel-border rounded-l"
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <SheetHeader>
          <SheetTitle className="font-mono text-sm flex items-center gap-2">
            <span className={cn("font-mono text-[8px] font-bold px-1.5 py-0.5 uppercase", sev.bg, sev.color)}>
              {alert.severity}
            </span>
            {alert.id} — {alert.title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className={cn("p-3 border", sev.border, sev.bg)}>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                <MapPin className="w-3 h-3" /> {alert.location}
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                <Clock className="w-3 h-3" /> {alert.time} AGO
              </span>
              {alert.responder && (
                <span className="flex items-center gap-1 font-mono text-[9px] text-mc-cyan">
                  <User className="w-3 h-3" /> {alert.responder}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[9px] text-muted-foreground">Confidence:</span>
              <span className="font-mono text-[10px] font-bold text-mc-cyan">{confPercent}%</span>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full bg-mc-surface border border-mc-panel-border">
              <TabsTrigger value="details" className="font-mono text-[9px]">Details</TabsTrigger>
              <TabsTrigger value="evidence" className="font-mono text-[9px]">Evidence</TabsTrigger>
              <TabsTrigger value="timeline" className="font-mono text-[9px]">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-3 space-y-3">
              <div className="bg-mc-surface border border-mc-panel-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye className="w-3 h-3 text-mc-cyan" />
                  <span className="font-mono text-[8px] text-muted-foreground uppercase">AI Conclusion</span>
                </div>
                <p className="font-mono text-[10px] text-foreground/80">{alert.conclusion}</p>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-3 h-3 text-mc-amber" />
                <span className="font-mono text-[9px] text-muted-foreground uppercase font-semibold">Recommended Actions</span>
              </div>
              <div className="space-y-1">
                {alert.recommended_actions.slice(0, 3).map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-mc-surface border border-mc-panel-border p-2"
                  >
                    <span className="font-mono text-[8px] font-bold text-mc-amber">{i + 1}</span>
                    <span className="font-mono text-[9px] text-foreground/80">{action}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="evidence" className="mt-3">
              <div className="bg-mc-surface border border-mc-panel-border p-4 flex items-center justify-center min-h-[120px]">
                <span className="font-mono text-[9px] text-muted-foreground">Evidence thumbnail placeholder</span>
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="mt-3">
              <div className="space-y-2">
                {timelineEvents.map((ev, i) => (
                  <div key={i} className="flex gap-2 border-b border-mc-panel-border/50 pb-2">
                    <span className="font-mono text-[8px] text-muted-foreground tabular-nums">{ev.event_at}</span>
                    <span className="font-mono text-[8px] font-bold uppercase">{ev.event_type}</span>
                    <span className="font-mono text-[9px] text-foreground">{ev.note}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 p-3 bg-mc-cyan-dim border border-mc-cyan/15">
            <ArrowRight className="w-3.5 h-3.5 text-mc-cyan" />
            <span className="font-mono text-[9px] text-mc-cyan font-semibold">ROUTED TO: {alert.routeTo}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default IncidentDetailDrawer;
