from pathlib import Path
from typing import Any, Dict, Optional

from flask import Flask, abort, jsonify, request, send_from_directory

try:
    from .db import (
        add_message,
        authenticate_user,
        compute_trust_prediction,
        compute_wallet_summary,
        create_project,
        create_session,
        create_user,
        evaluate_skill_test,
        generate_project_plan,
        get_dashboard_summary,
        get_latest_project_id,
        get_project_room,
        get_skill_challenge,
        get_user_by_token,
        get_video_session,
        initialize_database,
        store_video_scan,
    )
except ImportError:
    from db import (
        add_message,
        authenticate_user,
        compute_trust_prediction,
        compute_wallet_summary,
        create_project,
        create_session,
        create_user,
        evaluate_skill_test,
        generate_project_plan,
        get_dashboard_summary,
        get_latest_project_id,
        get_project_room,
        get_skill_challenge,
        get_user_by_token,
        get_video_session,
        initialize_database,
        store_video_scan,
    )


PROJECT_ROOT = Path(__file__).resolve().parent.parent
ALLOWED_STATIC_SUFFIXES = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".json"}

app = Flask(__name__, static_folder=None)
initialize_database()


def ok(payload: Dict[str, Any], status_code: int = 200):
    return jsonify({"status": "success", **payload}), status_code


def fail(message: str, status_code: int = 400):
    return jsonify({"status": "error", "message": message}), status_code


def require_json() -> Optional[Dict[str, Any]]:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None
    return data


def bearer_token() -> Optional[str]:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None


def current_user() -> Optional[Dict[str, Any]]:
    token = bearer_token()
    if not token:
        return None
    return get_user_by_token(token)


def send_frontend_file(relative_path: str):
    safe_path = (PROJECT_ROOT / relative_path).resolve()
    if not str(safe_path).startswith(str(PROJECT_ROOT)):
        abort(404)
    if not safe_path.exists() or not safe_path.is_file():
        abort(404)
    if safe_path.suffix not in ALLOWED_STATIC_SUFFIXES:
        abort(404)
    return send_from_directory(PROJECT_ROOT, relative_path)


@app.get("/api/health")
def health():
    return ok({"service": "TrustFlow AI API", "statusText": "running"})


