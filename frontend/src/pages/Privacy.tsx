import { useState } from "react";
import TopBar from "@/components/sentinel/TopBar";
import EmptyStatePanel from "@/components/sentinel/EmptyStatePanel";
import { Eye, EyeOff, Database, Send, Shield, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const auditEvents = [
  { event_type: "PRIVACY_TOGGLE", event_at: "14:32:05", actor_name: "Ops" },
  { event_type: "REDACTION_ON", event_at: "14:28:12", actor_name: "System" },
  { event_type: "KILL_SWITCH", event_at: "14:15:00", actor_name: "Admin" },
];

const Privacy = () => {
  const [redactionState, setRedactionState] = useState(true);
  const [privacyToggles, setPrivacyToggles] = useState({
    face_blur: true,
    pii_mask: true,
    audio_redact: false,
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar showSearch={false} showLiveToggle={false} />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* No-Storage Proof Panel */}
        <div className="mc-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-mc-cyan" />
            <span className="mc-panel-label">No-storage proof</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-muted-foreground">storage_mode:</span>
            <span className="font-mono text-[10px] font-bold text-mc-green">EPHEMERAL</span>
            <span className="font-mono text-[10px] text-muted-foreground">retention_state:</span>
            <span className="font-mono text-[10px] font-bold">CLEARED</span>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div className="mc-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-mc-cyan" />
            <span className="mc-panel-label">Data flow diagram</span>
          </div>
          <div className="flex gap-4 items-center font-mono text-[9px]">
            <span className="px-3 py-2 bg-mc-surface border border-mc-panel-border">CAMERAS</span>
            <span>→</span>
            <span className="px-3 py-2 bg-mc-surface border border-mc-panel-border">EDGE</span>
            <span>→</span>
            <span className="px-3 py-2 bg-mc-surface border border-mc-panel-border">OPS</span>
            <span>→</span>
            <span className="px-3 py-2 bg-mc-cyan-dim border border-mc-cyan/30">NO STORAGE</span>
          </div>
        </div>

        {/* Storage Status Cards */}
        <div className="grid grid-cols-3 gap-4">
          {["video_frames", "audio_stream", "metadata"].map((dt) => (
            <div key={dt} className="mc-panel p-3">
              <span className="font-mono text-[8px] text-muted-foreground uppercase">{dt}</span>
              <div className="mt-1 font-mono text-[9px] text-mc-green">retention: NONE</div>
              <div className="font-mono text-[8px] text-muted-foreground">ttl: 0s</div>
            </div>
          ))}
        </div>

        {/* Outbound Payload Viewer */}
        <div className="mc-panel p-4">
          <span className="mc-panel-label block mb-2">Outbound payload viewer</span>
          <div className="bg-mc-surface border border-mc-panel-border p-3 font-mono text-[8px] text-muted-foreground overflow-x-auto">
            payload_id: p_001 | bytes: 0 | timestamp: — | preview: [REDACTED]
          </div>
        </div>

        {/* Redaction Toggle */}
        <div className="mc-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {redactionState ? <EyeOff className="w-4 h-4 text-mc-green" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            <span className="mc-panel-label">Redaction</span>
          </div>
          <Switch checked={redactionState} onCheckedChange={setRedactionState} />
        </div>

        {/* Privacy Toggles */}
        <div className="mc-panel p-4">
          <span className="mc-panel-label block mb-3">Privacy toggles</span>
          <div className="space-y-3">
            {Object.entries(privacyToggles).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-mono text-[10px]">{key.replace(/_/g, " ")}</span>
                <Switch
                  checked={val}
                  onCheckedChange={(v) => setPrivacyToggles((p) => ({ ...p, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Kill Switch Buttons */}
        <div className="mc-panel p-4">
          <span className="mc-panel-label block mb-3">Kill switches</span>
          <div className="flex gap-3">
            <Button variant="destructive" size="sm" className="font-mono text-[9px]">
              <Power className="w-3 h-3 mr-1" />
              Pause all feeds
            </Button>
            <Button variant="outline" size="sm" className="font-mono text-[9px] border-mc-red/50 text-mc-red">
              Emergency purge
            </Button>
          </div>
        </div>

        {/* Audit Event List */}
        <div className="mc-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="mc-panel-label">Audit events</span>
            <span className="font-mono text-[9px] text-muted-foreground">{auditEvents.length} events</span>
          </div>
          <div className="space-y-2">
            {auditEvents.map((ev, i) => (
              <div key={i} className="flex gap-4 py-2 border-b border-mc-panel-border/50 font-mono text-[9px]">
                <span className="text-muted-foreground tabular-nums">{ev.event_at}</span>
                <span className="font-bold">{ev.event_type}</span>
                <span>{ev.actor_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
