"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ProjectChat } from "@/components/features/ProjectChat";
import { projectsAPI } from "@/lib/api";
import { 
  FolderKanban, 
  ArrowLeft,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Lock,
  Unlock,
  ShieldCheck,
  Activity,
  User,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";

const STATUS_CONFIG = {
  open:        { label: "INITIALIZED",   icon: Clock,         className: "text-cyan-400 border-cyan-400/50 bg-cyan-400/10" },
  in_progress: { label: "PROCESSING",    icon: Zap,           className: "text-purple-400 border-purple-400/50 bg-purple-400/10" },
  review:      { label: "VERIFYING",     icon: AlertCircle,   className: "text-pink-400 border-pink-400/50 bg-pink-400/10" },
  completed:   { label: "EXECUTED",      icon: CheckCircle2,  className: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10" },
} as const;

export default function ContractDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsAPI.get(id).then((r) => r.data),
  });

  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ["project-milestones", id],
    queryFn: () => projectsAPI.getMilestones(id).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[50vh]">
           <div className="animate-spin text-cyan-400"><Zap size={32} /></div>
        </div>
      </AppShell>
    );
  }

  // Fallback for demo purposes if backend doesn't return milestones yet
  const displayMilestones = milestones?.length > 0 ? milestones : [
    { id: 1, title: "System Architecture Design", amount: (project?.budget_max || 5000) * 0.3, status: "completed", updated_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, title: "Smart Contract Implementation", amount: (project?.budget_max || 5000) * 0.4, status: "pending", updated_at: new Date().toISOString() },
    { id: 3, title: "Security Audit & Mainnet Deploy", amount: (project?.budget_max || 5000) * 0.3, status: "locked", updated_at: new Date().toISOString() }
  ];

  const cfg = STATUS_CONFIG[(project?.status as keyof typeof STATUS_CONFIG) || "open"];
  const StatusIcon = cfg?.icon || Clock;

  return (
    <AppShell>
      <div className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
          
          {/* Header */}
          <div className="space-y-4">
            <Link href="/projects" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors font-mono text-xs uppercase tracking-widest">
              <ArrowLeft size={14} /> Return to Registry
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-400/30 rounded-2xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] uppercase">{project?.title || "Contract Detail"}</h1>
                  <p className="text-white/50 font-mono text-sm tracking-widest mt-1">ID: {String(id).padStart(6, '0')} • {project?.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true }) : "recently"}</p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-cyber font-bold uppercase tracking-widest ${cfg?.className}`}>
                <StatusIcon size={14} />
                {cfg?.label || project?.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description */}
              <SpotlightCard className="p-8 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl rounded-3xl transition-all">
                <h3 className="font-cyber font-bold tracking-widest uppercase text-white/50 text-xs mb-4">Operational Directives</h3>
                <p className="text-white/80 leading-relaxed font-mono text-sm">
                  {project?.description || "No description provided for this contract."}
                </p>
              </SpotlightCard>

              {/* Milestones Tracker */}
              <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.1)" className="p-0 overflow-hidden border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl rounded-3xl transition-all">
                <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                  <h2 className="text-lg font-cyber font-bold tracking-widest uppercase flex items-center gap-3 text-white/80">
                    <Activity size={18} className="text-cyan-400" /> Milestone Verification
                  </h2>
                </div>
                <div className="p-8">
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.08] before:to-transparent">
                    {displayMilestones.map((m: any, idx: number) => {
                      const isCompleted = m.status === 'completed';
                      const isPending = m.status === 'pending';
                      return (
                        <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.06] bg-black/60 backdrop-blur-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_rgba(0,0,0,0.5)] z-10">
                            {isCompleted ? (
                               <div className="w-full h-full rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                 <CheckCircle2 size={16} />
                               </div>
                            ) : isPending ? (
                               <div className="w-full h-full rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-pulse">
                                 <Unlock size={14} />
                               </div>
                            ) : (
                               <div className="w-full h-full rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500 border border-white/10">
                                 <Lock size={14} />
                               </div>
                            )}
                          </div>
                          
                          <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-md ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/10' : isPending ? 'border-cyan-500/30 bg-cyan-500/10' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white/90 font-display">{m.title}</span>
                              <span className={`font-mono text-xs font-bold ${isCompleted ? 'text-emerald-400' : isPending ? 'text-cyan-400' : 'text-white/40'}`}>${m.amount}</span>
                            </div>
                            <time className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{format(new Date(m.updated_at), "MMM dd, yyyy HH:mm")}</time>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </SpotlightCard>

            </div>

            <div className="space-y-6">
              {/* Escrow Vault Status */}
              <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl rounded-3xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-cyber font-bold tracking-widest uppercase text-white/90">Escrow Vault</h2>
                    <p className="text-[10px] font-mono text-white/40 uppercase">Secured by TrustFlow</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">Total Allocated Budget</p>
                    <p className="text-3xl font-display font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      ${project?.budget_max || "5000"}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/[0.06] space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-white/60">Locked in Escrow</span>
                      <span className="font-bold text-cyan-400 flex items-center gap-1"><Lock size={12}/> ${(project?.budget_max || 5000) * 0.7}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-white/60">Released Funds</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1"><Unlock size={12}/> ${(project?.budget_max || 5000) * 0.3}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Security Logs Mock */}
              <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.05)" className="p-6 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl rounded-3xl transition-all">
                 <h2 className="text-xs font-cyber font-bold tracking-widest uppercase text-white/50 mb-4">Immutable Ledger Logs</h2>
                 <div className="space-y-4">
                   <div className="flex gap-3">
                     <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] shrink-0" />
                     <div>
                       <p className="text-[11px] font-mono text-white/80">Funds released (Milestone 1)</p>
                       <p className="text-[9px] font-mono text-white/40 uppercase mt-0.5">TxHash: 0x98f...2a1</p>
                     </div>
                   </div>
                   <div className="flex gap-3">
                     <div className="mt-1 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.5)] shrink-0" />
                     <div>
                       <p className="text-[11px] font-mono text-white/80">Contract deployed to Escrow</p>
                       <p className="text-[9px] font-mono text-white/40 uppercase mt-0.5">TxHash: 0x33b...19c</p>
                     </div>
                   </div>
                   <div className="flex gap-3">
                     <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)] shrink-0" />
                     <div>
                       <p className="text-[11px] font-mono text-white/80">Node Identity Verified</p>
                       <p className="text-[9px] font-mono text-white/40 uppercase mt-0.5">TrustScore Engine</p>
                     </div>
                   </div>
                 </div>
              </SpotlightCard>

              {/* Real-Time WebSocket Chat */}
              <ProjectChat projectId={id} />

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
