import { useState } from "react";
import StatusBar from "@/components/command/StatusBar";
import CameraPanel from "@/components/command/CameraPanel";
import AlertStack from "@/components/command/AlertStack";
import FloorMap from "@/components/command/FloorMap";
import BottomStrip from "@/components/command/BottomStrip";

const Index = () => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top: Status Bar */}
      <StatusBar />

      {/* Main: 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Camera Feeds */}
        <div className="w-[220px] flex-shrink-0 border-r border-mc-panel-border">
          <CameraPanel />
        </div>

        {/* Center: Live floor map with incident pings */}
        <div className="flex-[1.2] min-w-0">
          <FloorMap />
        </div>

        {/* Right: Alert Stack */}
        <div className="w-[260px] flex-shrink-0 border-l border-mc-panel-border">
          <AlertStack selectedId={selectedAlertId} onSelect={(id) => setSelectedAlertId(prev => prev === id ? null : id)} />
        </div>
      </div>

      {/* Bottom: Responders + Audit */}
      <BottomStrip />
    </div>
  );
};

export default Index;
