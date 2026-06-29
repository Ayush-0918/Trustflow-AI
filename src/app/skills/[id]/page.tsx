"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  Clock, CheckCircle2, ShieldAlert,
  Loader2, Play, Lock, AlertCircle, Maximize, Activity, Cpu, ScanFace, ArrowRight
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { WebGLBackground } from "@/components/ui/WebGLBackground";

const MOCK_QUESTIONS = [
  { question: "Which of the following is true about PostgreSQL indexes?", options: ["B-Tree indexes are best for exact match and range queries.", "Hash indexes support range queries natively.", "GIN indexes are faster for simple equality checks than B-Tree.", "Indexes always speed up write operations."], answer: 0 },
  { question: "What is the primary advantage of React Native's new architecture (Fabric)?", options: ["It completely removes JavaScript from the runtime.", "It allows direct synchronous communication between JS and Native threads via JSI.", "It relies exclusively on the Bridge for serialization.", "It replaces React with a custom templating engine."], answer: 1 },
  { question: "In a React useEffect hook with an empty dependency array [], when does the cleanup function run?", options: ["After every re-render", "Right before the component unmounts", "Only when the browser window is closed", "It never runs if the dependency array is empty"], answer: 1 },
  { question: "What is the Time Complexity of searching for an element in a balanced Binary Search Tree?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], answer: 2 },
  { question: "Which HTTP status code should be used when a requested resource is found but the client does not have the necessary permissions?", options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"], answer: 2 },
  { question: "In Next.js App Router, which file name is used to define an Error Boundary for a route segment?", options: ["boundary.tsx", "error.tsx", "catch.tsx", "layout-error.tsx"], answer: 1 },
  { question: "What does the ACID acronym stand for in database transaction properties?", options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Completeness, Integrity, Dependability", "Allocation, Concurrency, Indexing, Data", "Automated, Cached, Isolated, Distributed"], answer: 0 },
  { question: "In Docker, what is the primary difference between an Image and a Container?", options: ["An image runs the application; a container stores the data.", "An image is a read-only template; a container is a running instance of an image.", "A container is used for building; an image is used for deploying.", "There is no difference; they are synonyms."], answer: 1 },
  { question: "What is the primary purpose of the Virtual DOM in React?", options: ["To directly manipulate the browser's DOM faster.", "To provide a sandboxed environment for execution.", "To minimize costly reflows and repaints in the actual DOM by diffing changes in memory.", "To allow React to run on server environments without a browser."], answer: 2 },
  { question: "When scaling a backend system, what does 'horizontal scaling' refer to?", options: ["Adding more CPU and RAM to a single server instance.", "Adding more servers/nodes to distribute the load.", "Optimizing the database queries to run faster.", "Migrating the system to a geographically closer data center."], answer: 1 }
];

const phaseVariants = {
  initial: { opacity: 0, filter: "blur(20px)", scale: 0.95 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: { opacity: 0, filter: "blur(20px)", scale: 1.05 }
};

export default function AssessmentPage() {
  const params = useParams();
  const skillId = typeof params.id === "string" ? params.id.replace(/-/g, " ") : "Assessment";
  
  const [phase, setPhase] = useState<"intro" | "calibrating" | "test" | "evaluating" | "complete">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const startCalibration = () => {
    setPhase("calibrating");
    setTimeout(() => setPhase("test"), 3500);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    if (currentQuestion < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setPhase("evaluating");
      setTimeout(() => setPhase("complete"), 3000);
    }
  };

  return (
    <AppShell>
      <WebGLBackground />
      <div className="p-6 md:p-8 xl:p-10 h-full flex flex-col relative z-10 overflow-hidden">
        <div className="max-w-3xl mx-auto w-full space-y-8 flex-1 flex flex-col">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight uppercase text-white drop-shadow-md capitalize">
                {skillId} Verification
              </h1>
              <p className="text-cyan-400 mt-1 text-xs font-mono tracking-widest uppercase">AI-Proctored Environment</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
              {phase === "test" && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl shadow-inner">
                    <Clock size={14} className="text-gray-400" />
                    <span className="font-mono text-white text-sm">29:59</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <span className="font-cyber font-bold tracking-widest text-[10px] text-cyan-400 uppercase">AI Active</span>
                  </div>
                  <BehavioralWidget />
                </>
              )}
            </div>
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {phase === "intro" && (
                <motion.div key="intro" variants={phaseVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                  <SpotlightCard className="p-8 md:p-12 h-full flex flex-col items-center justify-center text-center space-y-8 border-white/10 bg-white/[0.02]">
                    <ShieldAlert size={48} className="text-cyan-400 mx-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                    <div className="space-y-2">
                      <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Environment Ready</h2>
                      <p className="text-sm font-mono text-gray-400 max-w-sm">
                        TrustFlow AI is ready to monitor your session. Please ensure your camera is active and background noise is minimal.
                      </p>
                    </div>
                    <button
                      onClick={startCalibration}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-xl font-cyber font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    >
                      <Play size={18} /> Initiate Sequence
                    </button>
                  </SpotlightCard>
                </motion.div>
              )}

              {phase === "calibrating" && (
                <motion.div key="calibrating" variants={phaseVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                  <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="h-full py-20 flex flex-col items-center justify-center text-center space-y-12 border-purple-500/30 bg-purple-500/5 overflow-hidden">
                     <div className="relative w-64 h-64 flex items-center justify-center">
                       <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'rgba(168,85,247,0.8)' }} />
                       <div className="absolute inset-4 border-2 border-cyan-500/20 rounded-full animate-[spin_3s_linear_infinite_reverse]" style={{ borderLeftColor: 'rgba(34,211,238,0.8)' }} />
                       <div className="absolute inset-8 border border-white/10 rounded-full animate-[spin_2s_linear_infinite]" style={{ borderBottomColor: 'rgba(255,255,255,0.8)' }} />
                       
                       <div className="w-16 h-16 bg-purple-500/20 border border-purple-400/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] z-10 relative">
                         <Activity size={32} className="text-purple-400 animate-pulse" />
                       </div>
                       <div className="absolute inset-0 bg-purple-500/5 rounded-full animate-ping" />
                     </div>
                     
                     <div className="space-y-3 z-10">
                       <h2 className="text-3xl font-display font-black text-purple-400 tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] uppercase">Neural Sync Active</h2>
                       <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Calibrating behavioral tracking engines...</p>
                     </div>
                  </SpotlightCard>
                </motion.div>
              )}

              {phase === "test" && (
                <motion.div key="test" variants={phaseVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                  <SpotlightCard className="h-full flex flex-col border-white/10 bg-white/[0.02] p-6 overflow-hidden">
                     <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                        <span className="font-cyber font-bold tracking-widest uppercase text-gray-500 text-xs">Question {currentQuestion + 1} of {MOCK_QUESTIONS.length}</span>
                     </div>
                     <AnimatePresence mode="wait">
                       <motion.div 
                         key={currentQuestion}
                         initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                         animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                         exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
                         transition={{ duration: 0.3 }}
                         className="flex-1 flex flex-col"
                       >
                         <h3 className="text-xl font-mono text-white leading-relaxed mb-8">{MOCK_QUESTIONS[currentQuestion].question}</h3>
                         <div className="space-y-3 flex-1" style={{ perspective: "1000px" }}>
                           {MOCK_QUESTIONS[currentQuestion].options.map((opt, i) => (
                             <HolographicOption 
                               key={i} 
                               opt={opt} 
                               index={i} 
                               isSelected={selectedOption === i} 
                               onClick={() => setSelectedOption(i)} 
                             />
                           ))}
                         </div>
                       </motion.div>
                     </AnimatePresence>
                     <button onClick={handleNext} className="mt-8 self-end px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-cyber font-bold hover:bg-white/10">
                       {currentQuestion === MOCK_QUESTIONS.length - 1 ? 'Submit' : 'Next'}
                     </button>
                  </SpotlightCard>
                </motion.div>
              )}

              {phase === "evaluating" && (
                <motion.div key="evaluating" variants={phaseVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                   <SpotlightCard className="h-full flex flex-col items-center justify-center border-cyan-500/30 bg-cyan-500/5">
                     <Loader2 size={48} className="animate-spin text-cyan-400 mb-6" />
                     <h2 className="text-xl font-display text-cyan-400 uppercase tracking-widest">Compiling Results</h2>
                   </SpotlightCard>
                </motion.div>
              )}

              {phase === "complete" && (
                <motion.div key="complete" variants={phaseVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
                  <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.2)" className="h-full p-12 flex flex-col items-center justify-center text-center space-y-8 border-emerald-500/30 bg-emerald-500/5">
                    <CheckCircle2 size={64} className="text-emerald-400" />
                    <h2 className="text-3xl font-display font-black text-emerald-400 uppercase">Assessment Complete</h2>
                    <Link href="/skills">
                      <button className="px-8 py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 rounded-xl font-cyber font-bold uppercase">Return to Registry</button>
                    </Link>
                  </SpotlightCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function useBehavioralTracking() {
  const [speed, setSpeed] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  
  useEffect(() => {
    let lastTime = performance.now();
    let lastX = 0;
    let lastY = 0;
    
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      setSpeed(Math.min(100, (dist / dt) * 10));
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    };
    
    const onKeyDown = () => setKeystrokes(k => k + 1);
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);
    
    const interval = setInterval(() => {
       setSpeed(s => Math.max(0, s - 5));
    }, 100);
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
      clearInterval(interval);
    }
  }, []);
  
  return { speed, keystrokes };
}

function BehavioralWidget() {
  const { speed, keystrokes } = useBehavioralTracking();
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-purple-500/10 border border-purple-400/30 rounded-xl hidden md:flex shadow-[0_0_15px_rgba(168,85,247,0.15)]">
      <div className="flex flex-col gap-1 w-16">
         <span className="text-[8px] font-cyber tracking-widest text-purple-400 uppercase">Mouse Vel</span>
         <div className="h-1 bg-white/10 rounded-full overflow-hidden">
           <div className="h-full bg-purple-400 transition-all duration-75 shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: `${speed}%` }} />
         </div>
      </div>
      <div className="w-px h-6 bg-purple-400/20 mx-1" />
      <div className="flex flex-col">
         <span className="text-[8px] font-cyber tracking-widest text-purple-400 uppercase">Keystrokes</span>
         <span className="text-xs font-mono text-purple-200">{keystrokes}</span>
      </div>
    </div>
  )
}

function HolographicOption({ opt, isSelected, onClick, index }: any) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateX(-((y - centerY) / centerY) * 4);
    setRotateY(((x - centerX) / centerX) * 4);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.button 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateX, rotateY, opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      initial={{ opacity: 0, x: -20 }}
      className={clsx(
        "w-full text-left p-5 rounded-xl border font-mono text-sm transition-colors flex items-center gap-4 relative overflow-hidden group", 
        isSelected ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/[0.05]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      <div style={{ transform: "translateZ(20px)" }} className="flex items-center gap-4 w-full">
        <div className={clsx("w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "border-gray-600 group-hover:border-gray-400")}>
           {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
        </div>
        <span style={{ transform: "translateZ(30px)" }}>{opt}</span>
      </div>
    </motion.button>
  );
}
