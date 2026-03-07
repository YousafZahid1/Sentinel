import { motion } from "framer-motion";
import { Camera, Video, Maximize2, AlertTriangle } from "lucide-react";

const cameras = [
  { id: "cam1", name: "CAM-01", location: "Main Hallway — Floor 1", status: "active" as const, riskLevel: 12 },
  { id: "cam2", name: "CAM-02", location: "Entrance Lobby", status: "alert" as const, riskLevel: 78 },
  { id: "cam3", name: "CAM-03", location: "Cafeteria", status: "active" as const, riskLevel: 5 },
  { id: "cam4", name: "CAM-04", location: "Parking Lot B", status: "active" as const, riskLevel: 23 },
  { id: "cam5", name: "CAM-05", location: "Stairwell A", status: "alert" as const, riskLevel: 65 },
  { id: "cam6", name: "CAM-06", location: "West Wing Corridor", status: "active" as const, riskLevel: 8 },
  { id: "cam7", name: "CAM-07", location: "East Entrance", status: "active" as const, riskLevel: 3 },
  { id: "cam8", name: "CAM-08", location: "Server Room", status: "active" as const, riskLevel: 0 },
];

const CamerasPage = () => {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">All Cameras</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{cameras.length} cameras configured · {cameras.filter(c => c.status === "active" || c.status === "alert").length} online</p>
        </div>
        <button className="text-xs font-medium text-sentinel-blue bg-sentinel-blue-soft px-3 py-2 rounded-xl hover:bg-sentinel-blue/20 transition-colors">
          + Add Camera
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {cameras.map((cam, i) => {
          const isAlert = cam.riskLevel > 50;
          return (
            <motion.div
              key={cam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`sentinel-card overflow-hidden group cursor-pointer ${isAlert ? "border-sentinel-red/20" : "sentinel-card-hover"}`}
            >
              <div className="relative aspect-video bg-gradient-to-br from-background to-secondary flex items-center justify-center">
                <Video className="w-6 h-6 text-muted-foreground/20" />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-card/70 backdrop-blur-sm rounded-md px-2 py-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? "bg-sentinel-red animate-pulse" : "bg-sentinel-green"}`} />
                  <span className="text-[10px] font-mono font-semibold text-foreground/80">{cam.name}</span>
                </div>
                {isAlert && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-sentinel-red/90 backdrop-blur rounded-md px-1.5 py-0.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-primary-foreground" />
                    <span className="text-[9px] font-bold text-primary-foreground">{cam.riskLevel}%</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-sentinel-red/80 backdrop-blur rounded-md px-1.5 py-0.5">
                  <span className="w-1 h-1 rounded-full bg-primary-foreground animate-pulse" />
                  <span className="text-[8px] font-bold text-primary-foreground tracking-widest uppercase">Live</span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[11px] text-foreground font-medium truncate">{cam.location}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Risk: {cam.riskLevel}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CamerasPage;
