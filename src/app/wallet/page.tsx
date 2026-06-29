"use client";

import { useRef, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowDownCircle, ArrowUpCircle, Clock, TrendingUp,
  ShieldCheck, Lock, Send, Download, FileText,
  Zap, ChevronRight, Activity, BarChart3, Plus, Hexagon, Cpu, PieChart
} from "lucide-react";
import { TrustRing } from "@/components/features/trust/TrustBadge";
import { useAudio } from "@/lib/AudioProvider";
import { walletAPI, paymentAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { clsx } from "clsx";

gsap.registerPlugin(useGSAP);

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TRANSACTIONS = [
  {
    id: "TX-001",
    type: "in" as const,
    title: "Contract Settled — AI Agent Arch.",
    meta: "From: Acme Corp · TrustHash: 0x4f2a...",
    amount: 5000,
    date: "2026.06.28 · 14:32",
    status: "settled",
  },
  {
    id: "TX-002",
    type: "out" as const,
    title: "Platform Fee Deduction",
    meta: "Auto-deducted · 3.5% protocol fee",
    amount: -175,
    date: "2026.06.28 · 14:32",
    status: "settled",
  },
  {
    id: "TX-003",
    type: "pending" as const,
    title: "Milestone Release — FinTrust App",
    meta: "Awaiting client verification · M2/4",
    amount: 2500,
    date: "2026.06.26 · 09:11",
    status: "pending",
  },
  {
    id: "TX-004",
    type: "in" as const,
    title: "Mentorship Session — Sarah Chen",
    meta: "60min Neural Transfer · Rated 5.0",
    amount: 150,
    date: "2026.06.25 · 16:00",
    status: "settled",
  },
  {
    id: "TX-005",
    type: "out" as const,
    title: "Withdrawal to External Wallet",
    meta: "Bank transfer · Ref #TF-8812",
    amount: -3000,
    date: "2026.06.22 · 10:45",
    status: "settled",
  },
  {
    id: "TX-006",
    type: "in" as const,
    title: "Smart Contract Audit — DeFi X",
    meta: "From: DeFi Protocol X · Phase 1",
    amount: 7500,
    date: "2026.06.20 · 08:03",
    status: "settled",
  },
];

const ESCROW_ITEMS = [
  {
    id: "ESC-001",
    project: "AI Agent Architecture",
    client: "Acme Corp",
    sub: "3 milestones remaining",
    amount: 3000,
    status: "locked" as const,
  },
  {
    id: "ESC-002",
    project: "FinTrust Mobile App",
    client: "FinTrust Labs",
    sub: "M2 in client review",
    amount: 2500,
    status: "pending" as const,
  },
  {
    id: "ESC-003",
    project: "Solidity Audit — Phase 2",
    client: "DeFi Protocol X",
    sub: "On track",
    amount: 2000,
    status: "locked" as const,
  },
];

const EARNINGS = [
  { label: "Contracts", amount: 12500, pct: 78, color: "bg-cyan-400" },
  { label: "Mentorship", amount: 840, pct: 18, color: "bg-purple-400" },
  { label: "Referrals", amount: 200, pct: 5, color: "bg-emerald-400" },
];

// Sparkline path points (normalized 0-1, y inverted)
const CHART_POINTS = [
  { x: 0, y: 0.78 }, { x: 0.1, y: 0.72 }, { x: 0.2, y: 0.68 },
  { x: 0.3, y: 0.58 }, { x: 0.4, y: 0.52 }, { x: 0.5, y: 0.44 },
  { x: 0.6, y: 0.38 }, { x: 0.7, y: 0.30 }, { x: 0.85, y: 0.22 },
  { x: 1.0, y: 0.14 },
];

type FilterTab = "all" | "in" | "out" | "pending";

// ─── Sub-Components ───────────────────────────────────────────────────────────

function TxIcon({ type }: { type: "in" | "out" | "pending" }) {
  const map = {
    in:      { Icon: ArrowDownCircle, cls: "bg-emerald-500/10 text-emerald-400" },
    out:     { Icon: ArrowUpCircle,   cls: "bg-white/5 text-gray-300" },
    pending: { Icon: Clock,           cls: "bg-amber-500/10 text-amber-400" },
  };
  const { Icon, cls } = map[type];
  return (
    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", cls)}>
      <Icon size={18} strokeWidth={1.5} />
    </div>
  );
}

function StatusPill({ status }: { status: "locked" | "pending" | "settled" }) {
  const map = {
    locked:  "bg-indigo-500/10 border-indigo-400/30 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]",
    pending: "bg-amber-500/10 border-amber-400/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    settled: "bg-emerald-500/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-cyber uppercase tracking-widest border", map[status])}>
      {status === "locked" && <Lock size={9} />}
      {status === "pending" && <Clock size={9} />}
      {status === "settled" && <ShieldCheck size={9} />}
      {status}
    </span>
  );
}

// ─── 3D Hover Tilt Hook ───────────────────────────────────────────────────────────
function useTilt() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const container = useRef<HTMLDivElement>(null);
  const { playClick, playHover } = useAudio();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [wallet, setWallet] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  
  const tilt = useTilt();

  useEffect(() => {
    walletAPI.getWallet()
      .then(res => setWallet(res.data))
      .catch(err => console.error("Failed to load wallet", err));
  }, []);

  const handleDeposit = async () => {
    try {
      setLoadingPayment(true);
      const res = await paymentAPI.createSession(1000); // Demo $1000 deposit
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Payment failed to initialize");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      setLoadingPayment(true);
      const res = await paymentAPI.createConnectAccount();
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error("Failed to start Stripe onboarding");
    } finally {
      setLoadingPayment(false);
    }
  };

  // Derived values
  const liquidBalance = wallet ? wallet.liquid_balance : 0;
  const escrowBalance = wallet ? wallet.escrow_locked : 0;
  const totalBalance  = liquidBalance + escrowBalance;
  const netEarnings   = EARNINGS.reduce((a, e) => a + e.amount, 0) - 492; // fees

  const filteredTx = TRANSACTIONS.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "in") return tx.type === "in";
    if (filter === "out") return tx.type === "out";
    if (filter === "pending") return tx.type === "pending";
  });

  // Build SVG path for chart
  const W = 560; const H = 140;
  const pts = CHART_POINTS.map((p) => `${p.x * W},${p.y * H}`);
  const linePath  = `M${pts.join(" L")}`;
  const areaPath  = `M${pts.join(" L")} L${W},${H} L0,${H} Z`;

  useGSAP(() => {
    gsap.from(".hero-element", {
      y: 50, opacity: 0, duration: 1.2, stagger: 0.1, ease: "power4.out",
    });
    
    gsap.to(".pulse-ring", {
      scale: 1.5,
      opacity: 0,
      duration: 2,
      repeat: -1,
      ease: "power2.out"
    });
  }, { scope: container });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <WebGLBackground />
      <div
        ref={container}
        className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden max-w-7xl mx-auto perspective-1000"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 relative z-20">
          <div>
            <div className="hero-element flex items-center gap-2 mb-3 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full w-fit backdrop-blur-md">
              <div className="relative flex items-center justify-center">
                <Activity size={12} className="text-cyan-400 relative z-10" />
                <div className="pulse-ring absolute inset-0 bg-cyan-400 rounded-full" />
              </div>
              <span className="text-cyan-400 font-cyber text-[10px] uppercase tracking-widest">
                Secure Vault Protocol · Node ID: 0x8f3c...4a2b
              </span>
            </div>
            <h1 className="hero-element text-4xl md:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,1)] flex items-center gap-4">
              Wallet
            </h1>
            <p className="hero-element text-gray-400 mt-2 font-mono text-sm max-w-xl border-l-2 border-cyan-500/50 pl-3">
              Cryptographic asset management &amp; autonomous contract settlement layer.
            </p>
          </div>

          <div className="hero-element flex gap-3">
            <button
              onMouseEnter={playHover}
              onClick={handleStripeConnect}
              disabled={loadingPayment}
              className="h-12 px-6 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-gray-400 font-cyber text-xs uppercase tracking-widest hover:text-white hover:border-white/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 disabled:opacity-50"
            >
              <Download size={15} /> Connect Stripe
            </button>
            <button
              onMouseEnter={playHover}
              onClick={handleDeposit}
              disabled={loadingPayment}
              className="h-12 px-6 flex items-center gap-2 bg-cyan-500/10 backdrop-blur-md border border-cyan-400/40 rounded-xl text-cyan-400 font-cyber text-xs uppercase tracking-widest hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] active:scale-95 disabled:opacity-50"
            >
              <Plus size={15} /> Deposit $1k
            </button>
          </div>
        </div>

        {/* ── Balance Hero (Interactive 3D) ────────────────────────────────────── */}
        <motion.div
          className="hero-element mb-8 perspective-1000"
          onMouseMove={tilt.handleMouseMove}
          onMouseLeave={tilt.handleMouseLeave}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            style={{ 
              rotateX: tilt.rotateX, 
              rotateY: tilt.rotateY,
              transformStyle: "preserve-3d"
            }}
            className="w-full relative"
          >
            <SpotlightCard
              spotlightColor="rgba(34,211,238,0.2)"
              className="p-8 md:p-10 border-cyan-500/30 bg-black/50 backdrop-blur-3xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none" style={{ transform: "translateZ(-50px)" }}>
                <Hexagon size={300} className="animate-[spin_40s_linear_infinite]" />
              </div>
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10" style={{ transform: "translateZ(30px)" }}>
                {/* Liquid */}
                <div className="pt-6 md:pt-0 first:pt-0 group cursor-pointer" onMouseEnter={playHover} onClick={playClick}>
                  <div className="text-[10px] font-cyber text-cyan-400/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" /> Liquid Balance
                  </div>
                  <p className="text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-transform origin-left">
                    ${liquidBalance.toLocaleString()}.00
                  </p>
                  <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded w-fit">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400">+$1,240 this cycle</span>
                  </div>
                </div>
                {/* Escrow */}
                <div className="pt-6 md:pt-0 md:pl-8 group cursor-pointer" onMouseEnter={playHover} onClick={playClick}>
                  <div className="text-[10px] font-cyber text-amber-400/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" /> Escrow Locked
                  </div>
                  <p className="text-5xl font-display font-black tracking-tight text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform origin-left">
                    ${escrowBalance.toLocaleString()}.00
                  </p>
                  <div className="flex items-center gap-2 mt-3 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded w-fit">
                    <Lock size={12} className="text-amber-400" />
                    <span className="text-[10px] font-mono text-amber-400">3 contracts active</span>
                  </div>
                </div>
                {/* Total */}
                <div className="pt-6 md:pt-0 md:pl-8 group cursor-pointer" onMouseEnter={playHover} onClick={playClick}>
                  <div className="text-[10px] font-cyber text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" /> Total Value
                  </div>
                  <p className="text-5xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform origin-left">
                    ${totalBalance.toLocaleString()}.00
                  </p>
                  <div className="flex items-center gap-2 mt-3 bg-white/5 border border-white/10 px-2.5 py-1 rounded w-fit">
                    <TrendingUp size={12} className="text-gray-400" />
                    <span className="text-[10px] font-mono text-gray-400">+8.3% vs last cycle</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>

        {/* ── Main Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Capital Flow Chart */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <TrendingUp size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Capital Flow</h3>
                    <p className="font-cyber text-[9px] uppercase tracking-widest text-gray-500">Trailing 30 Days Volatility</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/50 border border-white/10 p-1 rounded-lg">
                  {['1W', '1M', '1Y'].map(time => (
                    <button key={time} className={clsx("px-3 py-1 text-[10px] font-cyber uppercase tracking-widest rounded-md transition-colors", time === '1M' ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-white")}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative h-48 w-full group">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {["$20k", "$15k", "$10k", "$5k"].map((label) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-600 w-8 text-right">{label}</span>
                      <div className="flex-1 h-[1px] bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors" />
                    </div>
                  ))}
                </div>

                {/* SVG Chart */}
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="absolute inset-0 w-full h-full pl-11"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <motion.path
                    d={areaPath}
                    fill="url(#chartGrad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                  />
                  <motion.path
                    d={linePath}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                  />
                  {CHART_POINTS.map((p, i) => (
                    <motion.circle
                      key={i}
                      cx={p.x * W}
                      cy={p.y * H}
                      r="5"
                      fill="#000"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.5 + i * 0.05, type: "spring" }}
                      className="drop-shadow-[0_0_10px_rgba(34,211,238,1)] cursor-crosshair hover:stroke-white hover:fill-cyan-400 transition-colors"
                      onMouseEnter={playHover}
                    />
                  ))}
                </svg>
              </div>

              <div className="flex justify-between mt-4 pl-11">
                {["Jun 01", "Jun 08", "Jun 15", "Jun 22", "Jun 28"].map((d, i) => (
                  <span
                    key={d}
                    className={clsx(
                      "text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded",
                      i === 4 ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-600"
                    )}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </SpotlightCard>

            {/* Transaction Ledger */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <BarChart3 size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Transaction Ledger</h3>
                    <p className="font-cyber text-[9px] uppercase tracking-widest text-gray-500">Cryptographically Verified</p>
                  </div>
                </div>
                <button 
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="h-8 px-4 text-[10px] font-cyber text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-all rounded-lg border border-white/10"
                >
                  Export CSV <ChevronRight size={12} />
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-6 bg-black/50 p-1.5 rounded-xl border border-white/5 w-fit">
                {(["all", "in", "out", "pending"] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setFilter(tab); playClick(); }}
                    onMouseEnter={playHover}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-[10px] font-cyber uppercase tracking-widest transition-all",
                      filter === tab
                        ? "bg-purple-500/20 border-purple-400/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Transactions list */}
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {filteredTx.map((tx, i) => (
                    <motion.div
                      layout
                      key={tx.id}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                      onMouseEnter={playHover}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <TxIcon type={tx.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-cyan-100 transition-colors">{tx.title}</p>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5 truncate">{tx.meta}</p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 flex flex-col items-end pl-4">
                        <p className={clsx(
                          "text-base font-display tracking-tight font-medium",
                          tx.type === "in" ? "text-emerald-400" :
                          tx.type === "out" ? "text-white" : "text-amber-400"
                        )}>
                          {tx.type === "out" ? "" : "+"}
                          ${Math.abs(tx.amount).toLocaleString()}.00
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 mt-0.5">{tx.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredTx.length === 0 && (
                  <div className="py-12 text-center text-gray-500 font-mono text-xs border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    No cryptographic records found matching criteria.
                  </div>
                )}
              </div>
            </SpotlightCard>

            {/* Cycle Earnings */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl">
              <h3 className="font-cyber font-bold text-xs uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
                <BarChart3 size={13} /> Cycle Earnings
              </h3>
              <div className="space-y-4">
                {EARNINGS.map((e, i) => (
                  <div key={e.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-mono text-white/60">{e.label}</span>
                      <span className="text-sm font-bold text-white">${e.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        className={clsx("h-full rounded-full relative", e.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${e.pct}%` }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.2, ease: "easeOut" }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-white/[0.06] flex justify-between items-center bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                <div>
                  <span className="text-[10px] font-cyber text-emerald-400/80 uppercase tracking-widest block mb-1">Net (after fees)</span>
                  <span className="text-[9px] font-mono text-gray-500">Auto-settled via Smart Contract</span>
                </div>
                <span className="text-2xl font-display font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">${netEarnings.toLocaleString()}</span>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* AI Neural Audit USP Feature */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
               {/* Animated Sonar Background */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.03] mix-blend-screen group-hover:opacity-[0.08] transition-opacity duration-1000">
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-emerald-400"
                  />
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [1, 0] }}
                    transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-emerald-400"
                  />
               </div>

               <div className="flex items-center justify-between mb-4 relative z-10">
                 <h3 className="font-cyber font-bold text-xs uppercase tracking-widest text-emerald-400/80 flex items-center gap-2">
                   <Cpu size={14} /> AI Neural Audit
                 </h3>
                 <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" /> Active
                 </span>
               </div>
               
               <p className="font-mono text-[10px] text-white/50 mb-6 leading-relaxed relative z-10">
                 Proprietary Neural Engine scanning smart contracts for vulnerabilities & anomaly signatures in real-time.
               </p>
               
               <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div>
                   <span className="block text-[9px] font-cyber text-gray-500 uppercase tracking-widest mb-1">Scanned</span>
                   <span className="text-xl font-display text-white">14,204</span>
                 </div>
                 <div>
                   <span className="block text-[9px] font-cyber text-gray-500 uppercase tracking-widest mb-1">Prevented</span>
                   <span className="text-xl font-display text-emerald-400">0</span>
                 </div>
               </div>
            </SpotlightCard>

            {/* Quick Actions */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl">
              <h3 className="font-cyber font-bold text-xs uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                <Zap size={13} /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Send", Icon: Send, activeCls: "group-hover:text-cyan-400" },
                  { label: "Receive", Icon: Download, activeCls: "group-hover:text-purple-400" },
                  { label: "Escrow", Icon: Lock, activeCls: "group-hover:text-emerald-400" },
                  { label: "Invoice", Icon: FileText, activeCls: "group-hover:text-amber-400" },
                ].map(({ label, Icon, activeCls }) => (
                  <button
                    key={label}
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="flex flex-col items-center gap-3 py-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-transparent group-hover:border-white/10 bg-black/20 transition-all">
                      <Icon size={18} strokeWidth={1.5} className={clsx("text-white/60 transition-colors", activeCls)} />
                    </div>
                    <span className="text-[10px] font-cyber text-white/60 group-hover:text-white uppercase tracking-widest transition-colors">{label}</span>
                  </button>
                ))}
              </div>
            </SpotlightCard>

            {/* Escrow Vault */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl">
              <h3 className="font-cyber font-bold text-xs uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
                <Lock size={13} /> Active Escrows
              </h3>
              <div className="space-y-2">
                {ESCROW_ITEMS.map((item, i) => (
                  <div
                    key={item.id}
                    onMouseEnter={playHover}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                    <div className="min-w-0 flex-1 mr-3 relative z-10">
                      <p className="text-sm font-medium text-white/90 truncate group-hover:text-amber-400 transition-colors">{item.project}</p>
                      <p className="text-[11px] font-mono text-white/50 mt-0.5">{item.client} · {item.sub}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5 relative z-10">
                      <p className="text-base font-display font-medium text-white group-hover:text-amber-400 transition-colors">${item.amount.toLocaleString()}</p>
                      <StatusPill status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-white/[0.06]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-cyber text-gray-500 uppercase tracking-widest">Total Locked Value</span>
                  <span className="text-lg font-display font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">${escrowBalance.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((escrowBalance / totalBalance) * 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 blur-sm animate-pulse" />
                  </motion.div>
                </div>
                <p className="text-[10px] font-mono text-gray-500 mt-2 text-right">
                  {Math.round((escrowBalance / totalBalance) * 100)}% of total vault value
                </p>
              </div>
            </SpotlightCard>
            
            {/* Asset Allocation */}
            <SpotlightCard className="hero-element p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl">
              <h3 className="font-cyber font-bold text-xs uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
                <PieChart size={13} /> Asset Allocation
              </h3>
              
              <div className="flex items-center justify-center py-4 relative">
                <div className="w-32 h-32 relative">
                  {/* Outer Rings */}
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    
                    {/* USDC - 65% */}
                    <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#22d3ee" strokeWidth="8"
                      strokeDasharray="251.3" strokeDashoffset="88.0" strokeLinecap="round"
                      initial={{ strokeDashoffset: 251.3 }}
                      animate={{ strokeDashoffset: 88.0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    />
                    
                    {/* ETH - 20% */}
                    <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="8"
                      strokeDasharray="251.3" strokeDashoffset="201.1" strokeLinecap="round"
                      className="origin-center rotate-[234deg] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      initial={{ strokeDashoffset: 251.3 }}
                      animate={{ strokeDashoffset: 201.1 }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    />

                    {/* TRST - 15% */}
                    <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#34d399" strokeWidth="8"
                      strokeDasharray="251.3" strokeDashoffset="213.6" strokeLinecap="round"
                      className="origin-center rotate-[306deg] drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      initial={{ strokeDashoffset: 251.3 }}
                      animate={{ strokeDashoffset: 213.6 }}
                      transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                  
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-display font-bold text-2xl drop-shadow-md">3</span>
                    <span className="text-[9px] font-cyber text-gray-500 uppercase tracking-widest mt-1">Assets</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {[
                  { label: "USDC", pct: "65%", val: "$13,221", color: "bg-cyan-400" },
                  { label: "ETH", pct: "20%", val: "$4,068", color: "bg-purple-400" },
                  { label: "TRST", pct: "15%", val: "$3,051", color: "bg-emerald-400" },
                ].map(asset => (
                  <div key={asset.label} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={clsx("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", asset.color.replace('bg-', 'text-'))}>
                         <div className={clsx("w-full h-full rounded-full", asset.color)} />
                      </div>
                      <span className="text-xs font-medium text-white group-hover:text-cyan-100 transition-colors">{asset.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-white/50">{asset.pct}</span>
                      <span className="text-sm font-display text-white w-16 text-right font-medium">{asset.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
