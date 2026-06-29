"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";

interface TrustBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showBar?: boolean;
}

function getTrustLevel(score: number) {
  if (score >= 80) return { level: "high",   label: "Trusted",  color: "emerald" };
  if (score >= 60) return { level: "medium", label: "Growing",  color: "amber"   };
  return             { level: "low",    label: "Building", color: "red"    };
}

export function TrustBadge({ score, size = "md", showLabel = false, showBar = false }: TrustBadgeProps) {
  const { level, label, color } = getTrustLevel(score);

  const dotSize = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3" }[size];
  const textSize = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  return (
    <div className="space-y-2">
      <div
        className={clsx(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-colors",
          textSize,
          level === "high"   && "trust-badge-high",
          level === "medium" && "trust-badge-medium",
          level === "low"    && "trust-badge-low",
        )}
      >
        <span
          className={clsx(dotSize, "rounded-full animate-pulse-trust shadow-sm",
            color === "emerald" && "bg-emerald-500 shadow-emerald-500/50",
            color === "amber"   && "bg-amber-500 shadow-amber-500/50",
            color === "red"     && "bg-red-500 shadow-red-500/50",
          )}
        />
        <span className="font-bold">{score.toFixed(0)}</span>
        {showLabel && <span className="opacity-80 font-medium">· {label}</span>}
      </div>

      {showBar && (
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(score, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx(
              "h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]",
              color === "emerald" && "bg-emerald-500",
              color === "amber"   && "bg-amber-500",
              color === "red"     && "bg-red-500",
            )}
          />
        </div>
      )}
    </div>
  );
}

// Large circular trust score for profile page
export function TrustRing({ score, size = 140 }: { score: number, size?: number }) {
  const { color, label } = getTrustLevel(score);
  const r = (size / 2) - 16;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;
  const strokeWidth = size > 100 ? 12 : 6;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-md">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          className="stroke-secondary/50" strokeWidth={strokeWidth} />
        <motion.circle 
          cx={size/2} cy={size/2} r={r} fill="none"
          className={clsx(
            color === "emerald" && "stroke-emerald-500",
            color === "amber"   && "stroke-amber-500",
            color === "red"     && "stroke-red-500",
          )}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {size > 100 ? (
        <div className="absolute text-center flex flex-col items-center justify-center">
          <motion.p 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black tracking-tighter"
          >
            {score.toFixed(0)}
          </motion.p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{label}</p>
        </div>
      ) : (
        <div className="absolute text-center flex flex-col items-center justify-center">
          <span className="font-bold text-sm">{score.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
