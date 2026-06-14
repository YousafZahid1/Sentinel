"""
Tests for api/services/transformer.py

Covers: risk score pass-through, fall detection, fight vs sport,
        recommended action mapping, conclusion building, empty/edge cases.
"""

import pytest
from api.services.transformer import transform


def _raw(
    risk: float = 0.0,
    outcome: str = "insufficient_evidence",
    action: str = "ignore",
    people: int = 1,
    per_person: list | None = None,
    timeline: list | None = None,
    why_action: list | None = None,
    why_pred: list | None = None,
    assessment: str = "Scene recorded.",
) -> dict:
    """Minimal valid raw payload for transform()."""
    return {
        "clip_summary": {"people_detected": people, "overall_assessment": assessment},
        "per_person": per_person or [],
        "timeline": timeline or [],
        "overall_fight_risk_0_1": risk,
        "prediction_next_5_10s": {
            "likely_outcome": outcome,
            "confidence_0_1": 0.8,
            "why": why_pred or [],
        },
        "recommended_action": {
            "action": action,
            "why": why_action or [],
        },
    }


# ── Risk score ────────────────────────────────────────────────────────────────

class TestRiskScore:
    def test_low_risk_passthrough(self):
        result = transform(_raw(risk=0.05))
        assert result.metadata.overall_risk_score == pytest.approx(0.05, abs=0.001)

    def test_high_risk_passthrough(self):
        result = transform(_raw(risk=0.95))
        assert result.metadata.overall_risk_score == pytest.approx(0.95, abs=0.001)

    def test_missing_risk_defaults_to_zero(self):
        raw = _raw()
        del raw["overall_fight_risk_0_1"]
        result = transform(raw)
        assert result.metadata.overall_risk_score == 0.0

    def test_people_detected_passthrough(self):
        result = transform(_raw(people=4))
        assert result.metadata.people_detected == 4


# ── Prediction ────────────────────────────────────────────────────────────────

class TestPrediction:
    def test_fall_serious_outcome(self):
        result = transform(_raw(risk=0.92, outcome="fall_with_serious_injury"))
        assert result.metadata.prediction.likely_outcome == "fall_with_serious_injury"

    def test_confrontation_outcome(self):
        result = transform(_raw(risk=0.75, outcome="confrontation_likely"))
        assert result.metadata.prediction.likely_outcome == "confrontation_likely"

    def test_calms_down_outcome(self):
        result = transform(_raw(risk=0.05, outcome="calms_down"))
        assert result.metadata.prediction.likely_outcome == "calms_down"

    def test_insufficient_evidence_default(self):
        result = transform(_raw())
        assert result.metadata.prediction.likely_outcome == "insufficient_evidence"


# ── Recommended actions ───────────────────────────────────────────────────────

class TestRecommendedActions:
    def test_ignore_action(self):
        result = transform(_raw(action="ignore"))
        assert any("passive monitoring" in a.lower() or "no action" in a.lower()
                   for a in result.recommended_actions)

    def test_monitor_action(self):
        result = transform(_raw(action="monitor"))
        assert any("monitor" in a.lower() for a in result.recommended_actions)

    def test_notify_staff_action(self):
        result = transform(_raw(action="notify_staff"))
        assert any("staff" in a.lower() for a in result.recommended_actions)

    def test_escalate_security_action(self):
        result = transform(_raw(action="escalate_security"))
        assert any("security" in a.lower() for a in result.recommended_actions)

    def test_fall_minor_adds_floor_staff(self):
        result = transform(_raw(action="notify_staff", outcome="fall_with_minor_injury"))
        combined = " ".join(result.recommended_actions).lower()
        assert "floor staff" in combined or "assist" in combined

    def test_fall_serious_adds_ems(self):
        result = transform(_raw(action="escalate_security", outcome="fall_with_serious_injury"))
        combined = " ".join(result.recommended_actions).lower()
        assert "emergency" in combined or "medical" in combined

    def test_medical_event_adds_first_aid(self):
        result = transform(_raw(action="escalate_security", outcome="medical_event_likely"))
        combined = " ".join(result.recommended_actions).lower()
        assert "medical" in combined or "first-aid" in combined or "first aid" in combined

    def test_why_phrases_included(self):
        result = transform(_raw(action="escalate_security", why_action=["aggressor advancing"]))
        assert any("aggressor advancing" in a for a in result.recommended_actions)

    def test_empty_action_fallback(self):
        result = transform(_raw(action="unknown_label"))
        assert len(result.recommended_actions) > 0


# ── Conclusion ────────────────────────────────────────────────────────────────

class TestConclusion:
    def test_includes_overall_assessment(self):
        result = transform(_raw(assessment="Two people arguing near exit."))
        assert "Two people arguing near exit." in result.conclusion

    def test_includes_predicted_outcome(self):
        result = transform(_raw(outcome="confrontation_likely"))
        assert "confrontation likely" in result.conclusion.lower()

    def test_insufficient_evidence_fallback(self):
        raw = _raw()
        raw["clip_summary"]["overall_assessment"] = ""
        result = transform(raw)
        assert "Insufficient evidence" in result.conclusion or len(result.conclusion) > 0


