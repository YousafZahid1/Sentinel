import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Responder {
  id: string;
  name: string;
  role: string;
  status: "responding" | "available" | "off-duty";
  location: string;
  task?: string;
}

interface AuditEntry {
  time: string;
  event: string;
  type: "dispatch" | "alert" | "resolve" | "system";
}

const responders: Responder[] = [
  { id: "r1", name: "OFFICER DAVIS", role: "SEC", status: "responding", location: "MAIN HALL", task: "A-002 AGGRESSION" },
  { id: "r2", name: "NURSE KIM", role: "MED", status: "responding", location: "EN ROUTE FL1", task: "A-001 FALL" },
  { id: "r3", name: "MARTINEZ", role: "SEC", status: "available", location: "CTRL ROOM" },
  { id: "r4", name: "DR. PATEL", role: "MED", status: "available", location: "MED OFFICE" },
  { id: "r5", name: "THOMPSON", role: "MNT", status: "available", location: "MNT BAY" },
  { id: "r6", name: "CHEN", role: "SEC", status: "off-duty", location: "—" },
  { id: "r7", name: "JOHNSON", role: "ADM", status: "available", location: "ADMIN" },
];

const auditLog: AuditEntry[] = [
  { time: "14:32:05", event: "A-001 FALL DETECTED — MAIN HALL FL1 — MEDICAL DISPATCHED", type: "alert" },
  { time: "14:32:06", event: "AUTO-DISPATCH: NURSE KIM → MAIN HALL FL1 (EST. 45s)", type: "dispatch" },
  { time: "14:28:51", event: "A-002 AGGRESSION ALERT — ENTRANCE LOBBY — SECURITY NOTIFIED", type: "alert" },
  { time: "14:28:52", event: "AUTO-DISPATCH: OFFICER DAVIS → ENTRANCE LOBBY (EST. 30s)", type: "dispatch" },
  { time: "14:24:10", event: "A-003 COLLISION RISK — STAIRWELL A — PROXIMITY ALERT SENT", type: "alert" },
  { time: "14:18:00", event: "A-004 WET FLOOR — CAFETERIA — MAINTENANCE NOTIFIED", type: "alert" },
  { time: "14:15:22", event: "INC-003 RESOLVED — WET FLOOR CLEANUP COMPLETE", type: "resolve" },
  { time: "14:00:00", event: "SYSTEM: SHIFT CHANGE — 8 RESPONDERS ON DUTY", type: "system" },
];

const statusDot = {
  responding: "bg-mc-amber animate-pulse",
  available: "bg-mc-green",
  "off-duty": "bg-muted-foreground/30",
};

const statusColor = {
  responding: "text-mc-amber",
  available: "text-mc-green",
  "off-duty": "text-muted-foreground/40",
};

const roleColor: Record<string, string> = {
  SEC: "text-mc-blue bg-mc-blue-dim",
  MED: "text-mc-red bg-mc-red-dim",
  MNT: "text-mc-amber bg-mc-amber-dim",
  ADM: "text-mc-green bg-mc-green-dim",
};

const auditTypeColor = {
  dispatch: "text-mc-cyan",
  alert: "text-mc-amber",
  resolve: "text-mc-green",
  system: "text-muted-foreground",
};

const HEIGHTS = ["h-8", "h-44", "h-80"] as const;
type HeightState = 0 | 1 | 2;

const BottomStrip = () => {
  const [heightIdx, setHeightIdx] = useState<HeightState>(0);

  const collapsed = heightIdx === 0;
  const expanded = heightIdx === 2;

  const cycleUp = () => setHeightIdx((i) => Math.min(i + 1, 2) as HeightState);
  const cycleDown = () => setHeightIdx((i) => Math.max(i - 1, 0) as HeightState);

  return (
    <div className={`mc-panel flex flex-col flex-shrink-0 transition-all duration-200 ${HEIGHTS[heightIdx]}`}>
      {/* Drag bar / controls */}
      <div className="flex items-center justify-center gap-3 border-b border-mc-panel-border py-0.5 flex-shrink-0 bg-mc-surface">
        <button
          onClick={cycleDown}
          disabled={heightIdx === 0}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          title="Collapse"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest select-none">
          {collapsed ? "collapsed" : expanded ? "expanded" : "normal"}
        </span>
        <button
          onClick={cycleUp}
          disabled={heightIdx === 2}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          title="Expand"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-1 min-h-0">
          {/* Responder Assignments */}
          <div className="w-[45%] flex flex-col border-r border-mc-panel-border min-h-0">
            <div className="mc-panel-header flex-shrink-0">
              <span className="mc-panel-label">Responder Assignments</span>
              <span className="font-mono text-[9px] text-mc-green">{responders.filter(r => r.status !== "off-duty").length} ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mc-panel-border bg-mc-surface">
                    {["STATUS", "NAME", "ROLE", "LOCATION", "TASK"].map(h => (
                      <th key={h} className="font-mono text-[7px] text-muted-foreground font-semibold text-left px-2 py-1 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responders.map(r => (
                    <tr key={r.id} className={`border-b border-mc-panel-border/50 hover:bg-mc-surface transition-colors cursor-pointer ${r.status === "off-duty" ? "opacity-30" : ""}`}>
                      <td className="px-2 py-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot[r.status]}`} />
                      </td>
                      <td className={`font-mono text-[9px] font-semibold px-2 py-1 ${statusColor[r.status]}`}>{r.name}</td>
                      <td className="px-2 py-1">
                        <span className={`font-mono text-[7px] font-bold px-1 py-0.5 ${roleColor[r.role] || "text-muted-foreground bg-mc-surface"}`}>{r.role}</span>
                      </td>
                      <td className="font-mono text-[8px] text-muted-foreground px-2 py-1">{r.location}</td>
                      <td className="font-mono text-[8px] px-2 py-1">
                        {r.task ? <span className="text-mc-amber font-semibold">{r.task}</span> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mc-panel-header flex-shrink-0">
              <span className="mc-panel-label">Audit Trail</span>
              <span className="font-mono text-[9px] text-muted-foreground">LIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {auditLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-1.5 border-b border-mc-panel-border/30 hover:bg-mc-surface transition-colors">
                  <span className="font-mono text-[8px] text-muted-foreground tabular-nums flex-shrink-0 mt-px">{entry.time}</span>
                  <span className={`font-mono text-[7px] font-bold px-1 py-px uppercase flex-shrink-0 mt-px ${
                    entry.type === "dispatch" ? "bg-mc-cyan-dim text-mc-cyan" :
                    entry.type === "alert" ? "bg-mc-amber-dim text-mc-amber" :
                    entry.type === "resolve" ? "bg-mc-green-dim text-mc-green" :
                    "bg-mc-surface text-muted-foreground"
                  }`}>{entry.type.slice(0, 4)}</span>
                  <span className={`font-mono text-[8px] leading-relaxed ${auditTypeColor[entry.type]}`}>{entry.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomStrip;
