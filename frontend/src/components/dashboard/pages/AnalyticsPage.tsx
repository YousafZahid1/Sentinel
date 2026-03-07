import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, BarChart3, Clock, Shield, AlertTriangle } from "lucide-react";

const weeklyData = [
  { day: "Mon", alerts: 12, prevented: 11, avgResponse: 1.4 },
  { day: "Tue", alerts: 8, prevented: 8, avgResponse: 1.1 },
  { day: "Wed", alerts: 15, prevented: 13, avgResponse: 1.6 },
  { day: "Thu", alerts: 6, prevented: 6, avgResponse: 0.9 },
  { day: "Fri", alerts: 18, prevented: 16, avgResponse: 1.8 },
  { day: "Sat", alerts: 4, prevented: 4, avgResponse: 0.7 },
  { day: "Sun", alerts: 3, prevented: 3, avgResponse: 0.8 },
];

const maxAlerts = Math.max(...weeklyData.map(d => d.alerts));

const AnalyticsPage = () => {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Weekly performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Total Alerts", value: "66", change: "-12%", trend: "down", icon: AlertTriangle, color: "text-sentinel-amber", bg: "bg-sentinel-amber-soft" },
          { label: "Prevention Rate", value: "92%", change: "+3%", trend: "up", icon: Shield, color: "text-sentinel-green", bg: "bg-sentinel-green-soft" },
          { label: "Avg Response", value: "1.2s", change: "-0.3s", trend: "down", icon: Clock, color: "text-sentinel-cyan", bg: "bg-sentinel-blue-soft" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="sentinel-card p-5">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
              <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.trend === "down" ? "text-sentinel-green" : "text-sentinel-green"}`}>
                {stat.trend === "down" ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label} this week</p>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="sentinel-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Alerts by Day</h3>
        <div className="flex items-end gap-3 h-40">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">{d.alerts}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.alerts / maxAlerts) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                className="w-full rounded-md bg-gradient-to-t from-sentinel-blue to-sentinel-cyan/60 min-h-[4px]"
              />
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Prevention chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="sentinel-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Prevention vs Incidents</h3>
        <div className="space-y-2">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-7">{d.day}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.prevented / d.alerts) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.03, duration: 0.4 }}
                  className="h-full bg-sentinel-green rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((d.alerts - d.prevented) / d.alerts) * 100}%` }}
                  transition={{ delay: 0.45 + i * 0.03, duration: 0.3 }}
                  className="h-full bg-sentinel-red"
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-12 text-right">{d.prevented}/{d.alerts}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-sentinel-green" /> Prevented</span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-sentinel-red" /> Escalated</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
