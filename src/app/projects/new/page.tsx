"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion } from "framer-motion";
import { FileCode2, ArrowRight, ShieldCheck, Zap, Database } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    milestones: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.budget) {
      toast.error("Required parameters missing.");
      return;
    }
    setLoading(true);
    // Simulate smart contract compilation and deployment delay
    setTimeout(() => {
      setLoading(false);
      toast.success("Smart Contract deployed to grid!");
      router.push("/projects");
    }, 2000);
  };

  return (
    <AppShell>
      <div className="p-10 h-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/projects" className="text-cyan-500 hover:text-cyan-300 transition-colors font-mono text-sm uppercase tracking-widest">
                &lt; Return to Registry
              </Link>
            </div>
            <h1 className="text-4xl font-display font-black tracking-tight uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">Deploy Contract</h1>
            <p className="text-cyan-400 mt-2 text-sm font-mono tracking-widest uppercase">Initialize a new secure smart contract node.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.15)" className="p-8 border-white/10 bg-white/[0.02]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-cyber font-bold uppercase tracking-widest text-cyan-400">Contract Designation (Title)</label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Decentralized API Layer"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-cyber font-bold uppercase tracking-widest text-cyan-400">Operational Directives (Description)</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Define the scope and requirements..."
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-cyber font-bold uppercase tracking-widest text-cyan-400">Allocated Budget ($)</label>
                      <input 
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="5000"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-cyber font-bold uppercase tracking-widest text-cyan-400">Milestone Count</label>
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={formData.milestones}
                        onChange={(e) => setFormData({ ...formData, milestones: parseInt(e.target.value) || 1 })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 rounded-xl font-cyber font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                      {loading ? (
                        <>Compiling Bytecode <span className="animate-pulse">...</span></>
                      ) : (
                        <>Compile & Deploy Contract <ArrowRight size={18} /></>
                      )}
                    </button>
                  </div>
                </form>
              </SpotlightCard>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-6 space-y-4 border-white/10 bg-white/[0.02]">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-400/30 rounded-xl flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Escrow Security</h3>
                  <p className="text-gray-400 text-sm font-mono mt-1">Funds are locked securely in an automated escrow until node milestones are verified.</p>
                </div>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.15)" className="p-6 space-y-4 border-white/10 bg-white/[0.02]">
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-400/30 rounded-xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Immutable Ledger</h3>
                  <p className="text-gray-400 text-sm font-mono mt-1">All contract terms, revisions, and deliveries are permanently recorded.</p>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
