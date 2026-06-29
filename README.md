<div align="center">
  <img src="https://dummyimage.com/150x150/000000/22d3ee.png&text=TrustFlow+AI"
     alt="TrustFlow AI Logo"
     width="120">
  <h1>🌐 TrustFlow AI</h1>
  <p><strong>The First Cryptographically Secure, AI-Governed Freelance Economy</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![CrewAI](https://img.shields.io/badge/CrewAI-Multi--Agent-FF4B4B?style=for-the-badge)](https://crewai.com)
  [![Groq](https://img.shields.io/badge/Groq-LPU_Inference-f35f21?style=for-the-badge)](https://groq.com)
  [![Stripe](https://img.shields.io/badge/Stripe-Connect-6772E5?style=for-the-badge&logo=stripe)](https://stripe.com)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Real_Time-black?style=for-the-badge&logo=socket.io)](https://socket.io/)
</div>

<br/>

## 🚨 The Problem
The freelance industry is plagued by **micromanagement, payment disputes, and scope creep**. Clients worry about freelancers ghosting them, and freelancers worry about clients refusing to pay after the work is done. Current platforms like Upwork take massive 20% cuts while doing very little to actually resolve technical disputes objectively.

## 💡 The TrustFlow Solution
TrustFlow AI eliminates human bias by combining **Multi-Agent AI Roadmapping**, **Stripe Escrow Smart Contracts**, and **Real-Time WebSockets**. The AI strictly scopes the project, the client locks the funds in escrow, and money is only released cryptographically when the AI and both parties verify milestone completion. 

---

## 🔥 Enterprise-Grade Features

### 🧠 1. Multi-Agent AI Architect (Groq + CrewAI)
Instead of human project managers arguing over timelines, TrustFlow uses a **CrewAI multi-agent system** running on **Groq LPUs** for sub-second inference. 
- You type a 2-sentence project idea.
- The AI instantly generates a strict JSON roadmap outlining specific phases, exact deliverables, timeline estimates, and risk factors.

### 🛡️ 2. Immutable Escrow Vaults (Stripe Connect)
We don't do "fake" hackathon payments. TrustFlow integrates a real **Stripe Escrow Architecture**. 
- Clients deposit funds directly into a secure Stripe Vault (`paymentAPI.createSession`).
- Freelancers link their bank accounts via Stripe Connect (`paymentAPI.createConnectAccount`).
- Funds are mathematically locked and auto-released via Webhook listeners when milestones are completed.

### ⚡ 3. Zero-Latency Real-Time Comms (FastAPI + Socket.IO)
No more refreshing the page to see messages. We built a native **ASGI WebSocket server** directly into the Python backend.
- End-to-end real-time chat within project rooms.
- Live typing indicators (`"Anonymous Node is typing..."`).
- Secure JWT authentication on socket connection to prevent unauthorized packet sniffing.

### 👁️ 4. Cryptographic Biometric Identity (Twilio + Cloudinary)
To combat bots and bad actors:
- **Twilio SMS OTP:** Hard-verifies user phone numbers globally.
- **Cloudinary:** Secure media upload pipelines for portfolio verification and deep-fake checks.

### 🎨 5. 60FPS Cyberpunk UI (Framer Motion + GSAP)
The UI is a visual masterpiece. Built using **TailwindCSS, GSAP, and Framer Motion**, the interface features glassmorphism, WebGL animated backgrounds, and interactive spotlight cards that feel like a high-end crypto trading terminal.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Next.js Client UI] <--> |REST API| FastAPI[FastAPI Backend]
    Client <--> |WebSockets wss://| SocketIO[ASGI Socket Server]
    
    FastAPI <--> |LPU Inference| Groq[Groq API / Llama3]
    FastAPI <--> |Agent Tasks| CrewAI[CrewAI Framework]
    
    FastAPI <--> |Async ORM| DB[(PostgreSQL / SQLite)]
    FastAPI <--> |Escrow Holds| Stripe[Stripe Connect & Checkouts]
    Stripe -.-> |Webhooks| FastAPI
    
    FastAPI <--> |SMS Auth| Twilio[Twilio API]
    Client <--> |Media Upload| Cloudinary[Cloudinary CDN]
```

---

## 🛠️ Project Structure

```text
TrustFlow-AI/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/ # API Routes (ai, projects, wallet, auth, webhooks)
│   │   ├── core/             # Security (JWT) & Config
│   │   ├── db/               # Async SQLAlchemy Setup & Migrations
│   │   ├── models/           # Database Schemas
│   │   └── services/         # CrewAI, Escrow, SMS logic
│   └── main.py               # Entry point & Socket.IO server
│
├── src/                      # Next.js 14 Frontend
│   ├── app/                  # App Router pages (projects, wallet, profile, ai-planner)
│   ├── components/           # UI Elements (GSAP + Framer Motion)
│   ├── hooks/                # Custom React Hooks (useSocket)
│   ├── lib/                  # Axios Interceptors & API Client
│   └── store/                # Zustand Global State
```

---

## 🚀 Local Development Setup

To run this platform on your own machine, you must spin up both the Backend and Frontend servers.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Ayush-0918/Trustflow-AI.git
cd Trustflow-AI
```

### 2️⃣ Initialize the FastAPI Backend
```bash
cd backend

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install heavy dependencies
pip install -r requirements.txt

# Create Environment Variables
touch .env
```
Inside your `backend/.env` file, you **must** supply your own keys:
```env
# AI
GROQ_API_KEY=gsk_your_key_here

# Payments
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_key_here

# Verification
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
CLOUDINARY_URL=cloudinary://key:secret@cloud

# Database
DATABASE_URL=sqlite+aiosqlite:///./trustflow.db
```
**Start the API:**
```bash
uvicorn app.main:app --reload
```
*Backend is now running at `http://localhost:8000`*

### 3️⃣ Initialize the Next.js Frontend
Open a new terminal at the root of the project:
```bash
# Install Node dependencies
npm install

# Start the React Server
npm run dev
```
*Frontend is now running at `http://localhost:3000`*

---

## 🧪 Testing the Innovation (Hackathon Guide)

When reviewing this project, make sure to test these specific flows to see the underlying technology in action:

1. **The Groq Speed Test:** Navigate to `/ai-planner`. Type a project idea. Notice how the AI breaks it down into complex JSON phases in milliseconds, bypassing standard OpenAI latency.
2. **The Socket.IO Room:** Open `/projects/1` in **two different browser tabs** (side-by-side). Type in the chat box on the right. Watch the live typing indicator and instant message broadcasting.
3. **The Webhook Ledger:** Go to `/wallet` and click "Deposit $1k". This routes you to Stripe. Notice how the frontend securely updates balances based on backend validation.

<br/>
<div align="center">
  <i>Engineered with passion for the Hackathon. 🚀</i>
</div>
