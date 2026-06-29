"use client";

import { useState } from "react";
import { SpotlightCard } from "./SpotlightCard";
import { motion } from "framer-motion";
import { TrendingUp, Coins, CalendarDays, ShieldCheck, Zap } from "lucide-react";
import { clsx } from "clsx";
import { useAudio } from "@/lib/AudioProvider";

export function StakingSimulator({ trustScore = 85 }: { trustScore?: number }) {
  const [stakedAmount, setStakedAmount] = useState<number>(5000);
  const [isCompounding, setIsCompounding] = useState<boolean>(true);
  const { playClick, playHover } = useAudio();

  // Trust score multiplier (0.5x to 2.5x based on score)
  const trustMultiplier = Math.max(0.5, (trustScore / 100) * 2.5);
  
  // Base APY is 5%, up to 12.5% with max trust
  const baseApy = 5;
  const currentApy = baseApy * trustMultiplier;
  
  // Calculations
  const annualYield = isCompounding 
    ? stakedAmount * (Math.pow(1 + (currentApy / 100) / 12, 12) - 1)
    : stakedAmount * (currentApy / 100);
    
  const monthlyYield = annualYield / 12;
  const dailyYield = annualYield / 365;

  return (
    <SpotlightCard className="p-8 border-cyan-500/20 bg-black/40 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <TrendingUp size={14} className="animate-pulse" />
            <span>Yield Generation</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-widest drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
            Reputation Staking
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Trust Multiplier</span>
          <span className="font-display font-bold text-emerald-400">{trustMultiplier.toFixed(2)}x</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Interactive Controls */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="font-mono text-xs text-gray-400 uppercase tracking-widest">Lock TRUST Tokens</label>
              <div className="text-2xl font-display font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                {stakedAmount.toLocaleString()} <span className="text-sm text-cyan-400/50">TRUST</span>
              </div>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full">
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={stakedAmount}
                onChange={(e) => setStakedAmount(Number(e.target.value))}
                onMouseDown={playClick}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <motion.div 
                className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10 pointer-events-none"
                style={{ width: `${(stakedAmount / 50000) * 100}%` }}
              />
              <div 
                className="absolute top-1/2 -mt-2 w-4 h-4 bg-white border-2 border-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)] z-10 pointer-events-none"
                style={{ left: `calc(${(stakedAmount / 50000) * 100}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-2 font-mono text-[10px] text-gray-500">
              <span>0</span>
              <span>50,000 MAX</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Zap size={16} className={isCompounding ? "text-purple-400" : "text-gray-500"} />
              <div>
                <p className="font-cyber font-bold text-sm text-white uppercase tracking-wider">Compound Interest</p>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Auto-reinvest daily yield</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsCompounding(!isCompounding);
                playClick();
              }}
              onMouseEnter={playHover}
              className={clsx(
                "w-12 h-6 rounded-full transition-colors relative",
                isCompounding ? "bg-purple-500/50 border border-purple-400/50" : "bg-white/10 border border-white/20"
              )}
            >
              <motion.div 
                animate={{ x: isCompounding ? 24 : 2 }}
                className={clsx(
                  "w-4 h-4 rounded-full mt-[3px] shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                  isCompounding ? "bg-purple-400" : "bg-gray-400"
                )}
              />
            </button>
          </div>
        </div>

        {/* Right: Live Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
             <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
               <span>Current APY</span>
               <span className="text-cyan-400 text-[10px]">LIVE</span>
             </p>
             <p className="text-5xl font-display font-black text-white drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)]">
               {currentApy.toFixed(2)}%
             </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
             <div className="flex items-center gap-2 mb-3">
               <Coins size={14} className="text-gray-400" />
               <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Est. Daily</p>
             </div>
             <p className="font-display font-bold text-xl text-emerald-400">
               +{dailyYield.toFixed(2)}
             </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
             <div className="flex items-center gap-2 mb-3">
               <CalendarDays size={14} className="text-gray-400" />
               <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Est. Monthly</p>
             </div>
             <p className="font-display font-bold text-xl text-emerald-400">
               +{monthlyYield.toFixed(2)}
             </p>
          </div>

          <div className="col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-end">
             <div>
               <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">Projected 1Y Return</p>
               <p className="font-display font-bold text-2xl text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                 +{(annualYield).toLocaleString(undefined, { maximumFractionDigits: 0 })} TRUST
               </p>
             </div>
             <div className="w-12 h-12 relative flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="24" cy="24" r="20" className="stroke-white/10 fill-none" strokeWidth="4" />
                 <motion.circle 
                   cx="24" cy="24" r="20" 
                   className="stroke-purple-400 fill-none" 
                   strokeWidth="4" 
                   strokeDasharray="125.6"
                   animate={{ strokeDashoffset: 125.6 - (125.6 * (currentApy / 15)) }}
                   transition={{ duration: 1 }}
                 />
               </svg>
               <TrendingUp size={12} className="absolute text-purple-400" />
             </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
