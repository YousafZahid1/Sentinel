import { motion } from "framer-motion";
import { MapPin, Camera, AlertTriangle, Users } from "lucide-react";

const zones = [
  { id: "z1", name: "Main Hallway", cameras: 3, risk: "high", alerts: 2, x: 20, y: 30, w: 35, h: 15 },
  { id: "z2", name: "Entrance Lobby", cameras: 2, risk: "medium", alerts: 1, x: 10, y: 10, w: 25, h: 18 },
  { id: "z3", name: "Cafeteria", cameras: 2, risk: "low", alerts: 0, x: 55, y: 45, w: 30, h: 25 },
  { id: "z4", name: "Stairwell A", cameras: 1, risk: "medium", alerts: 1, x: 45, y: 15, w: 12, h: 20 },
  { id: "z5", name: "West Wing", cameras: 2, risk: "low", alerts: 0, x: 10, y: 55, w: 30, h: 20 },
  { id: "z6", name: "Parking Lot B", cameras: 2, risk: "low", alerts: 0, x: 60, y: 10, w: 30, h: 25 },
  { id: "z7", name: "Server Room", cameras: 1, risk: "low", alerts: 0, x: 45, y: 60, w: 15, h: 15 },
];

const riskColors = {
  high: { bg: "bg-sentinel-red/20", border: "border-sentinel-red/40", dot: "bg-sentinel-red" },
  medium: { bg: "bg-sentinel-amber/15", border: "border-sentinel-amber/30", dot: "bg-sentinel-amber" },
  low: { bg: "bg-sentinel-green/10", border: "border-sentinel-green/20", dot: "bg-sentinel-green" },
};

const SiteMapPage = () => {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Site Map</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Floor plan overview with active zones</p>
        </div>
        <div className="flex items-center gap-4">
          {(["high", "medium", "low"] as const).map(r => (
            <span key={r} className="flex items-center gap-1.5 text-[10px] text-muted-foreground capitalize">
              <span className={`w-2 h-2 rounded-full ${riskColors[r].dot}`} /> {r}
            </span>
          ))}
        </div>
      </div>

      {/* Map area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sentinel-card p-1 relative">
        <div className="relative w-full aspect-[16/9] bg-secondary/30 rounded-lg overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {zones.map((zone, i) => {
            const rc = riskColors[zone.risk as keyof typeof riskColors];
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`absolute ${rc.bg} ${rc.border} border rounded-lg cursor-pointer hover:scale-105 transition-transform p-2 flex flex-col justify-between`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground/80 truncate">{zone.name}</span>
                  {zone.alerts > 0 && <span className={`w-2 h-2 rounded-full ${rc.dot} animate-pulse`} />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><Camera className="w-2.5 h-2.5" />{zone.cameras}</span>
                  {zone.alerts > 0 && <span className="flex items-center gap-0.5 text-[9px] text-sentinel-red"><AlertTriangle className="w-2.5 h-2.5" />{zone.alerts}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Zone list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {zones.map((zone, i) => {
          const rc = riskColors[zone.risk as keyof typeof riskColors];
          return (
            <motion.div key={zone.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.03 }} className="sentinel-card p-3 sentinel-card-hover cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rc.dot}`} />
                  <span className="text-xs font-semibold text-foreground">{zone.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground capitalize">{zone.risk} risk</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Camera className="w-3 h-3" /> {zone.cameras} cameras</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {zone.alerts} alerts</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SiteMapPage;
