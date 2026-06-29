<div align="center">
  <img src="https://dummyimage.com/150x150/000000/22d3ee.png&text=TrustFlow+AI" alt="TrustFlow AI Logo" width="120">
  <h1>🌐 TrustFlow AI</h1>
  <p><strong>The First Cryptographically Secure, AI-Governed Freelance Economy</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![CrewAI](https://img.shields.io/badge/CrewAI-Multi--Agent-FF4B4B?style=for-the-badge)](https://crewai.com)
  [![Groq](https://img.shields.io/badge/Groq-LPU_Inference-f35f21?style=for-the-badge)](https://groq.com)
  [![Stripe](https://img.shields.io/badge/Stripe-Connect-6772E5?style=for-the-badge&logo=stripe)](https://stripe.com)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Real_Time-black?style=for-the-badge&logo=socket.io)](https://socket.io/)
  [![Resend](https://img.shields.io/badge/Resend-Email_API-black?style=for-the-badge)](https://resend.com/)
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
- Clients deposit funds directly into a secure Stripe Vault.
- Funds are mathematically locked and auto-released via Webhook listeners when milestones are completed.

### ⚡ 3. Zero-Latency Real-Time Comms (FastAPI + Socket.IO)
No more refreshing the page to see messages. We built a native **ASGI WebSocket server** directly into the Python backend.
- End-to-end real-time chat within project rooms.
- Live typing indicators (`"Anonymous Node is typing..."`).

### 👁️ 4. Cryptographic Identity & Notifications
To combat bots, bad actors, and ensure seamless communication:
- **Twilio SMS OTP:** Hard-verifies user phone numbers globally.
- **Resend Email API:** Delivers beautiful transactional HTML emails for milestone updates and escrow deposits.
- **Cloudinary:** Secure media upload pipelines for portfolio verification and deep-fake checks.

### 🎨 5. 60FPS Cyberpunk UI (Tailwind + Framer Motion)
The UI is a visual masterpiece. Built using **TailwindCSS and Framer Motion**, the interface features glassmorphism, animated backgrounds, and interactive spotlight cards that feel like a high-end crypto trading terminal.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Next.js 14 Client UI] <--> |REST API| FastAPI[FastAPI Backend]
    Client <--> |WebSockets wss://| SocketIO[ASGI Socket Server]
    
    FastAPI <--> |LPU Inference| Groq[Groq API / Llama3]
    FastAPI <--> |Agent Tasks| CrewAI[CrewAI Framework]
    
    FastAPI <--> |Async ORM| DB[(PostgreSQL / SQLite)]
    FastAPI <--> |Escrow Holds| Stripe[Stripe Connect & Checkouts]
    Stripe -.-> |Webhooks| FastAPI
    
    FastAPI <--> |SMS Auth| Twilio[Twilio API]
    FastAPI <--> |Transactional Email| Resend[Resend API]
    Client <--> |Media Upload| Cloudinary[Cloudinary CDN]
```

---

## 🚀 Local Development Setup

To run this platform locally, you must spin up both the Backend and Frontend servers.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Ayush-0918/Trustflow-AI.git
cd Trustflow-AI
```

### 2️⃣ Initialize the FastAPI Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `backend/.env` file with your keys:
```env
# AI
GROQ_API_KEY=gsk_your_key_here

# Payments
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_key_here

# Verification & Notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1234567890
RESEND_API_KEY=re_your_key_here
CLOUDINARY_URL=cloudinary://key:secret@cloud

# Database
DATABASE_URL=sqlite+aiosqlite:///./trustflow.db
```
**Start the API:**
```bash
uvicorn app.main:app --reload
```
*Backend runs at `http://localhost:8000`*

### 3️⃣ Initialize the Next.js Frontend
```bash
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## 🧪 Testing the Innovation (Hackathon Guide)

When reviewing this project, make sure to test these specific flows to see the underlying technology in action:

1. **The Groq Speed Test:** Navigate to `/ai-planner`. Type a project idea. Notice how the AI breaks it down into complex JSON phases in milliseconds, bypassing standard OpenAI latency.
2. **The Socket.IO Room:** Open a project workspace in **two different browser tabs** (side-by-side). Type in the chat box on the right to witness live typing indicators and instant message broadcasting.
3. **The Webhook Ledger:** Go to `/wallet` and click "Deposit $1k". This routes you to Stripe. Notice how the frontend securely updates balances based on backend validation.
4. **Resend Email Triggers:** Escrow deposits and milestone completions automatically trigger beautiful HTML emails via Resend.

<br/>
<div align="center">
  <i>Engineered with passion. 🚀</i>
</div>
