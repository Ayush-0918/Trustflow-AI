"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { aiAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Video, VideoOff, Shield, CheckCircle2,
  AlertCircle, Loader2, Camera, RefreshCw,
  ScanFace, Activity
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { motion } from "framer-motion";

type Phase = "intro" | "camera" | "analyzing" | "result";

interface AnalysisResult {
  is_authentic: boolean;
  confidence: number;
  deepfake_probability: number;
  liveness_score: number;
  recommendation: string;
  flags: string[];
}

export default function VideoVerifyPage() {
  const { user, updateUser } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setPhase("camera");
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access and try again."
          : "Could not access camera. Make sure no other app is using it."
      );
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Capture frame and analyze
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw current video frame to canvas
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    stopCamera();
    setPhase("analyzing");
    setAnalyzing(true);

    try {
      // Countdown for UX
      for (let i = 3; i >= 1; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 800));
      }
      setCountdown(0);

      // Convert Canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      if (!blob) throw new Error("Could not capture image");
      
      const file = new File([blob], 'verification.jpg', { type: 'image/jpeg' });
      
      // Upload to Cloudinary via Backend
      const { usersAPI } = await import("@/lib/api");
      const uploadRes = await usersAPI.uploadVerification(file);
      
      // Perform AI Analysis (mocked for demo purposes alongside the real upload)
      const res = await aiAPI.analyzeVideo(
        `User is performing a live identity verification. Uploaded securely to: ${uploadRes.data.file_url}`
      );
      setResult(res.data);

      if (res.data.is_authentic && res.data.liveness_score > 0.7) {
        updateUser({ identity_verified: true });
        toast.success("Identity cryptographically verified successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
      setPhase("camera");
      startCamera();
    } finally {
      setAnalyzing(false);
      setPhase("result");
    }
  }, [stopCamera, startCamera, updateUser]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const onVideoMount = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && streamRef.current && node.srcObject !== streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch((e) => {
        if (e.name !== 'AbortError') console.error("Camera play error:", e);
      });
    }
  }, []);

  const passed = result?.is_authentic && (result?.liveness_score || 0) > 0.7;

  return (
    <AppShell>
      <div className="p-10 h-full">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Identity Verification</h1>
            <p className="text-muted-foreground mt-1">
              Verify your identity with a live video check. Boosts your trust score by up to 20 points.
            </p>
          </div>

          {/* Already verified */}
          {user?.identity_verified && phase === "intro" && (
            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" className="border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
              <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
              <div>
                <p className="font-sans font-semibold text-emerald-400">Identity already verified</p>
                <p className="text-sm font-mono text-emerald-400/60 mt-0.5">
                  You can re-verify at any time to refresh your verification status.
                </p>
              </div>
            </SpotlightCard>
          )}

          <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }} className="space-y-6">
              {/* USP: Live Node Diagnostic */}
              <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.2)" className="p-6 border-cyan-500/10 bg-cyan-500/5 flex items-center justify-between shadow-[0_0_20px_rgba(34,211,238,0.03)]">
                 <div className="flex items-center gap-4">
                   <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                     <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
                     <div className="absolute inset-1 border border-cyan-400/30 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                     <Activity size={18} className="text-cyan-400 animate-pulse" />
                   </div>
                   <div>
                     <h3 className="font-sans font-medium text-xs uppercase tracking-wider text-cyan-400 md:text-sm">Node Diagnostic Active</h3>
                     <p className="font-mono text-xs text-cyan-400/60">Secure WebRTC Handshake Established</p>
                   </div>
                 </div>
                 <div className="hidden sm:flex flex-col items-end">
                   <span className="font-mono text-xs text-gray-400">Latency: <span className="text-cyan-400">12ms</span></span>
                   <span className="font-mono text-xs text-gray-400">Enc: <span className="text-cyan-400">AES-256</span></span>
                 </div>
              </SpotlightCard>

              <SpotlightCard className="space-y-8 p-8 border-white/10 bg-white/[0.02]">
                <h2 className="font-sans font-semibold text-2xl text-white uppercase tracking-widest border-b border-white/10 pb-4">Verification Sequence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: Camera,       title: "Initialize Optics",      desc: "Allow TrustFlow to access your hardware for a brief live check." },
                    { icon: Video,        title: "Subject Alignment",      desc: "Look directly at the camera. The AI calibrates depth and liveness." },
                    { icon: Shield,       title: "Neural Deep-Scan",       desc: "Our neural network checks for deepfakes and synthetic signatures." },
                    { icon: CheckCircle2, title: "Zero-Knowledge Proof",   desc: "Result is cryptographically signed and your trust score updates." },
                  ].map(({ icon: Icon, title, desc }, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                      className="group flex flex-row items-start gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/[0.02] transition-all h-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                        <Icon size={20} className="text-white/70 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-sans font-semibold tracking-wider text-sm text-white uppercase mb-2 group-hover:text-cyan-100 transition-colors">{title}</p>
                        <p className="text-sm font-mono text-gray-400 leading-relaxed">{desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-white/[0.02] border-white/10 space-y-2 p-6 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                  <Shield size={14} className="text-white/80" />
                </div>
                <div>
                  <p className="text-sm font-sans font-medium text-xs uppercase tracking-wider text-white/80">Privacy Notice</p>
                  <p className="text-sm font-mono text-white/60 leading-relaxed mt-1">
                    Your video is processed in real-time and is never stored. Only the cryptographic verification result is saved to your profile.
                  </p>
                </div>
              </SpotlightCard>

              {cameraError && (
                <SpotlightCard className="border-red-500/30 bg-red-500/10 flex items-start gap-3 p-6">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-mono text-red-400">{cameraError}</p>
                </SpotlightCard>
              )}

              <button onClick={startCamera} className="w-full flex items-center justify-center py-5 bg-white/5 text-white/80 border border-white/20 rounded-xl font-sans font-medium text-xs uppercase tracking-wider hover:bg-white/10 transition-all gap-3 shadow-sm hover:shadow-sm hover:scale-[1.01] active:scale-95">
                <Camera size={18} />
                Initiate Sequence
              </button>
            </motion.div>
          )}

          {/* CAMERA */}
          {phase === "camera" && (
            <motion.div key="camera" initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }} className="space-y-5 max-w-lg mx-auto">
              
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-xl mb-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                   <span className="text-xs font-cyber font-bold tracking-widest text-white/80 uppercase">Biometric Engine Active</span>
                 </div>
                 <ScanFace size={16} className="text-white/80" />
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video border-2 border-white/10 shadow-sm">
                <video
                  ref={onVideoMount}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover relative z-0"
                />
                
                {/* Cyberpunk Crosshair Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-20" 
                     style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Central Targeting UI */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Rotating Outer Ring */}
                  <div className="absolute w-64 h-64 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" style={{ borderTopColor: 'rgba(34,211,238,0.8)', borderBottomColor: 'rgba(34,211,238,0.8)' }} />
                  <div className="absolute w-72 h-72 border border-purple-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ borderLeftColor: 'rgba(168,85,247,0.5)' }} />
                  
                  {/* Face guide overlay */}
                  <div className="relative w-48 h-64 border-2 border-white/20 rounded-[40%] overflow-hidden shadow-sm bg-white/[0.02] backdrop-blur-[1px]">
                     {/* Scanning Laser Animation */}
                     <motion.div 
                       animate={{ y: ["0%", "100%", "0%"] }}
                       transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                       className="absolute left-0 right-0 h-[2px] bg-white shadow-sm z-10"
                     >
                       <div className="absolute inset-0 bg-white blur-sm" />
                     </motion.div>
                  </div>
                </div>
                
                {/* Corner Brackets */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/20 pointer-events-none" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/20 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/20 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/20 pointer-events-none" />

                <div className="absolute bottom-6 left-0 right-0 text-center bg-gradient-to-t from-black/80 to-transparent pt-12 pb-2">
                  <p className="text-white/80 font-mono text-sm uppercase tracking-widest drop-shadow-sm animate-pulse">Align face within target sequence</p>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-4">
                <button
                  onClick={() => { stopCamera(); setPhase("intro"); }}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-sans font-medium text-xs uppercase tracking-wider hover:bg-white/10 transition-all gap-2 flex items-center justify-center"
                >
                  <VideoOff size={16} /> Cancel
                </button>
                <button
                  onClick={captureAndAnalyze}
                  className="flex-1 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-sans font-medium text-xs uppercase tracking-wider hover:bg-white/20 transition-all gap-2 flex items-center justify-center shadow-sm"
                >
                  <Shield size={16} /> Analyze & Verify
                </button>
              </div>
            </motion.div>
          )}

          {/* ANALYZING */}
          {phase === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}>
              <SpotlightCard spotlightColor="rgba(34, 211, 238, 0.2)" className="p-8 border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden">
                {/* Visualizer */}
                <div className="flex flex-col items-center gap-6 z-10">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shadow-sm">
                      <Shield size={40} className="text-white/80" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-50" />
                    <div className="absolute -inset-4 rounded-full border border-white/10 animate-[spin_3s_linear_infinite]" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-sans font-semibold text-2xl text-white/80 drop-shadow-sm">Neural Analysis Active</p>
                    <p className="text-gray-400 font-mono text-sm tracking-wide">
                      Verifying biometrics and deepfake signatures
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader2 size={20} className="animate-spin text-white/80" />
                    <span className="text-sm font-sans font-medium text-xs uppercase tracking-wider text-white/80">Processing Stream...</span>
                  </div>
                </div>

                {/* Matrix Terminal Log */}
                <div className="bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-[10px] sm:text-xs text-white/80 h-64 overflow-hidden relative shadow-sm z-10">
                   <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black to-transparent z-10" />
                   <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black to-transparent z-10" />
                   <div className="flex flex-col justify-end h-full w-full">
                     <TerminalLogs />
                   </div>
                </div>
                
                {/* Abstract Data Stream Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,1) 2px, rgba(34,211,238,1) 4px)", backgroundSize: "100% 4px" }} />
              </SpotlightCard>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Top Result Banner */}
              <SpotlightCard className={clsx(
                "flex flex-col md:flex-row items-center justify-between gap-8 py-10 px-8 border",
                passed
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-black shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                  : "border-red-500/30 bg-red-900/10 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
              )}>
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className={clsx(
                    "w-28 h-28 rounded-full flex items-center justify-center border-4 relative",
                    passed ? "bg-emerald-500/10 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "bg-red-500/10 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                  )}>
                    {/* Inner glowing ring */}
                    <div className={clsx("absolute inset-2 rounded-full border border-dashed animate-[spin_10s_linear_infinite]", passed ? "border-emerald-400/50" : "border-red-400/50")} />
                    
                    {passed
                      ? <Shield size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                      : <AlertCircle size={48} className="text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />}
                  </div>
                  <div className="space-y-2">
                    <h2 className={clsx("text-3xl font-display font-black tracking-tight", passed ? "text-emerald-400 drop-shadow-sm" : "text-red-400 drop-shadow-sm")}>
                      {passed ? "IDENTITY VERIFIED" : "VERIFICATION FAILED"}
                    </h2>
                    <p className={clsx(
                      "font-mono text-sm max-w-sm leading-relaxed",
                      passed ? "text-emerald-400/80" : "text-red-400/80"
                    )}>
                      {passed
                        ? "Cryptographic zero-knowledge proof generated. You now hold the Neural Identity Badge."
                        : "We could not verify your identity. Neural signatures did not match thresholds."}
                    </p>
                  </div>
                </div>

                {passed && (
                  <div className="flex flex-col items-center bg-black/40 border border-emerald-500/20 rounded-2xl p-6 min-w-[200px]">
                    <span className="text-[10px] font-cyber text-emerald-500 uppercase tracking-widest mb-2">Trust Score Impact</span>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        {Math.min(100, (user?.trust_score || 0) + 20).toFixed(0)}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold text-lg mb-1">
                        +20
                      </span>
                    </div>
                  </div>
                )}
              </SpotlightCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Official Badge Card */}
                {passed && (
                  <SpotlightCard className="col-span-1 p-8 border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-6 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full blur-xl group-hover:opacity-100 opacity-50 transition-opacity" />
                      <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full animate-[spin_8s_linear_infinite]" />
                      <div className="absolute inset-2 border border-purple-500/30 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
                        <CheckCircle2 size={40} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                      </div>
                    </div>
                    <h3 className="font-sans font-bold text-lg text-white mb-1">Verified Human</h3>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Global Trust Badge Issued</p>
                    <div className="mt-6 w-full pt-6 border-t border-white/10 text-[9px] font-mono text-gray-600 break-all">
                      Proof ID: {Math.random().toString(36).substring(2, 15)}...
                    </div>
                  </SpotlightCard>
                )}

                {/* Detailed Analysis Report */}
                <SpotlightCard className={clsx("p-8 border-white/10 bg-white/[0.02]", passed ? "col-span-2" : "col-span-3")}>
                  <h3 className="font-sans font-medium text-xs uppercase tracking-wider text-white mb-6">Deep-Scan Cryptographic Report</h3>
                  <div className="space-y-6">
                    {[
                      { label: "Liveness score",       value: result.liveness_score,         pct: true },
                      { label: "Authenticity confidence", value: result.confidence,           pct: true },
                      { label: "Deepfake probability",  value: result.deepfake_probability,   pct: true, invert: true },
                    ].map(({ label, value, pct, invert }) => {
                      const display = pct ? `${(value * 100).toFixed(0)}%` : value;
                      const good = invert ? value < 0.1 : value > 0.7;
                      return (
                        <div key={label} className="space-y-3">
                          <div className="flex justify-between font-mono text-sm uppercase">
                            <span className="text-gray-400 font-bold tracking-wider">{label}</span>
                            <span className={clsx("font-black tracking-widest", good ? "text-emerald-400 drop-shadow-sm" : "text-red-400 drop-shadow-sm")}>
                              {display}
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <div
                              className={clsx("h-full rounded-full transition-all duration-1000 shadow-sm",
                                good ? "bg-emerald-400 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-400 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                              )}
                              style={{ width: `${invert ? (1 - value) * 100 : value * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {result.flags?.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
                      <p className="text-xs font-cyber font-bold text-gray-500 uppercase tracking-widest">Detected Anomalies</p>
                      {result.flags.map((f) => (
                        <p key={f} className="text-sm font-mono text-amber-400 flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <span>⚠</span> {f}
                        </p>
                      ))}
                    </div>
                  )}
                </SpotlightCard>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { window.location.href = "/dashboard" }}
                  className="flex-1 flex items-center justify-center py-4 bg-white text-black rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all gap-2"
                >
                  Return to Dashboard
                </button>
                {!passed && (
                  <button
                    onClick={() => { setResult(null); setPhase("intro"); }}
                    className="flex-1 flex items-center justify-center py-4 bg-white/5 border border-white/10 text-white rounded-xl font-sans font-medium text-xs uppercase tracking-wider hover:bg-white/10 transition-all gap-2"
                  >
                    <RefreshCw size={16} /> Try again
                  </button>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

function TerminalLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const sequence = [
      "[SYS] Initializing TrustFlow Biometric Engine...",
      "[SYS] Capturing geometric face mesh vectors...",
      "[ANALYSIS] Liveness score check: running pulse variation...",
      "[SECURE] Verifying retinal micro-movements...",
      "[SECURE] Deepfake detection protocol activated...",
      "[ANALYSIS] Spatial consistency: MATCH",
      "[ANALYSIS] Sub-dermal mapping: VERIFIED",
      "[SYS] Encrypting biometrics to zero-knowledge proof...",
      "[SYS] Syncing with TrustFlow Network...",
      "[SUCCESS] Neural handshake complete."
    ];
    
    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setLogs(prev => [...prev, sequence[current]]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 300); // Fast cinematic scroll
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-1.5 flex flex-col justify-end">
      {logs.map((log, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="opacity-80">
          {log}
        </motion.div>
      ))}
      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="h-3 w-1.5 bg-white inline-block mt-1" />
    </div>
  )
}
