"use client";

import { useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Star, Video, Users, ChevronRight, Activity, Network } from "lucide-react";
import { useAudio } from "@/lib/AudioProvider";
import { clsx } from "clsx";

gsap.registerPlugin(useGSAP);

const MENTORS = [
  {
    name: "Sarah Chen",
    role: "Ex-Meta Core Systems",
    rate: "$150/hr",
    rating: 4.9,
    reviews: 124,
    tags: ["Distributed Systems", "Rust", "Scaling"],
    avatar: "SC",
    color: "brand"
  },
  {
    name: "Marcus Johnson",
    role: "Defi Protocol Lead",
    rate: "$200/hr",
    rating: 5.0,
    reviews: 89,
    tags: ["Solidity", "Zero-Knowledge", "Tokenomics"],
    avatar: "MJ",
    color: "cyan"
  },
  {
    name: "Elena Rodriguez",
    role: "WebGL Architect",
    rate: "$120/hr",
    rating: 4.9,
    reviews: 256,
    tags: ["Three.js", "Shaders", "Creative Dev"],
    avatar: "ER",
    color: "emerald"
  },
];

export default function MentorshipPage() {
  const container = useRef<HTMLDivElement>(null);
  const { playClick, playHover } = useAudio();

  useGSAP(() => {
    gsap.from(".hero-element", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out",
    });

    gsap.to(".hud-scanline", {
      y: "100%",
      duration: 8,
      repeat: -1,
      ease: "linear"
    });
  }, { scope: container });

  return (
    <AppShell>
      <WebGLBackground />
      <div ref={container} className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden max-w-7xl mx-auto">

        {/* Decorative HUD Elements */}
        <div className="absolute top-0 right-10 w-[1px] h-32 bg-gradient-to-b from-brand-500/0 via-brand-500/50 to-brand-500/0 opacity-50" />
        <div className="absolute top-32 right-8 w-4 h-[1px] bg-brand-500/50 opacity-50" />
        <div className="hud-scanline absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-500/0 via-brand-500-[0.02] to-brand-500/0 pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="hero-element flex items-center gap-3 mb-2 text-indigo-400 font-mono text-xs uppercase tracking-widest">
              <Network size={14} className="animate-pulse" />
              <span>Neural Knowledge Transfer</span>
            </div>
            <h1 className="hero-element text-4xl md:text-5xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              Expert Mentorship
            </h1>
            <p className="hero-element text-gray-400 mt-2 font-mono text-sm max-w-xl">
              Initiate direct neural links with top 1% verified industry leaders for accelerated skill calibration.
            </p>
          </div>

          <div className="hero-element flex gap-4">
            <button
              onMouseEnter={playHover}
              onClick={playClick}
              className="h-12 px-6 flex items-center justify-center bg-white/[0.02] border border-white/10 rounded-xl text-gray-400 font-cyber text-xs uppercase tracking-widest hover:text-indigo-400 hover:border-indigo-400/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-105 active:scale-95 gap-2"
            >
              <Activity size={16} /> Register as Node (Mentor)
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 hero-element">
          <SpotlightCard className="p-6 border-indigo-500/20 bg-indigo-500/5 flex items-center gap-5 hover:bg-indigo-500/10 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Video size={24} />
            </div>
            <div>
              <h3 className="font-cyber font-bold uppercase tracking-widest text-white text-sm">Encrypted Video Handshake</h3>
              <p className="text-xs font-mono text-gray-400 mt-1">P2P WebRTC zero-latency streams</p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 border-cyan-500/20 bg-cyan-500/5 flex items-center gap-5 hover:bg-cyan-500/10 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Star size={24} />
            </div>
            <div>
              <h3 className="font-cyber font-bold uppercase tracking-widest text-white text-sm">Cryptographic Vetting</h3>
              <p className="text-xs font-mono text-gray-400 mt-1">Top 1% skill verification</p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 border-purple-500/20 bg-purple-500/5 flex items-center gap-5 hover:bg-purple-500/10 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-cyber font-bold uppercase tracking-widest text-white text-sm">Knowledge Sync</h3>
              <p className="text-xs font-mono text-gray-400 mt-1">Accelerated neural upskilling</p>
            </div>
          </SpotlightCard>
        </div>

        <div className="hero-element">
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
            <h2 className="text-lg font-cyber font-bold uppercase tracking-widest text-white">Active Neural Nodes</h2>
            <button className="text-[10px] font-cyber uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              Query All Nodes <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MENTORS.map((mentor, i) => {
              const themeClass = mentor.color === 'brand' ? 'border-indigo-500/30 hover:border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.05)] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                : mentor.color === 'cyan' ? 'border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                  : 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]';

              const textClass = mentor.color === 'brand' ? 'text-indigo-400 group-hover:text-indigo-300'
                : mentor.color === 'cyan' ? 'text-cyan-400 group-hover:text-cyan-300'
                  : 'text-emerald-400 group-hover:text-emerald-300';

              const bgClass = mentor.color === 'brand' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                : mentor.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

              const avatarBg = mentor.color === 'brand' ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30'
                : mentor.color === 'cyan' ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
                  : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30';

              return (
                <motion.div
                  key={mentor.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  onMouseEnter={playHover}
                  className="h-full"
                >
                  <SpotlightCard className={clsx("p-6 bg-black/40 backdrop-blur-3xl group transition-all duration-500 flex flex-col h-full", themeClass)}>

                    <div className="flex justify-between items-start mb-6">
                      <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-black text-white shadow-inner border group-hover:scale-110 transition-transform", avatarBg)}>
                        {mentor.avatar}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md text-[10px] font-cyber uppercase tracking-widest shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]">
                          <Star size={12} className="fill-current" />
                          {mentor.rating}
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 mt-1">{mentor.reviews} Handshakes</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-display font-bold text-white drop-shadow-md">{mentor.name}</h3>
                    <p className={clsx("font-mono text-xs mt-1 mb-5 uppercase tracking-widest", textClass)}>{mentor.role}</p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {mentor.tags.map(tag => (
                        <span key={tag} className={clsx("text-[9px] font-cyber uppercase tracking-widest px-2 py-1 border rounded shadow-inner", bgClass)}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                      <div>
                        <span className="font-black font-display text-2xl text-white drop-shadow-md">{mentor.rate}</span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Transfer Rate</span>
                      </div>
                      <button
                        onClick={playClick}
                        className={clsx(
                          "py-2 px-5 text-[10px] font-cyber uppercase tracking-widest border rounded-lg transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] hover:shadow-lg active:scale-95 flex items-center gap-2",
                          mentor.color === 'brand' ? 'border-indigo-400 text-indigo-400 hover:bg-indigo-400 hover:text-black hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                            : mentor.color === 'cyan' ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                              : 'border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        )}
                      >
                        Initiate Link
                      </button>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