@app.post("/api/auth/signup")
def signup():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")

    first_name = (data.get("firstName") or "").strip()
    last_name = (data.get("lastName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirmPassword") or ""
    role = (data.get("role") or "freelancer").strip().lower()

    if not first_name or not last_name:
        return fail("First name and last name are required.")
    if not email or not password:
        return fail("Email and password are required.")
    if password != confirm_password:
        return fail("Passwords do not match.")

    user = create_user(
        name=f"{first_name} {last_name}".strip(),
        email=email,
        password=password,
        phone=data.get("phone", ""),
        role=role,
    )
    if not user:
        return fail("A user with this email already exists.", 409)

    token = create_session(user["id"])
    return ok({"token": token, "user": user}, 201)


@app.post("/api/auth/login")
def login():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return fail("Email and password are required.")

    user = authenticate_user(email, password)
    if not user:
        return fail("Invalid credentials.", 401)

    token = create_session(user["id"])
    return ok({"token": token, "user": user})


@app.get("/api/auth/me")
def me():
    user = current_user()
    if not user:
        return fail("Unauthorized.", 401)
    return ok({"user": user})


@app.get("/api/dashboard/summary")
def dashboard_summary():
    return ok(get_dashboard_summary())


@app.post("/api/projects/plan")
def project_plan():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")
    return ok(generate_project_plan(data))


@app.post("/api/projects")
def projects_create():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")

    if not (data.get("title") and data.get("description")):
        return fail("Project title and description are required.")

    user = current_user()
    result = create_project(data, client_user=user)
    return ok(result, 201)


@app.get("/api/projects/current")
def current_project():
    project_id = get_latest_project_id()
    room = get_project_room(project_id)
    if not room:
        return fail("No project found.", 404)
    return ok({"projectId": project_id, "project": room})


@app.get("/api/projects/<project_id>")
def project_detail(project_id: str):
    room = get_project_room(project_id)
    if not room:
        return fail("Project not found.", 404)
    return ok({"project": room})


@app.route("/api/projects/<project_id>/messages", methods=["GET", "POST"])
def project_messages(project_id: str):
    room = get_project_room(project_id)
    if not room:
        return fail("Project not found.", 404)

    if request.method == "GET":
        return ok({"messages": room["messages"]})

    data = require_json()
    if not data:
        return fail("No JSON payload provided.")

    sender_name = (data.get("senderName") or "TrustFlow User").strip()
    sender_role = (data.get("senderRole") or "Member").strip()
    body = (data.get("message") or "").strip()
    if not body:
        return fail("Message body is required.")

    message = add_message(project_id, sender_name, sender_role, body)
    return ok({"message": message}, 201)


@app.get("/api/video/session")
def video_session():
    project_id = request.args.get("projectId") or get_latest_project_id()
    return ok({"session": get_video_session(project_id)})


@app.post("/api/video/analyze")
def video_analyze():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")
    scenario = (data.get("scenario") or "suspicious").strip().lower()
    project_id = data.get("projectId") or get_latest_project_id()
    scan = store_video_scan(project_id, scenario)
    wallet = compute_wallet_summary(project_id)
    return ok({"scan": scan, "wallet": wallet})


@app.get("/api/skills/challenge")
def skills_challenge():
    challenge_type = (request.args.get("type") or "development").strip().lower()
    return ok({"challenge": get_skill_challenge(challenge_type)})


@app.post("/api/skills/evaluate")
def skills_evaluate():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")
    challenge_type = (data.get("challengeType") or "development").strip().lower()
    answers = data.get("answers") or []
    if not isinstance(answers, list):
        return fail("Answers must be an array.")

    user = current_user()
    project_id = data.get("projectId") or get_latest_project_id()
    result = evaluate_skill_test(
        challenge_type=challenge_type,
        answers=[int(value) for value in answers],
        project_id=project_id,
        user_id=user["id"] if user else None,
    )
    wallet = compute_wallet_summary(project_id)
    return ok({"result": result, "wallet": wallet})


@app.get("/api/wallet/summary")
def wallet_summary():
    project_id = request.args.get("projectId") or get_latest_project_id()
    return ok(compute_wallet_summary(project_id))


@app.get("/api/trust/prediction")
def trust_prediction():
    project_id = request.args.get("projectId") or get_latest_project_id()
    return ok(compute_trust_prediction(project_id))


# Compatibility endpoints for earlier demo JS.
@app.post("/signup")
def signup_compat():
    return signup()


@app.post("/login")
def login_compat():
    return login()


@app.post("/create-project")
def create_project_compat():
    return projects_create()


@app.post("/send-message")
def send_message_compat():
    data = require_json()
    if not data:
        return fail("No JSON payload provided.")
    project_id = data.get("projectId") or get_latest_project_id()
    if not project_id:
        return fail("Project not found.", 404)
    message = add_message(
        project_id,
        data.get("senderName") or "TrustFlow User",
        data.get("senderRole") or "Member",
        data.get("message") or "",
    )
    return ok({"message": message}, 201)


@app.post("/verify-face")
def verify_face_compat():
    data = require_json() or {}
    scenario = (data.get("scenario") or "healthy").strip().lower()
    project_id = data.get("projectId") or get_latest_project_id()
    scan = store_video_scan(project_id, scenario)
    return ok({"verified": scan["risk_tone"] == "success", "scan": scan})


@app.get("/")
def index():
    return send_frontend_file("index.html")


@app.get("/<path:requested_path>")
def frontend(requested_path: str):
    if requested_path.startswith("api/"):
        abort(404)
    if requested_path == "backend/app.py":
        abort(404)
    if requested_path == "":
        return send_frontend_file("index.html")
    return send_frontend_file(requested_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
