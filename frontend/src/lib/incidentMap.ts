import { alerts } from "@/components/command/AlertStack";

/** Normalize location for matching (e.g. "STAIRWELL-A" vs "STAIRWELL A"). */
function normalizeLocation(loc: string): string {
  return loc.replace(/\s+/g, " ").replace(/-/g, " ").toUpperCase().trim();
}

/** Short 1–2 word summary from alert title (e.g. "FALL DETECTED — PERSON DOWN" → "Fall detected"). */
export function alertTitleToSummary(title: string): string {
  const first = title.split(/[—\-]/)[0].trim().toLowerCase();
  const words = first.split(/\s+/).slice(0, 2);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Get the current event summary for a camera/zone location from active alerts.
 */
export function getEventSummaryForLocation(cameraLocation: string): string | null {
  const norm = normalizeLocation(cameraLocation);
  const alert = alerts.find((a) => {
    const aNorm = normalizeLocation(a.location);
    return aNorm === norm || aNorm.includes(norm) || norm.includes(aNorm);
  });
  return alert ? alertTitleToSummary(alert.title) : null;
}

/**
 * Map alert location to approximate (x, y) percent on the map.
 * When a floor plan is present, only these pins are shown (no zone boxes).
 * Positions are chosen to sit inside typical floor plan content (see FLOOR_PLAN_PIN_BOUNDS).
 */
export const locationToPinPosition: Record<string, { x: number; y: number }> = {
  "MAIN HALL FL1": { x: 48, y: 32 },
  "ENTRANCE LOBBY": { x: 22, y: 22 },
  "STAIRWELL A": { x: 44, y: 22 },
  "CAFETERIA": { x: 68, y: 58 },
};

/** Bounds (percent) so all pings stay inside the floor plan outline. */
export const FLOOR_PLAN_PIN_BOUNDS = { minX: 14, maxX: 86, minY: 14, maxY: 86 };

export function clampPinToFloorPlanBounds(x: number, y: number): { x: number; y: number } {
  const b = FLOOR_PLAN_PIN_BOUNDS;
  return {
    x: Math.max(b.minX, Math.min(b.maxX, x)),
    y: Math.max(b.minY, Math.min(b.maxY, y)),
  };
}

export function getPinPositionForLocation(location: string): { x: number; y: number } | null {
  const norm = normalizeLocation(location);
  for (const [key, pos] of Object.entries(locationToPinPosition)) {
    if (normalizeLocation(key) === norm) return pos;
  }
  return null;
}