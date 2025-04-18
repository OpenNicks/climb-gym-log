import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db
from sqlmodel import SQLModel, Session, create_engine
import os
import tempfile

@pytest.fixture(scope="function")
def client():
    db_fd, db_path = tempfile.mkstemp()
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    engine = create_engine(os.environ["DATABASE_URL"])
    SQLModel.metadata.create_all(engine)
    init_db()
    with TestClient(app) as c:
        yield c
    os.close(db_fd)
    os.unlink(db_path)

def test_update_climb_rating_success(client):
    # Create gym and climb
    gym = client.post("/gyms/", json={"name": "Test Gym", "location": "Here"}).json()
    climb = client.post(f"/gyms/{gym['id']}/climbs/", json={
        "gym_id": gym["id"], "color": "blue", "setter": "A", "section": "Main", "setter_grade": "V3", "date_added": "2023-01-01T00:00:00", "rating": 0
    }).json()
    # Update rating
    res = client.patch(f"/gyms/climbs/{climb['id']}/rating", json={"rating": 4})
    assert res.status_code == 200
    assert res.json()["rating"] == 4

def test_update_climb_rating_invalid(client):
    # Try to update non-existent climb
    res = client.patch(f"/gyms/climbs/999/rating", json={"rating": 5})
    assert res.status_code == 404

    # Try invalid rating
    gym = client.post("/gyms/", json={"name": "Test2", "location": "There"}).json()
    climb = client.post(f"/gyms/{gym['id']}/climbs/", json={
        "gym_id": gym["id"], "color": "red", "setter": "B", "section": "Side", "setter_grade": "V2", "date_added": "2023-01-01T00:00:00", "rating": 0
    }).json()
    res = client.patch(f"/gyms/climbs/{climb['id']}/rating", json={"rating": 6})
    assert res.status_code == 422
