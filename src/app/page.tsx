"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, Code2, ShieldAlert, FileText, Blocks, LayoutGrid } from "lucide-react";
import { WebglBackground } from "@/components/3d/WebglBackground";
import { AnimatedText } from "@/components/ui/AnimatedText";

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.37)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HollywoodLandingPage() {
  return (
    <div className="bg-transparent text-white selection:bg-brand-500/30 selection:text-white">
      
      {/* 1. Global WebGL Canvas fixed behind everything */}
      <WebglBackground />

      {/* 2. Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex items-center justify-between mix-blend-difference pointer-events-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Zap size={16} className="text-black fill-black" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">TrustFlow AI</span>
        </Link>
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link href="/auth/login" className="hover:opacity-70 transition-opacity">Login</Link>
          <Link href="/auth/register" className="h-10 px-6 rounded-full bg-white text-black font-semibold flex items-center hover:scale-105 transition-transform">
            Get started
          </Link>
        </div>
      </nav>

      {/* 3. The DOM Content (Scrollable) */}
      <main className="relative z-10 w-full pointer-events-none">
        
        {/* HERO SECTION */}
        <section className="h-[120vh] flex flex-col items-center justify-center px-6 pointer-events-auto">
          <div className="max-w-5xl text-center flex flex-col items-center pt-20">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold tracking-widest uppercase mb-8"
            >
              The Next Era of Freelancing
            </motion.div>
            
            <div className="text-6xl md:text-[7rem] font-display font-bold leading-[0.9] tracking-tighter mb-8 drop-shadow-[0_4px_24px_rgba(0,0,0,1)]">
              <AnimatedText text="A SIMULATED PARADIGM." delay={0.2} />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-xl md:text-2xl text-white max-w-3xl font-semibold drop-shadow-[0_4px_16px_rgba(0,0,0,1)]"
            >
              The intelligent freelancer marketplace powered by AI trust scoring. We use deep neural networks to guarantee perfect talent matching and zero-trust escrow to protect your capital.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-12"
            >
              <Link
                href="/auth/register"
                className="group relative h-16 px-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-lg flex items-center gap-3 overflow-hidden transition-all hover:bg-white hover:text-black hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 font-bold tracking-wide">ENTER THE NETWORK</span>
                <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
          </div>
        </section>

        {/* FEATURES SECTION (Scroll depth 1) */}
        <section className="min-h-screen flex items-center py-32 px-6 pointer-events-auto">
          <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            
            <div>
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8">
                <AnimatedText text="Eliminate Hiring Risk." />
              </h2>
              <p className="text-xl text-white font-semibold drop-shadow-[0_4px_16px_rgba(0,0,0,1)] mb-12">
                Traditional marketplaces rely on fake reviews. TrustFlow analyzes real GitHub commits, communication patterns, and past deliverables to generate an immutable Trust Score.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Code2, title: "AI Trust Scoring", desc: "Our neural net analyzes thousands of data points to predict a freelancer's reliability." },
                  { icon: ShieldAlert, title: "Zero-Trust Escrow", desc: "Funds are locked in smart contracts and released automatically when AI verifies the PR." },
                  { icon: FileText, title: "Proof of Work", desc: "No fake portfolios. We parse actual code contributions to verify technical capability." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
                      <item.icon />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glassmorphic floating cards representing "Data" */}
            <div className="relative h-[600px] hidden md:block">
              <GlassCard className="absolute top-10 right-10 w-80 z-20 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500" />
                  <span className="text-cyan-400 font-mono text-sm">99.9% Match</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Senior Architect</h3>
                <p className="text-gray-400 text-sm">Found in 12 seconds via AST analysis.</p>
              </GlassCard>

              <GlassCard className="absolute bottom-20 left-10 w-72 z-10 hover:scale-105 transition-transform">
                <Blocks className="text-purple-400 mb-6" size={32} />
                <h3 className="text-xl font-bold mb-2">Smart Contract</h3>
                <p className="text-gray-400 text-sm">Escrow secured. Awaiting milestone 1 completion.</p>
              </GlassCard>
            </div>
            
          </div>
        </section>

        {/* METRICS SECTION (Scroll depth 2) */}
        <section className="min-h-[80vh] flex items-center justify-center py-32 px-6 pointer-events-auto">
          <div className="w-full max-w-7xl mx-auto">
            <GlassCard className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                {[
                  { value: "$50M+", label: "Volume Processed" },
                  { value: "12,000", label: "Verified Developers" },
                  { value: "< 24h", label: "Time to Hire" },
                  { value: "0%", label: "Dispute Rate" }
                ].map((stat, i) => (
                  <div key={i} className="pt-8 md:pt-0">
                    <div className="text-5xl md:text-6xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-6 border-t border-white/10 bg-black/50 backdrop-blur-md pointer-events-auto">
          <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <Zap size={20} className="text-brand-400" />
              TrustFlow AI
            </div>
            <div className="text-gray-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} The Paradigm Shift. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
