"use client";

import { AppNav } from "@/components/layout/AppNav";
import { WebglBackground } from "@/components/3d/WebglBackground";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white font-sans selection:bg-cyan-500/50 relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <WebglBackground />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>
      <AppNav isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <main className="flex-1 relative z-10 overflow-x-hidden pt-0 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
