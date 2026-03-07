import { useState, useEffect } from "react";
import { getCameras, analyzeCamera, type CameraInfo, type AnalysisResult } from "@/lib/api";
import type { Alert } from "@/components/command/AlertStack";

export interface CameraState extends CameraInfo {
  status: "analyzing" | "done" | "error";
  result?: AnalysisResult;
  alert?: Alert;
  error?: string;
}

const OUTCOME_TITLES: Record<string, string> = {
  fall_with_minor_injury: "FALL DETECTED — MINOR INJURY",
  fall_with_serious_injury: "FALL DETECTED — SERIOUS INJURY",
  confrontation_likely: "AGGRESSION ESCALATING",
  argument_continues: "VERBAL ALTERCATION ONGOING",
  medical_event_likely: "MEDICAL EVENT DETECTED",
  calms_down: "SITUATION MONITORED",
  collision_probable: "COLLISION RISK DETECTED",
  insufficient_evidence: "ACTIVITY DETECTED",
};

function deriveRouteTo(actions: string[]): string {
  const first = (actions[0] ?? "").toLowerCase();
  if (first.includes("security") || first.includes("escalate")) return "SECURITY";
  if (first.includes("medical") || first.includes("emergency services")) return "MEDICAL";
  if (first.includes("maintenance")) return "MAINTENANCE";
  return "STAFF";
}

function toAlert(camId: string, result: AnalysisResult): Alert {
  const risk = result.metadata.overall_risk_score;
  const severity: Alert["severity"] =
    risk >= 0.7 ? "critical" : risk >= 0.35 ? "warning" : "info";
  const outcome = result.metadata.prediction.likely_outcome;

  return {
    id: camId,
    severity,
    title: OUTCOME_TITLES[outcome] ?? "INCIDENT DETECTED",
    location: camId,
    time: "00:00",
    routeTo: deriveRouteTo(result.recommended_actions),
    conclusion: result.conclusion,
    recommended_actions: result.recommended_actions,
    metadata: result.metadata,
  };
}

export function useCameras() {
  const [cameras, setCameras] = useState<CameraState[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let camInfos: CameraInfo[];
      try {
        camInfos = await getCameras();
      } catch {
        return;
      }
      if (cancelled) return;

      // Set all to "analyzing" immediately so CameraPanel shows loading state
      setCameras(camInfos.map((c) => ({ ...c, status: "analyzing" as const })));

      // Kick off all three analyses concurrently
      await Promise.all(
        camInfos.map(async (cam) => {
          try {
            const result = await analyzeCamera(cam.id);
            if (cancelled) return;
            setCameras((prev) =>
              prev.map((c) =>
                c.id === cam.id
                  ? { ...c, status: "done" as const, result, alert: toAlert(cam.id, result) }
                  : c
              )
            );
          } catch (err) {
            if (cancelled) return;
            setCameras((prev) =>
              prev.map((c) =>
                c.id === cam.id
                  ? { ...c, status: "error" as const, error: String(err) }
                  : c
              )
            );
          }
        })
      );
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const alerts = cameras.filter((c) => c.alert).map((c) => c.alert!);

  return { cameras, alerts };
}
