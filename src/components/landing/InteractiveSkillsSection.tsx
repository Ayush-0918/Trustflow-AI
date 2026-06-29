"use client";

import { useEffect, useRef, useState } from "react";
// @ts-ignore
import Matter from "matter-js";
import { motion } from "framer-motion";

function CircularScore({ score, label, color, delay = 0 }: { score: number, label: string, color: string, delay?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const stepTime = Math.abs(Math.floor(duration / steps));
      let current = 0;
      const interval = setInterval(() => {
        current += (score / steps);
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, stepTime);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay }}
            style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-display font-bold text-white">
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      <span className="mt-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function InteractiveSkillsSection() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const width = sceneRef.current.clientWidth;
    const height = 400;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "transparent",
      },
    });
    renderRef.current = render;
    Render.run(render);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    const wallOptions = { isStatic: true, render: { visible: false } };
    Composite.add(world, [
      Bodies.rectangle(width / 2, -500, width, 50, wallOptions),
      Bodies.rectangle(width / 2, height + 10, width, 20, wallOptions),
      Bodies.rectangle(-10, height / 2, 20, height, wallOptions),
      Bodies.rectangle(width + 10, height / 2, 20, height, wallOptions),
    ]);

    const skills = [
      { text: "Supabase", color: "#10b981", width: 140 },
      { text: "LangChain", color: "#6366f1", width: 150 },
      { text: "Docker", color: "#3b82f6", width: 120 },
      { text: "Redis", color: "#ef4444", width: 100 },
      { text: "React", color: "#06b6d4", width: 110 },
      { text: "AWS", color: "#f59e0b", width: 100 },
      { text: "Python", color: "#eab308", width: 120 },
      { text: "OpenAI", color: "#10b981", width: 120 },
      { text: "Kubernetes", color: "#3b82f6", width: 160 },
      { text: "TypeScript", color: "#3b82f6", width: 160 },
      { text: "FastAPI", color: "#10b981", width: 120 },
      { text: "PostgreSQL", color: "#3b82f6", width: 160 },
      { text: "Next.js", color: "#ffffff", width: 120 },
      { text: "TailwindCSS", color: "#06b6d4", width: 160 },
    ];

    skills.forEach((skill, index) => {
      // Create a pill-shaped body
      const x = width / 2 + (Math.random() - 0.5) * (width * 0.8);
      const y = -100 - (index * 60) - Math.random() * 200;
      
      const body = Bodies.rectangle(x, y, skill.width, 40, {
        chamfer: { radius: 20 },
        restitution: 0.6,
        render: {
          fillStyle: "rgba(255, 255, 255, 0.03)",
          strokeStyle: skill.color,
          lineWidth: 1.5,
        },
      });

      // Add a custom property to store the text (will be drawn manually if we want, or just leave as glowing borders for performance)
      // Since Matter.js basic renderer doesn't draw text, we'll let it just be colored outlines.
      Composite.add(world, body);
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (engineRef.current) Engine.clear(engineRef.current);
      if (renderRef.current?.canvas) {
        renderRef.current.canvas.remove();
      }
    };
  }, []);

  return (
    <section className="py-24 bg-black relative z-10 border-t border-white/5 overflow-hidden">
      {/* Background Physics Sandbox */}
      <div className="w-full max-w-7xl mx-auto px-6 mb-16 relative">
        <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="absolute inset-x-0 top-0 h-[400px] pointer-events-none z-10 flex items-center justify-center bg-gradient-to-b from-black/80 via-transparent to-black">
          <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-gray-400 absolute right-8 top-12 pointer-events-auto cursor-pointer flex items-center gap-2 hover:bg-white/10 transition-colors">
            Click & drag to scatter <span className="text-yellow-500">⚡</span>
          </div>
        </div>
        
        {/* Physics Canvas Container */}
        <div ref={sceneRef} className="w-full h-[400px] cursor-grab active:cursor-grabbing border border-white/5 rounded-[2rem] bg-[#0a0a0c] overflow-hidden" />
      </div>

      <div className="container max-w-5xl mx-auto px-6 text-center">
        <div className="mb-16">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-4">Trust Score System</h3>
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Know exactly <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">where they stand</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mt-4">
            AI-powered scores give you a real-time picture of a freelancer's capability.
            Each tells you exactly who you are hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CircularScore score={92} label="GitHub Quality" color="#a855f7" delay={0.2} />
          <CircularScore score={88} label="Code Reliability" color="#10b981" delay={0.4} />
          <CircularScore score={74} label="Communication" color="#ec4899" delay={0.6} />
        </div>
      </div>
    </section>
  );
}
