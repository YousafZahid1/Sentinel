import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ── Utility functions (inlined from hooks to keep tests self-contained) ──────

const OUTCOME_TITLES: Record<string, string> = {
  fall_with_minor_injury: "FALL DETECTED — MINOR INJURY",
  fall_with_serious_injury: "FALL DETECTED — SERIOUS INJURY",
  confrontation_likely: "AGGRESSION ESCALATING",
  argument_continues: "VERBAL ALTERCATION ONGOING",
  medical_event_likely: "MEDICAL EVENT DETECTED",
  calms_down: "SITUATION MONITORED",
  insufficient_evidence: "ACTIVITY DETECTED",
};

function deriveRouteTo(actions: string[]): string {
  const first = (actions[0] ?? "").toLowerCase();
  if (first.includes("security") || first.includes("escalate")) return "SECURITY";
  if (first.includes("medical") || first.includes("emergency services")) return "MEDICAL";
  if (first.includes("maintenance")) return "MAINTENANCE";
  return "STAFF";
}

function toAlertSeverity(risk: number): "critical" | "warning" | "info" {
  return risk >= 0.7 ? "critical" : risk >= 0.35 ? "warning" : "info";
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_KEY = "sentinel.camera_results";

function readCache(): Record<string, { result: unknown; cachedAt: number }> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}"); } catch { return {}; }
}
function writeCache(camId: string, result: unknown) {
  const cache = readCache();
  cache[camId] = { result, cachedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
function getFreshCached(camId: string): unknown | null {
  const entry = readCache()[camId];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
  return entry.result;
}

// ── deriveRouteTo ────────────────────────────────────────────────────────────

describe("deriveRouteTo", () => {
  it("returns SECURITY for escalate_security action", () => {
    expect(deriveRouteTo(["Escalate to security personnel immediately."])).toBe("SECURITY");
  });

  it("returns SECURITY for security supervisor mention", () => {
    expect(deriveRouteTo(["Contact security supervisor now."])).toBe("SECURITY");
  });

  it("returns MEDICAL for medical staff mention", () => {
    expect(deriveRouteTo(["Alert medical staff — person unresponsive."])).toBe("MEDICAL");
  });

  it("returns MEDICAL for emergency services mention", () => {
    expect(deriveRouteTo(["Call emergency services immediately."])).toBe("MEDICAL");
  });

  it("returns MAINTENANCE for maintenance mention", () => {
    expect(deriveRouteTo(["Notify maintenance to clear hazard."])).toBe("MAINTENANCE");
  });

  it("returns STAFF for generic staff notify", () => {
    expect(deriveRouteTo(["Notify on-site staff to attend."])).toBe("STAFF");
  });

  it("returns STAFF for empty actions array", () => {
    expect(deriveRouteTo([])).toBe("STAFF");
  });

  it("uses only the first action to determine routing", () => {
    expect(deriveRouteTo(["Notify staff.", "Alert medical team."])).toBe("STAFF");
  });
});

// ── Alert severity thresholds ────────────────────────────────────────────────

describe("alert severity thresholds", () => {
  it("0.70 is critical", () => expect(toAlertSeverity(0.70)).toBe("critical"));
  it("0.95 is critical", () => expect(toAlertSeverity(0.95)).toBe("critical"));
  it("0.69 is warning", () => expect(toAlertSeverity(0.69)).toBe("warning"));
  it("0.35 is warning", () => expect(toAlertSeverity(0.35)).toBe("warning"));
  it("0.34 is info", () => expect(toAlertSeverity(0.34)).toBe("info"));
  it("0.0 is info", () => expect(toAlertSeverity(0.0)).toBe("info"));
  it("staircase fall (0.95) is critical", () => expect(toAlertSeverity(0.95)).toBe("critical"));
  it("argument (0.40) is warning", () => expect(toAlertSeverity(0.40)).toBe("warning"));
  it("boxing match (0.10) is info", () => expect(toAlertSeverity(0.10)).toBe("info"));
});

// ── Outcome titles ───────────────────────────────────────────────────────────

describe("outcome titles", () => {
  it("maps fall_with_serious_injury correctly", () => {
    expect(OUTCOME_TITLES["fall_with_serious_injury"]).toBe("FALL DETECTED — SERIOUS INJURY");
  });

  it("maps confrontation_likely correctly", () => {
    expect(OUTCOME_TITLES["confrontation_likely"]).toBe("AGGRESSION ESCALATING");
  });

  it("maps medical_event_likely correctly", () => {
    expect(OUTCOME_TITLES["medical_event_likely"]).toBe("MEDICAL EVENT DETECTED");
  });

  it("returns undefined for unknown outcome", () => {
    expect(OUTCOME_TITLES["not_a_real_outcome"]).toBeUndefined();
  });
});

// ── localStorage cache ───────────────────────────────────────────────────────

describe("camera result cache", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("returns null for unknown camera", () => {
    expect(getFreshCached("CAM-99")).toBeNull();
  });

  it("returns cached result immediately after writing", () => {
    const result = { metadata: { overall_risk_score: 0.85 } };
    writeCache("CAM-01", result);
    expect(getFreshCached("CAM-01")).toEqual(result);
  });

  it("returns null when cache is expired", () => {
    const result = { metadata: { overall_risk_score: 0.5 } };
    writeCache("CAM-01", result);

    // Manually expire by overwriting with old timestamp
    const cache = readCache();
    cache["CAM-01"].cachedAt = Date.now() - CACHE_TTL_MS - 1000;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    expect(getFreshCached("CAM-01")).toBeNull();
  });

  it("caches multiple cameras independently", () => {
    writeCache("CAM-01", { score: 0.9 });
    writeCache("CAM-02", { score: 0.1 });
    expect((getFreshCached("CAM-01") as { score: number }).score).toBe(0.9);
    expect((getFreshCached("CAM-02") as { score: number }).score).toBe(0.1);
  });

  it("overwrites stale entry when written again", () => {
    writeCache("CAM-01", { score: 0.5 });
    writeCache("CAM-01", { score: 0.9 });
    expect((getFreshCached("CAM-01") as { score: number }).score).toBe(0.9);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem(CACHE_KEY, "not valid json{{");
    expect(() => getFreshCached("CAM-01")).not.toThrow();
    expect(getFreshCached("CAM-01")).toBeNull();
  });
});

// ── Risk score → UI label ────────────────────────────────────────────────────

describe("risk score display logic", () => {
  const riskColor = (pct: number) =>
    pct > 50 ? "red" : pct > 30 ? "amber" : "green";

  it("90% risk shows red", () => expect(riskColor(90)).toBe("red"));
  it("51% risk shows red", () => expect(riskColor(51)).toBe("red"));
  it("50% risk shows amber", () => expect(riskColor(50)).toBe("amber"));
  it("31% risk shows amber", () => expect(riskColor(31)).toBe("amber"));
  it("30% risk shows green", () => expect(riskColor(30)).toBe("green"));
  it("0% risk shows green", () => expect(riskColor(0)).toBe("green"));
});
