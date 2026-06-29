"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, ShieldCheck, Code, Database, Cpu, Lock, Hexagon, Zap } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type ThemeColor = "cyan" | "blue" | "indigo" | "emerald" | "purple" | "fuchsia" | "rose" | "orange" | "white";

const THEME_STYLES: Record<ThemeColor, any> = {
  cyan: {
    spotlight: "rgba(34, 211, 238, 0.15)",
    icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]",
    card: "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.05)]",
    title: "group-hover:text-cyan-100",
    btn: "group-hover:bg-cyan-500/10 group-hover:text-cyan-300 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
  },
  blue: {
    spotlight: "rgba(59, 130, 246, 0.15)",
    icon: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    card: "hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]",
    title: "group-hover:text-blue-100",
    btn: "group-hover:bg-blue-500/10 group-hover:text-blue-300 group-hover:border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
  },
  indigo: {
    spotlight: "rgba(99, 102, 241, 0.15)",
    icon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
    card: "hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)]",
    title: "group-hover:text-indigo-100",
    btn: "group-hover:bg-indigo-500/10 group-hover:text-indigo-300 group-hover:border-indigo-500/30 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
  },
  emerald: {
    spotlight: "rgba(16, 185, 129, 0.15)",
    icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    card: "hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]",
    title: "group-hover:text-emerald-100",
    btn: "group-hover:bg-emerald-500/10 group-hover:text-emerald-300 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
  },
  purple: {
    spotlight: "rgba(168, 85, 247, 0.15)",
    icon: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    card: "hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)]",
    title: "group-hover:text-purple-100",
    btn: "group-hover:bg-purple-500/10 group-hover:text-purple-300 group-hover:border-purple-500/30 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
  },
  fuchsia: {
    spotlight: "rgba(217, 70, 239, 0.15)",
    icon: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.15)]",
    card: "hover:border-fuchsia-500/30 hover:shadow-[0_0_30px_rgba(217,70,239,0.05)]",
    title: "group-hover:text-fuchsia-100",
    btn: "group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-300 group-hover:border-fuchsia-500/30 group-hover:shadow-[0_0_15px_rgba(217,70,239,0.2)]"
  },
  rose: {
    spotlight: "rgba(244, 63, 94, 0.15)",
    icon: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    card: "hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.05)]",
    title: "group-hover:text-rose-100",
    btn: "group-hover:bg-rose-500/10 group-hover:text-rose-300 group-hover:border-rose-500/30 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
  },
  orange: {
    spotlight: "rgba(249, 115, 22, 0.15)",
    icon: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    card: "hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)]",
    title: "group-hover:text-orange-100",
    btn: "group-hover:bg-orange-500/10 group-hover:text-orange-300 group-hover:border-orange-500/30 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
  },
  white: {
    spotlight: "rgba(255, 255, 255, 0.1)",
    icon: "bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]",
    card: "hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]",
    title: "group-hover:text-white",
    btn: "group-hover:bg-white/10 group-hover:text-white group-hover:border-white/30 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
  }
};

const SKILLS = [
  { name: "React Native Advanced", time: "45 MINS", icon: Cpu, theme: "cyan" as ThemeColor },
  { name: "Python Core Architecture", time: "60 MINS", icon: Code, theme: "blue" as ThemeColor },
  { name: "PostgreSQL Optimization", time: "30 MINS", icon: Database, theme: "indigo" as ThemeColor },
  { name: "Smart Contract Auditing", time: "90 MINS", icon: ShieldCheck, theme: "emerald" as ThemeColor },
  { name: "Next.js Performance", time: "45 MINS", icon: Zap, theme: "white" as ThemeColor },
  { name: "Zero-Knowledge Proofs", time: "120 MINS", icon: Lock, theme: "purple" as ThemeColor },
  { name: "WebGL & Three.js", time: "60 MINS", icon: Hexagon, theme: "rose" as ThemeColor },
  { name: "AI Agent Orchestration", time: "90 MINS", icon: Cpu, theme: "fuchsia" as ThemeColor },
  { name: "Rust Low-level Systems", time: "120 MINS", icon: Code, theme: "orange" as ThemeColor },
];

export default function SkillsPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".stagger-item", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: "power3.out",
    });
    
    gsap.from(".hero-text", {
      opacity: 0,
      y: -20,
      duration: 1,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <AppShell>
      <div ref={container} className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden" style={{ perspective: "1000px" }}>
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-text space-y-4 py-4 border-b border-white/5 pb-8">
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">AST Verification</h1>
            <p className="text-white/50 text-sm font-sans max-w-2xl leading-relaxed">Execute AI-proctored skill synthetics to cryptographically verify your expertise and boost your global trust score.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKILLS.map((skill) => {
              const slug = skill.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <InteractiveCard key={skill.name} skill={skill.name} time={skill.time} Icon={skill.icon} slug={slug} theme={skill.theme} />
              )
            })}
          </div>
          
          <div className="pt-8 stagger-item">
            <h3 className="text-sm font-sans font-medium tracking-wide uppercase mb-4 text-white/70 flex items-center gap-2">
              <ShieldCheck className="text-white/50" size={16} /> Verified Badges
            </h3>
            <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.03)" className="p-12 text-center border-white/5 bg-[#050505]/40 flex flex-col items-center justify-center backdrop-blur-xl">
               <ShieldCheck size={32} className="text-white/20 mb-4" />
               <p className="text-white/40 font-sans text-sm">Pass assessments to mint cryptographic badges to your node profile.</p>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InteractiveCard({ skill, time, Icon, slug, theme }: { skill: string, time: string, Icon: any, slug: string, theme: ThemeColor }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const styles = THEME_STYLES[theme];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateX(-((y - centerY) / centerY) * 3);
    setRotateY(((x - centerX) / centerX) * 3);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className="stagger-item h-full flex flex-col w-full"
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <SpotlightCard 
        spotlightColor={styles.spotlight}
        className={`p-6 relative overflow-hidden group border-white/5 bg-[#0A0A0A]/40 flex flex-col flex-1 w-full transition-all duration-300 ${styles.card}`}
      >
         <div className="flex flex-col h-full pointer-events-none z-10 relative" style={{ transform: "translateZ(10px)" }}>
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border ${styles.icon}`}>
             <Icon size={24} strokeWidth={1.5} />
           </div>
           <h3 className={`font-sans font-medium text-lg mb-1 text-white leading-tight transition-colors ${styles.title}`}>{skill}</h3>
           <p className="text-[10px] font-sans text-white/40 font-semibold uppercase tracking-wider mb-8">{time} • AI PROCTORED</p>
           
           <div className="mt-auto pointer-events-auto">
             <Link href={`/skills/${slug}`}>
               <button className={`flex items-center justify-between w-full px-4 py-3 bg-white/[0.02] border border-white/10 text-white/60 rounded-lg font-sans font-medium text-xs transition-all cursor-pointer shadow-sm ${styles.btn}`}>
                 <span>Initiate Test</span>
                 <ArrowRight size={14} className="shrink-0" />
               </button>
             </Link>
           </div>
         </div>
      </SpotlightCard>
    </motion.div>
  );
}
