import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_submit_feedback():
    response = client.post(
        "/api/analyze/feedback",
        json={
            "analysis_id": "test_analysis_id",
            "criticality": 5,
            "comments": "Test feedback comment"
        }
    )
    assert response.status_code == 204

def test_submit_feedback_invalid_data():
    response = client.post(
        "/api/analyze/feedback",
        json={
            "analysis_id": "",
            "criticality": "invalid",
            "comments": "Test feedback comment"
        }
    )
    assert response.status_code == 400

def test_submit_feedback_missing_required_field():
    response = client.post(
        "/api/analyze/feedback",
        json={
            "criticality": 5,
            "comments": "Test feedback comment"
        }
    )
    assert response.status_code == 422