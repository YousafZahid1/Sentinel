/**
 * Sentinel – Video fight-risk analysis via Llama API
 *
 * Run:
 *   1. cp .env.example .env  (set LLAMA_API_KEY)
 *   2. npm install
 *   3. npm start
 *
 * Extracts frames from uploaded video → sends to Llama vision API → returns JSON.
 * Requires: ffmpeg installed on PATH (brew install ffmpeg).
 */

import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const LLAMA_BASE_URL = "https://api.llama.com/v1";
const LLAMA_MODEL = "Llama-4-Maverick-17B-128E-Instruct-FP8";
const ALLOWED_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const ALLOWED_EXT = new Set([".mp4", ".mov", ".webm"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}${path.extname(file.originalname) || ".mp4"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIMES.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Use mp4, mov, or webm."));
    }
  },
});

const ANALYSIS_PROMPT = `You are an expert CCTV forensic analyst with training in behavioural psychology, use-of-force assessment, and security threat detection. You review frames from a live facility security system. Your output directly triggers emergency dispatch — false negatives kill, false positives waste resources. Be precise, evidence-based, and ruthlessly accurate.

═══════════════════════════════════════════
STEP 1 — SCENE & CONTEXT CLASSIFICATION
═══════════════════════════════════════════
Before scoring anything, classify the scene:

REGULATED_SPORT: Boxing/MMA ring (ropes or cage visible), referee on scene, fighters in gloves/headgear/mouthguard, organised audience, cornermen. Striking is EXPECTED and CONSENTED. Max risk = 0.15 unless someone is unconscious and the referee has NOT stopped the fight, or a weapon appears.

STAGED_OR_REHEARSED: Choreographed movements, camera crew visible, props/costumes, repeated identical motions across frames, people clearly performing for a camera. Score as low risk UNLESS real injury occurs.

PUBLIC_FACILITY: Corridor, staircase, lobby, carpark, retail, office, street, transit. Apply full threat analysis.

UNCLEAR: Apply full threat analysis and note ambiguity.

═══════════════════════════════════════════
STEP 2 — AUTHENTICITY ANALYSIS
═══════════════════════════════════════════
Determine if distress/violence is REAL or FAKE using these signals:

REAL distress indicators (raise score):
  • Involuntary facial micro-expressions: grimace, brow furrow, wide eyes with whites showing (genuine fear/pain)
  • Impact recoil — body absorbs and reacts to force physically (head snaps, stumble, flinch)
  • Pain delay — victim freezes 0.5–2s after impact before reacting (real shock response)
  • Bystanders react — people nearby flinch, scatter, pull out phones, back away
  • Attacker shows controlled aggression — jaw set, tunnel vision, weight shifted forward
  • Victim attempts to protect head/vitals instinctively
  • Asymmetric emotional states — one person terrified, the other cold/calculating

FAKE/STAGED indicators (lower score, flag as staged):
  • Faces relaxed or smiling immediately before/after "impact"
  • Movements look choreographed — same rhythm, no weight transfer
  • Neither party shows genuine fear or adrenaline response
  • Bystanders watching calmly, not reacting, filming casually
  • Theatrical falling — arms out, controlled descent
  • Playful body language between "combatants" in off-moments
  • Camera angles suggest deliberate filming of the incident

MIXED (real fight that started as play-fighting — score high):
  • Started joking, then one party's expression shifted to genuine anger
  • Force level escalated beyond what play-fighting looks like
  • One party trying to disengage while the other continues

═══════════════════════════════════════════
STEP 3 — CAMERA EVASION & SUSPICIOUS BEHAVIOUR
═══════════════════════════════════════════
Flag ANY of the following — these indicate pre-planned activity and raise suspicion score:

  • Person directly looking at camera location and then changing behaviour
  • Hood up + head down + deliberate face avoidance in a public space
  • Person physically blocking, covering, or adjusting camera angle
  • Group splitting to cover different camera blind spots
  • Someone checking over their shoulder repeatedly before acting
  • Violence or suspicious act happening just outside normal camera frame (possible deliberate placement)
  • Sudden change in behaviour when another person enters the space

Add "camera_evasion_flags" array to your output. If any are detected, add +0.15 to the risk score.

═══════════════════════════════════════════
STEP 4 — MANDATORY RISK SCORING TABLE
═══════════════════════════════════════════
Match the HIGHEST applicable bracket. Do not average down.

  0.95–1.00 | CRITICAL — Dispatch immediately
    Weapon actively used; person falling down stairs/from height; unresponsive victim; multiple attackers on one person; active shooter indicators

  0.80–0.94 | SEVERE — Escalate now
    Confirmed punch/kick landed with real impact; person on floor not moving; choking/strangling; medical emergency (seizure, cardiac); staircase fall at any height

  0.65–0.79 | HIGH — Notify security + standby medical
    Fistfight in progress (real, not sport); person has fallen and is struggling to get up; person limping/injured; aggressor pursuing retreating victim

  0.45–0.64 | ELEVATED — Alert floor staff
    Shoving/grabbing (real intent); aggressive encroachment; erratic/intoxicated behaviour near others; person sitting/lying in unusual position

  0.25–0.44 | CAUTION — Monitor closely
    Heated verbal argument; suspicious loitering; camera evasion without visible crime; person in mild distress

  0.00–0.24 | NORMAL
    Routine activity; regulated sport with referee in control; no threat indicators

FALL OVERRIDE — regardless of context, IF a fall occurs:
  Staircase/height fall → minimum 0.95
  Flat ground fall, not getting up → minimum 0.85
  Flat ground fall, recovering → minimum 0.65
  Stumble/near-fall → minimum 0.45

═══════════════════════════════════════════
STEP 5 — AUDIO INFERENCE FROM VISUAL CONTEXT
═══════════════════════════════════════════
Derive audio context from what you see:
  • Mouth wide open + neck tendons visible → screaming
  • Multiple open mouths facing one direction → shouting crowd or panic
  • Referee hand signals / stop gesture → whistle/commands
  • Person on phone, others pointing → emergency call in progress
  • Calm crowd seated in rows → ambient venue noise
  • Bystanders running away → alarm/screaming
  • Person hunched, hands over ears → loud noise / distress

═══════════════════════════════════════════
STEP 6 — RESPONSE ACTION
═══════════════════════════════════════════
  >= 0.80  → "escalate_security": name security supervisor AND medical staff role and exact reason
  0.45–0.79 → "notify_staff": name floor manager or security guard and specific concern
  0.20–0.44 → "monitor": describe what to watch for
  < 0.20   → "ignore"

═══════════════════════════════════════════
OUTPUT — STRICT JSON ONLY
═══════════════════════════════════════════
Start with { and end with }. No markdown. No code fences. No text before or after.

{
  "clip_summary": {
    "people_detected": <int>,
    "overall_assessment": "<2–3 sentences: what is happening, whether it is real or staged, and the key threat or non-threat reason>",
    "scene_type": "<regulated_sport|staged_or_rehearsed|public_facility|unclear>",
    "authenticity": "<real|staged|ambiguous|play_turned_real>",
    "audio_cues": ["<inferred sound based on visual evidence>"],
    "camera_evasion_flags": ["<specific evasion behaviour observed, or empty array if none>"]
  },
  "per_person": [
    {
      "person_id": "Person_A",
      "role": "<aggressor|victim|bystander|referee|athlete|unknown>",
      "overall_emotion": "<calm|happy|neutral|anxious|upset|angry|agitated|fearful|distressed|pain|shock|insufficient_evidence>",
      "overall_movement": "<casual|tense|posturing|boxing_stance|advancing|retreating|pacing|pointing|hands_up_guard|shoving|striking|falling|on_ground|limping|erratic|camera_avoiding|insufficient_evidence>",
      "face_reaction": "<relaxed|grimacing|screaming|wide_eyed_fear|blank_shock|laughing|insufficient_evidence>",
      "notable_cues": ["<precise visual detail — body part, direction, intensity>"]
    }
  ],
  "timeline": [
    {
      "start_s": <number>,
      "end_s": <number>,
      "fight_risk_0_1": <number — OVERALL EMERGENCY RISK per scoring table>,
      "confidence_0_1": <number>,
      "observations": ["<specific frame-level detail — do not generalise>"],
      "per_person_state": [
        { "person_id": "Person_A", "emotion": "<label>", "movement": "<label>", "face_reaction": "<label>" }
      ]
    }
  ],
  "overall_fight_risk_0_1": <number — final score after applying all steps above>,
  "authenticity_reasoning": "<1–2 sentences explaining why this is real, staged, or ambiguous based on specific visual evidence>",
  "prediction_next_5_10s": {
    "likely_outcome": "<calms_down|argument_continues|confrontation_likely|fall_with_minor_injury|fall_with_serious_injury|medical_event_likely|de_escalating|insufficient_evidence>",
    "confidence_0_1": <number>,
    "why": ["<evidence-based concrete phrase>"]
  },
  "recommended_action": {
    "action": "<ignore|monitor|notify_staff|escalate_security>",
    "why": ["<staff role + specific reason derived from evidence above>"]
  }
}`;

