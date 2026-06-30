"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { motion } from "framer-motion";
import { FolderKanban, ShieldCheck, Clock, Zap, Cpu, Activity, User, Send, CheckCircle2, ChevronRight, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useQuery } from "@tanstack/react-query";
import { projectsAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import io from "socket.io-client";

// HoloCard for 3D tilt effect
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
         <SpotlightCard spotlightColor={spotlightColor} className={`w-full h-full p-0 border-white/[0.06] bg-black/20 backdrop-blur-3xl shadow-2xl rounded-3xl group-hover:bg-black/30 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all duration-500 overflow-hidden ${className || ""}`}>
           <div className="w-full h-full flex flex-col">
             {children}
           </div>
         </SpotlightCard>
       </div>
    </motion.div>
  );
}

gsap.registerPlugin(useGSAP);

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const isMock = isNaN(Number(idStr));
  const projectId = isMock ? 0 : parseInt(idStr, 10);
  const container = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsAPI.get(projectId).then((r) => r.data),
    enabled: !isMock,
  });

  const { data: milestones, isLoading: loadingMilestones } = useQuery({
    queryKey: ["project-milestones", projectId],
    queryFn: () => projectsAPI.getMilestones(projectId).then((r) => r.data),
    enabled: !isMock,
  });

  const { data: initialMessages, isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["project-messages", projectId],
    queryFn: () => projectsAPI.getMessages(projectId).then((r) => r.data),
    enabled: !isMock,
  });

  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  useEffect(() => {
    if (initialMessages) {
      setLiveMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (isMock || !user) return;
    const socketURL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
    const socket = io(socketURL, { path: "/socket.io" });
    
    socket.emit("join_project", { project_id: projectId });

    socket.on("new_message", (msg) => {
      if (msg.project_id === projectId) {
        setLiveMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, isMock, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages]);

  useGSAP(() => {
    gsap.from(".detail-card", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, { scope: container });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isMock) return;
    const toastId = toast.loading("Encrypting transmission...");
    try {
      await projectsAPI.sendMessage(projectId, chatInput);
      setChatInput("");
      toast.success("Message sent", { id: toastId });
    } catch (err) {
      toast.error("Failed to send message", { id: toastId });
    }
  };

  if (isMock) {
    return (
      <AppShell>
        <WebGLBackground />
        <div className="flex h-full items-center justify-center p-10 relative z-10 text-center">
          <SpotlightCard className="p-10 max-w-md w-full bg-black/40 border-cyan-500/30">
             <AlertCircle size={48} className="text-cyan-400 mx-auto mb-4" />
             <h2 className="text-2xl font-display font-bold text-white mb-2">Simulation Mode</h2>
             <p className="text-gray-400 font-mono text-sm mb-6">This is a mock contract. Details are unretrievable from the live network.</p>
             <button onClick={() => router.back()} className="px-6 py-2 bg-cyan-500/20 text-cyan-400 rounded-full font-cyber text-xs uppercase tracking-widest hover:bg-cyan-500/30">
               Return to Grid
             </button>
          </SpotlightCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <WebGLBackground />
      <div ref={container} className="p-4 md:p-8 h-full relative z-10 overflow-y-auto max-w-[1600px] mx-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 text-white/50 text-xs font-mono uppercase tracking-widest">
          <button onClick={() => router.back()} className="hover:text-cyan-400 transition-colors">Projects</button>
          <ChevronRight size={12} />
          <span className="text-cyan-400 font-bold">ID_{projectId}</span>
        </div>

        {loadingProject ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={40} className="text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 flex-1">
            
            {/* COLUMN 1: Overview */}
            <div className="lg:col-span-4 lg:h-[calc(100vh-160px)] min-h-[400px]">
              <HoloCard className="h-full detail-card">
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Gradient header banner */}
                  <div className="relative p-6 pb-4 shrink-0 border-b border-white/5" style={{background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(0,0,0,0) 60%)'}}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <FolderKanban size={20} className="text-cyan-400" />
                    </div>
                    <h1 className="text-lg font-display font-black text-white leading-snug mb-3 [overflow-wrap:anywhere]">{project?.title}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-cyber text-[9px] text-white uppercase tracking-widest">
                        {project?.status}
                      </span>
                      {project?.budget_max && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg font-cyber text-[9px] text-emerald-400 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          ${project.budget_min?.toLocaleString()} – ${project.budget_max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 custom-scrollbar">
                    {/* Description */}
                    <div>
                      <p className="text-[10px] font-cyber uppercase tracking-widest text-gray-500 mb-2">Brief</p>
                      <p className="text-gray-300 font-mono text-xs leading-relaxed">
                        {project?.description || "No description provided."}
                      </p>
                    </div>

                    {/* Parties */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-cyber uppercase tracking-widest text-gray-500 mb-3">Nodes Involved</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                            <User size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{project?.client?.username || "Client Node"}</p>
                            <p className="text-[9px] font-cyber text-cyan-400 uppercase tracking-widest">Deployer</p>
                          </div>
                          <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                            <Cpu size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{project?.freelancer?.username || "Awaiting Node"}</p>
                            <p className="text-[9px] font-cyber text-purple-400 uppercase tracking-widest">Executor</p>
                          </div>
                          <div className={`ml-auto w-2 h-2 rounded-full shrink-0 ${project?.freelancer ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {project?.skills_required?.length > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-cyber uppercase tracking-widest text-gray-500 mb-3">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.skills_required.map((skill: string) => (
                            <span key={skill} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[10px] rounded-lg hover:bg-purple-500/20 transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deadline */}
                    {project?.deadline && (
                      <div className="pt-4 border-t border-white/5 flex items-center gap-3 p-3 bg-amber-500/5 border-amber-500/10 rounded-xl">
                        <Clock size={14} className="text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-cyber text-amber-400 uppercase tracking-widest">Deadline</p>
                          <p className="text-xs text-white font-mono mt-0.5">
                            {new Date(project.deadline).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </HoloCard>
            </div>

            {/* COLUMN 2: Escrow / Milestones */}
            <div className="lg:col-span-4 lg:h-[calc(100vh-160px)] min-h-[400px]">
              <HoloCard spotlightColor="rgba(34, 211, 238, 0.1)" className="h-full detail-card">
                <div className="p-5 h-full flex flex-col">
                  {/* Header with progress */}
                  <div className="flex items-center justify-between mb-1 shrink-0">
                    <h2 className="font-display font-bold text-base text-white uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={16} className="text-cyan-400" />
                      Escrow Vault
                    </h2>
                    {milestones?.length > 0 && (
                      <span className="text-[9px] font-cyber text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
                        {milestones.filter((m: any) => m.status === 'completed').length}/{milestones.length} DONE
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {milestones?.length > 0 && (
                    <div className="mb-5 shrink-0">
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                          style={{ width: `${(milestones.filter((m: any) => m.status === 'completed').length / milestones.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {loadingMilestones ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-400" /></div>
                    ) : milestones?.length > 0 ? (
                      milestones.map((ms: any, i: number) => (
                        <div key={ms.id} className={`p-4 rounded-xl flex gap-3 group transition-all relative overflow-hidden border ${
                          ms.status === 'completed'
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : ms.status === 'in_progress'
                            ? 'bg-cyan-500/5 border-cyan-500/20'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                        }`}>
                          {/* Step number */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                            ms.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            ms.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            'bg-white/5 text-gray-500 border border-white/10'
                          }`}>
                            {ms.status === 'completed' ? <CheckCircle2 size={14} /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{ms.title}</h4>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5 line-clamp-2">{ms.description || "No description."}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="text-emerald-400 text-xs font-black bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 leading-none">
                                ${ms.amount > 0 ? ms.amount.toLocaleString() : Math.floor((project?.budget_max || 5000) / (milestones.length || 1)).toLocaleString()}
                              </span>
                              {ms.status !== 'completed' && user?.id === project?.client_id ? (
                                <button className="text-[9px] font-cyber uppercase tracking-widest px-3 py-1.5 leading-none bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all whitespace-nowrap">
                                  Release Funds
                                </button>
                              ) : ms.status === 'completed' ? (
                                <span className="text-[9px] font-cyber text-emerald-400 flex items-center gap-1 uppercase tracking-widest"><CheckCircle2 size={10} /> Released</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-10 border border-dashed border-white/10 rounded-2xl">
                        <ShieldCheck size={28} className="text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-600 font-mono text-xs">Vault empty.</p>
                        <p className="text-gray-700 font-mono text-[10px] mt-1">Awaiting milestone deployment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </HoloCard>
            </div>

            {/* COLUMN 3: Secure Chat */}
            <div className="lg:col-span-4 lg:h-[calc(100vh-160px)] min-h-[500px]">
              <HoloCard className="h-full detail-card">
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0 shadow-md">
                   <h2 className="font-cyber font-bold text-[11px] text-white uppercase tracking-widest flex items-center gap-2">
                     <MessageSquare size={14} className="text-cyan-400" /> Secure Comms
                   </h2>
                   <div className="flex items-center gap-1.5 text-[9px] font-cyber uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> E2E Active
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
                   {/* Scanning line background effect */}
                   <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                     <div className="w-full h-1 bg-cyan-400/50 blur-[2px] animate-[scan_3s_linear_infinite]" />
                   </div>

                   {loadingMessages ? (
                     <div className="flex justify-center"><Loader2 className="animate-spin text-cyan-500 mt-10" /></div>
                   ) : liveMessages.length > 0 ? (
                     liveMessages.map((msg: any) => {
                       const isMe = msg.sender_id === user?.id;
                       return (
                         <div key={msg.id} className={`flex flex-col relative z-10 ${isMe ? "items-end" : "items-start"}`}>
                           <span className="text-[9px] font-mono text-gray-500 mb-1 px-1 flex items-center gap-1">
                             {isMe ? "YOU" : (msg.sender?.username || `NODE_${msg.sender_id}`)}
                           </span>
                           <div className={`px-4 py-2.5 rounded-2xl text-sm font-mono max-w-[85%] shadow-lg ${
                             isMe 
                              ? "bg-cyan-500/20 text-cyan-50 border border-cyan-500/40 rounded-br-sm shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
                              : "bg-white/[0.03] text-gray-300 border border-white/10 rounded-bl-sm"
                           }`}>
                             {msg.content}
                           </div>
                         </div>
                       )
                     })
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center relative z-10">
                       <Zap size={24} className="text-gray-600 mb-2 opacity-50" />
                       <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">Transmission channel open...</p>
                     </div>
                   )}
                   <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/60 shrink-0 relative z-10">
                   <div className="flex items-center gap-2">
                     <input
                       type="text"
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       placeholder="Transmit encrypted payload..."
                       className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-500/5 transition-all shadow-inner"
                     />
                     <button
                       type="submit"
                       disabled={!chatInput.trim()}
                       className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50 disabled:hover:bg-cyan-500/20"
                     >
                       <Send size={16} />
                     </button>
                   </div>
                </form>
              </HoloCard>
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}
