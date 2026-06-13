const BASE = "/api";

export interface CameraInfo {
  id: string;
  label: string;
  video_url: string;
  filename: string;
}

export interface RiskFactor {
  label: string;
  confidence: number;
  interpretation: string;
}

export interface AnalysisResult {
  analysis_id: string;
  timestamp: string;
  risk_factors: RiskFactor[];
  conclusion: string;
  recommended_actions: string[];
  metadata: {
    people_detected: number;
    overall_risk_score: number;
    prediction: {
      likely_outcome: string;
      confidence: number;
    };
  };
}

export async function getCameras(): Promise<CameraInfo[]> {
  const res = await fetch(`${BASE}/cameras`);
  if (!res.ok) throw new Error("Failed to fetch camera list");
  return res.json();
}

export async function analyzeCamera(camId: string): Promise<AnalysisResult> {
  const res = await fetch(`${BASE}/cameras/${camId}/analyze`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Analysis failed");
  }
  return res.json();
}

export async function addCamera(label: string, videoFile: File): Promise<CameraInfo> {
  const form = new FormData();
  form.append("label", label);
  form.append("video", videoFile);
  const res = await fetch(`${BASE}/cameras/add`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Failed to add camera");
  }
  return res.json();
}

export async function removeCamera(camId: string, deleteVideo = false): Promise<void> {
  const res = await fetch(`${BASE}/cameras/${camId}?delete_video=${deleteVideo}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Failed to remove camera");
  }
}
