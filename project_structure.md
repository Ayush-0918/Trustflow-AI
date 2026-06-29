# TrustFlow AI - Project Overview & Blueprint

This document provides a comprehensive guide to **TrustFlow AI**, explaining the current architecture, technologies used, and the complete directory structure.

---

## 1. Project Vision & Overview
**TrustFlow AI** is a decentralized, AI-governed freelance marketplace. It integrates CrewAI-powered project roadmapping, Stripe Escrow payments, real-time messaging, and multi-factor verification (SMS + Biometric) to eliminate fraud and scope creep.

---

## 2. Tech Stack & Materials Used

This project uses a modern decoupled architecture:

### Frontend Stack (Next.js App Router)
- **Next.js 14** - React framework for production-grade SSR and API routes.
- **Tailwind CSS & Framer Motion** - For complex, responsive, and animated UI components.
- **Zustand** - Lightweight global state management.
- **Axios** - HTTP client for interacting with the backend API.
- **Socket.IO Client** - Real-time WebSocket connection for live project chat.

### Backend Stack (FastAPI Python)
- **FastAPI** - High-performance asynchronous web framework.
- **SQLAlchemy & SQLite/PostgreSQL** - Async ORM for handling relational data.
- **Alembic** - Database schema migrations.
- **Socket.IO (python-socketio)** - ASGI integration for real-time WebSocket communication.
- **CrewAI & Groq** - Multi-agent AI engine using Groq LPUs for lightning-fast inference.
- **Stripe API** - Escrow integration using Stripe Connect.
- **Twilio & Resend APIs** - For OTP verification and transactional HTML emails.
- **Cloudinary** - Secure media and asset uploading.

---

## 3. Complete Directory Structure

```text
TrustFlow-AI/
├── backend/                        # Python FastAPI Backend Environment
│   ├── .venv/                      # Python Virtual Environment
│   ├── alembic/                    # Database migrations configuration
│   ├── alembic.ini
│   ├── app/                        # Core Application Code
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/      # API Routes (auth, projects, webhooks, etc.)
│   │   │       └── router.py       # Main API router consolidation
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings
│   │   │   └── security.py         # JWT Token, Password Hashing logic
│   │   ├── db/
│   │   │   ├── seed.py             # Script to populate mock database data
│   │   │   └── session.py          # SQLAlchemy async engine setup
│   │   ├── middleware/             # Custom ASGI middlewares (e.g., logging)
│   │   ├── models.py               # SQLAlchemy Database Models
│   │   ├── schemas/                # Pydantic validation schemas
│   │   └── services/               # Core Business Logic
│   │       ├── ai_service.py       # CrewAI & Groq inference logic
│   │       ├── email_service.py    # Resend email templates and sending logic
│   │       ├── escrow_service.py   # Stripe Connect API logic
│   │       ├── sms_service.py      # Twilio OTP logic
│   │       └── upload_service.py   # Cloudinary integration
│   ├── main.py                     # FastAPI entry point & Socket.IO server initialization
│   ├── requirements.txt            # Python dependencies
│   └── trustflow.db                # Local SQLite database (git ignored)
│
├── src/                            # Next.js Frontend Codebase
│   ├── app/                        # Next.js App Router Pages
│   │   ├── ai-planner/             # AI Roadmapping Interface
│   │   ├── auth/                   # Login & Registration flows
│   │   ├── marketplace/            # Freelancer/Project discovery
│   │   ├── profile/                # User profiles
│   │   ├── projects/               # Project management & dynamic workspaces
│   │   ├── wallet/                 # Stripe deposit/escrow UI
│   │   ├── globals.css             # Tailwind base and custom animations
│   │   ├── layout.tsx              # Root HTML wrapper and providers
│   │   └── page.tsx                # Landing Page
│   │
│   ├── components/                 # Reusable UI Components
│   │   ├── auth/
│   │   ├── features/               # Complex feature components (e.g., ProjectChat)
│   │   ├── layout/                 # Navbar, Footer
│   │   └── ui/                     # Primitives (Buttons, SpotlightCards, Modals)
│   │
│   ├── hooks/                      # Custom React Hooks (useSocket)
│   ├── lib/                        # Utilities (API Interceptors, class names)
│   ├── store/                      # Zustand Stores (authStore.ts)
│   └── types/                      # TypeScript global interfaces
│
├── public/                         # Static assets (images, icons)
├── package.json                    # Node.js dependencies
├── tailwind.config.js              # Tailwind theming configuration
└── README.md                       # Main project documentation
```

---

## 4. Architectural Workflows

1. **AI Planning Flow:** User submits prompt -> Next.js calls `POST /api/v1/ai/planner` -> FastAPI delegates to `ai_service.py` (CrewAI) -> CrewAI orchestrates multiple agent roles -> Returns JSON roadmap.
2. **Escrow Flow:** Client deposits funds -> Stripe triggers `POST /api/v1/webhooks/stripe/webhook` -> FastAPI validates signature in `webhooks.py` -> `escrow_service.py` locks funds in virtual ledger -> Updates Project Milestone status to "funded".
3. **Chat Flow:** Frontend mounts `ProjectChat` component -> `useSocket` connects to FastAPI Socket.IO server via ASGI -> Users emit `send_message` events -> Server broadcasts to specific project rooms.
