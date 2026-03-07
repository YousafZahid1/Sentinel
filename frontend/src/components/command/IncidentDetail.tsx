import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Zap, Shield, Users, Target, Brain,
  ChevronRight, MapPin, Clock, User, ArrowRight, Activity,
  BarChart3, Eye
} from "lucide-react";
import { Alert } from "./AlertStack";

interface IncidentDetailProps {
  alert: Alert | null;
}

const sevConfig = {
  critical: { color: "text-mc-red", bg: "bg-mc-red-dim", border: "border-mc-red/30", label: "CRITICAL" },
  warning: { color: "text-mc-amber", bg: "bg-mc-amber-dim", border: "border-mc-amber/30", label: "WARNING" },
  info: { color: "text-mc-cyan", bg: "bg-mc-cyan-dim", border: "border-mc-cyan/20", label: "INFO" },
};

const IncidentDetail = ({ alert }: IncidentDetailProps) => {
  if (!alert) {
    return (
      <div className="mc-panel h-full flex flex-col">
        <div className="mc-panel-header">
          <span className="mc-panel-label">Incident Analysis</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-8 h-8 text-muted-foreground/10 mx-auto mb-3" />
            <p className="font-mono text-[11px] text-muted-foreground/30 font-semibold">SELECT AN ALERT TO VIEW ANALYSIS</p>
            <p className="font-mono text-[9px] text-muted-foreground/20 mt-1">AI-generated incident breakdown will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  const sev = sevConfig[alert.severity];
  const riskPercent = Math.round(alert.metadata.overall_risk_score * 100);
  const confPercent = Math.round(alert.metadata.prediction.confidence * 100);

  return (
    <div className="mc-panel h-full flex flex-col">
      <div className="mc-panel-header">
        <div className="flex items-center gap-2">
          <span className="mc-panel-label">Incident Analysis</span>
          <span className={`font-mono text-[8px] font-bold px-1.5 py-0.5 ${sev.bg} ${sev.color} uppercase`}>{alert.id}</span>
        </div>
        <span className={`font-mono text-[9px] font-bold ${sev.color}`}>● {sev.label}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            {/* Title bar */}
            <div className={`p-3 border ${sev.border} ${sev.bg}`}>
              <h2 className={`font-mono text-xs font-bold ${sev.color}`}>{alert.title}</h2>
              <div className="flex items-center gap-4 mt-1.5">
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
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-mc-surface border border-mc-panel-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="w-3 h-3 text-mc-cyan" />
                  <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">People Detected</span>
                </div>
                <span className="font-mono text-2xl font-bold text-foreground">{alert.metadata.people_detected}</span>
              </div>

              <div className="bg-mc-surface border border-mc-panel-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="w-3 h-3 text-mc-amber" />
                  <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Risk Score</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`font-mono text-2xl font-bold ${riskPercent > 70 ? "text-mc-red" : riskPercent > 40 ? "text-mc-amber" : "text-mc-green"}`}>
                    {riskPercent}%
                  </span>
                </div>
                <div className="w-full h-1 bg-background mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskPercent}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`h-full ${riskPercent > 70 ? "bg-mc-red" : riskPercent > 40 ? "bg-mc-amber" : "bg-mc-green"}`}
                  />
                </div>
              </div>

              <div className="bg-mc-surface border border-mc-panel-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3 h-3 text-mc-cyan" />
                  <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Prediction</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-foreground block">
                  {alert.metadata.prediction.likely_outcome.replace(/_/g, " ").toUpperCase()}
                </span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="font-mono text-[9px] text-muted-foreground">Confidence:</span>
                  <span className={`font-mono text-[10px] font-bold ${confPercent > 80 ? "text-mc-red" : "text-mc-amber"}`}>{confPercent}%</span>
                </div>
                <div className="w-full h-1 bg-background mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confPercent}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full bg-mc-cyan"
                  />
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3 h-3 text-mc-cyan" />
                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">AI Conclusion</span>
              </div>
              <div className="bg-mc-surface border border-mc-panel-border p-3">
                <p className="font-mono text-[10px] text-foreground/80 leading-relaxed">{alert.conclusion}</p>
              </div>
            </div>

            {/* Recommended Actions */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-3 h-3 text-mc-amber" />
                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Recommended Actions</span>
              </div>
              <div className="space-y-1">
                {alert.recommended_actions.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-start gap-2 bg-mc-surface border border-mc-panel-border p-2.5 hover:border-mc-cyan/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-center w-5 h-5 bg-mc-amber-dim flex-shrink-0 mt-px">
                      <span className="font-mono text-[8px] font-bold text-mc-amber">{i + 1}</span>
                    </div>
                    <span className="font-mono text-[9px] text-foreground/70 leading-relaxed group-hover:text-foreground transition-colors">{action}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-mc-cyan flex-shrink-0 mt-0.5 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Route info */}
            <div className="flex items-center gap-2 p-3 bg-mc-cyan-dim border border-mc-cyan/15">
              <ArrowRight className="w-3.5 h-3.5 text-mc-cyan" />
              <span className="font-mono text-[9px] text-mc-cyan font-semibold">ROUTED TO: {alert.routeTo}</span>
              {alert.responder && (
                <>
                  <span className="font-mono text-[9px] text-muted-foreground">|</span>
                  <span className="font-mono text-[9px] text-mc-cyan">ASSIGNED: {alert.responder}</span>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IncidentDetail;
