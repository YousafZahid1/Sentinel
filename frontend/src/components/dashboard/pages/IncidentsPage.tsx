import { motion } from "framer-motion";
import { Shield, Clock, MapPin, User, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Incident {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  status: "active" | "responding" | "resolved";
  location: string;
  time: string;
  responders: string[];
  description: string;
}

const incidents: Incident[] = [
  { id: "INC-001", title: "Person Collapsed in Hallway", severity: "high", status: "responding", location: "Main Hallway — Floor 1", time: "14:32", responders: ["Nurse Kim", "Security Officer Davis"], description: "Individual fell near Room 204. AED dispatched. Medical team en route." },
  { id: "INC-002", title: "Physical Altercation", severity: "high", status: "active", location: "Entrance Lobby", time: "14:28", responders: ["Security Team Alpha"], description: "Two individuals in heated argument escalated to physical contact. Security notified." },
  { id: "INC-003", title: "Wet Floor Hazard", severity: "low", status: "resolved", location: "Cafeteria", time: "13:45", responders: ["Maintenance Crew"], description: "Water spill near fountain cleaned. Area marked with caution signs." },
  { id: "INC-004", title: "Crowd Congestion", severity: "medium", status: "resolved", location: "West Wing Corridor", time: "12:10", responders: ["Admin Office"], description: "Corridor exceeded safe capacity during lunch hour. Flow redirected." },
  { id: "INC-005", title: "Unauthorized Zone Entry", severity: "high", status: "resolved", location: "Server Room", time: "11:05", responders: ["Security Officer Martinez"], description: "Motion detected in restricted area. Verified as maintenance personnel without badge." },
];

const severityStyles = {
  high: { bg: "bg-sentinel-red-soft", text: "text-sentinel-red", label: "High" },
  medium: { bg: "bg-sentinel-amber-soft", text: "text-sentinel-amber", label: "Medium" },
  low: { bg: "bg-sentinel-blue-soft", text: "text-sentinel-blue", label: "Low" },
};

const statusStyles = {
  active: { bg: "bg-sentinel-red-soft", text: "text-sentinel-red", label: "Active" },
  responding: { bg: "bg-sentinel-amber-soft", text: "text-sentinel-amber", label: "Responding" },
  resolved: { bg: "bg-sentinel-green-soft", text: "text-sentinel-green", label: "Resolved" },
};

const IncidentsPage = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Incidents</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{incidents.filter(i => i.status !== "resolved").length} active · {incidents.length} total today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {incidents.map((inc, i) => {
          const sev = severityStyles[inc.severity];
          const stat = statusStyles[inc.status];
          const isOpen = selected === inc.id;
          return (
            <motion.div
              key={inc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(isOpen ? null : inc.id)}
              className={`sentinel-card p-4 cursor-pointer transition-all ${inc.status === "resolved" ? "opacity-60" : ""} ${isOpen ? "ring-1 ring-sentinel-blue/30" : "sentinel-card-hover"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">{inc.id}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${sev.bg} ${sev.text} uppercase`}>{sev.label}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${stat.bg} ${stat.text} uppercase`}>{stat.label}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mt-1.5">{inc.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" />{inc.location}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" />{inc.time}</span>
                  </div>
                </div>
              </div>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{inc.description}</p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Responders:</span>
                    {inc.responders.map(r => (
                      <span key={r} className="text-[10px] font-medium text-sentinel-blue bg-sentinel-blue-soft px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentsPage;
