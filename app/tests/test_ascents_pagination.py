"""
Pytest unit tests for ascents list endpoints with pagination and error handling.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    # TODO: Implement fixture to get valid auth headers for a test user
    return {"Authorization": "Bearer testtoken"}

# --- Expected Use ---
def test_list_user_ascents_pagination(auth_headers):
    response = client.get("/ascents/?limit=2&offset=0", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 2

# --- Edge Case ---
def test_list_user_ascents_offset_beyond(auth_headers):
    response = client.get("/ascents/?limit=2&offset=9999", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data == []

# --- Failure Case ---
def test_list_user_ascents_invalid_limit(auth_headers):
    response = client.get("/ascents/?limit=-1", headers=auth_headers)
    assert response.status_code == 422 or response.status_code == 400

# Unauthorized

def test_list_user_ascents_unauthorized():
    response = client.get("/ascents/")
    assert response.status_code == 401
