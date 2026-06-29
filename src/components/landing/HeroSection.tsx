"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white pt-20">
      {/* Ambient Glowing Orbs Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -100, 100, 0],
            y: [0, 100, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-brand-600/30 rounded-full blur-[100px] mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-indigo-900/40 rounded-full blur-[150px] mix-blend-screen"
        />
      </div>

      <div className="relative z-10 container max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Beta Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-sm font-medium text-brand-100">TrustFlow AI • The Global Freelance OS • Now in Beta</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tight leading-[1.1] mb-6"
        >
          The OS to help you <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-purple-300 to-indigo-300">
            Build Trust.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12"
        >
          Personalized AI roadmaps, project studio, GitHub intelligence, resume builder, and client matching — all wired together in one career dashboard.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/auth/register"
            className="h-14 px-8 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_40px_rgba(124,58,237,0.4)]"
          >
            Start your journey <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="h-14 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold flex items-center transition-all backdrop-blur-md"
          >
            Go to Dashboard
          </Link>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-24 border-t border-white/10 pt-12 w-full max-w-4xl"
        >
          {[
            { value: "10M+", label: "Tasks Completed" },
            { value: "50K+", label: "Projects Generated" },
            { value: "98%", label: "Success Rate" },
            { value: "200+", label: "Hiring Partners" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
                {stat.value}
              </span>
              <span className="text-xs md:text-sm text-gray-500 mt-2 uppercase tracking-wider font-semibold">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
