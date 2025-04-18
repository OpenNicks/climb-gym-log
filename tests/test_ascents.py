import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from app.main import app
from app.models.ascents import Ascent
from app.models.core import User, Climb, Gym
from app.db import get_session
from datetime import datetime

@pytest.fixture(name="client")
def client_fixture():
    # Use an in-memory SQLite database for testing
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    
    # Seed a user, gym, and climb
    with Session(engine) as session:
        user = User(username="testuser", email="test@example.com", hashed_password="fakehash", is_public=True)
        gym = Gym(name="Test Gym", location="Test City")
        session.add(user)
        session.add(gym)
        session.commit()
        session.refresh(user)
        session.refresh(gym)
        climb = Climb(gym_id=gym.id, color="Green", setter="Setter", section="A", setter_grade="V2", date_added=datetime.now(), rating=3)
        session.add(climb)
        session.commit()
        session.refresh(climb)

    def get_session_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    return client

def test_create_ascent(client):
    # Simulate login
    token = "demo-token"  # This should match your app's demo bypass
    headers = {"Authorization": f"Bearer {token}"}
    # Get climb id
    response = client.get("/gyms/")
    climb_id = response.json()[0]["climbs"][0]["id"] if response.json()[0]["climbs"] else 1
    data = {
        "climb_id": climb_id,
        "grade": "V2",
        "notes": "Felt soft",
        "date": str(datetime.now())
    }
    response = client.post("/ascents/", json=data, headers=headers)
    assert response.status_code == 201
    ascent = response.json()
    assert ascent["grade"] == "V2"
    assert ascent["notes"] == "Felt soft"

def test_list_user_ascents(client):
    token = "demo-token"
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/ascents/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_ascents_for_climb(client):
    token = "demo-token"
    headers = {"Authorization": f"Bearer {token}"}
    # Get climb id
    response = client.get("/gyms/")
    climb_id = response.json()[0]["climbs"][0]["id"] if response.json()[0]["climbs"] else 1
    response = client.get(f"/ascents/climb/{climb_id}", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_ascent_edge_cases(client):
    token = "demo-token"
    headers = {"Authorization": f"Bearer {token}"}
    # Missing climb_id
    response = client.post("/ascents/", json={"grade": "V3"}, headers=headers)
    assert response.status_code == 422
    # Invalid climb_id
    response = client.post("/ascents/", json={"climb_id": 9999, "grade": "V3"}, headers=headers)
    assert response.status_code in (404, 422, 500)
