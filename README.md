# 🌐 TrustFlow AI

> An intelligent, blockchain-inspired freelance marketplace powered by blazing-fast AI and secure escrow payments.

TrustFlow AI is a next-generation platform designed to eliminate scams and micromanagement in the freelance industry. By combining **CrewAI multi-agent systems**, **Stripe Connect Escrow**, and **Real-Time WebSockets**, TrustFlow mathematically guarantees trust between clients and freelancers.

---

## ✨ Core Features

1. **🚀 Blazing Fast AI Blueprints (Powered by Groq LPUs)**
   Instead of human project managers, our CrewAI multi-agent system acts as the Technical Architect. Simply describe your project, and the AI instantly generates a strict JSON roadmap breaking down phases, tasks, and budget allocation in milliseconds.
2. **🛡️ Immutable Escrow Vaults (Stripe integration)**
   Funds are locked in a digital vault upon project initialization. Using Stripe Connect, money is only released to the freelancer when both parties digitally sign off on milestone completions.
3. **💬 Real-Time Encrypted Comms (Socket.IO)**
   Live, real-time project rooms with typing indicators and instantaneous message streaming powered by FastAPI's native ASGI WebSockets.
4. **📱 Cryptographic Node Identity (Twilio & Cloudinary)**
   Every user is treated as a "Node". Verification is handled via Twilio SMS authentication and deep-fake secure media uploads via Cloudinary.
5. **🎨 Cyberpunk UI/UX (GSAP & Framer Motion)**
   A stunning, hardware-accelerated interface built with TailwindCSS, GSAP, and Framer Motion, delivering a fluid 60fps experience.

---

## 🏗️ Architecture & Tech Stack

This project is built using a modern decoupled architecture:

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS + Framer Motion + GSAP
- **State Management:** Zustand + React Query
- **Real-Time:** Socket.io-client

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL + SQLAlchemy (Async)
- **AI/LLM:** CrewAI + Groq API
- **Real-Time:** python-socketio (Native ASGI)
- **Integrations:** Stripe (Payments), Twilio (SMS), Resend (Email), Cloudinary (Media)

---

## 🚀 Getting Started (Local Development)

To run this project locally, you will need to start both the Next.js frontend and the FastAPI backend.

### 1. Clone the Repository
```bash
git clone https://github.com/Ayush-0918/Trustflow-AI.git
cd Trustflow-AI
```

### 2. Setup the Backend (FastAPI)
The backend is located in the `backend/` directory.

```bash
cd backend

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment Variables
# Create a `.env` file in the backend directory and add your API keys:
# GROQ_API_KEY=...
# STRIPE_SECRET_KEY=...
# STRIPE_WEBHOOK_SECRET=...
# TWILIO_ACCOUNT_SID=...
# CLOUDINARY_URL=...
# DATABASE_URL=sqlite+aiosqlite:///./trustflow.db

# Run the server
uvicorn app.main:app --reload
```
The backend will be running at `http://localhost:8000`.

### 3. Setup the Frontend (Next.js)
Open a new terminal window and navigate to the project root.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
The frontend will be running at `http://localhost:3000`.

---

## 💡 How to Test
1. **AI Planner:** Go to `/ai-planner`, type a prompt, and watch Groq generate a multi-agent roadmap instantly.
2. **WebSockets:** Open `/projects/1` in two different browser windows. Send a message in the chat box on the right and watch the live typing indicators.
3. **Escrow Wallet:** Go to `/wallet` and click "Deposit $1k" to test the Stripe Checkout flow.

---

*Built with passion for the Hackathon.* 🚀
