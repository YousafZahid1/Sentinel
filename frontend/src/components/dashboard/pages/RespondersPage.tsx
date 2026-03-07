import { motion } from "framer-motion";
import { User, Phone, MapPin, Shield, Clock, CheckCircle2, Circle } from "lucide-react";

interface Responder {
  id: string;
  name: string;
  role: string;
  status: "available" | "responding" | "off-duty";
  location: string;
  phone: string;
  currentTask?: string;
}

const responders: Responder[] = [
  { id: "r1", name: "Officer Davis", role: "Security", status: "responding", location: "Main Hallway", phone: "+1 555-0101", currentTask: "INC-001: Fall Detection" },
  { id: "r2", name: "Nurse Kim", role: "Medical", status: "responding", location: "En route to Floor 1", phone: "+1 555-0102", currentTask: "INC-001: Fall Detection" },
  { id: "r3", name: "Officer Martinez", role: "Security", status: "available", location: "Control Room", phone: "+1 555-0103" },
  { id: "r4", name: "Dr. Patel", role: "Medical", status: "available", location: "Medical Office", phone: "+1 555-0104" },
  { id: "r5", name: "Jake Thompson", role: "Maintenance", status: "available", location: "Maintenance Bay", phone: "+1 555-0105" },
  { id: "r6", name: "Sarah Chen", role: "Security", status: "off-duty", location: "—", phone: "+1 555-0106" },
  { id: "r7", name: "Mike Johnson", role: "Admin", status: "available", location: "Admin Office", phone: "+1 555-0107" },
  { id: "r8", name: "Lisa Brown", role: "Medical", status: "off-duty", location: "—", phone: "+1 555-0108" },
];

const statusStyles = {
  available: { dot: "bg-sentinel-green", text: "text-sentinel-green", label: "Available" },
  responding: { dot: "bg-sentinel-amber animate-pulse", text: "text-sentinel-amber", label: "Responding" },
  "off-duty": { dot: "bg-muted-foreground/40", text: "text-muted-foreground", label: "Off Duty" },
};

const roleColors: Record<string, string> = {
  Security: "bg-sentinel-blue-soft text-sentinel-blue",
  Medical: "bg-sentinel-red-soft text-sentinel-red",
  Maintenance: "bg-sentinel-amber-soft text-sentinel-amber",
  Admin: "bg-sentinel-green-soft text-sentinel-green",
};

const RespondersPage = () => {
  const available = responders.filter(r => r.status === "available").length;
  const responding = responders.filter(r => r.status === "responding").length;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Responders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{available} available · {responding} responding · {responders.length} total</p>
        </div>
        <button className="text-xs font-medium text-sentinel-blue bg-sentinel-blue-soft px-3 py-2 rounded-xl hover:bg-sentinel-blue/20 transition-colors">
          + Add Responder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {responders.map((r, i) => {
          const stat = statusStyles[r.status];
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`sentinel-card p-4 sentinel-card-hover cursor-pointer ${r.status === "off-duty" ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{r.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${stat.dot} flex-shrink-0`} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${roleColors[r.role] || "bg-secondary text-muted-foreground"} uppercase`}>{r.role}</span>
                    <span className={`text-[10px] ${stat.text}`}>{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" />{r.location}</span>
                  </div>
                  {r.currentTask && (
                    <div className="mt-2 p-2 rounded-lg bg-sentinel-amber-soft/50 border border-sentinel-amber/10">
                      <span className="text-[10px] text-sentinel-amber font-medium">{r.currentTask}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RespondersPage;
