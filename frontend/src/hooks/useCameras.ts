import { useState, useEffect, useCallback } from "react";
import {
  getCameras,
  analyzeCamera,
  addCamera as apiAddCamera,
  removeCamera as apiRemoveCamera,
  type CameraInfo,
  type AnalysisResult,
} from "@/lib/api";
import type { Alert } from "@/components/command/AlertStack";
import { supabase } from "@/lib/supabase";

export interface CameraState extends CameraInfo {
  status: "analyzing" | "done" | "error";
  result?: AnalysisResult;
  alert?: Alert;
  error?: string;
}

// Cache TTL: results are reused for 10 minutes before re-analyzing
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_KEY = "sentinel.camera_results";

interface CachedResult {
  result: AnalysisResult;
  cachedAt: number;
}

function readCache(): Record<string, CachedResult> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeCache(camId: string, result: AnalysisResult) {
  try {
    const cache = readCache();
    cache[camId] = { result, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function clearCacheEntry(camId: string) {
  try {
    const cache = readCache();
    delete cache[camId];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getFreshCached(camId: string): AnalysisResult | null {
  const cache = readCache();
  const entry = cache[camId];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
  return entry.result;
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

function jitter(base: number): number {
  return base + (Math.random() * 0.00036 - 0.00018);
}

function randomDescription(alert: Alert, result: AnalysisResult): string {
  const outcome = result.metadata.prediction.likely_outcome.replace(/_/g, " ");
  const confidence = Math.round(result.metadata.prediction.confidence * 100);
  const people = result.metadata.people_detected;
  const topFactor = result.risk_factors[0];
  const options = [
    result.conclusion,
    `${outcome} detected with ${confidence}% confidence. ${result.conclusion}`,
    `${people} ${people === 1 ? "person" : "people"} involved. ${result.conclusion}`,
    topFactor ? `Key signal: ${topFactor.label}. ${result.conclusion}` : result.conclusion,
    `${alert.routeTo} response recommended. ${result.conclusion}`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}

async function sendToSupabase(camId: string, alert: Alert, result: AnalysisResult) {
  const risk = result.metadata.overall_risk_score;
  const importance = risk >= 0.8 ? 5 : risk >= 0.65 ? 4 : risk >= 0.5 ? 3 : risk >= 0.35 ? 2 : 1;
  await supabase.from("emergencies").upsert({
    id: "63edd240-3310-4008-b6fc-a2b282870cd2",
    title: alert.title,
    description: randomDescription(alert, result),
    latitude: jitter(-77.2334),
    longitude: jitter(38.92161),
    created_at: new Date().toISOString(),
    role: "responder",
    importance,
  });
}

async function runAnalysis(
  cam: CameraInfo,
  setCameras: React.Dispatch<React.SetStateAction<CameraState[]>>
) {
  try {
    const result = await analyzeCamera(cam.id);
    const alert = toAlert(cam.id, result);
    writeCache(cam.id, result);
    setCameras((prev) =>
      prev.map((c) => (c.id === cam.id ? { ...c, status: "done" as const, result, alert } : c))
    );
    if (result.metadata.overall_risk_score >= 0.35) {
      sendToSupabase(cam.id, alert, result).catch(console.error);
    }
  } catch (err) {
    setCameras((prev) =>
      prev.map((c) =>
        c.id === cam.id ? { ...c, status: "error" as const, error: String(err) } : c
      )
    );
  }
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

      // Initialise all cameras immediately — use cache where available
      const initialStates: CameraState[] = camInfos.map((c) => {
        const cached = getFreshCached(c.id);
        if (cached) {
          return { ...c, status: "done" as const, result: cached, alert: toAlert(c.id, cached) };
        }
        return { ...c, status: "analyzing" as const };
      });
      setCameras(initialStates);

      // Only hit the API for cameras with no fresh cache
      const toAnalyze = camInfos.filter((c) => !getFreshCached(c.id));
      await Promise.all(toAnalyze.map((cam) => runAnalysis(cam, setCameras)));
    }

    run();
    return () => { cancelled = true; };
  }, []);

  const addCamera = useCallback(async (label: string, file: File) => {
    const newCam = await apiAddCamera(label, file);
    setCameras((prev) => [...prev, { ...newCam, status: "analyzing" as const }]);
    runAnalysis(newCam, setCameras);
    return newCam;
  }, []);

  const removeCamera = useCallback(async (camId: string) => {
    await apiRemoveCamera(camId, false);
    clearCacheEntry(camId);
    setCameras((prev) => prev.filter((c) => c.id !== camId));
  }, []);

  const alerts = cameras.filter((c) => c.alert).map((c) => c.alert!);

  return { cameras, alerts, addCamera, removeCamera };
}
