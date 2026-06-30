from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio
import logging

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine
from app.models import Base
from app.middleware.logging import LoggingMiddleware, SecurityHeadersMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trustflow")

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("TrustFlow AI v2 started")
    yield
    logger.info("TrustFlow AI shutting down")


app = FastAPI(
    title="TrustFlow AI",
    description="Intelligent freelancer marketplace with AI-powered trust",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Serve static files from the old frontend (root directory)
app.mount("/", StaticFiles(directory="../", html=True), name="static")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@sio.event
async def connect(sid, environ, auth):
    """
    FIX: actually decodes the JWT and rejects invalid/expired tokens.
    Previously accepted ANY truthy string as a valid token.
    """
    token = (auth or {}).get("token")
    if not token:
        return False
    try:
        from app.core.security import decode_token
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return False
        await sio.save_session(sid, {"token": token, "user_id": int(user_id)})
        return True
    except Exception:
        logger.warning(f"Socket connection rejected for {sid}: invalid token")
        return False


@sio.event
async def disconnect(sid):
    logger.info(f"Socket disconnected: {sid}")


@sio.event
async def join_project(sid, data):
    project_id = data.get("project_id")
    if project_id:
        await sio.enter_room(sid, f"project_{project_id}")
        await sio.emit("joined", {"project_id": project_id}, to=sid)


@sio.event
async def leave_project(sid, data):
    project_id = data.get("project_id")
    if project_id:
        await sio.leave_room(sid, f"project_{project_id}")


@sio.event
async def send_message(sid, data):
    """
    FIX 1: Frontend sends message.text (not message.content) — field name corrected.
    FIX 2: Saves to DB so chat history persists across refreshes.
    FIX 3: skip_sid=sid so sender doesn't see their own message twice
            (frontend already adds it optimistically to local state).
    """
    project_id = data.get("project_id")
    message = data.get("message", {})
    # Frontend (ProjectChat.tsx) sends { message: { text: "..." } } — field is "text"
    text = (message.get("text") or "").strip()

    if not project_id or not text:
        await sio.emit("error", {"detail": "project_id and message.text are required"}, to=sid)
        return

    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if not user_id:
        await sio.emit("error", {"detail": "Not authenticated"}, to=sid)
        return

    try:
        from app.db.session import AsyncSessionLocal
        from app.models import Message
        import datetime

        async with AsyncSessionLocal() as db:
            msg = Message(
                project_id=project_id,
                sender_id=user_id,
                content=text,
                message_type="text",
            )
            db.add(msg)
            await db.commit()
            await db.refresh(msg)

            payload = {
                "id": msg.id,
                "text": text,
                "sender_token": session.get("token"),
                "timestamp": msg.created_at.isoformat() if msg.created_at else datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }
            # skip_sid=sid: sender already has the message optimistically in UI
            await sio.emit("new_message", payload, room=f"project_{project_id}", skip_sid=sid)

    except Exception as e:
        logger.error(f"Failed to persist socket message from user {user_id}: {e}")
        await sio.emit("error", {"detail": "Failed to send message — please retry."}, to=sid)


@sio.event
async def typing(sid, data):
    project_id = data.get("project_id")
    if project_id:
        session = await sio.get_session(sid)
        await sio.emit(
            "user_typing",
            {"token": session.get("token"), "is_typing": data.get("is_typing", True)},
            room=f"project_{project_id}",
            skip_sid=sid,
        )


# CRITICAL FIX: combined_app was previously created but never used as the entry point.
# README documents `uvicorn app.main:app` which loaded the bare FastAPI app —
# meaning Socket.IO was silently never mounted, and the entire chat feature was dead.
# Rebinding `app` itself to the Socket.IO-wrapped ASGI app fixes this without
# requiring any change to the run command, Procfile, or deployment config.
app = socketio.ASGIApp(sio, other_asgi_app=app)
