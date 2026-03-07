import { AlertTriangle, Zap, MapPin, Clock, ArrowRight, User, ChevronRight } from "lucide-react";

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  location: string;
  time: string;
  routeTo: string;
  responder?: string;
  // API response data
  conclusion: string;
  recommended_actions: string[];
  metadata: {
    people_detected: number;
    overall_risk_score: number;
    prediction: {
      likely_outcome: string;
      confidence: number;
    };
  };
}

export const alerts: Alert[] = [
  {
    id: "A-001",
    severity: "critical",
    title: "FALL DETECTED — PERSON DOWN",
    location: "MAIN HALL FL1",
    time: "00:42",
    routeTo: "NURSE STATION",
    responder: "Nurse Kim",
    conclusion: "An individual has collapsed near Room 204. Pose landmark analysis indicates loss of consciousness. No responsive movement detected for 12 seconds. Nearest AED unit located 15 meters west in emergency cabinet C-4.",
    recommended_actions: [
      "Dispatch medical team immediately to Main Hall FL1, near Room 204",
      "Retrieve AED from emergency cabinet C-4 (15m west)",
      "Clear surrounding area of bystanders",
      "Contact emergency services if no response within 60 seconds",
      "Log incident for post-event medical review"
    ],
    metadata: {
      people_detected: 6,
      overall_risk_score: 0.92,
      prediction: {
        likely_outcome: "medical_emergency",
        confidence: 0.95,
      },
    },
  },
  {
    id: "A-002",
    severity: "warning",
    title: "AGGRESSION ESCALATING",
    location: "ENTRANCE LOBBY",
    time: "03:15",
    routeTo: "SECURITY",
    responder: "Officer Davis",
    conclusion: "Voice tone analysis registers 78% aggression confidence between two individuals. Body pose landmarks indicate confrontational stance — squared shoulders, reduced interpersonal distance. Escalation trajectory suggests physical altercation within 15-30 seconds if uninterrupted.",
    recommended_actions: [
      "Alert security team for immediate de-escalation response",
      "Send verbal warning via PA system to entrance lobby",
      "Position secondary security officer at exit points",
      "Activate recording on CAM-02 for evidence preservation",
      "Prepare incident report for administrative review"
    ],
    metadata: {
      people_detected: 4,
      overall_risk_score: 0.78,
      prediction: {
        likely_outcome: "confrontation_likely",
        confidence: 0.9,
      },
    },
  },
  {
    id: "A-003",
    severity: "warning",
    title: "COLLISION RISK — BLIND CORNER",
    location: "STAIRWELL A",
    time: "07:42",
    routeTo: "AUTO-ALERT",
    conclusion: "Motion trajectory analysis detects two groups approaching intersection from opposing directions at elevated pace. Predicted collision in approximately 4 seconds based on velocity vectors. No line of sight between approaching groups.",
    recommended_actions: [
      "Send proximity alert to nearby connected devices",
      "Activate warning indicator at intersection point",
      "Monitor for post-alert trajectory changes",
      "Flag location for permanent signage review"
    ],
    metadata: {
      people_detected: 5,
      overall_risk_score: 0.55,
      prediction: {
        likely_outcome: "collision_probable",
        confidence: 0.72,
      },
    },
  },
  {
    id: "A-004",
    severity: "info",
    title: "WET FLOOR HAZARD",
    location: "CAFETERIA",
    time: "14:30",
    routeTo: "MAINTENANCE",
    responder: "Jake Thompson",
    conclusion: "Visual analysis detected liquid spill near water fountain station. Estimated area: 1.2 square meters. Current foot traffic in zone is moderate. Slip probability calculated at 23% based on surface reflection analysis.",
    recommended_actions: [
      "Notify maintenance crew for cleanup",
      "Deploy wet floor signage at affected area",
      "Reroute foot traffic if possible",
      "Monitor area until cleanup confirmed"
    ],
    metadata: {
      people_detected: 12,
      overall_risk_score: 0.1,
      prediction: {
        likely_outcome: "slip_hazard_minor",
        confidence: 0.85,
      },
    },
  },
];

export type { Alert };

const sevStyles = {
  critical: {
    border: "border-l-mc-red mc-pulse-red",
    bg: "bg-mc-red-dim",
    text: "text-mc-red",
    badge: "bg-mc-red text-background",
    icon: Zap,
  },
  warning: {
    border: "border-l-mc-amber mc-pulse-amber",
    bg: "bg-mc-amber-dim",
    text: "text-mc-amber",
    badge: "bg-mc-amber text-background",
    icon: AlertTriangle,
  },
  info: {
    border: "border-l-mc-cyan",
    bg: "bg-mc-cyan-dim",
    text: "text-mc-cyan",
    badge: "bg-mc-cyan text-background",
    icon: AlertTriangle,
  },
};

interface AlertStackProps {
  alerts?: Alert[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const AlertStack = ({ selectedId, onSelect, alerts: propAlerts }: AlertStackProps) => {
  const activeAlerts = propAlerts ?? alerts;
  return (
    <div className="mc-panel h-full flex flex-col">
      <div className="mc-panel-header">
        <span className="mc-panel-label">Alert Stack</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-mc-red font-bold animate-pulse">● {activeAlerts.filter(a => a.severity === "critical").length} CRIT</span>
          <span className="font-mono text-[9px] text-mc-amber font-semibold">{activeAlerts.filter(a => a.severity === "warning").length} WARN</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeAlerts.map((alert) => {
          const sev = sevStyles[alert.severity];
          const Icon = sev.icon;
          const isSelected = selectedId === alert.id;
          return (
            <div
              key={alert.id}
              onClick={() => onSelect(alert.id)}
              className={`border-l-2 ${sev.border} border-b border-mc-panel-border p-3 cursor-pointer transition-colors ${
                isSelected ? "bg-mc-surface ring-1 ring-inset ring-mc-cyan/20" : "hover:bg-mc-surface"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`p-1 ${sev.bg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-3 h-3 ${sev.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[8px] text-muted-foreground">{alert.id}</span>
                    <span className={`font-mono text-[7px] font-bold px-1 py-px ${sev.badge} uppercase`}>
                      {alert.severity}
                    </span>
                  </div>
                  <h3 className="font-mono text-[10px] font-bold text-foreground leading-tight">{alert.title}</h3>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-0.5 font-mono text-[8px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" /> {alert.location}
                    </span>
                    <span className="flex items-center gap-0.5 font-mono text-[8px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" /> {alert.time} AGO
                    </span>
                  </div>

                  {alert.responder && (
                    <div className="mt-1 flex items-center gap-1">
                      <User className="w-2.5 h-2.5 text-mc-cyan" />
                      <span className="font-mono text-[8px] text-mc-cyan font-semibold">{alert.responder}</span>
                    </div>
                  )}

                  {/* Click hint */}
                  <div className="mt-1.5 flex items-center gap-1">
                    <ChevronRight className={`w-2.5 h-2.5 ${isSelected ? "text-mc-cyan" : "text-muted-foreground/30"}`} />
                    <span className={`font-mono text-[7px] ${isSelected ? "text-mc-cyan" : "text-muted-foreground/30"}`}>
                      {isSelected ? "VIEWING ANALYSIS" : "CLICK FOR DETAILS"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertStack;
