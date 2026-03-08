import { useState } from "react";
import TopBar from "@/components/sentinel/TopBar";
import { Eye, EyeOff, Database, Send, Shield, Power, CheckCircle, XCircle, Lock, Wifi, Brain } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const auditEvents = [
  { event_type: "AI_CALL", event_at: "14:32:05", actor_name: "System", note: "AI analysis — video bytes only, no PII transmitted" },
  { event_type: "REDACTION_ON", event_at: "14:28:12", actor_name: "System", note: "Face blur applied before AI upload" },
  { event_type: "PAYLOAD_SENT", event_at: "14:28:10", actor_name: "System", note: "1.2 MB → secure AI endpoint (redacted)" },
  { event_type: "KILL_SWITCH", event_at: "14:15:00", actor_name: "Admin", note: "Emergency feed pause triggered" },
  { event_type: "FEED_RESTORED", event_at: "14:15:45", actor_name: "Admin", note: "Feeds resumed after manual review" },
];

const Privacy = () => {
  const [externalToggles, setExternalToggles] = useState({
    ai_calls: true,
    notifications: false,
    analytics: false,
  });
  const [privacyToggles, setPrivacyToggles] = useState({
    face_blur: true,
    pii_mask: true,
    audio_redact: false,
  });
  const [storageOff] = useState(true);

  const toggleExternal = (key: string) =>
    setExternalToggles((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar showSearch={false} showLiveToggle={false} />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Hero status row */}
          <div className="grid grid-cols-3 gap-3">
            <div className={cn("p-4 border-2 flex flex-col items-center justify-center gap-1", "border-mc-green/40 bg-mc-green/5")}>
              <Database className="w-6 h-6 text-mc-green" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Storage</span>
              <span className="font-mono text-2xl font-black text-mc-green">OFF</span>
              <span className="font-mono text-[8px] text-muted-foreground">No video retained · TTL: 0s</span>
            </div>
            <div className={cn("p-4 border-2 flex flex-col items-center justify-center gap-1", "border-mc-green/40 bg-mc-green/5")}>
              <Eye className="w-6 h-6 text-mc-green" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Redaction</span>
              <span className="font-mono text-2xl font-black text-mc-green">ON</span>
              <span className="font-mono text-[8px] text-muted-foreground">Face blur · PII mask active</span>
            </div>
            <div className={cn("p-4 border-2 flex flex-col items-center justify-center gap-1", "border-mc-amber/40 bg-mc-amber/5")}>
              <Brain className="w-6 h-6 text-mc-amber" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">AI Calls</span>
              <span className="font-mono text-2xl font-black text-mc-amber">ON</span>
              <span className="font-mono text-[8px] text-muted-foreground">AI engine · video only · no PII</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* External call toggles */}
            <div className="mc-panel p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="w-3.5 h-3.5 text-mc-cyan" />
                <span className="mc-panel-label">External Calls</span>
              </div>
              {[
                { key: "ai_calls", label: "AI Analysis", desc: "Video bytes only — no PII transmitted" },
                { key: "notifications", label: "Notifications (SMS/Push)", desc: "Responder dispatch messages" },
                { key: "analytics", label: "Analytics / Telemetry", desc: "Usage and performance data" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-3 py-2 border-b border-mc-panel-border/50 last:border-0">
                  <div>
                    <span className="font-mono text-[10px] font-semibold block">{label}</span>
                    <span className="font-mono text-[8px] text-muted-foreground">{desc}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("font-mono text-[8px] font-bold", externalToggles[key as keyof typeof externalToggles] ? "text-mc-amber" : "text-muted-foreground/50")}>
                      {externalToggles[key as keyof typeof externalToggles] ? "ON" : "OFF"}
                    </span>
                    <Switch
                      checked={externalToggles[key as keyof typeof externalToggles]}
                      onCheckedChange={() => toggleExternal(key)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Redaction controls */}
            <div className="mc-panel p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <EyeOff className="w-3.5 h-3.5 text-mc-cyan" />
                <span className="mc-panel-label">Redaction Controls</span>
              </div>
              {[
                { key: "face_blur", label: "Face Blur", desc: "Applied before any AI upload" },
                { key: "pii_mask", label: "PII Masking", desc: "Names, IDs redacted in logs" },
                { key: "audio_redact", label: "Audio Redaction", desc: "Voice content stripped" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-3 py-2 border-b border-mc-panel-border/50 last:border-0">
                  <div>
                    <span className="font-mono text-[10px] font-semibold block">{label}</span>
                    <span className="font-mono text-[8px] text-muted-foreground">{desc}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("font-mono text-[8px] font-bold", privacyToggles[key as keyof typeof privacyToggles] ? "text-mc-green" : "text-muted-foreground/50")}>
                      {privacyToggles[key as keyof typeof privacyToggles] ? "ON" : "OFF"}
                    </span>
                    <Switch
                      checked={privacyToggles[key as keyof typeof privacyToggles]}
                      onCheckedChange={(v) => setPrivacyToggles((p) => ({ ...p, [key]: v }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last outbound payload */}
          <div className="mc-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-3.5 h-3.5 text-mc-cyan" />
              <span className="mc-panel-label">Last Outbound Payload</span>
              <span className="ml-auto font-mono text-[8px] text-mc-green flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified clean
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {[
                { label: "Payload ID", value: "p_0041" },
                { label: "Size", value: "1.2 MB" },
                { label: "Destination", value: "secure-ai.sentinel" },
                { label: "Timestamp", value: "14:32:05" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-mc-surface border border-mc-panel-border p-2">
                  <span className="font-mono text-[7px] text-muted-foreground uppercase block">{label}</span>
                  <span className="font-mono text-[9px] font-bold">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-mc-surface border border-mc-panel-border p-3 font-mono text-[8px] text-muted-foreground">
              <span className="text-mc-amber">▸ video_bytes:</span> [REDACTED — binary blob, 1.2 MB]<br />
              <span className="text-mc-amber">▸ prompt:</span> "Analyze for safety risk…"<br />
              <span className="text-mc-amber">▸ pii_fields:</span> <span className="text-mc-green">NONE DETECTED</span><br />
              <span className="text-mc-amber">▸ faces_in_payload:</span> <span className="text-mc-green">BLURRED</span>
            </div>
          </div>

          {/* Data flow */}
          <div className="mc-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-mc-cyan" />
              <span className="mc-panel-label">Data Flow — No Persistent Storage</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] overflow-x-auto pb-1">
              {[
                { label: "CAMERAS", color: "border-mc-panel-border" },
                { label: "REDACTION", color: "border-mc-green/40 text-mc-green" },
                { label: "AI EDGE", color: "border-mc-cyan/40 text-mc-cyan" },
                { label: "ANALYSIS", color: "border-mc-amber/40 text-mc-amber" },
                { label: "NO STORAGE", color: "border-mc-green/60 text-mc-green bg-mc-green/5" },
              ].map((node, i, arr) => (
                <div key={node.label} className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("px-2 py-1.5 border font-bold", node.color)}>{node.label}</span>
                  {i < arr.length - 1 && <span className="text-muted-foreground/40">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Kill switches + Audit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="mc-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <Power className="w-3.5 h-3.5 text-mc-red" />
                <span className="mc-panel-label">Kill Switches</span>
              </div>
              <div className="space-y-2">
                <button className="w-full font-mono text-[9px] py-2.5 bg-mc-red/10 border border-mc-red/40 text-mc-red hover:bg-mc-red/20 transition-colors flex items-center justify-center gap-2">
                  <Power className="w-3.5 h-3.5" /> Pause All Feeds
                </button>
                <button className="w-full font-mono text-[9px] py-2.5 border border-mc-red/30 text-mc-red/70 hover:bg-mc-red/5 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-3.5 h-3.5" /> Emergency Purge
                </button>
                <div className="flex items-center gap-2 py-1.5 px-2 bg-mc-green/5 border border-mc-green/20">
                  <Lock className="w-3 h-3 text-mc-green" />
                  <span className="font-mono text-[8px] text-mc-green">RLS active · Supabase row-level security</span>
                </div>
              </div>
            </div>

            <div className="mc-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="mc-panel-label">Audit Log</span>
                <span className="font-mono text-[8px] text-muted-foreground">{auditEvents.length} events</span>
              </div>
              <div className="space-y-0 overflow-y-auto max-h-40">
                {auditEvents.map((ev, i) => (
                  <div key={i} className="flex gap-2 py-1.5 border-b border-mc-panel-border/40 last:border-0">
                    <span className="font-mono text-[7px] text-muted-foreground tabular-nums flex-shrink-0 w-12">{ev.event_at}</span>
                    <span className={cn(
                      "font-mono text-[7px] font-bold px-1 flex-shrink-0 self-start",
                      ev.event_type === "AI_CALL" ? "text-mc-amber" :
                      ev.event_type === "KILL_SWITCH" ? "text-mc-red" :
                      ev.event_type === "REDACTION_ON" ? "text-mc-green" :
                      "text-mc-cyan"
                    )}>{ev.event_type}</span>
                    <span className="font-mono text-[7px] text-muted-foreground leading-relaxed">{ev.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
