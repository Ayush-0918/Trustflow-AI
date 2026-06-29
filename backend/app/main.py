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
    cors_allowed_origins=settings.CORS_ORIGINS,
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
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
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
    token = (auth or {}).get("token")
    if not token:
        return False
    await sio.save_session(sid, {"token": token})


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
    project_id = data.get("project_id")
    message = data.get("message", {})
    if project_id and message:
        session = await sio.get_session(sid)
        import datetime
        payload = {
            **message,
            "sender_token": session.get("token"),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        await sio.emit("new_message", payload, room=f"project_{project_id}", skip_sid=sid)


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


combined_app = socketio.ASGIApp(sio, app)
