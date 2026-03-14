import json
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "trustflow_demo.sqlite3"
PASSWORD_HASH_METHOD = "pbkdf2:sha256:600000"


def utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def dict_from_row(row: Optional[sqlite3.Row]) -> Optional[Dict[str, Any]]:
    if row is None:
        return None
    return dict(row)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    return generate_password_hash(password, method=PASSWORD_HASH_METHOD)


def parse_budget(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = str(value).replace("$", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


PROJECT_BLUEPRINTS = {
    "product design + frontend": [
        ("Discovery and design system", "Designer", 0.21, "Week 1", "Scope, IA, wireframes, and acceptance criteria"),
        ("Frontend implementation", "Frontend", 0.34, "Week 3", "Responsive dashboard screens and loading states"),
        ("Backend and workflow automation", "Full-stack", 0.28, "Week 4", "API integration, data hooks, and approvals"),
        ("QA, proof review, and release", "Shared", 0.17, "Week 5", "Demo walkthrough, proof mapping, and release gate"),
    ],
    "full-stack application": [
        ("Requirements and system design", "Product", 0.20, "Week 1", "Architecture, data flows, and delivery plan"),
        ("Core backend services", "Backend", 0.30, "Week 2", "APIs, auth, and workflow automation"),
        ("Frontend delivery", "Frontend", 0.30, "Week 4", "User interfaces and operational states"),
        ("Testing, deployment, and handover", "Shared", 0.20, "Week 5", "Validation, deployment, and project release"),
    ],
    "brand and marketing site": [
        ("Messaging and visual direction", "Strategy", 0.18, "Week 1", "Narrative, hierarchy, and design tone"),
        ("Design system and landing pages", "Designer", 0.32, "Week 2", "High-fidelity UI and responsive layouts"),
        ("Build and CMS wiring", "Frontend", 0.30, "Week 3", "Production implementation and content integration"),
        ("QA and publish", "Shared", 0.20, "Week 4", "Review, polish, and publish approval"),
    ],
}


SKILL_CHALLENGES = {
    "development": {
        "label": "Frontend development",
        "badgeLabel": "Verified Frontend Skill",
        "pfiBoost": 8,
        "questions": [
            {
                "prompt": "A shared button component update breaks spacing across multiple screens. What is the best first move?",
                "options": [
                    "Hotfix each screen individually so the UI looks correct again.",
                    "Inspect the shared component API and trace where the spacing contract changed.",
                    "Rollback the whole project without checking the exact regression source.",
                ],
                "correct": 1,
            },
            {
                "prompt": "A trust dashboard milestone requires responsive delivery. What matters most for acceptance?",
                "options": [
                    "Pixel-perfect desktop only.",
                    "Correct data states, mobile responsiveness, and clearly testable interactions.",
                    "Lots of animations even if loading states are unclear.",
                ],
                "correct": 1,
            },
            {
                "prompt": "Which proof best supports automated quality assurance for a frontend milestone?",
                "options": [
                    "A message saying the task is done.",
                    "A screenshot without interaction proof.",
                    "A walkthrough plus QA evidence mapped to acceptance criteria.",
                ],
                "correct": 2,
            },
        ],
    },
    "design": {
        "label": "UI and product design",
        "badgeLabel": "Verified UI Skill",
        "pfiBoost": 7,
        "questions": [
            {
                "prompt": "A payment approval flow feels low trust. What should improve first?",
                "options": [
                    "Add more gradients before clarifying state labels.",
                    "Strengthen hierarchy around amount, milestone status, and approval action.",
                    "Hide verification details so the screen looks cleaner.",
                ],
                "correct": 1,
            },
            {
                "prompt": "Which design artifact helps an employer approve a milestone faster?",
                "options": [
                    "Annotated screens showing what changed and how it maps to scope.",
                    "Only a moodboard.",
                    "A color palette without context.",
                ],
                "correct": 0,
            },
            {
                "prompt": "What is the strongest signal of a production-ready design system?",
                "options": [
                    "Consistent spacing, states, components, and responsive behavior.",
                    "A single beautiful hero screen.",
                    "Unique button shapes on every page.",
                ],
                "correct": 0,
            },
        ],
    },
    "strategy": {
        "label": "Product strategy",
        "badgeLabel": "Verified Strategy Skill",
        "pfiBoost": 6,
        "questions": [
            {
                "prompt": "What is the best way to reduce ambiguity in a freelance product scope?",
                "options": [
                    "Keep milestones broad and flexible.",
                    "Define outcomes, owners, proof, deadlines, and release rules per milestone.",
                    "Let approval criteria be decided after delivery.",
                ],
                "correct": 1,
            },
            {
                "prompt": "Which signal best predicts project delivery risk?",
                "options": [
                    "No written acceptance criteria and no milestone proof path.",
                    "A detailed roadmap with clear review checkpoints.",
                    "Early alignment on deliverables.",
                ],
                "correct": 0,
            },
            {
                "prompt": "What should an autonomous AI intermediary do after partial milestone completion?",
                "options": [
                    "Release full payment immediately.",
                    "Trigger feedback or a pro-rated release based on verified value.",
                    "Cancel the whole project by default.",
                ],
                "correct": 1,
            },
        ],
    },
}


VIDEO_SCENARIOS = {
    "suspicious": {
        "participant_name": "Karan Mehta",
        "participant_role": "Freelancer",
        "risk_label": "Elevated",
        "risk_tone": "danger",
        "voice_stress": 71,
        "facial_consistency": 54,
        "confidence_level": 46,
        "commitment_signal": 41,
        "pattern_score": 3,
        "escrow_action": "Hold",
        "summary": "System detected hesitation around timeline commitment and delivery confidence.",
        "warning_title": "AI detected uncertainty in project commitment.",
        "warning_message": "Recommendation: keep escrow locked and request a milestone-level reaffirmation before the next release.",
        "highlights": [
            {
                "title": "Commitment hesitation",
                "body": "Delay increased when the caller was asked if the Friday deadline was realistic.",
            },
            {
                "title": "Facial mismatch",
                "body": "Expression confidence dropped while verbally affirming milestone ownership.",
            },
            {
                "title": "Stress cue",
                "body": "Voice tension rose when payment release terms were repeated.",
            },
        ],
    },
    "healthy": {
        "participant_name": "Arjun Dev",
        "participant_role": "Freelancer",
        "risk_label": "Low",
        "risk_tone": "success",
        "voice_stress": 24,
        "facial_consistency": 91,
        "confidence_level": 89,
        "commitment_signal": 92,
        "pattern_score": 0,
        "escrow_action": "Proceed",
        "summary": "Signals look stable and the caller appears confident about ownership, scope, and delivery.",
        "warning_title": "AI confirms stable project commitment.",
        "warning_message": "Recommendation: proceed with milestone approval and keep the wallet on normal release settings.",
        "highlights": [
            {
                "title": "Clear ownership",
                "body": "The caller answered timeline and deliverable questions without contradiction.",
            },
            {
                "title": "Facial confidence",
                "body": "Expression and language stayed aligned while discussing milestone proof.",
            },
            {
                "title": "Low stress",
                "body": "Voice remained steady even when escrow rules and revision limits were repeated.",
            },
        ],
    },
    "warning": {
        "participant_name": "Arjun Dev",
        "participant_role": "Freelancer",
        "risk_label": "Watchlist",
        "risk_tone": "warning",
        "voice_stress": 48,
        "facial_consistency": 68,
        "confidence_level": 63,
        "commitment_signal": 59,
        "pattern_score": 1,
        "escrow_action": "Review",
        "summary": "Signals are mixed. The caller appears mostly aligned, but commitment confidence still needs a follow-up check.",
        "warning_title": "AI detected mild delivery uncertainty.",
        "warning_message": "Recommendation: request a proof update and keep the next release partially protected until commitment stabilizes.",
        "highlights": [
            {
                "title": "Minor hesitation",
                "body": "Response timing slowed slightly when deployment timing and revision scope were discussed.",
            },
            {
                "title": "Partial confidence mismatch",
                "body": "Facial confidence softened during one answer about final delivery sequencing.",
            },
            {
                "title": "Escrow caution",
                "body": "Signals are not severe enough for a full block, but they justify an extra review checkpoint.",
            },
        ],
    },
}


def initialize_database() -> None:
    conn = get_connection()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            phone TEXT,
            role TEXT NOT NULL,
            trust_score INTEGER NOT NULL DEFAULT 80,
            projects_completed INTEGER NOT NULL DEFAULT 0,
            reliability_index INTEGER NOT NULL DEFAULT 80,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            client_name TEXT NOT NULL,
            client_id TEXT,
            freelancer_id TEXT,
            budget REAL NOT NULL,
            deadline TEXT,
            category TEXT,
            review_style TEXT,
            risk_level TEXT,
            status TEXT NOT NULL,
            progress INTEGER NOT NULL DEFAULT 0,
            next_release REAL NOT NULL DEFAULT 0,
            status_label TEXT NOT NULL DEFAULT 'On Track',
            status_tone TEXT NOT NULL DEFAULT 'success',
            room_confidence INTEGER NOT NULL DEFAULT 80,
            assets_shared INTEGER NOT NULL DEFAULT 0,
            approvals_pending INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            owner TEXT NOT NULL,
            amount REAL NOT NULL,
            timing TEXT,
            status TEXT NOT NULL,
            progress INTEGER NOT NULL DEFAULT 0,
            deliverable TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            sender_role TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            kind TEXT NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS project_events (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            detail TEXT NOT NULL,
            tone TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS video_scans (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            participant_name TEXT NOT NULL,
            participant_role TEXT NOT NULL,
            scenario TEXT NOT NULL,
            risk_label TEXT NOT NULL,
            risk_tone TEXT NOT NULL,
            voice_stress INTEGER NOT NULL,
            facial_consistency INTEGER NOT NULL,
            confidence_level INTEGER NOT NULL,
            commitment_signal INTEGER NOT NULL,
            pattern_score INTEGER NOT NULL,
            escrow_action TEXT NOT NULL,
            summary TEXT NOT NULL,
            warning_title TEXT NOT NULL,
            warning_message TEXT NOT NULL,
            highlights_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS skill_tests (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            user_id TEXT,
            challenge_type TEXT NOT NULL,
            label TEXT NOT NULL,
            score INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            passed INTEGER NOT NULL,
            badge_label TEXT NOT NULL,
            pfi_boost INTEGER NOT NULL,
            summary TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """
    )
    conn.commit()
    conn.close()
    seed_demo_data()


def seed_demo_data() -> None:
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
    if count:
        conn.close()
        return

    employer_id = str(uuid.uuid4())
    freelancer_id = str(uuid.uuid4())
    now = utc_now()

    conn.execute(
        """
        INSERT INTO users (id, name, email, password_hash, phone, role, trust_score, projects_completed, reliability_index, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            employer_id,
            "Jane Smith",
            "jane@trustflow.demo",
            hash_password("demo1234"),
            "+91-9000000001",
            "employer",
            92,
            14,
            90,
            now,
        ),
    )
    conn.execute(
        """
        INSERT INTO users (id, name, email, password_hash, phone, role, trust_score, projects_completed, reliability_index, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            freelancer_id,
            "Arjun Dev",
            "arjun@trustflow.demo",
            hash_password("demo1234"),
            "+91-9000000002",
            "freelancer",
            94,
            36,
            92,
            now,
        ),
    )

    helio_id = create_project_record(
        conn,
        {
            "title": "Helio Metrics Dashboard",
            "description": "A premium analytics and trust operations dashboard for a SaaS client.",
            "client_name": "Helio Metrics",
            "client_id": employer_id,
            "freelancer_id": freelancer_id,
            "budget": 8500,
            "deadline": "2026-03-28",
            "category": "Product design + frontend",
            "review_style": "Client sign-off + AI verification",
            "risk_level": "Balanced",
            "status": "active",
            "progress": 58,
            "next_release": 2800,
            "status_label": "In Review",
            "status_tone": "warning",
            "room_confidence": 88,
            "assets_shared": 16,
            "approvals_pending": 1,
        },
        milestones=[
            {"title": "Discovery and design system", "owner": "Designer", "amount": 1800, "timing": "Week 1", "status": "released", "progress": 100, "deliverable": "Scope, IA, wireframes, and acceptance criteria"},
            {"title": "Frontend implementation", "owner": "Frontend", "amount": 2900, "timing": "Week 3", "status": "in_review", "progress": 82, "deliverable": "Responsive dashboard screens and loading states"},
            {"title": "Backend and workflow automation", "owner": "Full-stack", "amount": 2400, "timing": "Week 4", "status": "planned", "progress": 18, "deliverable": "API integration, data hooks, and approvals"},
            {"title": "QA, proof review, and release", "owner": "Shared", "amount": 1400, "timing": "Week 5", "status": "planned", "progress": 0, "deliverable": "Demo walkthrough, proof mapping, and release gate"},
        ],
    )

    create_project_record(
        conn,
        {
            "title": "E-commerce Platform Build",
            "description": "Checkout and customer purchase flow for a retail commerce platform.",
            "client_name": "Northstar Retail",
            "client_id": employer_id,
            "freelancer_id": freelancer_id,
            "budget": 13200,
            "deadline": "2026-03-31",
            "category": "Full-stack application",
            "review_style": "Client sign-off + AI verification",
            "risk_level": "Conservative",
            "status": "active",
            "progress": 76,
            "next_release": 4200,
            "status_label": "On Track",
            "status_tone": "success",
            "room_confidence": 91,
            "assets_shared": 12,
            "approvals_pending": 0,
        },
        milestones=[
            {"title": "Checkout architecture", "owner": "Backend", "amount": 2600, "timing": "Week 1", "status": "released", "progress": 100, "deliverable": "Payment flow design and data contract"},
            {"title": "Cart and checkout delivery", "owner": "Full-stack", "amount": 4200, "timing": "Week 3", "status": "in_review", "progress": 76, "deliverable": "Checkout UI, backend validation, and proof review"},
            {"title": "Post-purchase operations", "owner": "Backend", "amount": 3400, "timing": "Week 4", "status": "planned", "progress": 22, "deliverable": "Order state and operational notifications"},
            {"title": "QA and production release", "owner": "Shared", "amount": 3000, "timing": "Week 5", "status": "planned", "progress": 0, "deliverable": "Regression testing and release sign-off"},
        ],
    )

    create_project_record(
        conn,
        {
            "title": "Mobile App Redesign",
            "description": "Fitness product redesign with component consistency and delivery proof.",
            "client_name": "PulseFit",
            "client_id": employer_id,
            "freelancer_id": freelancer_id,
            "budget": 2800,
            "deadline": "2026-03-24",
            "category": "Product design + frontend",
            "review_style": "Manual sign-off only",
            "risk_level": "Fast-moving",
            "status": "active",
            "progress": 39,
            "next_release": 1650,
            "status_label": "Needs Attention",
            "status_tone": "danger",
            "room_confidence": 63,
            "assets_shared": 5,
            "approvals_pending": 1,
        },
        milestones=[
            {"title": "Visual exploration", "owner": "Designer", "amount": 650, "timing": "Week 1", "status": "released", "progress": 100, "deliverable": "Moodboard and component direction"},
            {"title": "Primary screen redesign", "owner": "Designer", "amount": 1650, "timing": "Week 2", "status": "blocked", "progress": 39, "deliverable": "Main app screens and system consistency"},
            {"title": "Revision and handoff", "owner": "Shared", "amount": 500, "timing": "Week 3", "status": "planned", "progress": 0, "deliverable": "Revisions, approval, and final export"},
        ],
    )

    add_message_record(conn, helio_id, "Jane Smith", "Employer", "The dashboard polish looks excellent. I just want confirmation on export behavior before approving release.")
    add_message_record(conn, helio_id, "Arjun Dev", "Freelancer", "I've uploaded the walkthrough and edge-case test proof. Export now handles large data sets without truncation.")

    add_asset_record(conn, helio_id, "Dashboard walkthrough.mp4", "Video", "8 minute product demo with voiceover")
    add_asset_record(conn, helio_id, "UI kit.fig", "Design", "Component library and responsive states")
    add_asset_record(conn, helio_id, "Test proof.pdf", "Proof", "Acceptance criteria mapped to QA evidence")

    add_project_event_record(conn, helio_id, "Milestone two proof uploaded", "Walkthrough and QA evidence attached to the room.", "neutral")
    add_project_event_record(conn, helio_id, "AI verification started", "Design and acceptance criteria scan in progress.", "warning")
    add_project_event_record(conn, helio_id, "Escrow locked for milestone three", "Release path prepared for the next approval cycle.", "success")

    conn.commit()
    conn.close()


def create_project_record(conn: sqlite3.Connection, payload: Dict[str, Any], milestones: List[Dict[str, Any]]) -> str:
    project_id = str(uuid.uuid4())
    conn.execute(
        """
        INSERT INTO projects (
            id, title, description, client_name, client_id, freelancer_id, budget, deadline, category,
            review_style, risk_level, status, progress, next_release, status_label, status_tone,
            room_confidence, assets_shared, approvals_pending, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            project_id,
            payload["title"],
            payload["description"],
            payload["client_name"],
            payload.get("client_id"),
            payload.get("freelancer_id"),
            payload["budget"],
            payload.get("deadline"),
            payload.get("category"),
            payload.get("review_style"),
            payload.get("risk_level"),
            payload["status"],
            payload["progress"],
            payload["next_release"],
            payload["status_label"],
            payload["status_tone"],
            payload["room_confidence"],
            payload["assets_shared"],
            payload["approvals_pending"],
            utc_now(),
        ),
    )

    for milestone in milestones:
        conn.execute(
            """
            INSERT INTO milestones (id, project_id, title, owner, amount, timing, status, progress, deliverable, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid.uuid4()),
                project_id,
                milestone["title"],
                milestone["owner"],
                milestone["amount"],
                milestone.get("timing"),
                milestone["status"],
                milestone.get("progress", 0),
                milestone.get("deliverable", ""),
                utc_now(),
            ),
        )

    return project_id


def add_message_record(conn: sqlite3.Connection, project_id: str, sender_name: str, sender_role: str, body: str) -> str:
    message_id = str(uuid.uuid4())
    conn.execute(
        """
        INSERT INTO messages (id, project_id, sender_name, sender_role, body, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (message_id, project_id, sender_name, sender_role, body, utc_now()),
    )
    return message_id


def add_asset_record(conn: sqlite3.Connection, project_id: str, name: str, kind: str, description: str) -> None:
    conn.execute(
        """
        INSERT INTO assets (id, project_id, name, kind, description)
        VALUES (?, ?, ?, ?, ?)
        """,
        (str(uuid.uuid4()), project_id, name, kind, description),
    )


def add_project_event_record(conn: sqlite3.Connection, project_id: str, title: str, detail: str, tone: str) -> None:
    conn.execute(
        """
        INSERT INTO project_events (id, project_id, title, detail, tone, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (str(uuid.uuid4()), project_id, title, detail, tone, utc_now()),
    )


def create_user(name: str, email: str, password: str, phone: str = "", role: str = "freelancer") -> Optional[Dict[str, Any]]:
    conn = get_connection()
    user_id = str(uuid.uuid4())
    now = utc_now()
    base_trust = 88 if role == "employer" else 80
    base_completed = 6 if role == "employer" else 0
    base_reliability = 89 if role == "employer" else 78
    try:
        conn.execute(
            """
            INSERT INTO users (id, name, email, password_hash, phone, role, trust_score, projects_completed, reliability_index, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                name,
                email.lower().strip(),
                hash_password(password),
                phone,
                role,
                base_trust,
                base_completed,
                base_reliability,
                now,
            ),
        )
        conn.commit()
        user = dict_from_row(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
        conn.close()
        return sanitize_user(user)
    except sqlite3.IntegrityError:
        conn.close()
        return None


def sanitize_user(user: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not user:
        return None
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "role": user["role"],
        "trustScore": user["trust_score"],
        "projectsCompleted": user["projects_completed"],
        "reliabilityIndex": user["reliability_index"],
    }


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    user = dict_from_row(conn.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone())
    conn.close()
    if not user:
        return None
    if not check_password_hash(user["password_hash"], password):
        return None
    return sanitize_user(user)


def create_session(user_id: str) -> str:
    conn = get_connection()
    token = str(uuid.uuid4())
    conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, utc_now()))
    conn.commit()
    conn.close()
    return token


def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute(
        """
        SELECT users.* FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE sessions.token = ?
        """,
        (token,),
    ).fetchone()
    conn.close()
    return sanitize_user(dict_from_row(row))


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    conn.close()
    return sanitize_user(dict_from_row(row))


def get_default_freelancer() -> Dict[str, Any]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE role = 'freelancer' ORDER BY created_at LIMIT 1").fetchone()
    conn.close()
    return sanitize_user(dict_from_row(row))


def generate_project_plan(payload: Dict[str, Any]) -> Dict[str, Any]:
    category = (payload.get("category") or "Product design + frontend").strip().lower()
    key = category if category in PROJECT_BLUEPRINTS else "product design + frontend"
    budget = parse_budget(payload.get("budget") or 8500)
    blueprint = PROJECT_BLUEPRINTS[key]

    milestones = []
    allocated = 0.0
    for index, (title, owner, ratio, timing, deliverable) in enumerate(blueprint):
        amount = round(budget * ratio, 2)
        if index == len(blueprint) - 1:
            amount = round(budget - allocated, 2)
        allocated += amount
        milestones.append(
            {
                "title": title,
                "owner": owner,
                "amount": amount,
                "timing": timing,
                "status": "planned",
                "progress": 0,
                "deliverable": deliverable,
            }
        )

    funding_preview = {
        "initialDeposit": round(budget * 0.38, 2),
        "midProjectLocked": round(budget * 0.40, 2),
        "finalReserve": round(budget - (round(budget * 0.38, 2) + round(budget * 0.40, 2)), 2),
    }

    recommendations = [
        "Add milestone-level acceptance criteria so automated quality assurance has a clean definition of done.",
        "Reserve the final payout until walkthrough proof and deployment evidence are attached.",
        "Trigger video verification before the first micro-payout is released.",
        "Map revision thresholds so partial completion can lead to pro-rated releases instead of disputes.",
    ]

    return {
        "budget": budget,
        "milestones": milestones,
        "recommendations": recommendations,
        "fundingPreview": funding_preview,
    }


def create_project(payload: Dict[str, Any], client_user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    plan = generate_project_plan(payload)
    budget = parse_budget(payload.get("budget") or 8500)
    freelancer = get_default_freelancer()
    client_name = payload.get("clientName") or (client_user["name"] if client_user else "Employer Team")

    progress = 12
    next_release = round(plan["milestones"][0]["amount"], 2)
    conn = get_connection()
    project_id = create_project_record(
        conn,
        {
            "title": payload.get("title") or "Untitled TrustFlow Project",
            "description": payload.get("description") or "Generated through TrustFlow AI planner.",
            "client_name": client_name,
            "client_id": client_user["id"] if client_user else None,
            "freelancer_id": freelancer["id"] if freelancer else None,
            "budget": budget,
            "deadline": payload.get("deadline"),
            "category": payload.get("category", "Product design + frontend"),
            "review_style": payload.get("reviewStyle", "Client sign-off + AI verification"),
            "risk_level": payload.get("riskLevel", "Balanced"),
            "status": "active",
            "progress": progress,
            "next_release": next_release,
            "status_label": "Planned",
            "status_tone": "warning",
            "room_confidence": 84,
            "assets_shared": 3,
            "approvals_pending": 0,
        },
        milestones=plan["milestones"],
    )

    add_message_record(conn, project_id, client_name, "Employer", "Project created. TrustFlow AI has generated the first milestone plan.")
    if freelancer:
        add_message_record(conn, project_id, freelancer["name"], "Freelancer", "I have reviewed the generated roadmap and I am ready to confirm the first milestone.")

    add_asset_record(conn, project_id, "Scope brief.txt", "Brief", "Original project brief submitted by the client")
    add_asset_record(conn, project_id, "Milestone roadmap.json", "Plan", "AI generated milestone breakdown and payout structure")
    add_asset_record(conn, project_id, "Trust checklist.pdf", "Proof", "Definition of done and review checklist")

    add_project_event_record(conn, project_id, "Project created", "AI requirement analysis generated a milestone roadmap and payout structure.", "success")
    add_project_event_record(conn, project_id, "Escrow staged", "Initial deposit is ready to move into protected trust wallet flow.", "warning")
    conn.commit()
    conn.close()

    return {
        "projectId": project_id,
        "plan": plan,
        "project": get_project_room(project_id),
    }


def get_latest_project_id() -> Optional[str]:
    conn = get_connection()
    row = conn.execute("SELECT id FROM projects ORDER BY created_at DESC LIMIT 1").fetchone()
    conn.close()
    return row["id"] if row else None


def list_live_projects() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT id, title, client_name, progress, next_release, status_label, status_tone, description
        FROM projects
        ORDER BY created_at DESC
        LIMIT 6
        """
    ).fetchall()
    conn.close()
    projects = []
    for row in rows:
        subtitle = row["description"].split(".")[0]
        projects.append(
            {
                "id": row["id"],
                "title": row["title"],
                "clientName": row["client_name"],
                "progress": row["progress"],
                "nextRelease": row["next_release"],
                "statusLabel": row["status_label"],
                "statusTone": row["status_tone"],
                "subtitle": subtitle,
            }
        )
    return projects


def get_dashboard_summary() -> Dict[str, Any]:
    conn = get_connection()
    projects = [dict(row) for row in conn.execute("SELECT * FROM projects ORDER BY created_at DESC").fetchall()]
    milestones = [dict(row) for row in conn.execute("SELECT * FROM milestones").fetchall()]
    messages = [dict(row) for row in conn.execute("SELECT * FROM messages ORDER BY created_at DESC LIMIT 5").fetchall()]
    conn.close()

    active_projects = len(projects)
    milestones_this_week = sum(1 for item in milestones if item["status"] in {"released", "in_review", "planned", "blocked"})
    escrow_protected = round(sum(item["budget"] for item in projects), 2)
    risk_alerts = sum(1 for item in projects if item["status_tone"] == "danger")

    timeline = [
        {
            "time": "09",
            "title": "Verification run for Northstar Retail",
            "detail": "Code proof and deployment evidence are queued before the next release.",
        },
        {
            "time": "12",
            "title": "Approval window closes for Helio Metrics",
            "detail": "If approved, payout can move instantly from escrow to freelancer.",
        },
        {
            "time": "16",
            "title": "Manual quality review for PulseFit",
            "detail": "Design consistency issues need a human decision before the hold is removed.",
        },
    ]

    activities = []
    for item in messages[:3]:
        activities.append(
            {
                "title": f"{item['sender_name']} updated the room",
                "detail": item["body"],
                "time": item["created_at"],
            }
        )

    if not activities:
        activities = [
            {
                "title": "TrustFlow initialized the workspace",
                "detail": "Create a project to see live activity and payout movement.",
                "time": utc_now(),
            }
        ]

    wallet = {
        "protected": escrow_protected,
        "ready": 7000.0,
        "awaiting": 11200.0,
        "held": 1650.0,
    }

    live_projects = list_live_projects()[:3]

    return {
        "metrics": {
            "activeProjects": active_projects,
            "milestonesThisWeek": milestones_this_week,
            "escrowProtected": escrow_protected,
            "riskAlerts": risk_alerts,
        },
        "projects": live_projects,
        "liveProjects": live_projects,
        "timeline": timeline,
        "wallet": wallet,
        "activities": activities,
        "currentProjectId": get_latest_project_id(),
    }


def get_project_room(project_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not project_id:
        project_id = get_latest_project_id()
    if not project_id:
        return None

    conn = get_connection()
    project = dict_from_row(conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone())
    if not project:
        conn.close()
        return None

    milestones = [dict(row) for row in conn.execute("SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at", (project_id,)).fetchall()]
    messages = [dict(row) for row in conn.execute("SELECT * FROM messages WHERE project_id = ? ORDER BY created_at", (project_id,)).fetchall()]
    assets = [dict(row) for row in conn.execute("SELECT * FROM assets WHERE project_id = ?", (project_id,)).fetchall()]
    events = [dict(row) for row in conn.execute("SELECT * FROM project_events WHERE project_id = ? ORDER BY created_at DESC", (project_id,)).fetchall()]
    conn.close()

    board = {"planned": [], "in_review": [], "released": []}
    for item in milestones:
        card = {
            "id": item["id"],
            "title": item["title"],
            "detail": item["deliverable"],
            "progress": item["progress"],
            "amount": item["amount"],
            "owner": item["owner"],
            "status": item["status"],
        }
        if item["status"] == "released":
            board["released"].append(card)
        elif item["status"] in {"in_review", "blocked"}:
            board["in_review"].append(card)
        else:
            board["planned"].append(card)

    people = [
        {"name": project["client_name"], "role": "Employer", "status": "Verified", "tone": "success"},
        {"name": "Arjun Dev", "role": "Freelancer", "status": "Trusted", "tone": "success"},
        {"name": "TrustFlow AI", "role": "Automated QA", "status": "Monitoring", "tone": "warning"},
    ]

    return {
        "id": project["id"],
        "title": project["title"],
        "clientName": project["client_name"],
        "description": project["description"],
        "budget": project["budget"],
        "deadline": project["deadline"],
        "progress": project["progress"],
        "nextRelease": project["next_release"],
        "roomConfidence": project["room_confidence"],
        "assetsShared": project["assets_shared"],
        "approvalsPending": project["approvals_pending"],
        "milestonesComplete": sum(1 for item in milestones if item["status"] == "released"),
        "milestonesTotal": len(milestones),
        "board": board,
        "assets": assets,
        "people": people,
        "messages": messages,
        "events": events,
    }


def add_message(project_id: str, sender_name: str, sender_role: str, body: str) -> Dict[str, Any]:
    conn = get_connection()
    message_id = add_message_record(conn, project_id, sender_name, sender_role, body)
    add_project_event_record(conn, project_id, f"{sender_name} sent a message", "Room discussion updated with new delivery context.", "neutral")
    conn.commit()
    message = dict_from_row(conn.execute("SELECT * FROM messages WHERE id = ?", (message_id,)).fetchone())
    conn.close()
    return message


def get_video_session(project_id: Optional[str] = None) -> Dict[str, Any]:
    room = get_project_room(project_id)
    if not room:
        return {
            "projectId": None,
            "projectTitle": "TrustFlow Demo Call",
            "participants": [
                {"name": "Jane Smith", "role": "Employer", "state": "Connected"},
                {"name": "Arjun Dev", "role": "Freelancer", "state": "Connected"},
            ],
            "transcript": [],
            "latestScan": None,
        }

    latest = get_latest_video_scan(room["id"])
    transcript = [
        {"speaker": "Jane Smith", "text": "Can you still commit to the revised Friday delivery?", "time": "00:42"},
        {"speaker": "Arjun Dev", "text": "Yes, the core dashboard is complete and the export flow is covered by proof.", "time": "00:57"},
        {"speaker": "TrustFlow AI", "text": "Behavioral scan is listening for confidence, consistency, and stress shifts.", "time": "01:04"},
    ]
    return {
        "projectId": room["id"],
        "projectTitle": room["title"],
        "participants": [
            {"name": room["clientName"], "role": "Employer", "state": "Connected"},
            {"name": "Arjun Dev", "role": "Freelancer", "state": "Connected"},
        ],
        "transcript": transcript,
        "latestScan": latest,
    }


def store_video_scan(project_id: Optional[str], scenario_name: str) -> Dict[str, Any]:
    scenario = VIDEO_SCENARIOS.get(scenario_name, VIDEO_SCENARIOS["suspicious"])
    conn = get_connection()
    scan_id = str(uuid.uuid4())
    conn.execute(
        """
        INSERT INTO video_scans (
            id, project_id, participant_name, participant_role, scenario, risk_label, risk_tone,
            voice_stress, facial_consistency, confidence_level, commitment_signal, pattern_score,
            escrow_action, summary, warning_title, warning_message, highlights_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            scan_id,
            project_id,
            scenario["participant_name"],
            scenario["participant_role"],
            scenario_name,
            scenario["risk_label"],
            scenario["risk_tone"],
            scenario["voice_stress"],
            scenario["facial_consistency"],
            scenario["confidence_level"],
            scenario["commitment_signal"],
            scenario["pattern_score"],
            scenario["escrow_action"],
            scenario["summary"],
            scenario["warning_title"],
            scenario["warning_message"],
            json.dumps(scenario["highlights"]),
            utc_now(),
        ),
    )
    if project_id:
        add_project_event_record(conn, project_id, "Behavioral trust scan completed", scenario["warning_title"], scenario["risk_tone"])
    conn.commit()
    conn.close()
    return get_latest_video_scan(project_id)


def get_latest_video_scan(project_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    if project_id:
        row = conn.execute(
            "SELECT * FROM video_scans WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
            (project_id,),
        ).fetchone()
    else:
        row = conn.execute("SELECT * FROM video_scans ORDER BY created_at DESC LIMIT 1").fetchone()
    conn.close()
    data = dict_from_row(row)
    if not data:
        return None
    data["highlights"] = json.loads(data["highlights_json"])
    return data


def get_skill_challenge(challenge_type: str) -> Dict[str, Any]:
    return SKILL_CHALLENGES.get(challenge_type, SKILL_CHALLENGES["development"])


def evaluate_skill_test(challenge_type: str, answers: List[int], project_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
    challenge = get_skill_challenge(challenge_type)
    correct_count = 0
    for index, question in enumerate(challenge["questions"]):
        if index < len(answers) and answers[index] == question["correct"]:
            correct_count += 1
    total = len(challenge["questions"])
    score = round((correct_count / total) * 100) if total else 0
    passed = correct_count >= 2
    result = {
        "type": challenge_type,
        "label": challenge["label"],
        "badgeLabel": challenge["badgeLabel"],
        "score": score,
        "correct": correct_count,
        "total": total,
        "passed": passed,
        "pfiBoost": challenge["pfiBoost"] if passed else -4,
        "summary": (
            f"AI validated the candidate for {challenge['label'].lower()} with {correct_count}/{total} correct answers."
            if passed
            else f"AI found only {correct_count}/{total} correct answers, so manual review is recommended before project acceptance."
        ),
    }

    conn = get_connection()
    conn.execute(
        """
        INSERT INTO skill_tests (
            id, project_id, user_id, challenge_type, label, score, correct_count, total_questions,
            passed, badge_label, pfi_boost, summary, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(uuid.uuid4()),
            project_id,
            user_id,
            challenge_type,
            challenge["label"],
            score,
            correct_count,
            total,
            1 if passed else 0,
            challenge["badgeLabel"],
            result["pfiBoost"],
            result["summary"],
            utc_now(),
        ),
    )
    if project_id:
        add_project_event_record(
            conn,
            project_id,
            "Skill validation completed",
            result["summary"],
            "success" if passed else "danger",
        )
    conn.commit()
    conn.close()
    return result


def get_latest_skill_test(user_id: Optional[str] = None, project_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    if project_id:
        row = conn.execute("SELECT * FROM skill_tests WHERE project_id = ? ORDER BY created_at DESC LIMIT 1", (project_id,)).fetchone()
    elif user_id:
        row = conn.execute("SELECT * FROM skill_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", (user_id,)).fetchone()
    else:
        row = conn.execute("SELECT * FROM skill_tests ORDER BY created_at DESC LIMIT 1").fetchone()
    conn.close()
    return dict_from_row(row)


def clamp_score(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, int(round(value))))


def build_trust_history(
    trust_score: int,
    pfi: int,
    latest_skill: Optional[Dict[str, Any]],
    latest_scan: Optional[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    skill_delta = 2 if latest_skill and latest_skill["passed"] else -4 if latest_skill else 0
    scan_delta = (
        1 if latest_scan and latest_scan["risk_tone"] == "success"
        else -2 if latest_scan and latest_scan["risk_tone"] == "warning"
        else -6 if latest_scan
        else 0
    )

    baseline_trust = clamp_score(trust_score - skill_delta - scan_delta - 6, 48, 96)
    baseline_pfi = clamp_score(pfi - (latest_skill["pfi_boost"] if latest_skill and latest_skill["passed"] else 0) - (2 if latest_scan and latest_scan["risk_tone"] == "success" else 0) + (3 if latest_scan and latest_scan["risk_tone"] == "danger" else 0), 46, 96)

    points = [
        {
            "label": "Onboarding",
            "trustScore": clamp_score(baseline_trust - 4, 40, 95),
            "pfi": clamp_score(baseline_pfi - 5, 40, 95),
            "status": "Initialized",
            "tone": "warning",
            "detail": "Base reputation, payout history, and profile setup established the first trust posture.",
        },
        {
            "label": "Delivery Proof",
            "trustScore": clamp_score(baseline_trust + 2, 40, 98),
            "pfi": clamp_score(baseline_pfi + 3, 40, 98),
            "status": "Raised",
            "tone": "success",
            "detail": "Milestone evidence and delivery consistency increased freelancer credibility.",
        },
        {
            "label": "Skill Test",
            "trustScore": clamp_score(baseline_trust + skill_delta + 3, 40, 100),
            "pfi": clamp_score(baseline_pfi + (latest_skill["pfi_boost"] if latest_skill and latest_skill["passed"] else -3 if latest_skill else 0), 40, 100),
            "status": latest_skill["passed"] and "Verified" or latest_skill and "Review" or "Pending",
            "tone": latest_skill["passed"] and "success" or latest_skill and "warning" or "warning",
            "detail": latest_skill["summary"] if latest_skill else "No micro-test result has been applied yet.",
        },
        {
            "label": "Behavior Scan",
            "trustScore": clamp_score(trust_score - 1, 40, 100) if latest_scan and latest_scan["risk_tone"] == "success"
                else clamp_score(trust_score - 3, 40, 100) if latest_scan and latest_scan["risk_tone"] == "warning"
                else clamp_score(trust_score - 8, 40, 100) if latest_scan
                else clamp_score(trust_score - 2, 40, 100),
            "pfi": clamp_score(pfi - 1, 40, 100) if latest_scan and latest_scan["risk_tone"] == "success"
                else clamp_score(pfi - 3, 40, 100) if latest_scan and latest_scan["risk_tone"] == "warning"
                else clamp_score(pfi - 7, 40, 100) if latest_scan
                else clamp_score(pfi - 2, 40, 100),
            "status": latest_scan["risk_label"] if latest_scan else "Pending",
            "tone": latest_scan["risk_tone"] if latest_scan else "warning",
            "detail": latest_scan["warning_title"] if latest_scan else "Behavioral verification has not been run yet.",
        },
        {
            "label": "Current",
            "trustScore": trust_score,
            "pfi": pfi,
            "status": "Live",
            "tone": "success" if trust_score >= 85 else "warning" if trust_score >= 65 else "danger",
            "detail": "Current trust state after skill validation, delivery proof, and behavioral analysis.",
        },
    ]
    return points


def compute_wallet_summary(project_id: Optional[str] = None) -> Dict[str, Any]:
    room = get_project_room(project_id)
    freelancer = get_default_freelancer()
    latest_skill = get_latest_skill_test(project_id=room["id"] if room else None, user_id=freelancer["id"] if freelancer else None)
    latest_scan = get_latest_video_scan(room["id"] if room else None)

    trust_score = freelancer["trustScore"] if freelancer else 84
    projects_completed = freelancer["projectsCompleted"] if freelancer else 12
    reliability_index = freelancer["reliabilityIndex"] if freelancer else 86
    pfi = round((trust_score + reliability_index) / 2)

    skill_validation = 45
    behavioral_trust = 50
    badge_status = "Pending"
    badge_text = "Run the skill validation test to issue a verified skill badge."
    skill_chip = {"tone": "warning", "text": "Skill badge pending"}
    behavior_chip = {"tone": "warning", "text": "Call scan not run"}

    events = [
        {
            "title": "PFI initialized",
            "detail": "Base score started from completed projects, payout history, and milestone accuracy.",
        }
    ]

    if latest_skill:
        skill_validation = latest_skill["score"]
        if latest_skill["passed"]:
            trust_score += 2
            reliability_index += 1
            pfi += latest_skill["pfi_boost"]
            badge_status = "Verified"
            badge_text = f"{latest_skill['badge_label']} earned and applied to the wallet profile."
            skill_chip = {"tone": "success", "text": latest_skill["badge_label"]}
            events.append(
                {
                    "title": "Skill validation passed",
                    "detail": f"{latest_skill['badge_label']} awarded after scoring {latest_skill['score']}%.",
                }
            )
        else:
            trust_score -= 4
            reliability_index -= 2
            pfi -= 6
            badge_status = "Review required"
            badge_text = "The micro-test did not meet the pass threshold, so the badge remains withheld."
            skill_chip = {"tone": "danger", "text": "Skill review required"}
            events.append(
                {
                    "title": "Skill validation flagged",
                    "detail": latest_skill["summary"],
                }
            )
    else:
        events.append(
            {
                "title": "Skill validation pending",
                "detail": "No verified skill badge has been issued yet for the current freelancer.",
            }
        )

    trust_hold = 1650.0
    if latest_scan:
        if latest_scan["risk_tone"] == "success":
            behavioral_trust = 89
            trust_score += 1
            pfi += 2
            trust_hold = 1200.0
            behavior_chip = {"tone": "success", "text": "Behavior scan cleared"}
            events.append(
                {
                    "title": "Behavioral trust cleared",
                    "detail": "Live call signals looked stable, so the wallet can continue normal release logic.",
                }
            )
        elif latest_scan["risk_tone"] == "warning":
            behavioral_trust = 62
            trust_score -= 2
            pfi -= 3
            behavior_chip = {"tone": "warning", "text": "Behavior warning logged"}
            events.append(
                {
                    "title": "Behavioral warning logged",
                    "detail": latest_scan["warning_title"],
                }
            )
        else:
            behavioral_trust = 34
            trust_score -= 6
            reliability_index -= 3
            pfi -= 7
            trust_hold = 2200.0
            behavior_chip = {"tone": "danger", "text": "Commitment risk detected"}
            events.append(
                {
                    "title": "Behavioral risk triggered",
                    "detail": latest_scan["warning_title"],
                }
            )
    else:
        events.append(
            {
                "title": "Behavioral scan pending",
                "detail": "No commitment-risk result has been logged from the latest call.",
            }
        )

    trust_score = max(0, min(100, trust_score))
    reliability_index = max(0, min(100, reliability_index))
    pfi = max(0, min(100, pfi))

    milestone_accuracy = 93
    deadline_adherence = 90
    aqa_consistency = 91

    protected_balance = room["budget"] if room else 24500.0
    ready_balance = room["nextRelease"] if room else 7000.0
    awaiting_balance = max(protected_balance - ready_balance - trust_hold, 0)
    history = build_trust_history(trust_score, pfi, latest_skill, latest_scan)

    return {
        "trustScore": trust_score,
        "professionalFidelityIndex": pfi,
        "profile": {
            "name": freelancer["name"] if freelancer else "Freelancer",
            "title": "Frontend engineer and product-minded freelancer",
            "avatar": "AD",
            "trustScore": trust_score,
            "projectsCompleted": projects_completed,
            "reliabilityIndex": reliability_index,
            "pfi": pfi,
            "badgeStatus": badge_status,
            "badgeText": badge_text,
            "skillChip": skill_chip,
            "behaviorChip": behavior_chip,
        },
        "breakdown": {
            "milestoneAccuracy": milestone_accuracy,
            "deadlineAdherence": deadline_adherence,
            "aqaConsistency": aqa_consistency,
            "skillValidation": skill_validation,
            "behavioralTrust": behavioral_trust,
        },
        "wallet": {
            "protected": round(protected_balance, 2),
            "ready": round(ready_balance, 2),
            "awaiting": round(awaiting_balance, 2),
            "trustHold": round(trust_hold, 2),
        },
        "events": events,
        "history": history,
        "latestSkillTest": latest_skill,
        "latestVideoScan": latest_scan,
    }


def compute_trust_prediction(project_id: Optional[str] = None) -> Dict[str, Any]:
    room = get_project_room(project_id)
    wallet = compute_wallet_summary(project_id)
    latest_scan = wallet.get("latestVideoScan")
    conn = get_connection()

    if room:
        milestones = [dict(row) for row in conn.execute(
            "SELECT status, progress FROM milestones WHERE project_id = ?",
            (room["id"],),
        ).fetchall()]
        messages = [dict(row) for row in conn.execute(
            "SELECT id FROM messages WHERE project_id = ?",
            (room["id"],),
        ).fetchall()]
        events = [dict(row) for row in conn.execute(
            "SELECT id FROM project_events WHERE project_id = ?",
            (room["id"],),
        ).fetchall()]
    else:
        milestones = [dict(row) for row in conn.execute(
            "SELECT status, progress FROM milestones ORDER BY created_at DESC LIMIT 8"
        ).fetchall()]
        messages = [dict(row) for row in conn.execute(
            "SELECT id FROM messages ORDER BY created_at DESC LIMIT 8"
        ).fetchall()]
        events = [dict(row) for row in conn.execute(
            "SELECT id FROM project_events ORDER BY created_at DESC LIMIT 8"
        ).fetchall()]

    conn.close()

    total_milestones = len(milestones) or 1
    blocked_count = sum(1 for item in milestones if item["status"] == "blocked")
    in_review_count = sum(1 for item in milestones if item["status"] == "in_review")
    low_progress_planned = sum(1 for item in milestones if item["status"] == "planned" and item["progress"] < 20)

    room_progress = room["progress"] if room else 54
    room_confidence = room["roomConfidence"] if room else 82
    approvals_pending = room["approvalsPending"] if room else 0
    assets_shared = room["assetsShared"] if room else 6

    delay_rate = clamp_score(
        (blocked_count / total_milestones) * 55
        + (in_review_count / total_milestones) * 24
        + (low_progress_planned / total_milestones) * 16
        + max(0, 45 - room_progress) * 0.35
        + max(0, 72 - room_confidence) * 0.18
        + approvals_pending * 8
    )

    message_count = len(messages)
    event_count = len(events)
    communication_frequency = clamp_score(message_count * 18 + event_count * 6 + assets_shared * 2)
    communication_risk = clamp_score(100 - communication_frequency)

    if latest_scan:
        behavior_risk = clamp_score(
            latest_scan["voice_stress"] * 0.30
            + (100 - latest_scan["facial_consistency"]) * 0.20
            + (100 - latest_scan["confidence_level"]) * 0.25
            + (100 - latest_scan["commitment_signal"]) * 0.25
        )
    else:
        behavior_risk = 22

    trust_score = wallet["trustScore"]

    # Hackathon formula:
    # risk = (100 - trustScore) * 0.4 + delayRate * 0.3 + behaviorRisk * 0.3
    # Communication frequency is applied as a stability modifier afterward.
    base_risk = ((100 - trust_score) * 0.4) + (delay_rate * 0.3) + (behavior_risk * 0.3)
    project_risk = clamp_score(base_risk + ((communication_risk - 40) * 0.2))

    delivery_delay_probability = clamp_score(
        (delay_rate * 0.38)
        + (project_risk * 0.32)
        + (max(0, 60 - room_confidence) * 0.30)
    )

    protected_balance = wallet["wallet"]["protected"] or 1
    trust_hold_ratio = (wallet["wallet"]["trustHold"] / protected_balance) * 100
    dispute_risk = clamp_score(
        ((100 - trust_score) * 0.25)
        + (behavior_risk * 0.18)
        + (trust_hold_ratio * 0.22)
        + (communication_risk * 0.10)
    )

    if project_risk < 30 and delivery_delay_probability < 28 and dispute_risk < 20:
        trust_stability = "HIGH"
        tone = "success"
    elif project_risk < 55:
        trust_stability = "MODERATE"
        tone = "warning"
    else:
        trust_stability = "FRAGILE"
        tone = "danger"

    recommended_action = (
        "Continue milestone verification and keep escrow automation active."
        if tone == "success"
        else "Request stronger proof and monitor the next delivery checkpoint."
        if tone == "warning"
        else "Keep escrow locked, review commitment signals, and require reaffirmation."
    )

    trust_gap = clamp_score(100 - trust_score)
    factors = [
        {
            "label": "Trust score gap",
            "input": trust_gap,
            "weight": 0.4,
            "contribution": round(trust_gap * 0.4, 1),
            "tone": "success" if trust_gap < 20 else "warning" if trust_gap < 40 else "danger",
            "detail": "How far the current trust score is from a perfect trust posture.",
        },
        {
            "label": "Milestone delay rate",
            "input": delay_rate,
            "weight": 0.3,
            "contribution": round(delay_rate * 0.3, 1),
            "tone": "success" if delay_rate < 20 else "warning" if delay_rate < 45 else "danger",
            "detail": "Delay pressure from blocked milestones, low progress, pending approvals, and room confidence.",
        },
        {
            "label": "Behavior risk",
            "input": behavior_risk,
            "weight": 0.3,
            "contribution": round(behavior_risk * 0.3, 1),
            "tone": "success" if behavior_risk < 25 else "warning" if behavior_risk < 50 else "danger",
            "detail": "Voice stress, facial consistency, confidence, and commitment are merged into one behavior score.",
        },
        {
            "label": "Communication frequency",
            "input": communication_frequency,
            "weight": 0.2,
            "contribution": round(((communication_risk - 40) * 0.2), 1),
            "tone": "success" if communication_frequency >= 70 else "warning" if communication_frequency >= 45 else "danger",
            "detail": "Messages, project events, and shared assets act as a stability modifier after the main risk formula.",
        },
    ]

    audit_log = [
        {
            "title": "Formula executed",
            "detail": "TrustFlow recalculated future project risk from trust score, delays, and behavior.",
            "tone": "success",
        },
        {
            "title": "Communication modifier applied",
            "detail": f"Communication frequency is {communication_frequency}% and adjusted the final stability posture.",
            "tone": factors[3]["tone"],
        },
        {
            "title": "Recommended action issued",
            "detail": recommended_action,
            "tone": tone,
        },
    ]

    return {
        "projectId": room["id"] if room else project_id,
        "projectTitle": room["title"] if room else "TrustFlow Live Project",
        "projectRisk": project_risk,
        "deliveryDelayProbability": delivery_delay_probability,
        "disputeRisk": dispute_risk,
        "trustStability": trust_stability,
        "communicationFrequency": communication_frequency,
        "delayRate": delay_rate,
        "behaviorRisk": behavior_risk,
        "trustScore": trust_score,
        "tone": tone,
        "formula": "risk = (100 - trustScore) * 0.4 + delayRate * 0.3 + behaviorRisk * 0.3",
        "narrative": "TrustFlow predicts future project risk using trust score, milestone delay signals, behavior analysis, and communication frequency.",
        "delayNarrative": "Delivery delay probability rises when progress stalls, approvals stack up, or milestone confidence drops.",
        "disputeNarrative": "Dispute risk reflects behavior instability, escrow hold pressure, trust score weakness, and poor communication rhythm.",
        "stabilityNarrative": "Trust stability reflects how dependable the project looks before the next failure, delay, or dispute happens.",
        "recommendedAction": recommended_action,
        "factors": factors,
        "auditLog": audit_log,
        "history": wallet.get("history", []),
    }
