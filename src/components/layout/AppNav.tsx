"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  GraduationCap,
  Video,
  User,
  LogOut,
  Zap,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  Sparkles,
  Globe
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { TrustBadge } from "@/components/features/trust/TrustBadge";
import { useState, useEffect } from "react";
import { SYSTEM_NOTIFICATIONS } from "@/lib/mockData";

const NAV_ITEMS = [
  { href: "/ai-planner",          icon: Sparkles,        label: "AI Planner" },
  { href: "/dashboard",           icon: LayoutDashboard, label: "System Core" },
  { href: "/projects",            icon: FolderKanban,    label: "Smart Contracts" },
  { href: "/marketplace",         icon: Globe,           label: "Marketplace" },
  { href: "/wallet",              icon: Wallet,          label: "Escrow Vault" },
  { href: "/skills",              icon: GraduationCap,   label: "AST Verification" },
  { href: "/video-verify",        icon: Video,           label: "Biometrics" },
  { href: "/profile",             icon: User,            label: "Node Profile" },
];

export function AppNav({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean, setIsMobileOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const unreadCount = SYSTEM_NOTIFICATIONS.length;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-1">
      <p className="px-4 text-[11px] font-sans font-medium text-white/40 uppercase tracking-wider mb-2 mt-4">Network Protocols</p>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className="relative block group outline-none px-2"
            tabIndex={0}
            aria-label={label}
          >
            {active && (
              <motion.div
                layoutId="active-nav"
                className="absolute inset-x-2 inset-y-0 bg-indigo-500/10 border-l-2 border-indigo-400 rounded-r-lg rounded-l-sm shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <div
              className={clsx(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-sans font-medium transition-colors z-10",
                active
                  ? "text-indigo-100"
                  : "text-white/50 hover:text-white/90 hover:bg-white/5"
              )}
            >
              <Icon size={16} className={clsx("shrink-0 transition-colors", active ? "text-indigo-400" : "text-white/40 group-hover:text-white/70")} />
              {label}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 bg-[#050505]/80 backdrop-blur-xl border-r border-white/5 z-40">
        
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-white/5 relative">
          <button 
            onClick={() => setShowWorkspace(!showWorkspace)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Zap size={12} className="text-white fill-white" />
              </div>
              <span className="font-sans font-medium text-sm text-white/90">TrustFlow</span>
            </div>
            <ChevronDown size={14} className="text-white/40 group-hover:text-white/70 transition-colors" />
          </button>
          
          <AnimatePresence>
            {showWorkspace && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-4 right-4 mt-2 bg-[#111] border border-white/10 rounded-xl p-2 shadow-xl z-50"
              >
                <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-white/70">A</span>
                  </div>
                  <span className="text-sm font-medium text-white/80">Archon Node</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Global Search */}
        <div className="px-4 py-3">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-white/40 hover:text-white/70 transition-colors group">
            <Search size={14} className="shrink-0" />
            <span className="text-xs font-sans font-medium text-left flex-1">Search registry...</span>
            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-medium border border-white/20 rounded px-1 text-white">⌘</span>
              <span className="text-[9px] font-medium border border-white/20 rounded px-1 text-white">K</span>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
          <NavLinks />
        </div>

        {/* User Card (Bottom) */}
        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-white">{user?.full_name?.charAt(0) || "U"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
                <span className="text-[11px] font-medium text-white/60 capitalize truncate">{user?.role || "Node"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,1)] animate-pulse" />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-full mb-2 left-0 w-64 bg-black/90 border border-white/10 rounded-xl p-4 z-50 backdrop-blur-xl shadow-2xl origin-bottom-left"
                >
                  <h4 className="text-xs font-cyber font-bold text-white uppercase tracking-widest mb-3">Alerts</h4>
                  <div className="space-y-3">
                    {SYSTEM_NOTIFICATIONS.map(n => (
                      <div key={n.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <p className={clsx("text-[10px] font-bold uppercase tracking-widest mb-1", 
                          n.type === "info" ? "text-cyan-400" : n.type === "warning" ? "text-amber-400" : "text-emerald-400"
                        )}>{n.title}</p>
                        <p className="text-xs font-mono text-gray-400">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-500/10 rounded-lg transition-all"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-sans font-bold text-lg tracking-wide text-white">TrustFlow</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-white">
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-full bg-gray-950 border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <span className="font-display font-bold text-lg tracking-widest uppercase text-white">Menu</span>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white font-mono" />
                </div>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto space-y-2">
                <NavLinks onClick={() => setIsMobileOpen(false)} />
              </nav>
              <div className="p-6 border-t border-white/10 space-y-4">
                <button className="flex items-center justify-between w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-cyber uppercase tracking-widest">
                  Notifications <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>
                </button>
                <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-pink-500 hover:bg-pink-500/10 rounded-lg font-cyber uppercase tracking-widest text-sm transition-colors">
                  <LogOut size={16} /> Terminate Link
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
