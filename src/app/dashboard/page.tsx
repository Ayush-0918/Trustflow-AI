"use client";

import { useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { TrustScoreGauge } from "@/components/charts/TrustScoreGauge";
import { AreaChartGradient } from "@/components/charts/AreaChartGradient";
import { PhysicsSandbox } from "@/components/physics/PhysicsSandbox";
import { projectsAPI, walletAPI, trustAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Clock, CheckCircle2, AlertCircle, FolderKanban, Zap, Activity, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { WorldNetworkMap } from "@/components/ui/WorldNetworkMap";
import { DASHBOARD_KPIS, FRAUD_DETECTION_RESULTS, TIME_SERIES_DATA } from "@/lib/mockData";
import { motion } from "framer-motion";

function HoloCard({ children, className, spotlightColor }: { children: React.ReactNode, className?: string, spotlightColor?: string }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateX(-((y - centerY) / centerY) * 4);
    setRotateY(((x - centerX) / centerX) * 4);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className={`relative group ${className || ""}`}
    >
       {/* 3D Inner Content */}
       <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="w-full h-full relative z-10">
         <SpotlightCard spotlightColor={spotlightColor} className="w-full h-full p-8 border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] transition-shadow duration-500">
           {children}
         </SpotlightCard>
       </div>
    </motion.div>
  );
}

const STATUS_CONFIG = {
  open:        { label: "INITIALIZED",   icon: Clock,         className: "text-cyan-400 border-cyan-400/50 bg-cyan-400/10" },
  in_progress: { label: "PROCESSING",    icon: Zap,           className: "text-purple-400 border-purple-400/50 bg-purple-400/10" },
  review:      { label: "VERIFYING",     icon: AlertCircle,   className: "text-pink-400 border-pink-400/50 bg-pink-400/10" },
  completed:   { label: "EXECUTED",      icon: CheckCircle2,  className: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10" },
} as const;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const container = useRef<HTMLDivElement>(null);

  const { data: projects, isLoading: projectsLoading, isError: projectsError } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => projectsAPI.myProjects().then((r) => r.data),
  });

  const { data: wallet, isLoading: walletLoading, isError: walletError } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletAPI.getWallet().then((r) => r.data),
  });

  const { data: trust, isLoading: trustLoading, isError: trustError } = useQuery({
    queryKey: ["trust-score"],
    queryFn: () => trustAPI.getScore().then((r) => r.data),
  });

  const revenueData = useMemo(() => 
    TIME_SERIES_DATA.map((d, i) => ({
      date: new Date(2026, 5, i + 1), // stable, not random
      value: d.revenue
    })).sort((a, b) => a.date.getTime() - b.date.getTime()),
    []
  );

  const recentProjects = useMemo(() => projects?.slice(0, 5) ?? [], [projects]);

  useGSAP(() => {
    // Cinematic Terminal Boot Sequence
    gsap.from(".stagger-item", {
      rotateX: -45,
      y: 100,
      opacity: 0,
      scale: 0.8,
      duration: 1.2,
      stagger: 0.15,
      ease: "elastic.out(1, 0.7)",
      delay: 0.1,
    });

    gsap.from(".hero-text", {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
    });
    
    gsap.fromTo(".scan-line", 
      { top: "-10%" },
      { top: "110%", duration: 3, repeat: -1, ease: "linear" }
    );
  }, { scope: container });

  return (
    <AppShell>
      <WebGLBackground />
      <div ref={container} className="max-w-7xl mx-auto px-6 md:px-8 xl:px-10 py-8 lg:py-12 space-y-8 md:space-y-10 relative z-10 overflow-x-hidden">
          
          {/* Cinematic Hero Area */}
          <div className="stagger-item relative w-full h-[550px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group bg-black">
              {/* Deep Space Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />

              {/* The 3D Globe Background */}
              <div className="absolute top-[-10%] bottom-[10%] right-[-5%] w-[100%] md:right-[2%] md:w-[55%] z-0 opacity-100 pointer-events-auto flex items-center justify-center">
                <WorldNetworkMap className="w-full h-full" />
              </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 p-8 md:p-12 flex flex-col justify-between pointer-events-none">
              {/* Top Section: Header */}
              <div className="flex justify-between items-start w-full pointer-events-none">
                {/* Header inside Hero */}
                <div className="max-w-2xl hero-text pointer-events-auto mt-4">
                  <h2 className="text-5xl md:text-7xl font-display font-black tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,1)] text-white leading-none">
                    NETWORK <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mt-1 inline-block">
                      TOPOLOGY
                    </span>
                  </h2>
                  <div className="inline-flex items-center gap-3 px-4 py-2 mt-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    Live Cryptographic Handshakes
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 w-full pointer-events-auto">
                {/* Network Health Card */}
                <div className="flex flex-row items-center gap-8 md:gap-10 bg-black/20 backdrop-blur-3xl border border-white/[0.06] p-6 pr-8 rounded-3xl shadow-2xl transition-all relative overflow-hidden group">
                   
                   <div className="flex flex-wrap gap-8 md:gap-10 relative z-10">
                     <div className="space-y-2">
                       <p className="font-mono text-[10px] md:text-xs text-white/50 uppercase tracking-widest flex items-center gap-2">
                         <Zap size={14} className="text-cyan-400" /> Active Nodes
                       </p>
                       <p className="font-display font-black text-3xl md:text-4xl text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">14,204</p>
                     </div>
                     <div className="w-[1px] h-16 bg-white/[0.06] hidden md:block" />
                     <div className="space-y-2">
                       <p className="font-mono text-[10px] md:text-xs text-white/50 uppercase tracking-widest flex items-center gap-2">
                         <Activity size={14} className="text-purple-400" /> Global Hashrate
                       </p>
                       <p className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-[0_2px_10px_rgba(168,85,247,0.3)]">8.4 EH/s</p>
                     </div>
                   </div>

                   {/* The Orbit next to the stats inside the card */}
                   <div className="hidden lg:flex relative w-20 h-20 items-center justify-center pointer-events-auto opacity-80 shrink-0 z-10 ml-2">
                     {/* Outer rotating dashed ring */}
                     <div className="absolute inset-0 border-[1px] border-dashed border-cyan-500/40 rounded-full animate-[spin_20s_linear_infinite]" />
                     {/* Inner rotating solid ring */}
                     <div className="absolute inset-2 border border-purple-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                     {/* Center pulsing core */}
                     <div className="absolute inset-7 bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 rounded-full backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
                       <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
                     </div>
                     {/* Connecting lines or crosshair */}
                     <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                     <div className="absolute h-full w-[1px] bg-cyan-500/20" />
                     {/* Small decorative nodes */}
                     <div className="absolute top-0 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,1)]" />
                     <div className="absolute bottom-0 w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_rgba(168,85,247,1)]" />
                     <div className="absolute left-0 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,1)]" />
                     <div className="absolute right-0 w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_rgba(168,85,247,1)]" />
                   </div>

                </div>

                <Link href="/projects/new" className="group relative h-14 md:h-16 flex justify-center items-center px-8 md:px-10 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-cyber text-[11px] font-bold uppercase tracking-widest overflow-hidden hover:bg-cyan-500/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] backdrop-blur-md">
                  <div className="absolute inset-0 bg-cyan-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors">
                    Deploy Contract
                  </span>
                </Link>
              </div>

            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Trust Score Gauge Card */}
            <div className="stagger-item md:col-span-1 h-full" style={{ perspective: "1500px" }}>
              <HoloCard spotlightColor="rgba(34, 211, 238, 0.15)" className="h-full flex flex-col items-center justify-center">
                <TrustScoreGauge score={trust?.overall_score ?? user?.trust_score ?? 50} size={180} strokeWidth={10} />
                <div className="mt-8 text-center" style={{ transform: "translateZ(40px)" }}>
                  <h3 className="font-cyber font-bold tracking-widest text-lg flex items-center justify-center gap-2 uppercase">
                    <Zap size={16} className="text-cyan-400 fill-cyan-400 animate-pulse" /> AI Trust Index
                  </h3>
                  {!user?.identity_verified && (
                    <Link href="/video-verify" className="text-xs font-mono text-purple-400 hover:text-purple-300 mt-3 inline-block drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                      [ INITIATE BIOMETRIC SCAN ]
                    </Link>
                  )}
                </div>
              </HoloCard>
            </div>

            {/* Revenue Area Chart */}
            <div className="stagger-item md:col-span-2 h-full" style={{ perspective: "1500px" }}>
              <HoloCard spotlightColor="rgba(168, 85, 247, 0.1)" className="h-full flex flex-col">
                <div className="mb-2" style={{ transform: "translateZ(20px)" }}>
                  <h3 className="font-cyber font-bold tracking-widest uppercase text-gray-400 text-xs">Capital Flow</h3>
                </div>
                <div className="flex-1 -mx-4 -mb-4 min-h-[240px]">
                  <AreaChartGradient 
                    data={revenueData} 
                    title=""
                    subtitle=""
                    valuePrefix="$"
                    height={240}
                  />
                </div>
              </HoloCard>
            </div>
          </div>

          {/* Secondary Grid: Physics & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Wallet Stat */}
            <div className="stagger-item h-full" style={{ perspective: "1500px" }}>
              <HoloCard spotlightColor="rgba(34, 211, 238, 0.1)" className="h-full flex flex-col justify-between p-0">
                <div className="space-y-2" style={{ transform: "translateZ(30px)" }}>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <span className="text-cyan-400 font-display font-bold text-xl">$</span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest">Liquid Assets</p>
                  <p className="text-5xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">${wallet?.balance?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/10" style={{ transform: "translateZ(20px)" }}>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-gray-400">Escrow Locked</span>
                    <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">${wallet?.pending_balance?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </HoloCard>
            </div>

            {/* Active Projects Stat */}
            <div className="stagger-item h-full" style={{ perspective: "1500px" }}>
              <HoloCard spotlightColor="rgba(168, 85, 247, 0.1)" className="h-full flex flex-col justify-between p-0">
                <div className="space-y-2" style={{ transform: "translateZ(30px)" }}>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-purple-400">
                    <Activity size={24} />
                  </div>
                  <p className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest">Validation Jobs</p>
                  <p className="text-5xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                    {DASHBOARD_KPIS.validationJobs.value}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/10" style={{ transform: "translateZ(20px)" }}>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-gray-400">Queue Trend</span>
                    <span className="text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{DASHBOARD_KPIS.validationJobs.change}</span>
                  </div>
                </div>
              </HoloCard>
            </div>

            {/* Interactive Physics Sandbox (Matter.js) */}
            <SpotlightCard className="stagger-item md:col-span-2 xl:col-span-1 h-full min-h-[300px] p-0 overflow-hidden border-white/5 bg-black/20 backdrop-blur-2xl">
              <div className="absolute inset-0 z-0">
                <PhysicsSandbox />
              </div>
            </SpotlightCard>
          </div>

          {/* Third Grid: Contracts & Fraud */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Recent Contracts List */}
            <div className="stagger-item xl:col-span-1 h-full" style={{ perspective: "1500px" }}>
              <HoloCard className="h-full !p-0 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/60 relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] scan-line pointer-events-none opacity-50 z-20" />
                  <h2 className="text-lg font-cyber font-bold tracking-widest uppercase text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Contract Ledger</h2>
                  <Link href="/projects" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest relative z-10">View Registry</Link>
                </div>

                <div className="p-8 space-y-4">
                  {projectsLoading && (
                    <div className="space-y-4 py-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] animate-pulse">
                          <div className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-1/3" />
                            <div className="h-3 bg-white/10 rounded w-1/4" />
                          </div>
                          <div className="w-24 h-6 rounded-full bg-white/5" />
                        </div>
                      ))}
                    </div>
                  )}

                  {(!projects || projects.length === 0) && !projectsLoading && !projectsError && (
                    <div className="text-center py-16 space-y-4" style={{ transform: "translateZ(20px)" }}>
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-gray-500 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <FolderKanban size={32} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl drop-shadow-[0_2px_5px_rgba(0,0,0,1)] text-white">Registry Empty</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mt-2 font-mono">
                          No smart contracts detected on your node. Initialize a new blueprint.
                        </p>
                      </div>
                      <Link href="/projects/new" className="inline-block px-6 py-3 mt-4 text-xs font-cyber font-bold uppercase tracking-widest text-cyan-400 border border-cyan-400/50 rounded-lg hover:bg-cyan-400/10 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        Initialize Contract
                      </Link>
                    </div>
                  )}

                  {recentProjects.map((project: any) => {
                    const cfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
                    const Icon = cfg?.icon || Clock;
                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="flex flex-col md:flex-row md:items-center gap-5 p-5 rounded-2xl border border-white/5 bg-black/20 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 group-hover:border-cyan-400/30 shrink-0 transition-colors relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                          <FolderKanban size={20} />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <p className="font-bold text-lg truncate text-white group-hover:text-cyan-100 transition-colors font-display tracking-wide">{project.title}</p>
                          <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-wider">
                            Deployed {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className={`relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-[10px] font-cyber font-bold uppercase tracking-widest ${cfg?.className}`}>
                          <Icon size={12} />
                          {cfg?.label || project.status}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </HoloCard>
            </div>

            {/* Fraud Detection */}
            <div className="stagger-item xl:col-span-1 h-full" style={{ perspective: "1500px" }}>
              <HoloCard className="h-full !p-0 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/60 relative">
                  <h2 className="text-lg font-cyber font-bold tracking-widest uppercase text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Anomaly Detection</h2>
                  <div className="text-xs font-mono text-pink-400 flex items-center gap-2 uppercase tracking-widest relative z-10 drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]"><ShieldAlert size={14} /> System Active</div>
                </div>

                <div className="p-8 space-y-4" style={{ transform: "translateZ(20px)" }}>
                  {FRAUD_DETECTION_RESULTS.map((result) => (
                     <div key={result.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-black/20 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                       <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${result.action === 'Blocked' ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`}>
                            <ShieldAlert size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-white font-display tracking-wide">{result.type}</p>
                            <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-wider">ID: {result.id}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 sm:ml-auto relative z-10">
                          <div className="text-right">
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Risk</p>
                            <p className={`font-black font-display ${result.riskScore > 80 ? 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-amber-400'}`}>{result.riskScore}/100</p>
                          </div>
                          <div className={`px-3 py-1.5 rounded-md border text-[10px] font-cyber font-bold uppercase tracking-widest ${result.action === 'Blocked' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-amber-500/50 bg-amber-500/10 text-amber-400'}`}>
                            {result.action}
                          </div>
                       </div>
                     </div>
                  ))}
                </div>
              </HoloCard>
            </div>
          </div>
        </div>
    </AppShell>
  );
}
