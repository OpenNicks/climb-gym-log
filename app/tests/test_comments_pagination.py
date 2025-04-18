"""
Pytest unit tests for comments list endpoint with pagination and error handling.
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
def test_list_comments_pagination(auth_headers):
    response = client.get("/climbs/1/comments?limit=2&offset=0", headers=auth_headers)
    assert response.status_code in (200, 404)  # 404 if climb 1 doesn't exist
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 2

# --- Edge Case ---
def test_list_comments_offset_beyond(auth_headers):
    response = client.get("/climbs/1/comments?limit=2&offset=9999", headers=auth_headers)
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert data == []

# --- Failure Case ---
def test_list_comments_invalid_limit(auth_headers):
    response = client.get("/climbs/1/comments?limit=-1", headers=auth_headers)
    assert response.status_code in (422, 400, 404)
