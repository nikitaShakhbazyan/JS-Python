"""
Tests for authentication endpoints
"""
import pytest
from fastapi import status


def test_register_user(client):
    """Test user registration"""
    response = client.post(
        "/register",
        json={"email": "newuser@example.com", "password": "password123"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_register_duplicate_user(client, test_user):
    """Test registration with duplicate email"""
    response = client.post(
        "/register",
        json={"email": test_user["email"], "password": "password123"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post(
        "/token",
        data={"username": test_user["email"], "password": test_user["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()


def test_login_invalid_credentials(client, test_user):
    """Test login with invalid password"""
    response = client.post(
        "/token",
        data={"username": test_user["email"], "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    response = client.post(
        "/token",
        data={"username": "nonexistent@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
