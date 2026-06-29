"use client";

import { useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { User, Activity, Hexagon, Terminal, GitMerge, CheckCircle2, Medal, Zap, LayoutDashboard, Share2, MapPin, Database, Cpu } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAudio } from "@/lib/AudioProvider";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { usersAPI, trustAPI, skillsAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

gsap.registerPlugin(useGSAP);

type ThemeColor = "cyan" | "emerald" | "purple" | "amber";

const THEME_STYLES: Record<ThemeColor, any> = {
  cyan: {
    icon: "text-cyan-400",
    border: "border-cyan-400/30",
    bg: "bg-cyan-400",
    hover: "group-hover:text-cyan-400",
    cardBorder: "hover:border-cyan-500/30",
    cardShadow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
  },
  emerald: {
    icon: "text-emerald-400",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400",
    hover: "group-hover:text-emerald-400",
    cardBorder: "hover:border-emerald-500/30",
    cardShadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
  },
  purple: {
    icon: "text-purple-400",
    border: "border-purple-400/30",
    bg: "bg-purple-400",
    hover: "group-hover:text-purple-400",
    cardBorder: "hover:border-purple-500/30",
    cardShadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
  },
  amber: {
    icon: "text-amber-400",
    border: "border-amber-400/30",
    bg: "bg-amber-400",
    hover: "group-hover:text-amber-400",
    cardBorder: "hover:border-amber-500/30",
    cardShadow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
  }
};

const BADGE_ICONS = [LayoutDashboard, Terminal, Database, GitMerge, Cpu, Medal];
const BADGE_THEMES: ThemeColor[] = ["cyan", "emerald", "purple", "amber"];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const container = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playClick, playHover } = useAudio();
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Fetch real trust score
  const { data: trustData } = useQuery({
    queryKey: ["trust-score"],
    queryFn: () => trustAPI.getScore().then((r) => r.data),
  });

  // Fetch real skill badges
  const { data: skillResults } = useQuery({
    queryKey: ["my-skill-results"],
    queryFn: () => skillsAPI.myResults().then((r) => r.data),
  });

  const trustScore = Math.round(trustData?.overall_score ?? user?.trust_score ?? 50);
  const trustLevel = trustScore >= 80 ? "ELITE NODE" : trustScore >= 60 ? "VERIFIED NODE" : trustScore >= 40 ? "ACTIVE NODE" : "NEW NODE";

  // Map real skill results to badge format, fall back to hardcoded BADGES
  const badges = (skillResults && skillResults.length > 0)
    ? skillResults.map((r: any, i: number) => ({
        id: `B${r.id}`,
        title: r.skill_name,
        type: "AI PROCTORED",
        score: Math.round(r.percentage),
        date: new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit" }).replace("/", "."),
        icon: BADGE_ICONS[i % BADGE_ICONS.length],
        theme: BADGE_THEMES[i % BADGE_THEMES.length],
      }))
    : [
        { id: "B1", title: "React Native Core", type: "AI PROCTORED", score: 98, date: "2024.10", icon: LayoutDashboard, theme: "cyan" as ThemeColor },
        { id: "B2", title: "Node.js Microservices", type: "AI PROCTORED", score: 95, date: "2024.09", icon: Terminal, theme: "emerald" as ThemeColor },
        { id: "B3", title: "PostgreSQL Advanced", type: "AI PROCTORED", score: 92, date: "2024.09", icon: Database, theme: "purple" as ThemeColor },
        { id: "B4", title: "System Architecture", type: "PEER REVIEWED", score: 88, date: "2024.08", icon: GitMerge, theme: "amber" as ThemeColor },
      ];

  useGSAP(() => {
    gsap.from(".profile-elem", {
      y: 30,
      opacity: 0,
      duration: 0.5, // much faster duration
      stagger: 0.05, // much faster stagger
      ease: "power3.out",
    });
  }, { scope: container });

  const handleVerifyPhone = async () => {
    if (!phoneInput.trim() || phoneInput.length < 10) {
      setShowPhoneModal(true);
      return;
    }
    playClick();
    setLoadingPhone(true);
    setShowPhoneModal(false);
    try {
      await usersAPI.verifyPhone(phoneInput);
      toast.success("SMS Verification Code Sent via Twilio!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send SMS");
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoadingMedia(true);
    const toastId = toast.loading("Uploading to Cloudinary...");
    try {
      const res = await usersAPI.uploadMedia(file);
      toast.success("Media uploaded successfully!", { id: toastId });
      console.log("Cloudinary URL:", res.data.url);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed", { id: toastId });
    } finally {
      setLoadingMedia(false);
    }
  };

  return (
    <AppShell>
      <WebGLBackground />
      <div ref={container} className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT: IDENTITY COLUMN */}
            <div className="w-full lg:w-1/3 space-y-8">
               <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.15)" className="profile-elem p-8 border-cyan-500/30 bg-black/40 backdrop-blur-3xl relative overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Hexagon size={180} className="text-cyan-400 animate-[spin_30s_linear_infinite]" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                     <div className="relative group cursor-pointer" onMouseEnter={playHover} onClick={playClick}>
                       <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       <div className="w-32 h-32 rounded-full border-2 border-cyan-400/50 p-2 flex items-center justify-center bg-black/80 backdrop-blur-sm relative z-10">
                         <div className="w-full h-full rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-400/30">
                           <User size={40} className="text-cyan-400" />
                         </div>
                       </div>
                       {user?.identity_verified && (
                         <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-full border-4 border-black shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20">
                           <CheckCircle2 size={16} className="fill-emerald-500" />
                         </div>
                       )}
                     </div>

                     <div className="space-y-1">
                       <h1 className="text-2xl font-display font-black tracking-tight text-white drop-shadow-md">{user?.full_name || user?.username || "Anonymous Node"}</h1>
                       <div className="flex items-center justify-center gap-2 text-cyan-400 font-cyber text-xs uppercase tracking-widest">
                         <MapPin size={12} /> {user?.location || "Grid Sector 4, Quadrant B"}
                       </div>
                     </div>
                     
                     <div className="w-full p-4 rounded-xl bg-black/60 border border-cyan-500/20 space-y-3 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
                        <div className="flex justify-between items-center text-[10px] font-cyber uppercase tracking-widest">
                           <span className="text-gray-500">Node Status</span>
                           <span className="text-emerald-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]" /> ACTIVE</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-cyber uppercase tracking-widest">
                           <span className="text-gray-500">Network Uptime</span>
                           <span className="text-white">99.9%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-cyber uppercase tracking-widest">
                           <span className="text-gray-500">Contracts Completed</span>
                           <span className="text-white">24</span>
                        </div>
                     </div>
                     
                     <div className="w-full flex flex-col gap-3">
                       <button 
                         onMouseEnter={playHover}
                         onClick={handleVerifyPhone}
                         disabled={loadingPhone}
                         className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl font-cyber text-xs uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95 disabled:opacity-50"
                       >
                         <Zap size={14} /> Verify Phone (Twilio)
                       </button>

                       <input type="file" className="hidden" ref={fileInputRef} onChange={handleMediaUpload} accept="image/*,video/*" />
                       <button 
                         onMouseEnter={playHover}
                         onClick={() => { playClick(); fileInputRef.current?.click(); }}
                         disabled={loadingMedia}
                         className="w-full py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl font-cyber text-xs uppercase tracking-widest text-purple-400 hover:bg-purple-500/20 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-95 disabled:opacity-50"
                       >
                         <Share2 size={14} /> Upload Media (Cloudinary)
                       </button>
                     </div>
                  </div>
               </SpotlightCard>

               {/* Phone Verification Modal */}
               {showPhoneModal && (
                 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPhoneModal(false)}>
                   <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-sm w-full space-y-6" onClick={(e) => e.stopPropagation()}>
                     <h3 className="font-display font-bold text-lg text-white">Phone Verification</h3>
                     <p className="text-sm font-mono text-gray-400">Enter your phone number to receive a Twilio verification code.</p>
                     <input
                       type="tel"
                       value={phoneInput}
                       onChange={(e) => setPhoneInput(e.target.value)}
                       placeholder="+1 (555) 123-4567"
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-400/50"
                     />
                     <button
                       onClick={handleVerifyPhone}
                       disabled={loadingPhone || phoneInput.length < 10}
                       className="w-full py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl font-cyber text-xs uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                     >
                       Send Code
                     </button>
                   </div>
                 </div>
               )}

               <SpotlightCard className="profile-elem p-6 border-white/10 bg-black/40 backdrop-blur-3xl space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <h3 className="font-cyber font-bold tracking-widest text-xs text-gray-500 uppercase flex items-center gap-2">
                    <Cpu size={14} /> Hardware Fingerprint
                  </h3>
                  <div className="font-mono text-[10px] text-gray-400 space-y-2 break-all bg-white/[0.02] p-4 rounded-lg border border-white/5">
                    <p className="flex justify-between"><span className="text-gray-600">SYS:</span> <span>macOS / WebKit</span></p>
                    <p className="flex justify-between"><span className="text-gray-600">RES:</span> <span>2560x1440@120Hz</span></p>
                    <p className="flex justify-between"><span className="text-gray-600">HSH:</span> <span className="text-cyan-400">0x8f3c...4a2b</span></p>
                  </div>
               </SpotlightCard>
            </div>

            {/* RIGHT: TRUST GRAPH & BADGES */}
            <div className="w-full lg:w-2/3 space-y-8">
               
               {/* TRUST SCORE GRAPH */}
               <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.15)" className="profile-elem p-8 border-cyan-500/20 bg-black/40 backdrop-blur-3xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                        <Activity size={14} className="animate-pulse" />
                        <span>Cryptographic Reputation</span>
                      </div>
                      <h2 className="font-display font-bold text-2xl text-white uppercase tracking-widest">Network Trust Score</h2>
                      <p className="font-mono text-xs text-gray-400 mt-1">Aggregated from on-chain history and biometric verification matrices.</p>
                    </div>
                    <div className="text-right">
                       <h3 className="font-display font-black text-6xl text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">{trustScore}</h3>
                       <p className="font-cyber text-[10px] uppercase tracking-widest text-cyan-400 mt-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full inline-block shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]">{trustLevel}</p>
                    </div>
                  </div>
                  
                  {/* Abstract Graph Representation */}
                  <div className="h-56 w-full relative flex items-end justify-between px-2 pt-8 z-10 border-b border-l border-cyan-500/20">
                     {/* Grid lines */}
                     <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                     
                     {/* Graph Line */}
                     <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                       <defs>
                         <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="rgba(34,211,238,0.3)" />
                           <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                         </linearGradient>
                       </defs>
                       <motion.path 
                         initial={{ pathLength: 0, opacity: 0 }}
                         animate={{ pathLength: 1, opacity: 1 }}
                         transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                         d="M0,80 Q10,70 20,75 T40,60 T60,50 T80,30 T100,20" 
                         fill="none" 
                         stroke="#22d3ee" 
                         strokeWidth="2" 
                         className="drop-shadow-[0_0_10px_rgba(34,211,238,1)]"
                       />
                       <motion.path 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 1, duration: 1.5 }}
                         d="M0,80 Q10,70 20,75 T40,60 T60,50 T80,30 T100,20 L100,100 L0,100 Z" 
                         fill="url(#grad)" 
                       />
                     </svg>
                     
                     {/* Data Points */}
                     {[80, 75, 60, 50, 30, 20].map((y, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1 + (i * 0.2), type: "spring" }}
                          className="w-3 h-3 rounded-full bg-cyan-400 relative z-10 shadow-[0_0_15px_rgba(34,211,238,1)] flex items-center justify-center group" 
                          style={{ bottom: `${100 - y}%` }}
                        >
                           <div className="w-1 h-1 bg-white rounded-full" />
                           <div className="absolute -top-8 -left-4 bg-black/80 border border-cyan-500/50 backdrop-blur-md px-2 py-1 rounded font-mono text-[10px] text-cyan-400 hidden group-hover:block whitespace-nowrap z-30">
                             Δ +{(y % 15) + 2}
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </SpotlightCard>

               {/* VERIFIED SKILLS GRID */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4 profile-elem">
                    <h2 className="font-display font-bold text-xl text-white uppercase tracking-widest flex items-center gap-3">
                      <Medal size={20} className="text-amber-400" />
                      Cryptographic Badges
                    </h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {badges.map((badge: any, i: number) => {
                       const styles = THEME_STYLES[badge.theme as ThemeColor] || THEME_STYLES.cyan;
                       return (
                       <motion.div 
                         key={badge.id}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: i * 0.05 }}
                         onMouseEnter={playHover}
                         className={`profile-elem group p-5 rounded-xl bg-black/40 backdrop-blur-3xl border border-white/5 transition-all flex gap-4 overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer ${styles.cardBorder} ${styles.cardShadow}`}
                       >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                          
                          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 bg-black relative z-10 shadow-inner group-hover:scale-110 transition-transform ${styles.border}`}>
                            <div className={`absolute inset-0 opacity-20 blur-md rounded-lg ${styles.bg}`} />
                            <badge.icon size={20} className={styles.icon} />
                          </div>
                          
                          <div className="flex-1 relative z-10">
                             <h4 className={`font-mono text-sm text-white font-bold transition-colors ${styles.hover}`}>{badge.title}</h4>
                             <div className="flex items-center gap-2 mt-1.5">
                               <Zap size={10} className={styles.icon} />
                               <span className="font-cyber text-[9px] uppercase tracking-widest text-gray-400">{badge.type}</span>
                             </div>
                          </div>
                          
                          <div className="text-right flex flex-col justify-between relative z-10">
                             <span className={`font-display font-black text-xl text-white drop-shadow-md transition-colors ${styles.hover}`}>{badge.score}</span>
                             <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">{badge.date}</span>
                          </div>
                       </motion.div>
                       )
                    })}
                 </div>
               </div>

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
