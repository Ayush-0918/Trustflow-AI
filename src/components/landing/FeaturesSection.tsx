"use client";

import { motion } from "framer-motion";
import { Terminal, Send, CheckCircle, Code2, Briefcase, FileText, Cpu, Presentation, ShieldAlert } from "lucide-react";

const features = [
  { icon: ShieldAlert, title: "Smart Contract Escrow", desc: "Payments are securely held and released upon milestone completion." },
  { icon: Code2, title: "Code Review AI", desc: "Automated analysis of PRs and commits before payment release." },
  { icon: Presentation, title: "Video Interviews", desc: "Integrated seamless video calls for vetting freelancers." },
  { icon: FileText, title: "Resume Parser", desc: "Extracts key skills and matches them to project requirements." },
  { icon: Briefcase, title: "Job Matching", desc: "Connects elite freelancers with high-quality startups." },
  { icon: Cpu, title: "AI Skill Assessments", desc: "Dynamic testing to verify the actual capability of a developer." },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-black text-white relative z-10 border-t border-white/5">
      <div className="container max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Your entire freelance workflow, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">automated by AI.</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Replaces upwork, slack, zoom, and github reviews. Everything you need to hire, manage, and pay with confidence.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Chat / Code Window */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/20"
          >
            {/* Window Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4 bg-[#111115]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <div>
                <h4 className="font-semibold text-sm">TrustFlow AI Agent</h4>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online • Analyzing Pull Request #42
                </div>
              </div>
              <div className="ml-auto text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                24/7
              </div>
            </div>

            {/* Window Body (Code & Chat) */}
            <div className="p-6 space-y-6">
              {/* Fake Code Block */}
              <div className="rounded-xl bg-[#111115] border border-white/5 p-4 font-mono text-sm overflow-hidden">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="space-y-3">
                  <p className="text-red-400 line-through opacity-70">
                    <span className="text-red-500 mr-2">{"// ❌ Bad"}</span> 
                    {"const [state, setState] = useState({ isLoading: true });"}
                  </p>
                  <p className="text-emerald-400">
                    <span className="text-emerald-500 mr-2">{"// ✅ Fix (Optimized state)"}</span> 
                    {"const [isLoading, setIsLoading] = useState(true);"}
                  </p>
                  <p className="text-emerald-400">
                    <span className="text-emerald-500 mr-2">{"// ✅ Code perfectly aligns with requirements."}</span> 
                  </p>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%]">
                    Can we release the escrow for Milestone 1?
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-700 ml-3 shrink-0 flex items-center justify-center text-xs">U</div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 shrink-0 flex items-center justify-center text-xs">AI</div>
                  <div className="bg-brand-900/30 border border-brand-500/20 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-brand-50 max-w-[85%]">
                    Yes! I've reviewed the latest commit. The code is highly optimized and passes all 12 test suites. Releasing $1,500 to the freelancer's wallet now. 🚀
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="relative mt-4">
                <input 
                  type="text" 
                  disabled
                  placeholder="Ask the agent to review code, release payments..." 
                  className="w-full bg-[#111115] border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm focus:outline-none"
                />
                <button className="absolute right-2 top-2 bottom-2 w-10 bg-brand-600 hover:bg-brand-500 rounded-lg flex items-center justify-center transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: Feature Cards */}
          <div className="lg:col-span-5 space-y-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer flex gap-4 items-start"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#111115] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-brand-500/20 group-hover:text-brand-400 group-hover:border-brand-500/30 transition-all duration-300">
                    <Icon size={20} className="text-gray-400 group-hover:text-brand-400 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{feature.title}</h4>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
