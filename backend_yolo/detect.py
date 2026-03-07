import cv2
import numpy as np
from ultralytics import YOLO
import time
from collections import defaultdict

# DeepFace is imported lazily inside the function so the server starts fast
# even if TF/Keras takes a moment to warm up.

# Color palette — one consistent color per class index
PALETTE = [
    (255, 56, 56), (255, 157, 151), (255, 112, 31), (255, 178, 29),
    (207, 210, 49), (72, 249, 10), (146, 204, 23), (61, 219, 134),
    (26, 147, 52), (0, 212, 187), (44, 153, 168), (0, 194, 255),
    (52, 69, 147), (100, 115, 255), (0, 24, 236), (132, 56, 255),
    (82, 0, 133), (203, 56, 255), (255, 149, 200), (255, 55, 199),
]

EMOTION_COLORS = {
    "happy":    (0, 220, 100),
    "sad":      (100, 100, 255),
    "angry":    (0, 50, 255),
    "fear":     (180, 0, 255),
    "surprise": (0, 200, 255),
    "disgust":  (0, 180, 80),
    "neutral":  (200, 200, 200),
}


def get_color(class_id: int) -> tuple:
    return PALETTE[class_id % len(PALETTE)]


def _put_label_box(frame: np.ndarray, x1: int, y1: int, text: str, color: tuple, font_scale: float = 0.52) -> int:
    """Draw a filled label rectangle above y1, return the top y of the box."""
    (tw, th), bl = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 1)
    top = max(y1 - th - bl - 6, 0)
    cv2.rectangle(frame, (x1, top), (x1 + tw + 6, top + th + bl + 4), color, -1)
    cv2.putText(frame, text, (x1 + 3, top + th + 2),
                cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), 1, cv2.LINE_AA)
    return top


def draw_person_box(frame: np.ndarray, box, conf: float, face_info: dict | None) -> None:
    """Draw bounding box for a person with optional emotion/age/gender overlay."""
    x1, y1, x2, y2 = map(int, box)

    if face_info:
        emotion = face_info.get("dominant_emotion", "neutral")
        color = EMOTION_COLORS.get(emotion, (200, 200, 200))
    else:
        color = (255, 56, 56)

    # Main box
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

    # Top label: "person 0.91"
    label_top = _put_label_box(frame, x1, y1, f"person {conf:.2f}", color)

    if face_info:
        emotion   = face_info.get("dominant_emotion", "?")
        age       = face_info.get("age", "?")
        gender    = face_info.get("dominant_gender", "?")
        em_conf   = face_info.get("emotion_conf", 0)

        # Emotion bar below top label
        lines = [
            f"{emotion} ({em_conf:.0f}%)",
            f"{gender}  age~{age}",
        ]
        y_cursor = y1 + 6
        for line in lines:
            (tw, th), bl = cv2.getTextSize(line, cv2.FONT_HERSHEY_SIMPLEX, 0.48, 1)
            cv2.rectangle(frame, (x1, y_cursor), (x1 + tw + 6, y_cursor + th + bl + 4), (0, 0, 0), -1)
            cv2.putText(frame, line, (x1 + 3, y_cursor + th + 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.48, color, 1, cv2.LINE_AA)
            y_cursor += th + bl + 8


def draw_box(frame: np.ndarray, box, label: str, conf: float, class_id: int) -> None:
    """Draw bounding box for non-person objects."""
    x1, y1, x2, y2 = map(int, box)
    color = get_color(class_id)
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    _put_label_box(frame, x1, y1, f"{label} {conf:.2f}", color)


def draw_stats_overlay(frame: np.ndarray, counts: dict, fps: float, frame_num: int) -> None:
    overlay = frame.copy()
    lines = [f"FPS: {fps:.1f}", f"Frame: {frame_num}"] + [f"{k}: {v}" for k, v in sorted(counts.items())]
    pad, line_h, box_w = 10, 22, 200
    box_h = pad * 2 + line_h * len(lines)
    cv2.rectangle(overlay, (10, 10), (10 + box_w, 10 + box_h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)
    for i, line in enumerate(lines):
        color = (0, 255, 120) if i == 0 else (255, 255, 255)
        cv2.putText(frame, line, (20, 10 + pad + line_h * i + 14),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, color, 1, cv2.LINE_AA)


def _analyze_face(face_img: np.ndarray) -> dict | None:
    """Run DeepFace on a cropped face/person region. Returns None on failure."""
    try:
        from deepface import DeepFace
        results = DeepFace.analyze(
            face_img,
            actions=["emotion", "age", "gender"],
            enforce_detection=False,
            silent=True,
        )
        r = results[0] if isinstance(results, list) else results
        emotion_scores = r.get("emotion", {})
        dominant = r.get("dominant_emotion", "neutral")
        conf = emotion_scores.get(dominant, 0)
        return {
            "dominant_emotion": dominant,
            "emotion_conf": conf,
            "age": int(r.get("age", 0)),
            "dominant_gender": r.get("dominant_gender", "unknown"),
        }
    except Exception:
        return None


def run_yolo_on_video(
    input_path: str,
    output_path: str,
    model_name: str = "yolov8n.pt",
    conf_threshold: float = 0.25,
    face_analysis_every_n: int = 5,
    progress_callback=None,
) -> dict:
    """
    Run YOLOv8 detection on every frame.
    For every detected person, run DeepFace every N frames to get
    emotion, age, and gender — cached between analysis frames.
    """
    model = YOLO(model_name)

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {input_path}")

    width        = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height       = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    original_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, original_fps, (width, height))

    cumulative_counts: dict[str, int] = defaultdict(int)
    # Cache face analysis per person-box slot (keyed by slot index in frame)
    face_cache: dict[int, dict | None] = {}

    frame_num = 0
    t_start = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_num += 1
        t_frame = time.time()
        do_face_analysis = (frame_num % face_analysis_every_n == 1)

        results = model(frame, conf=conf_threshold, verbose=False)[0]
        frame_counts: dict[str, int] = defaultdict(int)

        person_idx = 0
        for det in results.boxes:
            class_id = int(det.cls[0])
            label    = model.names[class_id]
            conf     = float(det.conf[0])
            box      = det.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = map(int, box)

            if label == "person":
                if do_face_analysis:
                    # Crop the person region (upper 60% = more likely to contain face)
                    crop_y2 = min(y2, y1 + int((y2 - y1) * 0.6))
                    crop = frame[max(y1, 0):max(crop_y2, y1 + 1), max(x1, 0):max(x2, x1 + 1)]
                    if crop.size > 0:
                        face_cache[person_idx] = _analyze_face(crop)
                    else:
                        face_cache[person_idx] = None

                face_info = face_cache.get(person_idx)
                draw_person_box(frame, box, conf, face_info)
                frame_counts["person"] += 1
                cumulative_counts["person"] += 1
                person_idx += 1
            else:
                draw_box(frame, box, label, conf, class_id)
                frame_counts[label] += 1
                cumulative_counts[label] += 1

        fps = 1.0 / max(time.time() - t_frame, 1e-6)
        draw_stats_overlay(frame, frame_counts, fps, frame_num)
        out.write(frame)

        if progress_callback and total_frames > 0:
            progress_callback(frame_num, total_frames)

    cap.release()
    out.release()

    elapsed = time.time() - t_start
    return {
        "total_frames": frame_num,
        "processing_time_sec": round(elapsed, 2),
        "detections_per_class": dict(cumulative_counts),
        "total_detections": sum(cumulative_counts.values()),
    }
