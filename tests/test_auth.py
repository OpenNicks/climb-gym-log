import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db
from sqlmodel import SQLModel, create_engine
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

def register_and_login(client, username="testuser", password="testpass123", email="test@example.com"):
    reg = client.post("/auth/register", json={
        "username": username,
        "email": email,
        "password": password
    })
    assert reg.status_code == 201
    login = client.post("/auth/login", data={"username": username, "password": password})
    assert login.status_code == 200
    token = login.json()["access_token"]
    return token

def test_register_and_login(client):
    token = register_and_login(client)
    assert token
    # Current user endpoint
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "testuser"

def test_protected_climb_create_requires_auth(client):
    # Try without auth
    gym = client.post("/gyms/", json={"name": "AuthGym", "location": "Loc"}).json()
    climb_data = {
        "gym_id": gym["id"], "color": "red", "setter": "S", "section": "Main", "setter_grade": "V1", "date_added": "2023-01-01T00:00:00"
    }
    res = client.post(f"/gyms/{gym['id']}/climbs/", json=climb_data)
    assert res.status_code == 401
    # Try with auth
    token = register_and_login(client, username="climber", email="c@c.com")
    res2 = client.post(f"/gyms/{gym['id']}/climbs/", json=climb_data, headers={"Authorization": f"Bearer {token}"})
    assert res2.status_code == 201

def test_protected_rating_requires_auth(client):
    token = register_and_login(client, username="rateuser", email="r@r.com")
    gym = client.post("/gyms/", json={"name": "RateGym", "location": "Loc"}).json()
    climb = client.post(f"/gyms/{gym['id']}/climbs/", json={
        "gym_id": gym["id"], "color": "blue", "setter": "B", "section": "Side", "setter_grade": "V2", "date_added": "2023-01-01T00:00:00"
    }, headers={"Authorization": f"Bearer {token}"}).json()
    # No auth
    res = client.patch(f"/gyms/climbs/{climb['id']}/rating", json={"rating": 5})
    assert res.status_code == 401
    # With auth
    res2 = client.patch(f"/gyms/climbs/{climb['id']}/rating", json={"rating": 4}, headers={"Authorization": f"Bearer {token}"})
    assert res2.status_code == 200
    assert res2.json()["rating"] == 4
