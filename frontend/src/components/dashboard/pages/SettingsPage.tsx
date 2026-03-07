import { motion } from "framer-motion";
import { Camera, Bell, Shield, Users, Clock, Globe, Lock, Save } from "lucide-react";
import { useState } from "react";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [audioAnalysis, setAudioAnalysis] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${checked ? "bg-sentinel-blue" : "bg-secondary"}`}
    >
      <motion.div
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-foreground shadow-sm"
      />
    </button>
  );

  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure your Sentinel admin panel</p>
      </div>

      {/* General */}
      <div className="sentinel-card divide-y divide-border">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">General</h3>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Push Notifications</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Send alerts to responder devices</p>
          </div>
          <Toggle checked={notifications} onChange={setNotifications} />
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Auto-Dispatch</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Automatically assign nearest responder to incidents</p>
          </div>
          <Toggle checked={autoDispatch} onChange={setAutoDispatch} />
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Audio Analysis</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Enable voice tone analysis for aggression detection</p>
          </div>
          <Toggle checked={audioAnalysis} onChange={setAudioAnalysis} />
        </div>
      </div>

      {/* Detection */}
      <div className="sentinel-card divide-y divide-border">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Detection Thresholds</h3>
        </div>
        {[
          { label: "Fall Detection Sensitivity", value: "85%" },
          { label: "Aggression Threshold", value: "70%" },
          { label: "Crowd Density Limit", value: "80%" },
          { label: "Alert Cooldown", value: "30s" },
        ].map(setting => (
          <div key={setting.label} className="p-4 flex items-center justify-between">
            <p className="text-sm text-foreground font-medium">{setting.label}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={setting.value}
                className="w-16 text-right text-sm text-foreground bg-secondary rounded-lg px-2 py-1.5 border border-border outline-none focus:ring-1 focus:ring-sentinel-blue"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <div className="sentinel-card p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-sentinel-green mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">Privacy & Data</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sentinel processes pose landmarks only. No raw video or audio is stored. All analysis happens in real-time on-device.</p>
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 bg-sentinel-blue text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-sentinel-blue/90 transition-colors">
        <Save className="w-4 h-4" />
        Save Changes
      </button>
    </div>
  );
};

export default SettingsPage;
