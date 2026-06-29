# TrustFlow AI - Project Overview & Blueprint

This document is a comprehensive guide to **TrustFlow AI**, explaining exactly what the project is, what technologies are used, the current state of features, the directory structure, and a blueprint for future enhancements.

---

## 1. Project Vision & Overview
**TrustFlow AI** is an intelligent freelancer marketplace platform that integrates AI-powered features, Escrow payments, Skill testing, and Video-based Verification to build extreme trust between clients and freelancers. It aims to eliminate fraud and ensure high-quality delivery through automated trust scoring, video deep-fake detection, and smart escrow wallets.

---

## 2. Tech Stack & Materials Used (What is used in this)

This project uses a split architecture (Vanilla Frontend + Python Backend):

### Frontend Stack (Client-Side)
- **HTML5 & CSS3** - Core structure and styling (`style.css`), avoiding complex heavy frameworks for a fast, custom shell.
- **Vanilla JavaScript (ES6)** - Modular scripts located in the `/js` folder handling API requests, routing, animations (`landing-effects.js`, `particles.js`), and WebRTC/Video logic (`video-call.js`).

### Backend Stack (Server-Side)
- **Python 3** - Core backend language.
- **Flask** - Lightweight web framework used for API routing and serving static files (`backend/app.py`).
- **SQLite3** - Relational database (`trustflow_demo.sqlite3`) storing Users, Projects, Messages, and Payments.
- **Custom Services Framework** - Mock AI models, escrow engines, and SMS services implemented in `services/`.

---

## 3. Current State: What Has Been Built So Far?

1. **Frontend Pages:**
   - Landing Page (`index.html`) with particle effects.
   - Authentication (`login.html`, `signup.html`).
   - Dashboard (`dashboard.html`) showing projects and Trust Scores.
   - Project Workspaces (`project-room.html`, `project-create.html`).
   - Freelancer Profile (`freelancer-profile.html`).
   - Escrow & Wallet (`escrow.html`, `trust-wallet.html`).
   - Video Calling & Identity Verification (`video-call.html`, `video-verification.html`).
   - Skill Testing (`skill-test.html`).
2. **Backend API Features (`app.py`):**
   - Authentication (Login/Signup/Me).
   - Project Creation & Management (AI Project Planner integration).
   - Real-time messaging endpoints for Project Rooms.
   - Trust Prediction and Wallet Summary endpoints.
   - Video session handling and Deep-fake/Suspicious behavior detection endpoints.
   - Skills Evaluation endpoints.

---

## 4. Complete Directory Structure

```text
.
├── backend/                  # Python Flask Backend
│   ├── app.py                # Main Flask application and API routes
│   ├── db.py                 # SQLite database connection and ORM queries
│   ├── seed_users.py         # Script to populate mock database data
│   ├── test_db.py            # Unit tests for the database
│   ├── trustflow_demo.sqlite3# The local database file
│   ├── models/               # Python models representing DB tables
│   │   ├── milestone.py
│   │   ├── payment.py
│   │   ├── project.py
│   │   └── user.py
│   └── routes/               # API endpoint modules
│       ├── auth.py
│       ├── chat.py
│       ├── payment.py
│       ├── project.py
│       └── video.py
├── database/                 
│   └── db.py                 # (Duplicate/Older DB logic - needs consolidation)
├── js/                       # Vanilla JavaScript Frontend Logic
│   ├── ai-detection.js       # AI analysis for video calls
│   ├── aiPlanner.js          # AI project blueprint generation logic
│   ├── api.js                # Core Fetch wrapper for API communication
│   ├── auth.js               # Login/Signup handling
│   ├── chat.js               # Realtime project messaging UI logic
│   ├── dashboard.js          # Dashboard data fetching
│   ├── escrow.js             # Milestone and payment UI logic
│   ├── freelancer-profile.js # Profile management
│   ├── i18n.js               # Internationalization logic
│   ├── index.js              # General index logic
│   ├── landing-effects.js    # UI animations
│   ├── notification.js       # Toast notifications
│   ├── particles.js          # Canvas particle background
│   ├── skill-test.js         # Evaluation UI logic
│   ├── trust-score.js        # Trust scoring UI logic
│   ├── ui-shell.js           # Core layout wrapper logic
│   └── video-call.js         # WebRTC/Video stream logic
├── services/                 # Backend Services (AI, Escrow, SMS)
│   ├── ai_service.py
│   ├── escrow_engine.py
│   └── sms_service.py
├── style.css                 # Global CSS styles for the entire app
└── *.html                    # All frontend HTML pages (index, login, dashboard, etc.)
```

---

## 5. Guide for Future AI Assistants (How to Enhance & Redesign)

If you are an AI reading this, here is how you can enhance the platform:

1. **Database & Architecture Cleanup:**
   - The backend logic is slightly duplicated between `backend/db.py` and `database/db.py`. Consolidate these into a clean ORM pattern (using SQLAlchemy if possible).
2. **Frontend Modernization:**
   - The frontend relies on separate HTML files and vanilla JS fetching. It works well, but for extreme scalability, you might consider migrating the heavy state logic (like `project-room.html`) into a modern framework component (like React/Vue) OR implement a lightweight component architecture using Web Components.
3. **Connect Real AI APIs:**
   - The `services/ai_service.py` currently uses mock responses for the Trust Prediction, Video Deepfake Detection, and Project Planner. These need to be connected to actual LLMs (like OpenAI/Google Gemini) and real computer vision APIs.
4. **WebSocket Integration:**
   - The chat system in `project-room.html` relies on HTTP polling. Implementing `Flask-SocketIO` would make messaging truly real-time.
