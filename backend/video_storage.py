"""Large video uploads for the CMS.

The browser sends the file in small chunks (proxies cap request size), then asks to assemble them.
Storage: Google Cloud Storage when GCS_BUCKET is set (production on Cloud Run, stateless across
instances), otherwise MongoDB GridFS with chunks kept on local disk (preview / single instance).
"""
import os
import re
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from pydantic import BaseModel, Field

MAX_VIDEO = 500 * 1024 * 1024
MAX_CHUNK = 6 * 1024 * 1024
READ = 1024 * 1024
GCS_BUCKET = os.environ.get("GCS_BUCKET", "").strip()
TMP = Path("/tmp/op_video_parts")

_bucket = None


def gcs_bucket():
    global _bucket
    if _bucket is None:
        from google.cloud import storage
        _bucket = storage.Client().bucket(GCS_BUCKET)
    return _bucket


class InitIn(BaseModel):
    filename: str = Field(max_length=200)
    content_type: str = Field(max_length=100)
    size: int = Field(gt=0)


class CompleteIn(BaseModel):
    parts: int = Field(gt=0, le=200)


def parse_range(value, size):
    if not value:
        return 0, size - 1, 200
    m = re.fullmatch(r"bytes=(\d*)-(\d*)", value.strip())
    if not m or (not m.group(1) and not m.group(2)):
        raise HTTPException(416, "Range not satisfiable")
    if m.group(1):
        start, end = int(m.group(1)), int(m.group(2) or size - 1)
    else:
        start, end = max(0, size - int(m.group(2))), size - 1
    if start >= size or end < start:
        raise HTTPException(416, "Range not satisfiable")
    return start, min(end, size - 1), 206


def build_video_router(db, require_editor) -> APIRouter:
    router = APIRouter()
    grid = AsyncIOMotorGridFSBucket(db, bucket_name="videos")

    async def get_upload(upload_id: str) -> dict:
        doc = await db.video_uploads.find_one({"upload_id": upload_id}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Upload not found")
        return doc

    @router.post("/admin/videos/init")
    async def init_upload(body: InitIn, _: dict = Depends(require_editor)):
        if not body.content_type.startswith("video/"):
            raise HTTPException(400, "Format vidéo requis / Video file required (mp4, webm, mov)")
        if body.size > MAX_VIDEO:
            raise HTTPException(400, "Vidéo trop lourde (500 Mo max) / Video too large (500 MB max)")
        upload_id = uuid.uuid4().hex
        await db.video_uploads.insert_one({
            "upload_id": upload_id, "filename": body.filename, "content_type": body.content_type,
            "size": body.size, "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"upload_id": upload_id, "chunk_size": 5 * 1024 * 1024}

    @router.put("/admin/videos/{upload_id}/chunk")
    async def put_chunk(upload_id: str, index: int, request: Request, _: dict = Depends(require_editor)):
        await get_upload(upload_id)
        data = await request.body()
        if not data or len(data) > MAX_CHUNK or not 0 <= index < 200:
            raise HTTPException(400, "Invalid chunk")
        name = f"{index:05d}"
        if GCS_BUCKET:
            blob = gcs_bucket().blob(f"tmp/{upload_id}/{name}")
            await run_in_threadpool(blob.upload_from_string, data)
        else:
            folder = TMP / upload_id
            folder.mkdir(parents=True, exist_ok=True)
            await run_in_threadpool((folder / name).write_bytes, data)
        return {"ok": True}

    async def assemble_gcs(upload_id: str, parts: int, doc: dict) -> str:
        bucket = gcs_bucket()
        sources = [bucket.blob(f"tmp/{upload_id}/{i:05d}") for i in range(parts)]
        key = f"videos/{upload_id}"
        round_ = 0
        while len(sources) > 32:  # compose accepts at most 32 sources: merge in rounds
            merged = []
            for g in range(0, len(sources), 32):
                out = bucket.blob(f"tmp/{upload_id}/r{round_}-{g // 32:03d}")
                await run_in_threadpool(out.compose, sources[g:g + 32])
                merged.append(out)
            sources, round_ = merged, round_ + 1
        final = bucket.blob(key)
        final.content_type = doc["content_type"]
        await run_in_threadpool(final.compose, sources)
        tmp_blobs = await run_in_threadpool(lambda: list(bucket.list_blobs(prefix=f"tmp/{upload_id}/")))
        for b in tmp_blobs:
            await run_in_threadpool(b.delete)
        await run_in_threadpool(final.reload)
        return key, int(final.size)

    async def assemble_grid(upload_id: str, parts: int, doc: dict):
        folder = TMP / upload_id
        stream = grid.open_upload_stream(doc["filename"], chunk_size_bytes=1024 * 1024, metadata={"contentType": doc["content_type"]})
        size = 0
        for i in range(parts):
            path = folder / f"{i:05d}"
            if not path.exists():
                await stream.abort()
                raise HTTPException(400, f"Missing chunk {i}")
            data = await run_in_threadpool(path.read_bytes)
            size += len(data)
            await stream.write(data)
        await stream.close()
        shutil.rmtree(folder, ignore_errors=True)
        return str(stream._id), size

    @router.post("/admin/videos/{upload_id}/complete")
    async def complete(upload_id: str, body: CompleteIn, _: dict = Depends(require_editor)):
        doc = await get_upload(upload_id)
        if GCS_BUCKET:
            key, size = await assemble_gcs(upload_id, body.parts, doc)
            backend = "gcs"
        else:
            key, size = await assemble_grid(upload_id, body.parts, doc)
            backend = "gridfs"
        await db.videos.insert_one({
            "video_id": upload_id, "backend": backend, "key": key, "content_type": doc["content_type"],
            "size": size, "filename": doc["filename"], "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.video_uploads.delete_one({"upload_id": upload_id})
        return {"url": f"/api/media/video/{upload_id}"}

    @router.get("/media/video/{video_id}")
    async def stream(video_id: str, range_header: str = Header(default=None, alias="Range")):
        doc = await db.videos.find_one({"video_id": video_id}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Not found")
        size = doc["size"]
        start, end, status = parse_range(range_header, size)
        headers = {"Accept-Ranges": "bytes", "Content-Length": str(end - start + 1), "Cache-Control": "public, max-age=86400"}
        if status == 206:
            headers["Content-Range"] = f"bytes {start}-{end}/{size}"

        if doc["backend"] == "gcs":
            blob = gcs_bucket().blob(doc["key"])

            async def body():
                for pos in range(start, end + 1, READ):
                    yield await run_in_threadpool(blob.download_as_bytes, start=pos, end=min(pos + READ - 1, end))
        else:
            from bson import ObjectId
            out = await grid.open_download_stream(ObjectId(doc["key"]))
            out.seek(start)

            async def body():
                left = end - start + 1
                while left > 0:
                    data = await out.read(min(READ, left))
                    if not data:
                        break
                    left -= len(data)
                    yield data

        return StreamingResponse(body(), status_code=status, media_type=doc["content_type"], headers=headers)

    return router
