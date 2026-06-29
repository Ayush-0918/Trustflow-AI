"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Cpu, ShieldCheck, Activity, TerminalSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAudio } from "@/lib/AudioProvider";

gsap.registerPlugin(useGSAP);

const BOOT_SEQUENCE = [
  "INITIALIZING SECURE ENVIRONMENT...",
  "ESTABLISHING ENCRYPTED HANDSHAKE...",
  "COMPILING SMART CONTRACT [SOLIDITY v0.8.24]...",
  "GENERATING CRYPTOGRAPHIC PROOF...",
  "BUILDING ZK-SNARK CIRCUIT...",
  "ENCRYPTING PAYLOAD [AES-GCM-256]...",
  "AWAITING WEB3 WALLET SIGNATURE...",
  "BROADCASTING TRANSACTION TO NETWORK...",
  "AWAITING CONSENSUS VALIDATION...",
  "CONTRACT SUCCESSFULLY DEPLOYED.",
];

export function DeployTerminalOverlay({ 
  isOpen, 
  onClose,
  onComplete 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { playBoot, playSuccess, playClick } = useAudio();

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setLogs([]);
      setIsSuccess(false);
      setIsWaitingForSignature(false);
      document.body.style.overflow = "hidden";
      
      playBoot();

      let currentStep = 0;
      let interval: NodeJS.Timeout;

      const runStep = async () => {
        if (currentStep < BOOT_SEQUENCE.length) {
          const currentLog = BOOT_SEQUENCE[currentStep];
          
          if (currentLog === "AWAITING WEB3 WALLET SIGNATURE...") {
            clearInterval(interval);
            playClick();
            setLogs(prev => [...prev, currentLog]);
            setStep(currentStep + 1);
            setIsWaitingForSignature(true);
            
            // Mock signature approval for seamless demo
            setTimeout(() => {
              setIsWaitingForSignature(false);
              currentStep++;
              // Resume sequence
              interval = setInterval(runStep, 800);
            }, 2500);
            
            return;
          }

          playClick();
          setLogs(prev => [...prev, currentLog]);
          setStep(currentStep + 1);
          currentStep++;
        } else {
          clearInterval(interval);
          setIsSuccess(true);
          playSuccess();
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      };

      interval = setInterval(runStep, 800); // 800ms per step

      return () => {
        clearInterval(interval);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onComplete]);


  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useGSAP(() => {
    if (isOpen && containerRef.current) {
      gsap.fromTo(".scanline", 
        { top: "-10%" },
        { top: "110%", duration: 2, repeat: -1, ease: "linear" }
      );
      
      // Glitch effect on boot
      gsap.to(".terminal-container", {
        x: () => Math.random() * 10 - 5,
        y: () => Math.random() * 10 - 5,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "rough",
        clearProps: "all"
      });
    }
  }, { scope: containerRef, dependencies: [isOpen] });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
        >
          {/* Cybernetic Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotateX: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="terminal-container relative w-full max-w-4xl h-[80vh] md:h-[600px] bg-black border-2 border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.2)]"
            style={{ perspective: "1000px" }}
          >
            {/* Scanline */}
            <div className="scanline absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] opacity-50 z-20 pointer-events-none" />

            {/* Header */}
            <div className="h-14 border-b border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between px-6">
              <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                <TerminalSquare size={16} />
                <span>SECURE_OP_CENTER // DEPLOYMENT_TERMINAL</span>
              </div>
              <button 
                onClick={onClose}
                className="text-cyan-400/50 hover:text-cyan-400 transition-colors font-mono text-xs uppercase tracking-widest z-50"
              >
                [ ABORT ]
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-8 h-[calc(100%-3.5rem)] flex flex-col relative z-10 overflow-hidden font-mono">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-[10px] text-cyan-400 uppercase tracking-widest mb-2">
                  <span>SYSTEM PROGRESS</span>
                  <span>{Math.round((step / BOOT_SEQUENCE.length) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / BOOT_SEQUENCE.length) * 100}%` }}
                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  />
                </div>
              </div>

              {/* Logs */}
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide text-sm md:text-base">
                {logs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 ${index === BOOT_SEQUENCE.length - 1 ? 'text-emerald-400 font-bold' : log.includes('ERROR') ? 'text-red-400 font-bold' : 'text-cyan-300/80'}`}
                  >
                    <span className="text-cyan-600 shrink-0 mt-0.5">{`>`}</span>
                    <span className="tracking-wide">{log}</span>
                  </motion.div>
                ))}
                
                {isWaitingForSignature && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 border border-cyan-500/50 bg-cyan-500/10 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-t-2 border-cyan-400 animate-spin" />
                      <span className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Please sign the transaction in your Web3 wallet...</span>
                    </div>
                  </motion.div>
                )}

                {!isSuccess && !logs.some(l => l.includes('ERROR')) && !isWaitingForSignature && (
                  <div className="flex items-center gap-3 text-cyan-400 animate-pulse">
                    <span className="text-cyan-600">{`>`}</span>
                    <span className="w-2.5 h-5 bg-cyan-400 inline-block" />
                  </div>
                )}
                <div ref={logEndRef} />
              </div>

              {/* Success Overlay Pulse */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center border border-emerald-500/50 shadow-[inset_0_0_100px_rgba(16,185,129,0.2)]"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <CheckCircle2 size={80} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] mb-6" />
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)] uppercase">
                      Deployment Verified
                    </h2>
                    <p className="font-mono text-emerald-400 uppercase tracking-widest mt-3 text-sm">
                      Smart Contract Active on Network
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
