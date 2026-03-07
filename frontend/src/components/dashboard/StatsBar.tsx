import { motion } from "framer-motion";
import { Camera, Shield, AlertTriangle, Users, TrendingDown, Zap } from "lucide-react";

const stats = [
  {
    label: "Active Cameras",
    value: "24",
    subtext: "All online",
    icon: Camera,
    color: "text-sentinel-blue",
    bg: "bg-sentinel-blue-soft",
  },
  {
    label: "Threats Prevented",
    value: "147",
    subtext: "+12 today",
    icon: Shield,
    color: "text-sentinel-green",
    bg: "bg-sentinel-green-soft",
  },
  {
    label: "Active Alerts",
    value: "3",
    subtext: "2 critical",
    icon: AlertTriangle,
    color: "text-sentinel-amber",
    bg: "bg-sentinel-amber-soft",
  },
  {
    label: "Avg Response",
    value: "1.2s",
    subtext: "↓ 0.3s faster",
    icon: Zap,
    color: "text-sentinel-cyan",
    bg: "bg-sentinel-blue-soft",
  },
  {
    label: "Responders",
    value: "8",
    subtext: "On duty",
    icon: Users,
    color: "text-sentinel-blue",
    bg: "bg-sentinel-blue-soft",
  },
];

const StatsBar = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="sentinel-card p-4 sentinel-card-hover"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            <p className={`text-[10px] font-medium ${stat.color}`}>{stat.subtext}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;
