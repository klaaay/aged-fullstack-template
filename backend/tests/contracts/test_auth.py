from fastapi.testclient import TestClient

from app.platform.config.settings import settings


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    payload = {"email": "foo@example.com", "password": "password123"}

    first = client.post("/api/auth/register", json=payload)
    second = client.post("/api/auth/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()["error"]["type"] == "conflict"


def test_login_returns_access_token_and_sets_refresh_cookie(client: TestClient) -> None:
    payload = {"email": "bar@example.com", "password": "password123"}

    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == 200
    assert response.json()["data"]["access_token"]
    assert "refresh_token=" in response.headers["set-cookie"]


def test_refresh_returns_new_access_token(client: TestClient) -> None:
    payload = {"email": "refresh@example.com", "password": "password123"}

    client.post("/api/auth/register", json=payload)
    client.post("/api/auth/login", json=payload)
    refresh_response = client.post("/api/auth/refresh")

    assert refresh_response.status_code == 200
    assert refresh_response.json()["data"]["access_token"]


def test_logout_revokes_refresh_session(client: TestClient) -> None:
    payload = {"email": "logout@example.com", "password": "password123"}

    client.post("/api/auth/register", json=payload)
    client.post("/api/auth/login", json=payload)

    logout_response = client.post("/api/auth/logout")
    refresh_response = client.post("/api/auth/refresh")

    assert logout_response.status_code == 204
    assert refresh_response.status_code == 401
    assert refresh_response.json()["error"]["type"] == "unauthorized"


def test_default_admin_credentials_can_login(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": settings.admin_email, "password": settings.admin_password},
    )

    assert response.status_code == 200
    assert response.json()["data"]["user"]["role"] == "admin"


def test_non_admin_cannot_access_admin_entry(client: TestClient) -> None:
    payload = {"email": "member@example.com", "password": "password123"}
    client.post("/api/auth/register", json=payload)
    login_response = client.post("/api/auth/login", json=payload)

    response = client.get(
        "/api/auth/admin-entry",
        headers={"Authorization": f"Bearer {login_response.json()['data']['access_token']}"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["type"] == "forbidden"


def test_register_returns_validation_error_for_invalid_payload(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": "invalid-email", "password": "short"},
    )

    assert response.status_code == 400
    assert response.json()["error"]["type"] == "validation_error"
