import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session
from app.main import app
from app.db import engine, get_session

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session):
    def override_get_session():
        yield session
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_create_and_list_gym(client):
    # Test gym creation
    response = client.post("/gyms/", json={"name": "Test Gym", "location": "Test City"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Gym"
    assert data["location"] == "Test City"

    # Test gym listing with pagination
    response = client.get("/gyms/?skip=0&limit=1")
    assert response.status_code == 200
    gyms = response.json()
    assert isinstance(gyms, list)
    assert any(gym["name"] == "Test Gym" for gym in gyms)

    # Test duplicate gym name
    response = client.post("/gyms/", json={"name": "Test Gym", "location": "Test City"})
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_create_and_list_climb(client):
    # Create gym first
    gym_resp = client.post("/gyms/", json={"name": "Climb Gym", "location": "Nowhere"})
    gym_id = gym_resp.json()["id"]
    # Create climb for gym
    climb_data = {
        "gym_id": gym_id,
        "color": "Blue",
        "setter": "Alex",
        "section": "A",
        "setter_grade": "V4",
        "date_added": "2025-04-16T12:00:00"
    }
    resp = client.post(f"/gyms/{gym_id}/climbs/", json=climb_data)
    assert resp.status_code == 201
    climb = resp.json()
    assert climb["color"] == "Blue"
    assert climb["setter"] == "Alex"
    # List climbs for gym with pagination
    resp = client.get(f"/gyms/{gym_id}/climbs/?skip=0&limit=1")
    assert resp.status_code == 200
    climbs = resp.json()
    assert isinstance(climbs, list)
    assert any(c["color"] == "Blue" for c in climbs)

# Edge case: gym not found

def test_create_climb_gym_not_found(client):
    climb_data = {
        "gym_id": 999,
        "color": "Red",
        "setter": "Jamie",
        "section": "B",
        "setter_grade": "V3",
        "date_added": "2025-04-16T12:00:00"
    }
    resp = client.post(f"/gyms/999/climbs/", json=climb_data)
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Gym not found"

# Simulate DB failure for climb creation
def test_create_climb_db_failure(client, monkeypatch):
    gym_resp = client.post("/gyms/", json={"name": "Fail Gym", "location": "Nowhere"})
    gym_id = gym_resp.json()["id"]
    climb_data = {
        "gym_id": gym_id,
        "color": "Yellow",
        "setter": "Jess",
        "section": "C",
        "setter_grade": "V2",
        "date_added": "2025-04-16T12:00:00"
    }
    def fail_commit():
        raise Exception("Simulated DB error")
    monkeypatch.setattr(Session, "commit", lambda self: fail_commit())
    resp = client.post(f"/gyms/{gym_id}/climbs/", json=climb_data)
    assert resp.status_code == 500
    assert "Failed to create climb" in resp.json()["detail"]
