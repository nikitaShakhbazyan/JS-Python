"""
Tests for participants endpoints
"""
import pytest
from fastapi import status


def test_create_participant(client, test_user):
    """Test creating a new participant"""
    participant_data = {
        "subject_id": "P001",
        "study_group": "treatment",
        "enrollment_date": "2024-11-14",
        "status": "active",
        "age": 45,
        "gender": "F"
    }
    response = client.post(
        "/participants/",
        json=participant_data,
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["subject_id"] == "P001"
    assert data["age"] == 45
    assert "participant_id" in data


def test_create_participant_unauthorized(client):
    """Test creating participant without authentication"""
    participant_data = {
        "subject_id": "P002",
        "study_group": "control",
        "age": 30,
        "gender": "M"
    }
    response = client.post("/participants/", json=participant_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_duplicate_participant(client, test_user):
    """Test creating participant with duplicate subject_id"""
    participant_data = {
        "subject_id": "P003",
        "study_group": "treatment",
        "age": 50,
        "gender": "M"
    }
    # Create first participant
    client.post(
        "/participants/",
        json=participant_data,
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    # Try to create duplicate
    response = client.post(
        "/participants/",
        json=participant_data,
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert response.status_code == status.HTTP_409_CONFLICT


def test_get_all_participants(client, test_user):
    """Test getting all participants"""
    # Create test participants
    for i in range(3):
        client.post(
            "/participants/",
            json={
                "subject_id": f"P{i:03d}",
                "study_group": "treatment",
                "age": 30 + i,
                "gender": "M"
            },
            headers={"Authorization": f"Bearer {test_user['token']}"}
        )

    response = client.get(
        "/participants/",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 3


def test_get_participant_by_id(client, test_user):
    """Test getting a specific participant"""
    # Create participant
    create_response = client.post(
        "/participants/",
        json={
            "subject_id": "P100",
            "study_group": "control",
            "age": 40,
            "gender": "F"
        },
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    participant_id = create_response.json()["participant_id"]

    # Get participant
    response = client.get(
        f"/participants/{participant_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["subject_id"] == "P100"


def test_delete_participant(client, test_user):
    """Test deleting a participant"""
    # Create participant
    create_response = client.post(
        "/participants/",
        json={
            "subject_id": "P200",
            "study_group": "treatment",
            "age": 35,
            "gender": "M"
        },
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    participant_id = create_response.json()["participant_id"]

    # Delete participant
    delete_response = client.delete(
        f"/participants/{participant_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # Verify deletion
    get_response = client.get(
        f"/participants/{participant_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_nonexistent_participant(client, test_user):
    """Test deleting a non-existent participant"""
    response = client.delete(
        "/participants/nonexistent-id",
        headers={"Authorization": f"Bearer {test_user['token']}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
