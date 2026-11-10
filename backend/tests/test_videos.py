"""Chunked video upload + range streaming (run: pytest backend/tests/test_videos.py)."""
import os
import requests

API = os.environ.get("TEST_API_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0]
FIXTURE = os.path.join(os.path.dirname(__file__), "fixtures", "sample.mp4")


def login():
    s = requests.Session()
    r = s.post(f"{API}/api/auth/login", json={"email": "admin@outsidersproduction.ma", "password": "Outsiders2026!"})
    assert r.status_code == 200
    return s


def test_upload_requires_auth():
    r = requests.post(f"{API}/api/admin/videos/init", json={"filename": "a.mp4", "content_type": "video/mp4", "size": 10})
    assert r.status_code == 401


def test_rejects_non_video_and_too_large():
    s = login()
    assert s.post(f"{API}/api/admin/videos/init", json={"filename": "a.pdf", "content_type": "application/pdf", "size": 10}).status_code == 400
    assert s.post(f"{API}/api/admin/videos/init", json={"filename": "a.mp4", "content_type": "video/mp4", "size": 600 * 1024 * 1024}).status_code == 400


def test_chunked_upload_and_range():
    s = login()
    data = open(FIXTURE, "rb").read()
    init = s.post(f"{API}/api/admin/videos/init", json={"filename": "sample.mp4", "content_type": "video/mp4", "size": len(data)}).json()
    step = 300 * 1024  # several small chunks to exercise assembly
    parts = [data[i:i + step] for i in range(0, len(data), step)]
    for i, p in enumerate(parts):
        r = s.put(f"{API}/api/admin/videos/{init['upload_id']}/chunk?index={i}", data=p, headers={"Content-Type": "application/octet-stream"})
        assert r.status_code == 200
    url = s.post(f"{API}/api/admin/videos/{init['upload_id']}/complete", json={"parts": len(parts)}).json()["url"]
    full = requests.get(f"{API}{url}")
    assert full.status_code == 200 and full.content == data
    part = requests.get(f"{API}{url}", headers={"Range": "bytes=1000-1999"})
    assert part.status_code == 206 and part.content == data[1000:2000]
    assert part.headers["Content-Range"] == f"bytes 1000-1999/{len(data)}"