function extractFrames(videoPath, frameDir, maxFrames = 8) {
  fs.mkdirSync(frameDir, { recursive: true });
  try {
    execSync(
      `ffmpeg -i "${videoPath}" -vf "fps=1" -frames:v ${maxFrames} "${frameDir}/frame_%03d.jpg" -y 2>/dev/null`,
      { stdio: "pipe" }
    );
  } catch (err) {
    throw new Error(
      "ffmpeg failed. Run: brew install ffmpeg\n" + (err.stderr?.toString() || "")
    );
  }

  const frames = fs
    .readdirSync(frameDir)
    .filter((f) => f.endsWith(".jpg"))
    .sort()
    .map((f) => path.join(frameDir, f));

  if (frames.length === 0) {
    throw new Error("No frames extracted — video may be corrupted or too short.");
  }
  return frames;
}

function cleanupDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      for (const f of fs.readdirSync(dirPath)) fs.unlinkSync(path.join(dirPath, f));
      fs.rmdirSync(dirPath);
    }
  } catch (_) {}
}

async function callLlama(apiKey, messages) {
  const res = await fetch(`${LLAMA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: LLAMA_MODEL, messages, max_completion_tokens: 4096 }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.message || JSON.stringify(data);
    throw new Error(`Llama API error ${res.status}: ${errMsg}`);
  }

  // Llama API returns completion_message.content.text
  // Fall back to OpenAI-style choices[0].message.content
  const text =
    data?.completion_message?.content?.text ??
    data?.choices?.[0]?.message?.content ??
    null;

  if (!text) {
    console.error("Unexpected Llama response:", JSON.stringify(data).slice(0, 500));
    throw new Error("Empty or unrecognised response from Llama API");
  }
  return text;
}

async function analyzeWithLlama(apiKey, videoPath) {
  const frameDir = `${videoPath}_frames`;
  try {
    const framePaths = extractFrames(videoPath, frameDir);

    const imageContent = framePaths.map((fp) => ({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${fs.readFileSync(fp).toString("base64")}`,
      },
    }));

    const text = await callLlama(apiKey, [
      {
        role: "user",
        content: [...imageContent, { type: "text", text: ANALYSIS_PROMPT }],
      },
    ]);

    let raw = text.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) raw = jsonMatch[1].trim();

    return JSON.parse(raw);
  } finally {
    cleanupDir(frameDir);
  }
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyze", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Missing file. Use form field 'video'." });
  }

  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "LLAMA_API_KEY not set in backend/.env" });
  }

  const filePath = req.file.path;
  try {
    const parsed = await analyzeWithLlama(apiKey, filePath);
    return res.type("application/json").json(parsed);
  } catch (err) {
    const message = err?.message || String(err);
    console.error("Analysis error:", message);
    const status = message.includes("401") || message.includes("403") ? 502 : 500;
    return res.status(status).json({ error: message });
  } finally {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ error: err.code === "LIMIT_FILE_SIZE" ? "File too large (max 100MB)" : err.message });
  }
  res.status(400).json({ error: err.message || "Upload failed" });
});

app.listen(PORT, () => {
  console.log(`Sentinel backend at http://localhost:${PORT}`);
  console.log(`Model: ${LLAMA_MODEL}`);
  console.log(`API key: ${process.env.LLAMA_API_KEY ? "SET" : "MISSING - set LLAMA_API_KEY in .env"}`);
});
