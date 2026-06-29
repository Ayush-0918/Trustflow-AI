"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TrustScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function TrustScoreGauge({ score, size = 180, strokeWidth = 8 }: TrustScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const innerRadius = radius - 15;
  const outerRadius = radius + 15;
  const circumference = radius * 2 * Math.PI;
  const innerCircumference = innerRadius * 2 * Math.PI;
  
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let current = 0;
    const timer = setInterval(() => {
      current += (score / steps);
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return "#22d3ee"; // Cyan
    if (s >= 50) return "#a855f7"; // Purple
    return "#f43f5e"; // Rose
  };

  const color = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size + 40, height: size + 40 }}>
      {/* Absolute Ambient Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color, transform: "scale(0.8)" }}
      />
      
      <svg width={size + 40} height={size + 40} className="transform -rotate-90 relative z-10">
        
        {/* Outer Rotating HUD Ring */}
        <motion.circle
          cx={(size + 40) / 2}
          cy={(size + 40) / 2}
          r={outerRadius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
          strokeDasharray="4 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Inner Counter-Rotating Ring */}
        <motion.circle
          cx={(size + 40) / 2}
          cy={(size + 40) / 2}
          r={innerRadius}
          fill="transparent"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="2 12"
          opacity={0.3}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Main Background Track */}
        <circle
          cx={(size + 40) / 2}
          cy={(size + 40) / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
        />
        
        {/* Main Animated Progress */}
        <motion.circle
          cx={(size + 40) / 2}
          cy={(size + 40) / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      
      {/* Center Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span 
          className="text-5xl font-display font-black tracking-tighter"
          style={{ 
            color: "#fff", 
            textShadow: `0 0 15px ${color}`,
            WebkitTextStroke: "1px rgba(255,255,255,0.1)"
          }}
        >
          {Math.round(animatedScore)}
        </span>
        <span className="text-[10px] font-cyber tracking-[0.3em] uppercase text-gray-400 mt-1">
          Index
        </span>
      </div>
    </div>
  );
}
