"use client";

import { useEffect, useRef } from "react";

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({ t: 0, mouse: { x: 0, y: 0 }, tilt: { x: 0, y: 0 } });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let W = 0, H = 0, cx = 0, cy = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2; cy = H / 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      const s = stateRef.current;
      // Calculate normalized tilt (-1 to 1)
      s.tilt.x += ((e.clientY / H - 0.5) * 24 - s.tilt.x) * 0.08;
      s.tilt.y += ((e.clientX / W - 0.5) * -24 - s.tilt.y) * 0.08;
      s.mouse.x = e.clientX; s.mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouse);

    const N = 120; // Reduced particles for performance behind heavy UI
    const particles = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI * 2;
      const r = 70 + Math.random() * 0.4 * Math.min(800, 800);
      return { 
        x: cx + Math.cos(angle) * r, 
        y: cy + Math.sin(angle) * r, 
        vx: 0, vy: 0, angle, r, baseR: r, 
        size: Math.random() * 1.5 + 0.35, 
        speed: 0.3 + Math.random() * 0.7, 
        phase: Math.random() * Math.PI * 2, 
        hue: 185 + Math.random() * 85, // Cyan to Purple
        life: Math.random() 
      };
    });

    let last = 0;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16, 3); last = now;
      const s = stateRef.current; 
      s.t += dt; 
      s.tilt.x *= 0.96; 
      s.tilt.y *= 0.96;
      const { t, mouse, tilt } = s;

      ctx.clearRect(0, 0, W, H);

      // Deep Space Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "rgba(5, 8, 20, 1)"); // Deep space blue/black
      bgGrad.addColorStop(1, "rgba(0, 0, 5, 1)");
      ctx.fillStyle = bgGrad; 
      ctx.fillRect(0, 0, W, H);

      // Subtle Tech Grid
      ctx.strokeStyle = "rgba(34, 211, 238, 0.02)"; 
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Laser Scan Line
      const scanY = ((t * 2.1) % (H * 1.6)) - H * 0.3;
      const sg = ctx.createLinearGradient(0, scanY - 32, 0, scanY + 32);
      sg.addColorStop(0, "rgba(34, 211, 238, 0)"); 
      sg.addColorStop(0.5, "rgba(34, 211, 238, 0.02)"); 
      sg.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = sg; ctx.fillRect(0, scanY - 32, W, 64);

      // Core Particles
      const mx = mouse.x || cx, my = mouse.y || cy;
      particles.forEach(p => {
        p.life += 0.004 * p.speed;
        p.angle += 0.00038 * p.speed;
        const wb = Math.sin(p.phase + t * 0.007) * 16;
        const tx = cx + Math.cos(p.angle) * (p.baseR + wb);
        const ty2 = cy + Math.sin(p.angle) * (p.baseR + wb);
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse repel
        if (d < 110) { const f = (1 - d / 110) * 1.5; p.vx += dx / d * f; p.vy += dy / d * f; }
        
        p.vx += (tx - p.x) * 0.013; 
        p.vy += (ty2 - p.y) * 0.013;
        p.vx *= 0.87; p.vy *= 0.87; 
        p.x += p.vx; p.y += p.vy;
        
        const alpha = 0.2 + Math.sin(p.life * Math.PI * 2) * 0.3;
        const sz = p.size * (0.6 + Math.sin(p.life * Math.PI * 3) * 0.35);
        
        // Glow
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 4);
        pg.addColorStop(0, `hsla(${p.hue}, 90%, 78%, ${alpha})`); 
        pg.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
        ctx.fillStyle = pg; 
        ctx.beginPath(); ctx.arc(p.x, p.y, sz * 4, 0, Math.PI * 2); ctx.fill();
        
        // Core
        ctx.fillStyle = `hsla(${p.hue}, 100%, 96%, ${alpha * 0.8})`; 
        ctx.beginPath(); ctx.arc(p.x, p.y, sz * 0.6, 0, Math.PI * 2); ctx.fill();
      });

      // Connecting Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) { 
            ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - d / 90) * 0.08})`; 
            ctx.lineWidth = 0.4; ctx.beginPath(); 
            ctx.moveTo(particles[i].x, particles[i].y); 
            ctx.lineTo(particles[j].x, particles[j].y); 
            ctx.stroke(); 
          }
        }
      }

      // Parallax Orb (Follows Mouse Tilt)
      const ox = cx + tilt.y * 1.5;
      const oy = cy + tilt.x * 1.5;
      const scale = 1 + Math.sin(t * 0.02) * 0.03;
      
      const cg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 50 * scale);
      cg.addColorStop(0, "rgba(34, 211, 238, 0.08)"); 
      cg.addColorStop(0.5, "rgba(168, 85, 247, 0.03)"); 
      cg.addColorStop(1, "rgba(20, 80, 200, 0)");
      ctx.fillStyle = cg; 
      ctx.beginPath(); ctx.arc(ox, oy, 50 * scale, 0, Math.PI * 2); ctx.fill();

      // Vignette Mask
      const vg = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.2, cx, cy, Math.max(W, H) * 0.8);
      vg.addColorStop(0, "rgba(0, 0, 0, 0)"); 
      vg.addColorStop(1, "rgba(0, 0, 0, 0.9)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => { 
      cancelAnimationFrame(animRef.current); 
      window.removeEventListener("resize", resize); 
      window.removeEventListener("mousemove", onMouse); 
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full z-[-1] pointer-events-none"
    />
  );
}
