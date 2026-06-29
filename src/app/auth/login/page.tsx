"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Zap, ArrowRight, Fingerprint } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import { WebglBackground } from "@/components/3d/WebglBackground";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const schema = z.object({
  email: z.string().email("Invalid coordinates"),
  password: z.string().min(1, "Encryption key required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await authAPI.login(data);
      setAuth(res.data.access_token, res.data.user);
      toast.success("Identity verified. Access granted.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    }
  }

  // Handle successful Web3 connection
  useEffect(() => {
    if (isConnected && address) {
      toast.success(`Web3 Linked: ${address.slice(0, 6)}...${address.slice(-4)}`);
      // For now, mock a successful backend auth for the wallet
      setAuth("web3_token_mock", {
        id: 999999,
        email: "web3@trustflow.ai",
        username: address.slice(0, 8),
        full_name: "Web3 User",
        avatar_url: null,
        role: "freelancer",
        trust_score: 95,
        is_verified: true,
        identity_verified: true,
        skills: ["Solidity", "Web3"],
        hourly_rate: 150,
        location: "Decentralized",
      });
      router.push("/dashboard");
    }
  }, [isConnected, address, router, setAuth]);


  return (
    <div className="h-screen w-full flex bg-black text-white overflow-hidden font-sans">
      {/* Cinematic 3D Core */}
      <WebglBackground />

      {/* Grid Overlay for Cyberpunk Feel */}
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(180deg, white, rgba(255,255,255,0))",
          WebkitMaskImage: "linear-gradient(180deg, white, rgba(255,255,255,0))"
        }}
      />

      {/* Left Column: Massive Cinematic Typography */}
      <div className="hidden lg:flex w-3/5 relative flex-col justify-between p-16 z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mix-blend-screen">
            <Zap size={24} className="text-black" />
          </div>
          <span className="font-display font-bold text-2xl tracking-widest uppercase">TrustFlow</span>
        </motion.div>

        <div>
          <div className="overflow-hidden mb-2">
            <h1 className="text-[7rem] leading-[0.85] font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,1)] text-white">
              <AnimatedText text="SYSTEM" delay={0.3} />
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[7rem] leading-[0.85] font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,1)] text-transparent stroke-text" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)" }}>
              <AnimatedText text="ACCESS." delay={0.5} />
            </h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 text-2xl text-gray-400 font-mono max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
          >
            Authenticate your identity to enter the decentralized neural network.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="font-mono text-sm tracking-widest text-gray-500 uppercase"
        >
          Node: Alpha-7 // Status: Awaiting Input
        </motion.div>
      </div>

      {/* Right Column: Spotlight Glassmorphism Auth Panel */}
      <div className="w-full lg:w-2/5 h-full relative z-10 flex items-center justify-center p-8 lg:p-16">
        {/* Ambient Glow behind panel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <SpotlightCard className="w-full max-w-md bg-black/40 backdrop-blur-3xl border-white/10 p-10 rounded-[2rem]">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Fingerprint className="text-cyan-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Authentication</h2>
              <p className="text-sm font-mono text-gray-400">Provide required credentials</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs font-mono tracking-widest text-gray-500 uppercase group-focus-within:text-cyan-400 transition-colors">
                Neural ID (Email)
              </label>
              <div className="relative">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter email"
                  className="w-full h-14 bg-white/[0.02] border-b border-white/10 px-0 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all"
                />
              </div>
              {errors.email && <p className="text-xs font-mono text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono tracking-widest text-gray-500 uppercase group-focus-within:text-cyan-400 transition-colors">
                  Encryption Key
                </label>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-14 bg-white/[0.02] border-b border-white/10 px-0 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all font-mono tracking-[0.2em]"
                />
              </div>
              {errors.password && <p className="text-xs font-mono text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full h-14 mt-8 flex items-center justify-between px-6 bg-white text-black rounded-full font-bold uppercase tracking-widest overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {/* Hover sweep effect */}
              <div className="absolute inset-0 bg-cyan-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              
              <span className="relative z-10 group-hover:text-black flex items-center">
                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {isSubmitting ? "Verifying..." : "Initialize Link"}
              </span>
              
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center relative z-10 group-hover:bg-black/20 group-hover:translate-x-1 transition-all">
                <ArrowRight size={16} />
              </div>
            </button>
          </form>

          <div className="relative mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Or Link Wallet</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => connect({ connector: injected() })}
            className="group relative w-full h-14 mt-6 flex items-center justify-center gap-3 px-6 bg-black border border-white/20 text-white rounded-full font-bold uppercase tracking-widest overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap size={18} className="text-purple-400 group-hover:animate-pulse relative z-10" />
            <span className="relative z-10">Web3 Inject</span>
          </button>

          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-sm font-mono text-gray-500">
            <span>NO CLEARANCE?</span>
            <Link href="/auth/register" className="text-white hover:text-cyan-400 transition-colors underline underline-offset-4 decoration-white/20">
              CREATE IDENTITY
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
