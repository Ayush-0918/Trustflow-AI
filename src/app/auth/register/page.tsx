"use client";

import { useState } from "react";
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
import { WebglBackground } from "@/components/3d/WebglBackground";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const schema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid coordinates"),
  password: z.string().min(6, "Key must be at least 6 characters"),
  role: z.enum(["client", "freelancer"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "client"
    }
  });

  const selectedRole = watch("role");

  async function onSubmit(data: FormData) {
    try {
      await authAPI.register(data);
      toast.success("Identity established in the matrix.");
      
      const res = await authAPI.login({ email: data.email, password: data.password });
      setAuth(res.data.access_token, res.data.user);
      
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-black text-white overflow-hidden font-sans relative">
      {/* Cinematic 3D Core */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <WebglBackground />
      </div>

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
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-16 z-10 pointer-events-none overflow-y-auto overflow-x-hidden">
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

        <div className="my-auto">
          <div className="overflow-hidden mb-2">
            <h1 className="text-[6.5rem] leading-[0.85] font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,1)] text-white">
              <AnimatedText text="CREATE" delay={0.3} />
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[6.5rem] leading-[0.85] font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,1)] text-transparent stroke-text" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)" }}>
              <AnimatedText text="IDENTITY." delay={0.5} />
            </h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 text-2xl text-gray-400 font-mono max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
          >
            Generate your cryptographic signature and join the decentralized talent network.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="font-mono text-sm tracking-widest text-gray-500 uppercase"
        >
          Node: Alpha-7 // Status: Awaiting Connection
        </motion.div>
      </div>

      {/* Right Column: Spotlight Glassmorphism Auth Panel */}
      <div className="w-full lg:w-[45%] min-h-screen relative z-10 flex items-center justify-center p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
        {/* Ambient Glow behind panel */}
        <div className="fixed top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <SpotlightCard className="w-full max-w-lg bg-black/40 backdrop-blur-3xl border-white/10 p-10 rounded-[2rem] my-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Fingerprint className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">New Identity</h2>
              <p className="text-sm font-mono text-gray-400">Establish parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Role Toggle Switch */}
            <div className="space-y-3 pb-2 border-b border-white/5">
              <label className="text-xs font-mono tracking-widest text-gray-500 uppercase">
                Primary Function
              </label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer group">
                  <input type="radio" value="client" className="peer sr-only" {...register("role")} />
                  <div className="h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] peer-checked:bg-white peer-checked:text-black font-bold tracking-widest transition-all duration-300 group-hover:bg-white/[0.05]">
                    CLIENT
                  </div>
                </label>
                <label className="flex-1 cursor-pointer group">
                  <input type="radio" value="freelancer" className="peer sr-only" {...register("role")} />
                  <div className="h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] peer-checked:bg-white peer-checked:text-black font-bold tracking-widest transition-all duration-300 group-hover:bg-white/[0.05]">
                    TALENT
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase group-focus-within:text-purple-400 transition-colors">
                  Real Name
                </label>
                <input
                  {...register("full_name")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full h-12 bg-transparent border-b border-white/10 px-0 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-all"
                />
                {errors.full_name && <p className="text-xs font-mono text-red-400 mt-1">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase group-focus-within:text-purple-400 transition-colors">
                  Alias
                </label>
                <input
                  {...register("username")}
                  type="text"
                  placeholder="johndoe"
                  className="w-full h-12 bg-transparent border-b border-white/10 px-0 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-all"
                />
                {errors.username && <p className="text-xs font-mono text-red-400 mt-1">{errors.username.message}</p>}
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-mono tracking-widest text-gray-500 uppercase group-focus-within:text-purple-400 transition-colors">
                Neural ID (Email)
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter email"
                className="w-full h-12 bg-transparent border-b border-white/10 px-0 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-all"
              />
              {errors.email && <p className="text-xs font-mono text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-mono tracking-widest text-gray-500 uppercase group-focus-within:text-purple-400 transition-colors">
                Encryption Key
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full h-12 bg-transparent border-b border-white/10 px-0 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-all font-mono tracking-[0.2em]"
              />
              {errors.password && <p className="text-xs font-mono text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full h-14 mt-8 flex items-center justify-between px-6 bg-white text-black rounded-full font-bold uppercase tracking-widest overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {/* Hover sweep effect */}
              <div className="absolute inset-0 bg-purple-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              
              <span className="relative z-10 group-hover:text-black flex items-center">
                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {isSubmitting ? "Generating..." : "Generate Identity"}
              </span>
              
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center relative z-10 group-hover:bg-black/20 group-hover:translate-x-1 transition-all">
                <ArrowRight size={16} />
              </div>
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-sm font-mono text-gray-500">
            <span>EXISTING NODE?</span>
            <Link href="/auth/login" className="text-white hover:text-purple-400 transition-colors underline underline-offset-4 decoration-white/20">
              ACCESS SYSTEM
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
