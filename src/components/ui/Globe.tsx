"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useSpring } from "react-spring";

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001,
    },
  }));

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    // Hardcode WebGL resolution to 1000x1000 to prevent initialization bugs
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 1,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3], // Standard cobe base color
      markerColor: [0.13, 0.82, 0.93], // Cyan marker color
      glowColor: [0.13, 0.82, 0.93], // Cyan glow
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.0060], size: 0.1 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [35.6895, 139.6917], size: 0.08 },
        { location: [1.3521, 103.8198], size: 0.06 },
        { location: [-33.8688, 151.2093], size: 0.04 },
        { location: [25.2048, 55.2708], size: 0.05 },
      ],
      onRender: (state: any) => {
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        state.phi = phi + r.get();
      }
    } as any);

    return () => {
      if (globe) globe.destroy();
    };
  }, []);

  return (
    <div 
      className={`relative w-full max-w-[800px] aspect-square mx-auto ${className || ""}`}
      style={{ cursor: 'grab' }}
    >
      {/* Cinematic Ambient Glow */}
      <div className="absolute inset-0 z-0 w-[120%] h-[120%] -left-[10%] -top-[10%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_60%)] blur-3xl pointer-events-none" />
      
      {/* Inner Sphere Shadow for 3D depth */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] rounded-full border border-cyan-500/10" />

      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10"
        onPointerDown={(e) => {
          // @ts-ignore
          pointerInteracting.current = e.clientX;
          if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if(canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if(canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({ r: delta / 200 });
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({ r: delta / 100 });
          }
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
