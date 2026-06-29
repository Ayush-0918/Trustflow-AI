"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NODES = {
  India: { lat: 20.5937, lng: 78.9629, name: "Mumbai" },
  Europe: { lat: 51.1657, lng: 10.4515, name: "Frankfurt" },
  USA: { lat: 37.0902, lng: -95.7129, name: "Virginia" },
  Singapore: { lat: 1.3521, lng: 103.8198, name: "Singapore" },
  Tokyo: { lat: 35.6895, lng: 139.6917, name: "Tokyo" },
  Dubai: { lat: 25.2048, lng: 55.2708, name: "Dubai" },
  London: { lat: 51.5074, lng: -0.1278, name: "London" },
  Sydney: { lat: -33.8688, lng: 151.2093, name: "Sydney" },
} as const;

export function WorldNetworkMap({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dims, setDims] = useState({ width: 600, height: 600 });
  const [isReady, setIsReady] = useState(false);

  // CRITICAL: Memoize data so react-globe.gl doesn't re-init the scene
  const arcsData = useMemo(
    () => [
      { startLat: NODES.India.lat, startLng: NODES.India.lng, endLat: NODES.Singapore.lat, endLng: NODES.Singapore.lng },
      { startLat: NODES.Singapore.lat, startLng: NODES.Singapore.lng, endLat: NODES.Tokyo.lat, endLng: NODES.Tokyo.lng },
      { startLat: NODES.Tokyo.lat, startLng: NODES.Tokyo.lng, endLat: NODES.Sydney.lat, endLng: NODES.Sydney.lng },
      { startLat: NODES.Sydney.lat, startLng: NODES.Sydney.lng, endLat: NODES.Dubai.lat, endLng: NODES.Dubai.lng },
      { startLat: NODES.Dubai.lat, startLng: NODES.Dubai.lng, endLat: NODES.Europe.lat, endLng: NODES.Europe.lng },
      { startLat: NODES.Europe.lat, startLng: NODES.Europe.lng, endLat: NODES.London.lat, endLng: NODES.London.lng },
      { startLat: NODES.London.lat, startLng: NODES.London.lng, endLat: NODES.USA.lat, endLng: NODES.USA.lng },
      { startLat: NODES.USA.lat, startLng: NODES.USA.lng, endLat: NODES.India.lat, endLng: NODES.India.lng },
      // Cross-traffic for denser look
      { startLat: NODES.Europe.lat, startLng: NODES.Europe.lng, endLat: NODES.Singapore.lat, endLng: NODES.Singapore.lng },
      { startLat: NODES.Dubai.lat, startLng: NODES.Dubai.lng, endLat: NODES.Tokyo.lat, endLng: NODES.Tokyo.lng },
      { startLat: NODES.USA.lat, startLng: NODES.USA.lng, endLat: NODES.Europe.lat, endLng: NODES.Europe.lng },
    ],
    []
  );

  const ringsData = useMemo(() => Object.values(NODES), []);

  // Responsive canvas sizing — matches actual container, not hardcoded 800
  useEffect(() => {
    if (!containerRef.current) return;
    
    const el = containerRef.current;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Use devicePixelRatio for sharpness on retina, but cap it to avoid killing GPU
      const dpr = Math.min(window.devicePixelRatio, 2);
      setDims({ 
        width: Math.floor(width * dpr), 
        height: Math.floor(height * dpr) 
      });
    });
    
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Configure globe once it's ready — no interval polling
  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8; // Initial speed
      controls.enableZoom = false;
      controls.enablePan = false;
    }
    
    globe.pointOfView({ lat: 20, lng: 50, altitude: 2.2 }, 1500);
    setIsReady(true);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-visible ${className || ""}`}
    >
      {/* Ambient glow — scaled to container */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_55%)] blur-2xl pointer-events-none" />
      
      {/* Subtle ring border */}
      <div className="absolute inset-[5%] z-20 pointer-events-none rounded-full border border-cyan-500/10" />

      <div className={`relative z-10 w-full h-full transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`}>
        <Globe
          ref={globeRef}
          width={dims.width}
          height={dims.height}
          backgroundColor="rgba(0,0,0,0)"
          
          // Use a brighter texture or fallback if unpkg fails
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          
          showAtmosphere={true}
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.2}
          
          // Arcs with gradient visibility
          arcsData={arcsData}
          arcColor={() => ["rgba(34, 211, 238, 0.9)", "rgba(168, 85, 247, 0.9)"]} // Cyan to Purple
          arcDashLength={0.3}
          arcDashGap={0.1}
          arcDashAnimateTime={2500}
          arcStroke={0.6}
          
          // Rings / nodes
          ringsData={ringsData}
          ringColor={() => (t: number) => `rgba(168, 85, 247, ${1 - t})`}
          ringMaxRadius={6}
          ringPropagationSpeed={1.5}
          ringRepeatPeriod={2000}
          
          // Labels for nodes
          labelsData={ringsData}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.name}
          labelSize={0.8}
          labelColor={() => "rgba(255,255,255,0.7)"}
          labelAltitude={0.01}
          
          onGlobeReady={handleGlobeReady}
        />
      </div>
    </div>
  );
}
