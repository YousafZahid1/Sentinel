import { motion } from "framer-motion";
import { AlertTriangle, Zap, MapPin, Clock, User, CheckCircle2, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  location: string;
  time: string;
  assignedTo?: string;
  routeTo?: string;
  resolved: boolean;
}

const allAlerts: Alert[] = [
  { id: "1", type: "critical", title: "Fall Detected", description: "Person collapsed in hallway. Nearest AED located 15m away.", location: "Main Hallway", time: "2 min ago", assignedTo: "Nurse Station", routeTo: "Medical", resolved: false },
  { id: "2", type: "warning", title: "Aggression Escalating", description: "Voice tone + body language indicate rising conflict between two individuals.", location: "Entrance Lobby", time: "5 min ago", assignedTo: "Security Team", routeTo: "Security", resolved: false },
  { id: "3", type: "warning", title: "Collision Risk", description: "Two groups approaching blind corner at pace.", location: "Stairwell A", time: "8 min ago", routeTo: "Auto-alert", resolved: false },
  { id: "4", type: "info", title: "Wet Floor", description: "Spill detected near water fountain. Low-risk slip hazard.", location: "Cafeteria", time: "15 min ago", assignedTo: "Maintenance", routeTo: "Maintenance", resolved: true },
  { id: "5", type: "critical", title: "Unauthorized Access", description: "Movement detected in restricted zone after hours.", location: "Server Room", time: "22 min ago", assignedTo: "Security Team", routeTo: "Security", resolved: true },
  { id: "6", type: "info", title: "Crowd Density High", description: "Cafeteria exceeding 80% capacity threshold.", location: "Cafeteria", time: "30 min ago", routeTo: "Admin", resolved: true },
];

const typeStyles = {
  critical: { dot: "bg-sentinel-red", bg: "bg-sentinel-red-soft", text: "text-sentinel-red", border: "border-l-sentinel-red" },
  warning: { dot: "bg-sentinel-amber", bg: "bg-sentinel-amber-soft", text: "text-sentinel-amber", border: "border-l-sentinel-amber" },
  info: { dot: "bg-sentinel-blue", bg: "bg-sentinel-blue-soft", text: "text-sentinel-blue", border: "border-l-sentinel-blue" },
};

const AlertsPage = () => {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const filtered = allAlerts.filter(a => filter === "all" ? true : filter === "active" ? !a.resolved : a.resolved);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{allAlerts.filter(a => !a.resolved).length} active · {allAlerts.filter(a => a.resolved).length} resolved</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-xl p-0.5">
          {(["all", "active", "resolved"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((alert, i) => {
          const style = typeStyles[alert.type];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`sentinel-card p-4 border-l-2 ${style.border} ${alert.resolved ? "opacity-60" : ""} sentinel-card-hover cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                  {alert.type === "critical" ? <Zap className={`w-3.5 h-3.5 ${style.text}`} /> : <AlertTriangle className={`w-3.5 h-3.5 ${style.text}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-foreground">{alert.title}</h3>
                    {alert.resolved && <CheckCircle2 className="w-3.5 h-3.5 text-sentinel-green" />}
                    {alert.routeTo && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${style.bg} ${style.text} uppercase tracking-wider`}>
                        → {alert.routeTo}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" /> {alert.location}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" /> {alert.time}</span>
                    {alert.assignedTo && <span className="flex items-center gap-1 text-[10px] text-sentinel-blue font-medium"><User className="w-2.5 h-2.5" /> {alert.assignedTo}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPage;
