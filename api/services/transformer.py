"""
Transforms raw Gemini analysis output into the Sentinel structured response.

Maps:
  per_person[].notable_cues + timeline[].observations  →  risk_factors
  clip_summary.overall_assessment + prediction          →  conclusion
  recommended_action                                    →  recommended_actions
"""

from typing import Any

from api.models.response import AnalysisMetadata, AnalysisResponse, Prediction, RiskFactor

# Risk level above which a timeline segment is considered elevated
_RISK_THRESHOLD = 0.4


def _extract_risk_factors(raw: dict) -> list[RiskFactor]:
    factors: list[RiskFactor] = []
    seen: set[str] = set()

    def add(label: str, confidence: float, interpretation: str) -> None:
        key = label.lower()
        if key not in seen:
            seen.add(key)
            factors.append(RiskFactor(label=label, confidence=round(confidence, 3), interpretation=interpretation))

    # Per-person notable cues
    overall_risk: float = raw.get("overall_fight_risk_0_1", 0.0)
    for person in raw.get("per_person", []):
        pid = person.get("person_id", "unknown")
        emotion = person.get("overall_emotion", "")
        movement = person.get("overall_movement", "")

        if emotion not in ("calm", "happy", "neutral", "insufficient_evidence", ""):
            add(
                label=f"{emotion} emotional state detected",
                confidence=overall_risk,
                interpretation=f"{pid} displaying {emotion} affect — potential behavioral escalation signal.",
            )

        if movement not in ("casual", "insufficient_evidence", ""):
            add(
                label=f"{movement.replace('_', ' ')} movement detected",
                confidence=overall_risk,
                interpretation=f"{pid} exhibiting {movement.replace('_', ' ')} — may indicate confrontational intent or distress.",
            )

        for cue in person.get("notable_cues", []):
            add(
                label=cue,
                confidence=overall_risk,
                interpretation=f"Observed on {pid}: {cue}.",
            )

    # High-risk timeline observations
    for segment in raw.get("timeline", []):
        seg_risk: float = segment.get("fight_risk_0_1", 0.0)
        seg_conf: float = segment.get("confidence_0_1", overall_risk)
        if seg_risk >= _RISK_THRESHOLD:
            for obs in segment.get("observations", []):
                add(
                    label=obs,
                    confidence=seg_conf,
                    interpretation=f"Detected at {segment.get('start_s', '?')}s–{segment.get('end_s', '?')}s (risk score {seg_risk:.2f}): {obs}.",
                )

    # Prediction signals
    prediction = raw.get("prediction_next_5_10s", {})
    for why in prediction.get("why", []):
        add(
            label=why,
            confidence=prediction.get("confidence_0_1", overall_risk),
            interpretation=f"Predictive signal for next 5–10 s: {why}.",
        )

    return factors


def _build_conclusion(raw: dict) -> str:
    summary = raw.get("clip_summary", {}).get("overall_assessment", "")
    prediction = raw.get("prediction_next_5_10s", {})
    outcome = prediction.get("likely_outcome", "")
    pred_conf = prediction.get("confidence_0_1", 0.0)

    outcome_readable = outcome.replace("_", " ") if outcome else ""

    parts = [summary] if summary else []
    if outcome_readable and outcome_readable != "insufficient evidence":
        parts.append(
            f"Predicted outcome: {outcome_readable} (confidence {pred_conf:.0%})."
        )

    recommended = raw.get("recommended_action", {})
    for why in recommended.get("why", []):
        parts.append(why)

    return " ".join(parts).strip() or "Insufficient evidence to draw a conclusion."


def _build_recommended_actions(raw: dict) -> list[str]:
    actions: list[str] = []
    recommended = raw.get("recommended_action", {})
    action_label = recommended.get("action", "")

    action_map = {
        "ignore": "No action required — continue passive monitoring.",
        "monitor": "Increase monitoring frequency on this area.",
        "notify_staff": "Notify on-site staff to attend the location immediately.",
        "escalate_security": "Escalate to security personnel — potential emergency in progress.",
    }

    if action_label in action_map:
        actions.append(action_map[action_label])

    actions.extend(recommended.get("why", []))

    prediction = raw.get("prediction_next_5_10s", {})
    outcome = prediction.get("likely_outcome", "")

    supplemental = {
        "fall_with_minor_injury": "Dispatch floor staff to assist and document the incident.",
        "fall_with_serious_injury": "Call emergency medical services immediately and clear the area.",
        "medical_event_likely": "Alert medical staff and prepare first-aid response.",
        "confrontation_likely": "Separate individuals — send security guard and notify supervisor.",
        "argument_continues": "Send a staff member to de-escalate the situation.",
    }
    if outcome in supplemental and supplemental[outcome] not in actions:
        actions.append(supplemental[outcome])

    return actions if actions else ["No immediate action required."]


def transform(raw: dict, staff_feedback: dict = None) -> AnalysisResponse:
    """Convert raw Gemini JSON into a structured AnalysisResponse with optional staff feedback."""
    prediction_raw = raw.get("prediction_next_5_10s", {})
    
    metadata = AnalysisMetadata(
        people_detected=raw.get("clip_summary", {}).get("people_detected", 0),
        overall_risk_score=round(raw.get("overall_fight_risk_0_1", 0.0), 3),
        prediction=Prediction(
            likely_outcome=prediction_raw.get("likely_outcome", "insufficient_evidence"),
            confidence=round(prediction_raw.get("confidence_0_1", 0.0), 3),
        ),
    )
    
    if staff_feedback:
        metadata.staff_feedback = staff_feedback
    
    return AnalysisResponse(
        risk_factors=_extract_risk_factors(raw),
        conclusion=_build_conclusion(raw),
        recommended_actions=_build_recommended_actions(raw),
        metadata=metadata,
    )

    return AnalysisResponse(
        risk_factors=_extract_risk_factors(raw),
        conclusion=_build_conclusion(raw),
        recommended_actions=_build_recommended_actions(raw),
        metadata=AnalysisMetadata(
            people_detected=raw.get("clip_summary", {}).get("people_detected", 0),
            overall_risk_score=round(raw.get("overall_fight_risk_0_1", 0.0), 3),
            prediction=Prediction(
                likely_outcome=prediction_raw.get("likely_outcome", "insufficient_evidence"),
                confidence=round(prediction_raw.get("confidence_0_1", 0.0), 3),
            ),
        ),
    )
