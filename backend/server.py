from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Annotated, Optional, List

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from starlette.middleware.cors import CORSMiddleware

from email_service import send_email, contact_notification_html

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI()
api = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude={"id"})
        return data


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=160)
    project_type: str = Field(default="", max_length=80)
    message: str = Field(min_length=1, max_length=5000)


class Message(BaseDocument):
    name: str
    email: str
    company: str = ""
    project_type: str = ""
    message: str
    read: bool = False
    email_status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MessagePatch(BaseModel):
    read: bool


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def make_token(user_id: str, email: str, kind: str, delta: timedelta) -> str:
    payload = {"sub": user_id, "email": email, "type": kind, "exp": datetime.now(timezone.utc) + delta}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str):
    access = make_token(user_id, email, "access", timedelta(hours=2))
    refresh = make_token(user_id, email, "refresh", timedelta(days=7))
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    auth = request.headers.get("Authorization", "")
    if not token and auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(401, "Invalid token type")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])}, {"password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "")}


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Forbidden")
    return user


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


# ---------- Auth ----------
@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    ident = f"{client_ip(request)}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    now = datetime.now(timezone.utc)
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = datetime.fromisoformat(attempt["last"]) + timedelta(minutes=15)
        if now < locked_until:
            raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": ident})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one({"identifier": ident},
                                           {"$inc": {"count": 1}, "$set": {"last": now.isoformat()}}, upsert=True)
        raise HTTPException(401, "Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    set_auth_cookies(response, str(user["_id"]), email)
    return {"id": str(user["_id"]), "email": email, "name": user.get("name", ""), "role": user.get("role", "")}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    response.delete_cookie("refresh_token", path="/", secure=True, samesite="none")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid token type")
    set_auth_cookies(response, payload["sub"], payload.get("email", ""))
    return {"ok": True}


# ---------- Contact ----------
async def notify_owner(message_id: str, doc: dict):
    recipient = os.environ.get("CONTACT_NOTIFY_EMAIL", "").strip()
    if not recipient:
        await db.messages.update_one({"_id": ObjectId(message_id)}, {"$set": {"email_status": "skipped"}})
        return
    try:
        await send_email(to=recipient, subject=f"Nouveau message — {doc['name']}", html=contact_notification_html(doc))
        status = "sent"
    except Exception as e:
        logger.error(f"Contact notification failed: {e}")
        status = "failed"
    await db.messages.update_one({"_id": ObjectId(message_id)}, {"$set": {"email_status": status}})


@api.post("/contact", status_code=201)
async def create_contact(body: ContactIn, request: Request, background: BackgroundTasks):
    ip = client_ip(request)
    since = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    if await db.messages.count_documents({"ip": ip, "created_at": {"$gte": since}}) >= 5:
        raise HTTPException(429, "Too many messages. Please try again later.")
    msg = Message(**body.model_dump())
    doc = msg.to_mongo()
    doc["ip"] = ip
    res = await db.messages.insert_one(doc)
    background.add_task(notify_owner, str(res.inserted_id), doc)
    return {"ok": True, "id": str(res.inserted_id)}


@api.get("/admin/messages", response_model=List[Message], response_model_by_alias=False)
async def list_messages(_: dict = Depends(require_admin)):
    docs = await db.messages.find({}).sort("created_at", -1).to_list(1000)
    return [Message.from_mongo(d) for d in docs]


@api.patch("/admin/messages/{message_id}", response_model=Message, response_model_by_alias=False)
async def patch_message(message_id: str, body: MessagePatch, _: dict = Depends(require_admin)):
    if not ObjectId.is_valid(message_id):
        raise HTTPException(404, "Not found")
    doc = await db.messages.find_one_and_update({"_id": ObjectId(message_id)}, {"$set": {"read": body.read}},
                                                return_document=True)
    if not doc:
        raise HTTPException(404, "Not found")
    return Message.from_mongo(doc)


@api.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str, _: dict = Depends(require_admin)):
    if not ObjectId.is_valid(message_id):
        raise HTTPException(404, "Not found")
    res = await db.messages.delete_one({"_id": ObjectId(message_id)})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api.get("/")
async def root():
    return {"message": "Outsiders Production API"}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.messages.create_index("created_at")
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(os.environ["ADMIN_PASSWORD"]),
                                   "name": "Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