# ── Risk factors ──────────────────────────────────────────────────────────────

class TestRiskFactors:
    def test_high_emotion_produces_factor(self):
        pp = [{"person_id": "A", "overall_emotion": "angry",
               "overall_movement": "casual", "notable_cues": []}]
        result = transform(_raw(risk=0.6, per_person=pp))
        labels = [f.label.lower() for f in result.risk_factors]
        assert any("angry" in l for l in labels)

    def test_calm_emotion_no_factor(self):
        pp = [{"person_id": "A", "overall_emotion": "calm",
               "overall_movement": "casual", "notable_cues": []}]
        result = transform(_raw(risk=0.05, per_person=pp))
        labels = [f.label.lower() for f in result.risk_factors]
        assert not any("calm" in l for l in labels)

    def test_notable_cues_become_factors(self):
        pp = [{"person_id": "A", "overall_emotion": "calm",
               "overall_movement": "casual", "notable_cues": ["clutching chest"]}]
        result = transform(_raw(risk=0.8, per_person=pp))
        labels = [f.label.lower() for f in result.risk_factors]
        assert any("clutching chest" in l for l in labels)

    def test_high_risk_timeline_segment_adds_factor(self):
        tl = [{"start_s": 0, "end_s": 5, "fight_risk_0_1": 0.85,
               "confidence_0_1": 0.9, "observations": ["punch landed"],
               "per_person_state": []}]
        result = transform(_raw(risk=0.85, timeline=tl))
        labels = [f.label.lower() for f in result.risk_factors]
        assert any("punch" in l for l in labels)

    def test_low_risk_timeline_segment_ignored(self):
        tl = [{"start_s": 0, "end_s": 5, "fight_risk_0_1": 0.1,
               "confidence_0_1": 0.9, "observations": ["walking calmly"],
               "per_person_state": []}]
        result = transform(_raw(risk=0.1, timeline=tl))
        labels = [f.label.lower() for f in result.risk_factors]
        assert not any("walking calmly" in l for l in labels)

    def test_no_duplicate_factors(self):
        pp = [
            {"person_id": "A", "overall_emotion": "angry",
             "overall_movement": "casual", "notable_cues": ["raised fist"]},
            {"person_id": "B", "overall_emotion": "angry",
             "overall_movement": "casual", "notable_cues": ["raised fist"]},
        ]
        result = transform(_raw(risk=0.7, per_person=pp))
        labels = [f.label.lower() for f in result.risk_factors]
        assert labels.count("raised fist") == 1


# ── Scenario: staircase fall ──────────────────────────────────────────────────

class TestStaircaseFallScenario:
    def test_staircase_fall_full_pipeline(self):
        raw = _raw(
            risk=0.95,
            outcome="fall_with_serious_injury",
            action="escalate_security",
            people=1,
            per_person=[{
                "person_id": "A",
                "overall_emotion": "fearful",
                "overall_movement": "falling",
                "notable_cues": ["tumbling down stairs", "no protective response"],
            }],
            timeline=[{
                "start_s": 0, "end_s": 4,
                "fight_risk_0_1": 0.95,
                "confidence_0_1": 0.92,
                "observations": ["person falling down staircase"],
                "per_person_state": [{"person_id": "A", "emotion": "fearful", "movement": "falling"}],
            }],
            why_action=["medical staff needed immediately", "person unresponsive"],
            assessment="Person is tumbling down a staircase and is unresponsive.",
        )
        result = transform(raw)

        assert result.metadata.overall_risk_score >= 0.90
        assert result.metadata.prediction.likely_outcome == "fall_with_serious_injury"
        assert any("security" in a.lower() or "escalate" in a.lower()
                   for a in result.recommended_actions)
        assert "staircase" in result.conclusion.lower() or "tumbling" in result.conclusion.lower()


# ── Scenario: boxing match ────────────────────────────────────────────────────

class TestBoxingMatchScenario:
    def test_boxing_match_is_low_risk(self):
        raw = _raw(
            risk=0.10,
            outcome="calms_down",
            action="ignore",
            people=3,
            per_person=[
                {"person_id": "A", "overall_emotion": "calm",
                 "overall_movement": "boxing_stance", "notable_cues": ["wearing gloves", "mouthguard"]},
                {"person_id": "B", "overall_emotion": "calm",
                 "overall_movement": "boxing_stance", "notable_cues": ["headgear on"]},
                {"person_id": "C", "overall_emotion": "calm",
                 "overall_movement": "casual", "notable_cues": ["referee role"]},
            ],
            assessment="Regulated boxing match with referee and protective gear.",
        )
        result = transform(raw)

        assert result.metadata.overall_risk_score <= 0.15
        assert any("passive" in a.lower() or "no action" in a.lower()
                   for a in result.recommended_actions)


# ── Scenario: staged / fake ───────────────────────────────────────────────────

class TestStagedFightScenario:
    def test_staged_fight_low_risk(self):
        raw = _raw(
            risk=0.08,
            outcome="calms_down",
            action="ignore",
            assessment="Staged performance with choreographed movements and smiling participants.",
        )
        result = transform(raw)
        assert result.metadata.overall_risk_score < 0.20
