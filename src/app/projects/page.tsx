"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { motion } from "framer-motion";
import { FolderKanban, Plus, Clock, Zap, AlertCircle, ShieldAlert, Cpu, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DeployTerminalOverlay } from "@/components/ui/DeployTerminalOverlay";
import { useQuery } from "@tanstack/react-query";
import { projectsAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

gsap.registerPlugin(useGSAP);

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
       <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="w-full h-full relative z-10">
         <SpotlightCard spotlightColor={spotlightColor} className="w-full h-full p-6 md:p-8 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl rounded-3xl group-hover:bg-black/30 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all duration-500">
           {children}
         </SpotlightCard>
       </div>
    </motion.div>
  );
}

const STATUS_STYLES: Record<string, any> = {
  in_progress: {
    glow: "rgba(168, 85, 247, 0.15)",
    badge: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    progress: "from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
    icon: "group-hover:text-purple-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 shadow-purple-500/20",
    title: "group-hover:text-purple-100",
    label: "Executing",
    iconType: Zap
  },
  review: {
    glow: "rgba(236, 72, 153, 0.15)",
    badge: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    progress: "from-pink-500 to-rose-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]",
    icon: "group-hover:text-pink-400 group-hover:bg-pink-500/10 group-hover:border-pink-500/20 shadow-pink-500/20",
    title: "group-hover:text-pink-100",
    label: "Verifying",
    iconType: AlertCircle
  },
  open: {
    glow: "rgba(34, 211, 238, 0.15)",
    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    progress: "from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]",
    icon: "group-hover:text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 shadow-cyan-500/20",
    title: "group-hover:text-cyan-100",
    label: "Initialized",
    iconType: Clock
  },
  completed: {
    glow: "rgba(16, 185, 129, 0.15)",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    progress: "from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    icon: "group-hover:text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 shadow-emerald-500/20",
    title: "group-hover:text-emerald-100",
    label: "Settled",
    iconType: FolderKanban
  },
  disputed: {
    glow: "rgba(239, 68, 68, 0.15)",
    badge: "text-red-400 bg-red-500/10 border-red-500/20",
    progress: "from-red-500 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
    icon: "group-hover:text-red-400 group-hover:bg-red-500/10 group-hover:border-red-500/20 shadow-red-500/20",
    title: "group-hover:text-red-100",
    label: "Arbitration",
    iconType: ShieldAlert
  }
};

const MOCK_CONTRACTS = [
  { id: "cnt_098f6bcd46", title: "Freelance React Dev", status: "in_progress", amount: 1500, time: "2 days ago", progress: 65, type: "Time & Materials" },
  { id: "cnt_1a2b3c4d5e", title: "Smart Contract Audit", status: "review", amount: 4200, time: "5 hrs ago", progress: 90, type: "Fixed Milestone" },
  { id: "cnt_9f8e7d6c5b", title: "DeFi Protocol Upgrade", status: "open", amount: 8000, time: "10 mins ago", progress: 10, type: "Bounty" },
  { id: "cnt_4x9p2m7r1a", title: "Zero-Knowledge Rollup", status: "in_progress", amount: 24500, time: "1 week ago", progress: 45, type: "Retainer" },
  { id: "cnt_7v5n3b8k9l", title: "Rust Validator Node", status: "completed", amount: 12000, time: "1 day ago", progress: 100, type: "Fixed Milestone" },
  { id: "cnt_2w4e6r8t0y", title: "AI Model Fine-Tuning", status: "review", amount: 6500, time: "3 hrs ago", progress: 98, type: "Bounty" },
  { id: "cnt_3m5n7b9v1c", title: "Penetration Testing", status: "disputed", amount: 3500, time: "2 weeks ago", progress: 50, type: "Time & Materials" },
  { id: "cnt_8k6l4j2h0g", title: "Tokenomics Design", status: "open", amount: 9000, time: "Just now", progress: 5, type: "Fixed Milestone" },
];

