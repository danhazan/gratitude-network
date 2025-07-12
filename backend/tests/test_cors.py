from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_cors_headers():
    origin = "http://localhost:3000"
    response = client.options(
        "/healthz",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    # FastAPI's CORSMiddleware reflects the origin if it's allowed
    assert response.headers["access-control-allow-origin"] == origin or response.headers["access-control-allow-origin"] == "*"
    assert "access-control-allow-methods" in response.headers
    assert "access-control-allow-headers" in response.headers

def test_cors_get_request():
    origin = "http://localhost:3000"
    response = client.get("/healthz", headers={"Origin": origin})
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    # FastAPI's CORSMiddleware reflects the origin if it's allowed
    assert response.headers["access-control-allow-origin"] == origin or response.headers["access-control-allow-origin"] == "*"