"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';

type AudioContextType = {
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  playBoot: () => void;
  isMuted: boolean;
  toggleMute: () => void;
};

const AudioSystemContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Audio Context on first interaction
    const initAudio = () => {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (isMuted || !audioCtx.current) return;
    
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playHover = () => {
    // Subtle low hum
    playTone(120, 'sine', 0.1, 0.05);
  };

  const playClick = () => {
    // High tech click
    playTone(800, 'square', 0.05, 0.03);
    setTimeout(() => playTone(1200, 'sine', 0.05, 0.02), 20);
  };

  const playSuccess = () => {
    // Holographic success chime
    playTone(440, 'sine', 0.1, 0.1);
    setTimeout(() => playTone(554, 'sine', 0.1, 0.1), 100);
    setTimeout(() => playTone(659, 'sine', 0.4, 0.1), 200);
  };

  const playError = () => {
    // Harsh digital error
    playTone(150, 'sawtooth', 0.2, 0.1);
    setTimeout(() => playTone(100, 'sawtooth', 0.2, 0.1), 100);
  };

  const playBoot = () => {
    // Deep system boot sweep
    if (isMuted || !audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <AudioSystemContext.Provider value={{ playHover, playClick, playSuccess, playError, playBoot, isMuted, toggleMute }}>
      {children}
    </AudioSystemContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioSystemContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
