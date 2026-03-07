import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Clock, MapPin, User, Zap, ChevronRight } from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  location: string;
  time: string;
  assignedTo?: string;
  routeTo?: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Fall Detected",
    description: "Person collapsed. Nearest AED located 15m away.",
    location: "Main Hallway",
    time: "Just now",
    assignedTo: "Nurse Station",
    routeTo: "Medical",
  },
  {
    id: "2",
    type: "warning",
    title: "Aggression Escalating",
    description: "Voice tone + body language indicate rising conflict.",
    location: "Entrance Lobby",
    time: "2 min ago",
    assignedTo: "Security",
    routeTo: "Security",
  },
  {
    id: "3",
    type: "warning",
    title: "Collision Risk",
    description: "Two groups approaching blind corner at pace.",
    location: "Stairwell A",
    time: "5 min ago",
    routeTo: "Auto-alert",
  },
  {
    id: "4",
    type: "info",
    title: "Wet Floor",
    description: "Spill detected near water fountain.",
    location: "Cafeteria",
    time: "12 min ago",
    assignedTo: "Maintenance",
    routeTo: "Maintenance",
  },
];

const typeStyles = {
  critical: {
    dot: "bg-sentinel-red",
    bg: "bg-sentinel-red-soft",
    text: "text-sentinel-red",
    border: "border-l-sentinel-red",
  },
  warning: {
    dot: "bg-sentinel-amber",
    bg: "bg-sentinel-amber-soft",
    text: "text-sentinel-amber",
    border: "border-l-sentinel-amber",
  },
  info: {
    dot: "bg-sentinel-blue",
    bg: "bg-sentinel-blue-soft",
    text: "text-sentinel-blue",
    border: "border-l-sentinel-blue",
  },
};

const AlertsPanel = () => {
  return (
    <div className="sentinel-card overflow-hidden h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Live Alerts</h2>
          <span className="w-2 h-2 bg-sentinel-red rounded-full animate-pulse" />
        </div>
        <button className="text-[11px] text-sentinel-blue font-medium hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="divide-y divide-border">
        {alerts.map((alert, i) => {
          const style = typeStyles[alert.type];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              className={`p-4 border-l-2 ${style.border} hover:bg-secondary/30 transition-colors cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {alert.type === "critical" ? (
                    <Zap className={`w-3.5 h-3.5 ${style.text}`} />
                  ) : (
                    <AlertTriangle className={`w-3.5 h-3.5 ${style.text}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-foreground">{alert.title}</h3>
                    {alert.routeTo && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${style.bg} ${style.text} uppercase tracking-wider`}>
                        → {alert.routeTo}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" /> {alert.location}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" /> {alert.time}
                    </span>
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

export default AlertsPanel;
