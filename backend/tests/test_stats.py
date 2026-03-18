from unittest.mock import patch


VALID_PAYLOAD = {
    "install_id": "abc-123",
    "android_id": "d4e5f6",
    "species": "Great Tit",
    "scientific_name": "Parus major",
    "confidence": "high",
    "had_result": True,
    "duration_ms": 3241,
    "wikipedia_tapped": False,
    "example_images_count": 3,
    "platform": "android",
    "app_version": "1.0.0",
    "os_version": "14",
    "timestamp": "2026-03-10T10:22:00Z",
}


def test_stats_valid_payload(client):
    with patch("app.routers.stats.append_stat") as mock_append:
        response = client.post("/api/stats", json=VALID_PAYLOAD)
    assert response.status_code == 200
    assert response.json() == {"ok": True}
    mock_append.assert_called_once()


def test_stats_missing_required_field(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "species"}
    with patch("app.routers.stats.append_stat"):
        response = client.post("/api/stats", json=payload)
    assert response.status_code == 422


def test_stats_android_id_null(client):
    payload = {**VALID_PAYLOAD, "android_id": None}
    with patch("app.routers.stats.append_stat"):
        response = client.post("/api/stats", json=payload)
    assert response.status_code == 200


def test_append_stat_writes_jsonl(tmp_path):
    import json

    from app.services.stats_service import append_stat

    test_file = tmp_path / "test_stats.jsonl"
    with patch("app.services.stats_service.LOG_FILE", test_file):
        append_stat({"species": "Robin"})

    content = test_file.read_text(encoding="utf-8")
    parsed = json.loads(content.splitlines()[0])
    assert parsed["species"] == "Robin"