export default function ProjectsPage() {
  const container = useRef<HTMLDivElement>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: apiProjects, isLoading, refetch } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => projectsAPI.myProjects().then((r) => r.data),
  });

  // Map API projects to the card format, fall back to MOCK_CONTRACTS if API returns nothing
  const contracts = useMemo(() => {
    if (apiProjects && apiProjects.length > 0) {
      return apiProjects.map((p: any) => ({
        id: `cnt_${p.id}`,
        title: p.title,
        status: p.status || "open",
        amount: p.agreed_price || p.budget_max || 0,
        time: p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : "Just now",
        progress: p.status === "completed" ? 100 : p.status === "in_progress" ? 50 : p.status === "review" ? 90 : 5,
        type: "Smart Contract",
      }));
    }
    return MOCK_CONTRACTS;
  }, [apiProjects]);

  const handleDeploymentComplete = () => {
    setIsDeploying(false);
    refetch();
  };

  useGSAP(() => {
    gsap.from(".terminal-header", {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
    });

    gsap.from(".contract-card", {
      rotateX: -45,
      y: 100,
      opacity: 0,
      scale: 0.8,
      duration: 1.2,
      stagger: 0.15,
      ease: "elastic.out(1, 0.7)",
      delay: 0.2,
    });
  }, { scope: container });

  return (
    <AppShell>
      <WebGLBackground />
      <div ref={container} className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden max-w-7xl mx-auto">
        
        {/* Terminal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 terminal-header mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest">
              <Cpu size={14} className="animate-pulse" />
              <span>Secure Vault Protocol v3.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              Autonomous Escrow Network
            </h1>
            <p className="text-white/50 mt-3 font-mono text-xs max-w-xl leading-relaxed">
              Cryptographically monitor active vaults, verify AI-driven execution milestones, and mint trustless decentralized agreements.
            </p>
          </div>
          <button 
            onClick={() => setIsDeploying(true)}
            className="group relative h-12 w-full md:w-auto flex justify-center items-center px-8 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-cyber text-[11px] font-bold uppercase tracking-widest overflow-hidden hover:bg-cyan-500/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)]"
          >
            <div className="absolute inset-0 bg-cyan-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors">
              <Plus size={14} strokeWidth={2} /> Initialize Escrow
            </span>
          </button>
        </div>

        <DeployTerminalOverlay 
          isOpen={isDeploying} 
          onClose={() => setIsDeploying(false)} 
          onComplete={handleDeploymentComplete} 
        />

        {/* 3D Blueprint Terminal Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" style={{ perspective: "2000px" }}>
          
          {/* Contracts List */}
          <div className="xl:col-span-2 space-y-6">
            {contracts.map((contract) => {
              const styles = STATUS_STYLES[contract.status] || STATUS_STYLES.open;
              const StatusIcon = styles.iconType;
              return (
              <div key={contract.id} className="contract-card">
                <HoloCard spotlightColor={styles.glow} className="p-0">
                  <Link href={`/projects/${contract.id.toString().replace('cnt_', '')}`} className="block relative overflow-hidden group">
                     {/* Scanning background effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0" />
                     
                     <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                       
                       <div className="flex items-start gap-5">
                          <div className={`w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/40 shrink-0 transition-all duration-500 shadow-xl mt-1 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] ${styles.icon}`}>
                            <FolderKanban size={22} strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <h3 className={`font-display font-bold text-xl tracking-tight text-white transition-colors ${styles.title}`}>
                              {contract.title}
                            </h3>
                            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
                              <span>ID: {contract.id.toUpperCase()}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-white/60">{contract.type}</span>
                            </div>
                          </div>
                       </div>

                       <div className="flex flex-col md:items-end justify-between gap-3 shrink-0">
                          <div className="text-2xl font-display font-black tracking-tight text-white mt-1">
                            ${contract.amount.toLocaleString()}
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex items-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-cyber font-bold uppercase tracking-widest border ${styles.badge}`}>
                               <StatusIcon size={10} strokeWidth={2} /> {styles.label}
                            </span>
                          </div>
                       </div>
                     </div>

                     {/* Progress Bar */}
                     <div className="relative z-10 mt-6 pt-6 border-t border-white/[0.04]" style={{ transform: "translateZ(10px)" }}>
                        <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">
                          <span>Execution Phase</span>
                          <span className={`font-bold transition-colors ${styles.title.replace('group-hover:', '')}`}>{contract.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${contract.progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            className={`h-full rounded-full bg-gradient-to-r relative ${styles.progress}`}
                          >
                             <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/50 blur-sm animate-pulse" />
                          </motion.div>
                        </div>
                     </div>
                  </Link>
                </HoloCard>
              </div>
              )
            })}
          </div>

          {/* Network Health Sidebar */}
          <div className="contract-card">
            <HoloCard spotlightColor="rgba(168, 85, 247, 0.1)" className="h-full">
              <div className="space-y-8" style={{ transform: "translateZ(20px)" }}>
                <div>
                  <h3 className="font-cyber font-bold text-xs tracking-widest uppercase text-white/50 mb-6 border-b border-white/[0.06] pb-5 flex items-center gap-2">
                    <Activity size={14} /> Network Status
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center group cursor-default">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">Active Nodes</span>
                      <span className="text-sm font-bold font-display text-white">42,891</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-default">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">Gas Fee</span>
                      <span className="text-sm font-bold font-display text-emerald-400 flex items-center gap-1.5"><Zap size={12} className="opacity-70" /> 12 Gwei</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-default">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">System Load</span>
                      <span className="text-sm font-bold font-display text-cyan-400">Normal</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-white/[0.06]">
                  <div className="w-full h-36 rounded-2xl bg-white/[0.02] border border-white/[0.04] relative overflow-hidden flex flex-col items-center justify-center group hover:bg-white/[0.04] transition-colors cursor-pointer">
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent group-hover:opacity-40 group-hover:animate-pulse transition-opacity" />
                     <ShieldAlert size={36} strokeWidth={1.5} className="text-cyan-400 opacity-60 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                     <p className="mt-4 text-[9px] font-cyber text-cyan-400/80 uppercase tracking-widest text-center w-full z-10">Engine Active</p>
                  </div>
                </div>
              </div>
            </HoloCard>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
