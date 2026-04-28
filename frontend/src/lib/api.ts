const BASE = "/api";

export interface CameraInfo {
  id: string;
  video_url: string;
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
  try {
    const res = await fetch(`${BASE}/cameras`);
    if (!res.ok) {
      throw new Error(`Failed to fetch camera list: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching cameras:", error);
    throw error;
  }
}

export async function analyzeCamera(camId: string): Promise<AnalysisResult> {
  const res = await fetch(`${BASE}/cameras/${camId}/analyze`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Analysis failed");
  }
  return res.json();
}
