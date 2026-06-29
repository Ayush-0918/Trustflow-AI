"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  GraduationCap,
  Video,
  User,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { TrustBadge } from "@/components/features/trust/TrustBadge";
import { useAudio } from "@/lib/AudioProvider";

const NAV_ITEMS = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "System Core" },
  { href: "/projects",            icon: FolderKanban,    label: "Smart Contracts" },
  { href: "/wallet",              icon: Wallet,          label: "Escrow Vault" },
  { href: "/skills",              icon: GraduationCap,   label: "AST Verification" },
  { href: "/video-verify",        icon: Video,           label: "Biometrics" },
  { href: "/profile",             icon: User,            label: "Node Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { playHover, playClick } = useAudio();

  return (
    <aside className="w-72 shrink-0 flex flex-col h-screen sticky top-0 bg-white/[0.01] backdrop-blur-3xl border-r border-white/10 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <Zap size={20} className="text-white fill-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-widest uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">TrustFlow</span>
      </div>

      {/* User card */}
      {user && (
        <div className="px-6 py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 font-bold text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              {user.full_name?.[0] || user.username[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-white uppercase tracking-wider">{user.full_name || user.username}</p>
              <p className="text-xs text-cyan-400 font-mono tracking-widest">{user.role}</p>
            </div>
          </div>
          <div className="mt-5">
            <TrustBadge score={user.trust_score} size="sm" showLabel showBar />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <p className="px-3 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-4">Network Protocols</p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="relative block group outline-none"
              onMouseEnter={() => !active && playHover()}
              onClick={() => playClick()}
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-cyan-500/10 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={clsx(
                  "relative flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-cyber font-bold uppercase tracking-widest transition-all duration-300 z-10 group-hover:translate-x-2",
                  active
                    ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                    : "text-gray-400 group-hover:text-white group-hover:bg-white/5"
                )}
              >
                <Icon size={16} className={clsx("transition-transform duration-300 group-hover:scale-110", active ? "text-cyan-400" : "")} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-6 py-6 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3 text-xs font-cyber font-bold uppercase tracking-widest text-gray-500 hover:text-pink-500 hover:bg-pink-500/10 rounded-xl transition-all group"
        >
          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
          Terminate Link
        </button>
      </div>
    </aside>
  );
}
