"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface DataPoint {
  date: string | Date;
  value: number;
}

interface AreaChartGradientProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
  height?: number;
  valuePrefix?: string;
}

export function AreaChartGradient({
  data,
  title,
  subtitle,
  color = "#3b82f6", 
  height = 300,
  valuePrefix = "",
}: AreaChartGradientProps) {
  const formattedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      formattedDate: typeof d.date === "string" ? d.date : format(d.date, "MMM dd"),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-3 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">{label}</p>
          <p className="text-xl font-display font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            {valuePrefix}{payload[0].value.toLocaleString()}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Ambient background glow matching the chart line */}
      <div 
        className="absolute inset-0 z-0 blur-3xl opacity-[0.15] pointer-events-none" 
        style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} 
      />
      
      {(title || subtitle) && (
        <div className="mb-6 relative z-10">
          {title && <h3 className="text-lg font-cyber font-bold tracking-widest text-white uppercase">{title}</h3>}
          {subtitle && <p className="text-xs font-mono text-gray-500 tracking-widest uppercase">{subtitle}</p>}
        </div>
      )}
      
      <div style={{ height: height }} className="w-full -ml-4 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="1 10" vertical={false} stroke="rgba(255,255,255,0.1)" strokeLinecap="round" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false} 
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }} 
              tickFormatter={(value) => `${valuePrefix}${value}`}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }} 
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={2000}
              style={{ filter: "url(#neonGlow)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
