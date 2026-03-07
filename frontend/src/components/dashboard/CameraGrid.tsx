import { motion } from "framer-motion";
import { AlertTriangle, Maximize2, Video } from "lucide-react";

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: "active" | "alert" | "offline";
  riskLevel: number;
}

const cameras: CameraFeed[] = [
  { id: "cam1", name: "CAM-01", location: "Main Hallway — Floor 1", status: "active", riskLevel: 12 },
  { id: "cam2", name: "CAM-02", location: "Entrance Lobby", status: "alert", riskLevel: 78 },
  { id: "cam3", name: "CAM-03", location: "Cafeteria", status: "active", riskLevel: 5 },
  { id: "cam4", name: "CAM-04", location: "Parking Lot B", status: "active", riskLevel: 23 },
  { id: "cam5", name: "CAM-05", location: "Stairwell A", status: "alert", riskLevel: 65 },
  { id: "cam6", name: "CAM-06", location: "West Wing Corridor", status: "active", riskLevel: 8 },
];

const CameraGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {cameras.map((cam, i) => {
        const isAlert = cam.riskLevel > 50;
        return (
          <motion.div
            key={cam.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className={`sentinel-card overflow-hidden group cursor-pointer transition-all duration-200 ${
              isAlert ? "border-sentinel-red/20 hover:border-sentinel-red/40" : "sentinel-card-hover"
            }`}
          >
            {/* Feed area */}
            <div className="relative aspect-[16/10] bg-gradient-to-br from-background to-secondary flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)",
              }} />
              
              <Video className="w-8 h-8 text-muted-foreground/20" />

              {/* Top-left: name + status */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-card/70 backdrop-blur-sm rounded-md px-2 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? "bg-sentinel-red animate-pulse" : "bg-sentinel-green"}`} />
                <span className="text-[10px] font-mono font-semibold text-foreground/80">{cam.name}</span>
              </div>

              {/* Top-right: risk badge (alert) OR time (normal) */}
              <div className="absolute top-2.5 right-2.5">
                {isAlert ? (
                  <div className="flex items-center gap-1 bg-sentinel-red/90 backdrop-blur rounded-md px-2 py-1">
                    <AlertTriangle className="w-3 h-3 text-primary-foreground" />
                    <span className="text-[10px] font-bold text-primary-foreground">Risk {cam.riskLevel}%</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-foreground/40 bg-card/50 backdrop-blur-sm rounded-md px-2 py-1">
                    {new Date().toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                )}
              </div>

              {/* Bottom-left: LIVE */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-sentinel-red/80 backdrop-blur rounded-md px-1.5 py-0.5">
                <span className="w-1 h-1 rounded-full bg-primary-foreground animate-pulse" />
                <span className="text-[9px] font-bold text-primary-foreground tracking-widest uppercase">Live</span>
              </div>

              {/* Bottom-right: expand */}
              <button className="absolute bottom-2.5 right-2.5 p-1.5 bg-card/60 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3 h-3 text-foreground/70" />
              </button>
            </div>

            {/* Info bar */}
            <div className="p-3 flex items-center justify-between">
              <p className="text-xs text-foreground font-medium truncate mr-3">{cam.location}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-14 h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cam.riskLevel}%` }}
                    transition={{ delay: i * 0.04 + 0.3, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      cam.riskLevel > 50 ? "bg-sentinel-red" : cam.riskLevel > 30 ? "bg-sentinel-amber" : "bg-sentinel-green"
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-mono font-semibold ${
                  cam.riskLevel > 50 ? "text-sentinel-red" : cam.riskLevel > 30 ? "text-sentinel-amber" : "text-sentinel-green"
                }`}>
                  {cam.riskLevel}%
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CameraGrid;
