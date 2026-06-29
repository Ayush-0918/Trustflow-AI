"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { aiAPI, projectsAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { 
  Loader2, Sparkles, Target, AlertTriangle, 
  CheckCircle2, Clock, Command, CornerDownLeft, Activity
} from "lucide-react";
import toast from "react-hot-toast";
import { useAudio } from "@/lib/AudioProvider";

gsap.registerPlugin(useGSAP);

interface Blueprint {
  phases: Array<{
    name: string;
    duration_days: number;
    tasks: string[];
    deliverables: string[];
  }>;
  skills_recommended: string[];
  risk_factors: string[];
  success_criteria: string[];
  suggested_milestones: Array<{
    title: string;
    percentage: number;
    description: string;
  }>;
  estimated_hours: number;
  complexity: string;
}

export default function AIPlannerPage() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { playClick, playSuccess, playBoot } = useAudio();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [prompt, setPrompt] = useState("");

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useGSAP(() => {
    gsap.from(".raycast-palette", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power4.out",
    });
  }, { scope: container });

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  async function handleGenerate() {
    if (!prompt.trim() || prompt.length < 10) {
      toast.error("Please provide a more detailed project description (min 10 characters).");
      return;
    }

    playBoot();
    setIsGenerating(true);
    setBlueprint(null);
    try {
      const res = await aiAPI.generateBlueprint({
        project_title: prompt.split("\\n")[0].substring(0, 60), 
        project_description: prompt,
        budget: 5000,
        deadline_days: 30,
      });
      setBlueprint(res.data.blueprint);
      playSuccess();
      toast.success("Neural sequence generated successfully.");
    } catch (err: any) {
      console.error("AI Generation Error:", err.response?.data || err);
      toast.error(err.response?.data?.detail || "Sequence failed. Try a more detailed prompt.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCreateProject() {
    if (!blueprint) return;
    setIsSaving(true);
    playClick();
    try {
      const projectRes = await projectsAPI.create({
        title: prompt.split("\\n")[0].substring(0, 60),
        description: prompt,
        budget_max: 5000,
        skills_required: blueprint.skills_recommended,
      });
      const projectId = projectRes.data.id;

      const budget = 5000;
      const milestoneAmount = Math.floor(budget / blueprint.suggested_milestones.length);

      for (const m of blueprint.suggested_milestones) {
        await projectsAPI.createMilestone(projectId, {
          title: m.title,
          description: m.description,
          amount: milestoneAmount,
        });
      }

      playSuccess();
      toast.success("Blueprint synthesized and injected to registry!");
      router.push(`/projects`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Injection failed");
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <WebGLBackground />
      <div ref={container} className="relative z-10 w-full h-full min-h-screen flex flex-col items-center pt-[15vh] px-4">
        
        {/* Raycast-style Command Palette */}
        <motion.div 
          layout
          initial={{ borderRadius: 24 }}
          className="raycast-palette w-full max-w-3xl bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5"
        >
          {/* Top Search Bar Area */}
          <div className="flex items-start gap-4 p-6 relative">
            <Command className="text-white/40 shrink-0 mt-1" size={24} />
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="What do you want to build?"
              className="w-full bg-transparent text-xl md:text-2xl font-sans font-light text-white placeholder:text-white/20 focus:outline-none resize-none min-h-[36px] overflow-hidden leading-relaxed"
              rows={1}
            />
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {isGenerating && !blueprint && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 250 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center justify-center border-t border-white/5 bg-black/40"
              >
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full animate-[spin_3s_linear_infinite]" style={{ borderTopColor: 'rgba(168,85,247,0.8)' }} />
                  <div className="absolute inset-2 border border-cyan-500/30 rounded-full animate-[spin_2s_linear_infinite_reverse]" style={{ borderLeftColor: 'rgba(34,211,238,0.8)' }} />
                  <Activity size={20} className="text-purple-400 animate-pulse" />
                </div>
                <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Synthesizing Neural Matrix</h2>
              </motion.div>
            )}

            {/* Results State */}
            {blueprint && !isGenerating && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 max-h-[55vh] overflow-y-auto custom-scrollbar bg-[#0A0A0A]/40"
              >
                <div className="space-y-8">
                  {/* High Level Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Complexity</p>
                      <p className="text-2xl font-sans font-light capitalize text-white">{blueprint.complexity}</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Compute Time</p>
                      <p className="text-2xl font-sans font-light text-white">{blueprint.estimated_hours}H</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Phases</p>
                      <p className="text-2xl font-sans font-light text-white">{blueprint.phases?.length || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-5">
                      <h3 className="font-sans text-sm font-medium text-white/80 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400/70" /> Recommended Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {blueprint.skills_recommended?.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 text-[11px] font-mono rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-5">
                      <h3 className="font-sans text-sm font-medium text-white/80 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-400/70" /> Risk Vectors
                      </h3>
                      <ul className="space-y-3 text-xs font-sans text-white/50">
                        {blueprint.risk_factors?.map((r, i) => (
                          <li key={i} className="flex gap-3 items-start">
                            <span className="text-white/20 mt-0.5">•</span> 
                            <span className="leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Execution Matrix (Timeline style) */}
                  <div className="pt-4">
                    <h3 className="font-sans text-sm font-medium text-white/80 flex items-center gap-2 mb-6">
                      <Clock size={16} className="text-cyan-400/70" /> Execution Matrix
                    </h3>
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {blueprint.phases?.map((phase, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-8 last:pb-0">
                          {/* Timeline dot */}
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white/20 bg-[#0A0A0A] text-white/50 text-[10px] font-mono z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                            {i + 1}
                          </div>
                          
                          {/* Content Card */}
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-semibold text-sm text-white/90">{phase.name}</h4>
                              <span className="text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                {phase.duration_days}d
                              </span>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2">Sequence</p>
                                <ul className="space-y-2">
                                  {phase.tasks?.map((t, idx) => (
                                    <li key={idx} className="text-[11px] font-sans text-white/60 flex gap-2">
                                      <span className="text-white/20 shrink-0">—</span>
                                      <span>{t}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="pt-3 border-t border-white/5">
                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2">Deliverables</p>
                                <ul className="space-y-2">
                                  {phase.deliverables?.map((d, idx) => (
                                    <li key={idx} className="text-[11px] font-sans text-white/80 flex gap-2 items-start">
                                      <CheckCircle2 size={12} className="shrink-0 mt-0.5 text-white/30" />
                                      <span>{d}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Bar (Footer) */}
          <div className="p-4 bg-[#0A0A0A] border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
            <div className="flex items-center gap-3">
              {!blueprint && !isGenerating && <span>Type prompt & press <kbd className="font-sans font-medium bg-white/10 px-1.5 py-0.5 rounded text-white/80 mx-1">⌘ Enter</kbd></span>}
              {isGenerating && <span className="animate-pulse">Processing...</span>}
              {blueprint && <span>Blueprint synthesized.</span>}
            </div>
            {blueprint && (
              <button
                onClick={handleCreateProject}
                disabled={isSaving}
                className="flex items-center gap-2 bg-white text-black hover:bg-white/90 transition-colors px-4 py-2 rounded-full font-medium tracking-wide shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Deploy Protocol
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
