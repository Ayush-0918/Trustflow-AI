"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Zap, Code, ShieldCheck, ChevronRight, Activity, Globe, Loader2, Check } from "lucide-react";
import { TrustRing } from "@/components/features/trust/TrustBadge";
import { useAudio } from "@/lib/AudioProvider";
import { clsx } from "clsx";

const SECTORS = [
  { name: "AI & Machine Learning", count: 1245, load: 85 },
  { name: "Web Development", count: 3410, load: 60 },
  { name: "Mobile Apps", count: 890, load: 45 },
  { name: "Design & UI/UX", count: 1102, load: 55 },
  { name: "Blockchain", count: 450, load: 95 },
  { name: "Cybersecurity", count: 875, load: 75 },
  { name: "Data Science", count: 1890, load: 70 },
  { name: "DevOps & Cloud", count: 2100, load: 80 },
  { name: "Quantitative Finance", count: 320, load: 90 },
  { name: "AR & VR", count: 150, load: 30 }
];

type ThemeColor = "cyan" | "emerald" | "purple" | "amber" | "brand";

const THEME_STYLES: Record<ThemeColor, any> = {
  cyan: {
    cardBorder: 'border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] shadow-[inset_0_0_20px_rgba(34,211,238,0.02)]',
    titleGlow: 'text-cyan-50 group-hover:text-cyan-200 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]',
    tagBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.1)]',
    button: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]',
    accent: 'text-cyan-400'
  },
  emerald: {
    cardBorder: 'border-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]',
    titleGlow: 'text-emerald-50 group-hover:text-emerald-200 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    tagBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    button: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-400 hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    accent: 'text-emerald-400'
  },
  purple: {
    cardBorder: 'border-white/5 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]',
    titleGlow: 'text-purple-50 group-hover:text-purple-200 drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    tagBg: 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    button: 'bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-400 hover:text-black hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    accent: 'text-purple-400'
  },
  amber: {
    cardBorder: 'border-white/5 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]',
    titleGlow: 'text-amber-50 group-hover:text-amber-200 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    tagBg: 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    button: 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-400 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    accent: 'text-amber-400'
  },
  brand: {
    cardBorder: 'border-white/5 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] shadow-[inset_0_0_20px_rgba(99,102,241,0.02)]',
    titleGlow: 'text-indigo-50 group-hover:text-indigo-200 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    tagBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.1)]',
    button: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 hover:bg-indigo-400 hover:text-black hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]',
    accent: 'text-indigo-400'
  }
};

const getMetadata = (title: string) => {
  let hashStr = 0;
  for (let i = 0; i < title.length; i++) hashStr = Math.imul(31, hashStr) + title.charCodeAt(i) | 0;
  const absHash = Math.abs(hashStr);
  return {
    hash: "0x" + absHash.toString(16).toUpperCase().padStart(8, '0'),
    bidders: (absHash % 12) + 2,
    match: 75 + (absHash % 24),
    hours: (absHash % 48) + 1,
    mins: (absHash % 59).toString().padStart(2, '0')
  };
};

const JOBS = [
  {
    "title": "LLM Fine-tuning for Legal Documents - Req #9675",
    "budget": "$11k",
    "type": "Hourly",
    "tags": [
      "PyTorch",
      "HuggingFace",
      "LegalTech"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 60,
    "client": "Cyberdyne",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Build a scalable AI Agent Architecture - Req #6515",
    "budget": "$49k",
    "type": "Fixed Price",
    "tags": [
      "Python",
      "FastAPI",
      "LLMs"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 95,
    "client": "WebScale",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Build a scalable AI Agent Architecture - Req #6458",
    "budget": "$17k",
    "type": "Retainer",
    "tags": [
      "Python",
      "FastAPI",
      "LLMs"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 70,
    "client": "YieldMax",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior RAG Pipeline for Enterprise Search - Req #7498",
    "budget": "$38k",
    "type": "Fixed Price",
    "tags": [
      "LangChain",
      "VectorDB",
      "OpenAI"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 75,
    "client": "Acme Corp",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "RAG Pipeline for Enterprise Search - Req #4185",
    "budget": "$115/hr",
    "type": "Fixed Price",
    "tags": [
      "LangChain",
      "VectorDB",
      "OpenAI"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 90,
    "client": "LexAI",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior RAG Pipeline for Enterprise Search - Phase 1 - Req #7269",
    "budget": "$42k",
    "type": "Fixed Price",
    "tags": [
      "LangChain",
      "VectorDB",
      "OpenAI"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 60,
    "client": "Acme Corp",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Computer Vision Model for Defect Detection - Phase 1 - Req #6877",
    "budget": "$56/hr",
    "type": "Retainer",
    "tags": [
      "OpenCV",
      "TensorFlow",
      "IoT"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 90,
    "client": "MetaBuild",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Computer Vision Model for Defect Detection - Phase 3 - Req #3586",
    "budget": "$129/hr",
    "type": "Fixed Price",
    "tags": [
      "OpenCV",
      "TensorFlow",
      "IoT"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 80,
    "client": "Acme Corp",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Build a scalable AI Agent Architecture - Phase 3 - Req #2621",
    "budget": "$43k",
    "type": "Hourly",
    "tags": [
      "Python",
      "FastAPI",
      "LLMs"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 85,
    "client": "DataMind",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Computer Vision Model for Defect Detection - Phase 1 - Req #7444",
    "budget": "$39k",
    "type": "Fixed Price",
    "tags": [
      "OpenCV",
      "TensorFlow",
      "IoT"
    ],
    "sector": "AI & Machine Learning",
    "trust_required": 85,
    "client": "MetaBuild",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "DeFi Yield Aggregator Dashboard - Req #6703",
    "budget": "$103/hr",
    "type": "Retainer",
    "tags": [
      "Next.js",
      "Tailwind",
      "Ethers.js"
    ],
    "sector": "Web Development",
    "trust_required": 70,
    "client": "Alpha Fund",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior High-Frequency Trading Bot Dashboard - Req #6330",
    "budget": "$88/hr",
    "type": "Fixed Price",
    "tags": [
      "React",
      "WebSockets",
      "D3.js"
    ],
    "sector": "Web Development",
    "trust_required": 95,
    "client": "Cyberdyne",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Serverless Admin Panel - Req #1844",
    "budget": "$114/hr",
    "type": "Retainer",
    "tags": [
      "AWS Lambda",
      "Vue.js",
      "Firebase"
    ],
    "sector": "Web Development",
    "trust_required": 80,
    "client": "Cyberdyne",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Senior Serverless Admin Panel - Req #5918",
    "budget": "$135/hr",
    "type": "Fixed Price",
    "tags": [
      "AWS Lambda",
      "Vue.js",
      "Firebase"
    ],
    "sector": "Web Development",
    "trust_required": 90,
    "client": "MetaBuild",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "High-Frequency Trading Bot Dashboard - Req #9240",
    "budget": "$9k",
    "type": "Retainer",
    "tags": [
      "React",
      "WebSockets",
      "D3.js"
    ],
    "sector": "Web Development",
    "trust_required": 60,
    "client": "Alpha Fund",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior DeFi Yield Aggregator Dashboard - Phase 2 - Req #7898",
    "budget": "$53/hr",
    "type": "Hourly",
    "tags": [
      "Next.js",
      "Tailwind",
      "Ethers.js"
    ],
    "sector": "Web Development",
    "trust_required": 85,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Enterprise E-commerce Platform - Phase 2 - Req #7745",
    "budget": "$60/hr",
    "type": "Retainer",
    "tags": [
      "Next.js",
      "Stripe",
      "PostgreSQL"
    ],
    "sector": "Web Development",
    "trust_required": 85,
    "client": "Cyberdyne",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Serverless Admin Panel - Phase 1 - Req #6828",
    "budget": "$13k",
    "type": "Retainer",
    "tags": [
      "AWS Lambda",
      "Vue.js",
      "Firebase"
    ],
    "sector": "Web Development",
    "trust_required": 80,
    "client": "MetaBuild",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Serverless Admin Panel - Phase 1 - Req #3766",
    "budget": "$9k",
    "type": "Retainer",
    "tags": [
      "AWS Lambda",
      "Vue.js",
      "Firebase"
    ],
    "sector": "Web Development",
    "trust_required": 60,
    "client": "Alpha Fund",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Real-time Collaboration Tool - Phase 3 - Req #4115",
    "budget": "$63/hr",
    "type": "Fixed Price",
    "tags": [
      "Node.js",
      "Socket.io",
      "Redis"
    ],
    "sector": "Web Development",
    "trust_required": 95,
    "client": "LexAI",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "iOS App for Fitness Tracking - Req #3762",
    "budget": "$60/hr",
    "type": "Retainer",
    "tags": [
      "Swift",
      "CoreMotion",
      "HealthKit"
    ],
    "sector": "Mobile Apps",
    "trust_required": 95,
    "client": "GlobalTrade",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Senior Social Media App MVP - Req #4005",
    "budget": "$30k",
    "type": "Fixed Price",
    "tags": [
      "React Native",
      "Firebase",
      "Redux"
    ],
    "sector": "Mobile Apps",
    "trust_required": 80,
    "client": "WebScale",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Cross-platform Crypto Wallet - Req #1754",
    "budget": "$114/hr",
    "type": "Fixed Price",
    "tags": [
      "Flutter",
      "Dart",
      "Web3"
    ],
    "sector": "Mobile Apps",
    "trust_required": 70,
    "client": "FinTrust Labs",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Senior Cross-platform Crypto Wallet - Req #3442",
    "budget": "$13k",
    "type": "Retainer",
    "tags": [
      "Flutter",
      "Dart",
      "Web3"
    ],
    "sector": "Mobile Apps",
    "trust_required": 85,
    "client": "YieldMax",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Android App for Logistics - Req #5917",
    "budget": "$91/hr",
    "type": "Retainer",
    "tags": [
      "Kotlin",
      "Jetpack Compose",
      "Maps API"
    ],
    "sector": "Mobile Apps",
    "trust_required": 70,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Social Media App MVP - Phase 1 - Req #6705",
    "budget": "$35k",
    "type": "Retainer",
    "tags": [
      "React Native",
      "Firebase",
      "Redux"
    ],
    "sector": "Mobile Apps",
    "trust_required": 75,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Android App for Logistics - Phase 3 - Req #7024",
    "budget": "$55/hr",
    "type": "Retainer",
    "tags": [
      "Kotlin",
      "Jetpack Compose",
      "Maps API"
    ],
    "sector": "Mobile Apps",
    "trust_required": 95,
    "client": "MetaBuild",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Social Media App MVP - Phase 1 - Req #7381",
    "budget": "$115/hr",
    "type": "Hourly",
    "tags": [
      "React Native",
      "Firebase",
      "Redux"
    ],
    "sector": "Mobile Apps",
    "trust_required": 85,
    "client": "GlobalTrade",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "React Native Mobile App for Fintech - Phase 3 - Req #3760",
    "budget": "$32k",
    "type": "Retainer",
    "tags": [
      "React Native",
      "TypeScript",
      "Stripe"
    ],
    "sector": "Mobile Apps",
    "trust_required": 70,
    "client": "GlobalTrade",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior Cross-platform Crypto Wallet - Phase 3 - Req #7050",
    "budget": "$47/hr",
    "type": "Retainer",
    "tags": [
      "Flutter",
      "Dart",
      "Web3"
    ],
    "sector": "Mobile Apps",
    "trust_required": 70,
    "client": "WebScale",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Mobile App Redesign - Req #2317",
    "budget": "$42k",
    "type": "Fixed Price",
    "tags": [
      "Figma",
      "User Research",
      "Wireframing"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 90,
    "client": "FinTrust Labs",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior UI/UX Design for Web3 Marketplace - Req #1547",
    "budget": "$132/hr",
    "type": "Hourly",
    "tags": [
      "Figma",
      "Prototyping",
      "Web3"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 95,
    "client": "WebScale",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Landing Page 3D Animations - Req #8349",
    "budget": "$17k",
    "type": "Hourly",
    "tags": [
      "Spline",
      "Three.js",
      "Framer"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 65,
    "client": "GlobalTrade",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Dashboard UI System - Req #4538",
    "budget": "$40/hr",
    "type": "Fixed Price",
    "tags": [
      "Design Systems",
      "Figma",
      "UI"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 90,
    "client": "MetaBuild",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Dashboard UI System - Req #4818",
    "budget": "$36k",
    "type": "Retainer",
    "tags": [
      "Design Systems",
      "Figma",
      "UI"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 95,
    "client": "Alpha Fund",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior UI/UX Design for Web3 Marketplace - Phase 2 - Req #1567",
    "budget": "$63/hr",
    "type": "Fixed Price",
    "tags": [
      "Figma",
      "Prototyping",
      "Web3"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 70,
    "client": "WebScale",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Dashboard UI System - Phase 2 - Req #6027",
    "budget": "$46k",
    "type": "Retainer",
    "tags": [
      "Design Systems",
      "Figma",
      "UI"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 75,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Dashboard UI System - Phase 1 - Req #1162",
    "budget": "$36k",
    "type": "Retainer",
    "tags": [
      "Design Systems",
      "Figma",
      "UI"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 60,
    "client": "Alpha Fund",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Mobile App Redesign - Phase 3 - Req #5053",
    "budget": "$28k",
    "type": "Retainer",
    "tags": [
      "Figma",
      "User Research",
      "Wireframing"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 95,
    "client": "GlobalTrade",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Dashboard UI System - Phase 3 - Req #6433",
    "budget": "$44/hr",
    "type": "Retainer",
    "tags": [
      "Design Systems",
      "Figma",
      "UI"
    ],
    "sector": "Design & UI/UX",
    "trust_required": 70,
    "client": "Acme Corp",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Smart Contract Audit (Solidity) - Req #9617",
    "budget": "$88/hr",
    "type": "Retainer",
    "tags": [
      "Solidity",
      "Security",
      "Web3"
    ],
    "sector": "Blockchain",
    "trust_required": 70,
    "client": "DataMind",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Solana Rust Smart Contract - Req #2037",
    "budget": "$29k",
    "type": "Retainer",
    "tags": [
      "Rust",
      "Anchor",
      "Solana"
    ],
    "sector": "Blockchain",
    "trust_required": 60,
    "client": "MetaBuild",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Solana Rust Smart Contract - Req #7321",
    "budget": "$34k",
    "type": "Retainer",
    "tags": [
      "Rust",
      "Anchor",
      "Solana"
    ],
    "sector": "Blockchain",
    "trust_required": 85,
    "client": "SecureNet",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Smart Contract Audit (Solidity) - Req #8475",
    "budget": "$43k",
    "type": "Fixed Price",
    "tags": [
      "Solidity",
      "Security",
      "Web3"
    ],
    "sector": "Blockchain",
    "trust_required": 95,
    "client": "FinTrust Labs",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Zero-Knowledge Proof Implementation - Req #1280",
    "budget": "$6k",
    "type": "Fixed Price",
    "tags": [
      "Circom",
      "zk-SNARKs",
      "Cryptography"
    ],
    "sector": "Blockchain",
    "trust_required": 65,
    "client": "YieldMax",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior NFT Marketplace Smart Contracts - Phase 1 - Req #2257",
    "budget": "$137/hr",
    "type": "Retainer",
    "tags": [
      "ERC721",
      "Hardhat",
      "IPFS"
    ],
    "sector": "Blockchain",
    "trust_required": 70,
    "client": "Cyberdyne",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "NFT Marketplace Smart Contracts - Phase 2 - Req #4960",
    "budget": "$131/hr",
    "type": "Fixed Price",
    "tags": [
      "ERC721",
      "Hardhat",
      "IPFS"
    ],
    "sector": "Blockchain",
    "trust_required": 85,
    "client": "FinTrust Labs",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Senior Solana Rust Smart Contract - Phase 3 - Req #7557",
    "budget": "$76/hr",
    "type": "Fixed Price",
    "tags": [
      "Rust",
      "Anchor",
      "Solana"
    ],
    "sector": "Blockchain",
    "trust_required": 70,
    "client": "Cyberdyne",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "DeFi Lending Protocol - Phase 2 - Req #1415",
    "budget": "$78/hr",
    "type": "Retainer",
    "tags": [
      "Solidity",
      "Foundry",
      "DeFi"
    ],
    "sector": "Blockchain",
    "trust_required": 75,
    "client": "SecureNet",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior DeFi Lending Protocol - Phase 1 - Req #7355",
    "budget": "$24k",
    "type": "Fixed Price",
    "tags": [
      "Solidity",
      "Foundry",
      "DeFi"
    ],
    "sector": "Blockchain",
    "trust_required": 90,
    "client": "Acme Corp",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Cloud Infrastructure Security Audit - Req #2243",
    "budget": "$110/hr",
    "type": "Retainer",
    "tags": [
      "AWS",
      "IAM",
      "Security"
    ],
    "sector": "Cybersecurity",
    "trust_required": 85,
    "client": "DataMind",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Incident Response & Forensics - Req #7366",
    "budget": "$135/hr",
    "type": "Retainer",
    "tags": [
      "Forensics",
      "SIEM",
      "Splunk"
    ],
    "sector": "Cybersecurity",
    "trust_required": 85,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Incident Response & Forensics - Req #1494",
    "budget": "$51/hr",
    "type": "Hourly",
    "tags": [
      "Forensics",
      "SIEM",
      "Splunk"
    ],
    "sector": "Cybersecurity",
    "trust_required": 75,
    "client": "SecureNet",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Senior Incident Response & Forensics - Req #9129",
    "budget": "$89/hr",
    "type": "Hourly",
    "tags": [
      "Forensics",
      "SIEM",
      "Splunk"
    ],
    "sector": "Cybersecurity",
    "trust_required": 70,
    "client": "WebScale",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Implement Zero-Trust Architecture - Req #1708",
    "budget": "$91/hr",
    "type": "Fixed Price",
    "tags": [
      "NetSec",
      "Zero-Trust",
      "VPN"
    ],
    "sector": "Cybersecurity",
    "trust_required": 70,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Incident Response & Forensics - Phase 1 - Req #7129",
    "budget": "$47k",
    "type": "Fixed Price",
    "tags": [
      "Forensics",
      "SIEM",
      "Splunk"
    ],
    "sector": "Cybersecurity",
    "trust_required": 80,
    "client": "Acme Corp",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Implement Zero-Trust Architecture - Phase 3 - Req #2548",
    "budget": "$50k",
    "type": "Fixed Price",
    "tags": [
      "NetSec",
      "Zero-Trust",
      "VPN"
    ],
    "sector": "Cybersecurity",
    "trust_required": 75,
    "client": "YieldMax",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Senior Smart Contract Security Review - Phase 2 - Req #9288",
    "budget": "$43k",
    "type": "Fixed Price",
    "tags": [
      "Solidity",
      "Audit",
      "DeFi"
    ],
    "sector": "Cybersecurity",
    "trust_required": 70,
    "client": "SecureNet",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Incident Response & Forensics - Phase 3 - Req #8384",
    "budget": "$104/hr",
    "type": "Fixed Price",
    "tags": [
      "Forensics",
      "SIEM",
      "Splunk"
    ],
    "sector": "Cybersecurity",
    "trust_required": 65,
    "client": "FinTrust Labs",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior Smart Contract Security Review - Phase 1 - Req #3180",
    "budget": "$8k",
    "type": "Fixed Price",
    "tags": [
      "Solidity",
      "Audit",
      "DeFi"
    ],
    "sector": "Cybersecurity",
    "trust_required": 85,
    "client": "DataMind",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Customer Churn Prediction Model - Req #7536",
    "budget": "$121/hr",
    "type": "Retainer",
    "tags": [
      "Python",
      "XGBoost",
      "Data Science"
    ],
    "sector": "Data Science",
    "trust_required": 70,
    "client": "GlobalTrade",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Recommendation Engine for Streaming - Req #6880",
    "budget": "$48/hr",
    "type": "Fixed Price",
    "tags": [
      "Collab Filter",
      "Spark",
      "Python"
    ],
    "sector": "Data Science",
    "trust_required": 90,
    "client": "DeFi Protocol X",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "NLP Sentiment Analysis - Req #5111",
    "budget": "$96/hr",
    "type": "Hourly",
    "tags": [
      "Spacy",
      "NLTK",
      "Transformers"
    ],
    "sector": "Data Science",
    "trust_required": 70,
    "client": "YieldMax",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior Recommendation Engine for Streaming - Req #3234",
    "budget": "$15k",
    "type": "Retainer",
    "tags": [
      "Collab Filter",
      "Spark",
      "Python"
    ],
    "sector": "Data Science",
    "trust_required": 75,
    "client": "LexAI",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Time-Series Forecasting for Retail - Req #2873",
    "budget": "$33k",
    "type": "Hourly",
    "tags": [
      "Pandas",
      "Prophet",
      "SQL"
    ],
    "sector": "Data Science",
    "trust_required": 95,
    "client": "Cyberdyne",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior Time-Series Forecasting for Retail - Phase 3 - Req #1712",
    "budget": "$36k",
    "type": "Retainer",
    "tags": [
      "Pandas",
      "Prophet",
      "SQL"
    ],
    "sector": "Data Science",
    "trust_required": 80,
    "client": "FinTrust Labs",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Data Pipeline Architecture - Phase 2 - Req #2260",
    "budget": "$114/hr",
    "type": "Fixed Price",
    "tags": [
      "Airflow",
      "Snowflake",
      "dbt"
    ],
    "sector": "Data Science",
    "trust_required": 70,
    "client": "GlobalTrade",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Customer Churn Prediction Model - Phase 2 - Req #1926",
    "budget": "$101/hr",
    "type": "Retainer",
    "tags": [
      "Python",
      "XGBoost",
      "Data Science"
    ],
    "sector": "Data Science",
    "trust_required": 80,
    "client": "LexAI",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Time-Series Forecasting for Retail - Phase 3 - Req #2936",
    "budget": "$92/hr",
    "type": "Retainer",
    "tags": [
      "Pandas",
      "Prophet",
      "SQL"
    ],
    "sector": "Data Science",
    "trust_required": 90,
    "client": "GlobalTrade",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Data Pipeline Architecture - Phase 3 - Req #6872",
    "budget": "$18k",
    "type": "Fixed Price",
    "tags": [
      "Airflow",
      "Snowflake",
      "dbt"
    ],
    "sector": "Data Science",
    "trust_required": 85,
    "client": "MetaBuild",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "AWS Infrastructure as Code - Req #5879",
    "budget": "$68/hr",
    "type": "Fixed Price",
    "tags": [
      "Terraform",
      "AWS",
      "CloudFormation"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 90,
    "client": "DataMind",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Senior Kubernetes Cluster Migration - Req #9458",
    "budget": "$23k",
    "type": "Retainer",
    "tags": [
      "Kubernetes",
      "Docker",
      "AWS"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 70,
    "client": "FinTrust Labs",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Serverless Architecture Design - Req #4652",
    "budget": "$48k",
    "type": "Retainer",
    "tags": [
      "AWS Lambda",
      "API Gateway",
      "DynamoDB"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 60,
    "client": "Acme Corp",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Prometheus & Grafana Monitoring - Req #6840",
    "budget": "$42k",
    "type": "Fixed Price",
    "tags": [
      "Monitoring",
      "Grafana",
      "DevOps"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 75,
    "client": "Alpha Fund",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Serverless Architecture Design - Req #9532",
    "budget": "$15k",
    "type": "Retainer",
    "tags": [
      "AWS Lambda",
      "API Gateway",
      "DynamoDB"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 75,
    "client": "Acme Corp",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Serverless Architecture Design - Phase 2 - Req #2450",
    "budget": "$148/hr",
    "type": "Hourly",
    "tags": [
      "AWS Lambda",
      "API Gateway",
      "DynamoDB"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 80,
    "client": "Cyberdyne",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "AWS Infrastructure as Code - Phase 3 - Req #7408",
    "budget": "$129/hr",
    "type": "Fixed Price",
    "tags": [
      "Terraform",
      "AWS",
      "CloudFormation"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 85,
    "client": "DataMind",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior AWS Infrastructure as Code - Phase 2 - Req #7484",
    "budget": "$8k",
    "type": "Hourly",
    "tags": [
      "Terraform",
      "AWS",
      "CloudFormation"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 65,
    "client": "DeFi Protocol X",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Prometheus & Grafana Monitoring - Phase 3 - Req #7153",
    "budget": "$61/hr",
    "type": "Retainer",
    "tags": [
      "Monitoring",
      "Grafana",
      "DevOps"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 95,
    "client": "Acme Corp",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Senior Kubernetes Cluster Migration - Phase 1 - Req #7230",
    "budget": "$39k",
    "type": "Fixed Price",
    "tags": [
      "Kubernetes",
      "Docker",
      "AWS"
    ],
    "sector": "DevOps & Cloud",
    "trust_required": 75,
    "client": "WebScale",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "High-Frequency Trading Algorithm - Req #5272",
    "budget": "$112/hr",
    "type": "Fixed Price",
    "tags": [
      "Rust",
      "Order Book",
      "HFT"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 60,
    "client": "LexAI",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Options Pricing Model - Req #2556",
    "budget": "$133/hr",
    "type": "Retainer",
    "tags": [
      "Math",
      "Python",
      "Derivatives"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 80,
    "client": "FinTrust Labs",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "Crypto Portfolio Optimizer - Req #2785",
    "budget": "$50k",
    "type": "Hourly",
    "tags": [
      "SciPy",
      "ConvexOpt",
      "Finance"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 90,
    "client": "Cyberdyne",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Options Pricing Model - Req #9371",
    "budget": "$60/hr",
    "type": "Fixed Price",
    "tags": [
      "Math",
      "Python",
      "Derivatives"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 60,
    "client": "YieldMax",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Statistical Arbitrage Strategy - Req #7143",
    "budget": "$77/hr",
    "type": "Fixed Price",
    "tags": [
      "Python",
      "Pandas",
      "Quant"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 70,
    "client": "LexAI",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Senior High-Frequency Trading Algorithm - Phase 3 - Req #7920",
    "budget": "$83/hr",
    "type": "Hourly",
    "tags": [
      "Rust",
      "Order Book",
      "HFT"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 95,
    "client": "DataMind",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Options Pricing Model - Phase 1 - Req #7632",
    "budget": "$13k",
    "type": "Fixed Price",
    "tags": [
      "Math",
      "Python",
      "Derivatives"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 75,
    "client": "Acme Corp",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Statistical Arbitrage Strategy - Phase 1 - Req #5345",
    "budget": "$38k",
    "type": "Fixed Price",
    "tags": [
      "Python",
      "Pandas",
      "Quant"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 75,
    "client": "DataMind",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Crypto Portfolio Optimizer - Phase 3 - Req #4135",
    "budget": "$27k",
    "type": "Retainer",
    "tags": [
      "SciPy",
      "ConvexOpt",
      "Finance"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 75,
    "client": "Acme Corp",
    "verified": false,
    "color": "cyan"
  },
  {
    "title": "Senior Options Pricing Model - Phase 1 - Req #4271",
    "budget": "$56/hr",
    "type": "Fixed Price",
    "tags": [
      "Math",
      "Python",
      "Derivatives"
    ],
    "sector": "Quantitative Finance",
    "trust_required": 65,
    "client": "Alpha Fund",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "WebXR Virtual Showroom - Req #2995",
    "budget": "$84/hr",
    "type": "Fixed Price",
    "tags": [
      "Three.js",
      "WebXR",
      "WebGL"
    ],
    "sector": "AR & VR",
    "trust_required": 85,
    "client": "SecureNet",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "Senior Metaverse Avatar Integrator - Req #4650",
    "budget": "$85/hr",
    "type": "Hourly",
    "tags": [
      "Web3",
      "Unity",
      "Avatars"
    ],
    "sector": "AR & VR",
    "trust_required": 90,
    "client": "DataMind",
    "verified": true,
    "color": "brand"
  },
  {
    "title": "WebXR Virtual Showroom - Req #9964",
    "budget": "$17k",
    "type": "Fixed Price",
    "tags": [
      "Three.js",
      "WebXR",
      "WebGL"
    ],
    "sector": "AR & VR",
    "trust_required": 60,
    "client": "WebScale",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior Unity VR Training Simulation - Req #9877",
    "budget": "$29k",
    "type": "Hourly",
    "tags": [
      "Unity",
      "C#",
      "Oculus"
    ],
    "sector": "AR & VR",
    "trust_required": 60,
    "client": "FinTrust Labs",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Unreal Engine Architectural Viz - Req #6018",
    "budget": "$50k",
    "type": "Retainer",
    "tags": [
      "Unreal",
      "Blueprints",
      "3D"
    ],
    "sector": "AR & VR",
    "trust_required": 85,
    "client": "LexAI",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior Unreal Engine Architectural Viz - Phase 3 - Req #2622",
    "budget": "$23k",
    "type": "Fixed Price",
    "tags": [
      "Unreal",
      "Blueprints",
      "3D"
    ],
    "sector": "AR & VR",
    "trust_required": 80,
    "client": "Acme Corp",
    "verified": false,
    "color": "brand"
  },
  {
    "title": "ARKit Measurement App - Phase 3 - Req #1776",
    "budget": "$11k",
    "type": "Retainer",
    "tags": [
      "ARKit",
      "Swift",
      "iOS"
    ],
    "sector": "AR & VR",
    "trust_required": 60,
    "client": "GlobalTrade",
    "verified": true,
    "color": "emerald"
  },
  {
    "title": "Senior WebXR Virtual Showroom - Phase 3 - Req #3121",
    "budget": "$51/hr",
    "type": "Fixed Price",
    "tags": [
      "Three.js",
      "WebXR",
      "WebGL"
    ],
    "sector": "AR & VR",
    "trust_required": 75,
    "client": "YieldMax",
    "verified": false,
    "color": "emerald"
  },
  {
    "title": "Unreal Engine Architectural Viz - Phase 1 - Req #4997",
    "budget": "$38k",
    "type": "Retainer",
    "tags": [
      "Unreal",
      "Blueprints",
      "3D"
    ],
    "sector": "AR & VR",
    "trust_required": 95,
    "client": "MetaBuild",
    "verified": true,
    "color": "cyan"
  },
  {
    "title": "Senior WebXR Virtual Showroom - Phase 1 - Req #5993",
    "budget": "$40k",
    "type": "Retainer",
    "tags": [
      "Three.js",
      "WebXR",
      "WebGL"
    ],
    "sector": "AR & VR",
    "trust_required": 65,
    "client": "Alpha Fund",
    "verified": true,
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const { playClick, playSuccess, playHover } = useAudio();
  
  // State for signing simulation
  const [signingJobs, setSigningJobs] = useState<Record<number, boolean>>({});
  const [signedJobs, setSignedJobs] = useState<Record<number, boolean>>({});

  const handleSignContract = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (signedJobs[index] || signingJobs[index]) return;
    
    playClick();
    setSigningJobs(prev => ({ ...prev, [index]: true }));
    
    setTimeout(() => {
      setSigningJobs(prev => ({ ...prev, [index]: false }));
      setSignedJobs(prev => ({ ...prev, [index]: true }));
      playSuccess();
    }, 2000);
  };

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSector = activeSector ? job.sector === activeSector : true;
    return matchesSearch && matchesSector;
  });

  return (
    <AppShell>
      <WebGLBackground />
      <div className="p-6 md:p-8 xl:p-10 h-full relative z-10 overflow-x-hidden max-w-7xl mx-auto">
        
        {/* Decorative HUD Elements */}
        <div className="absolute top-0 right-10 w-[1px] h-32 bg-gradient-to-b from-brand-500/0 via-brand-500/50 to-brand-500/0 opacity-50" />
        <div className="absolute top-32 right-8 w-4 h-[1px] bg-brand-500/50 opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-500/0 via-brand-500/[0.02] to-brand-500/0 pointer-events-none -z-10 animate-[pulse_4s_ease-in-out_infinite]" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="flex items-center gap-3 mb-2 text-white font-mono text-xs uppercase tracking-widest">
              <Globe size={14} className="animate-pulse" />
              <span>Global Contract Registry</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight text-white ">
              Project Marketplace
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm max-w-xl">
              Access high-yield, verified contracts. Requires minimum cryptographic trust threshold for execution.
            </p>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query global registry..." 
                className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-xl pl-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all font-mono text-sm shadow-sm" 
              />
            </div>
            <button 
              onMouseEnter={playHover}
              onClick={playClick}
              className="h-12 w-12 flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/20/50 transition-all shadow-sm hover:shadow-sm hover:scale-105 active:scale-95 shrink-0"
            >
              <Filter size={18} />
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar / Matchmaker */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="md:col-span-1 space-y-6 md:sticky md:top-8 self-start">
            <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.15)" className="p-6 border-white/5 bg-[#0A0A0A]/40 backdrop-blur-xl shadow-sm">
              <h3 className="font-sans font-medium font-bold uppercase tracking-widest text-white border-b border-white/5 pb-3 mb-4 text-sm">Target Sectors</h3>
              <div className="space-y-3">
                {SECTORS.map(c => {
                  const isActive = activeSector === c.name;
                  return (
                    <div key={c.name} onClick={() => { playClick(); setActiveSector(isActive ? null : c.name); }} className="cursor-pointer group flex flex-col gap-2 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/10">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className={clsx("w-3.5 h-3.5 rounded-sm border transition-colors flex items-center justify-center shadow-sm shrink-0 mt-0.5", isActive ? "border-cyan-500 bg-cyan-500/20" : "border-white/20 bg-white/[0.02] group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10")}>
                            {isActive && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-sm shadow-[0_0_5px_rgba(34,211,238,0.8)]" />}
                          </div>
                          <span className={clsx("text-[11px] font-sans font-medium tracking-wide transition-colors leading-tight", isActive ? "text-cyan-100" : "text-gray-400 group-hover:text-white")}>{c.name}</span>
                        </div>
                        <span className="text-[9px] font-mono font-medium text-gray-400 bg-black/50 px-1.5 py-0.5 rounded border border-white/5 shrink-0">{c.count.toLocaleString()}</span>
                      </div>
                      {/* Telemetry Progress Bar */}
                      <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden flex ml-[22px] border border-white/5" style={{ width: 'calc(100% - 22px)' }}>
                         <div className={clsx("h-full rounded-full transition-all duration-1000", isActive ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-gray-600 group-hover:bg-gray-400")} style={{ width: `${c.load}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SpotlightCard>
            
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.2)" className="p-6 border-purple-500/20 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white relative z-10 shadow-sm">
                  <Activity size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans font-medium font-bold uppercase tracking-widest text-white text-sm relative z-10">Neural Matcher</h3>
                  <p className="text-[10px] font-mono text-white relative z-10">AI-Optimized Routing</p>
                </div>
              </div>
              <p className="text-xs font-mono text-gray-400 mb-6 leading-relaxed relative z-10">Deploy algorithmic matching to instantly align your verified skills with optimal open contracts.</p>
              
              <button 
                onMouseEnter={playHover}
                onClick={playClick}
                className="w-full py-3 bg-white/10 text-white border border-white/20 rounded-lg font-sans font-medium font-bold uppercase tracking-widest hover:bg-purple-500/30 transition-all text-xs shadow-sm hover:shadow-sm relative z-10"
              >
                Engage Auto-Match
              </button>
            </SpotlightCard>

            {/* Clearance Level Card */}
            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.15)" className="p-6 border-emerald-500/20 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group h-fit">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="min-w-0 truncate">
                      <h3 className="font-sans font-semibold uppercase tracking-wider text-white text-sm truncate">Clearance</h3>
                      <p className="text-[10px] font-mono text-emerald-400 truncate">Tier 1 Operative</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 shrink-0 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 relative">
                     <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-[spin_3s_linear_infinite]" />
                     <span className="font-sans font-bold text-emerald-400 text-xs">85</span>
                  </div>
                </div>
                
                <p className="text-xs font-mono text-gray-400 leading-relaxed m-0">
                  Your cryptographic trust score grants you execution rights on <span className="text-white">high-yield contracts</span> up to $50k.
                </p>
                
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                   <div className="flex justify-between text-[10px] font-mono">
                     <span className="text-gray-500">Security Clearance</span>
                     <span className="text-emerald-400">Verified</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono">
                     <span className="text-gray-500">Identity Status</span>
                     <span className="text-emerald-400">Cryptographically Signed</span>
                   </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
          
          {/* Main Job Feed */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
              <span className="text-[10px] font-sans font-medium text-gray-500 uppercase tracking-widest">Active Contracts ({filteredJobs.length})</span>
              <div className="flex gap-4 text-[10px] font-sans font-medium uppercase tracking-widest">
                <span className="text-white cursor-pointer hover:text-white transition-colors">Latest</span>
                <span className="text-gray-500 cursor-pointer hover:text-white transition-colors">Highest Yield</span>
              </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredJobs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-12 text-center border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center"
                  >
                    <Search className="text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-sans font-semibold text-white mb-2">No Contracts Found</h3>
                    <p className="text-gray-400 font-mono text-sm">No active contracts match your current cryptographic clearance or query.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setActiveSector(null); }}
                      className="mt-6 px-6 py-2 bg-white/5 text-white border border-white/20/30 rounded-lg font-mono text-xs uppercase hover:bg-brand-500/30 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </motion.div>
                ) : (
                  filteredJobs.map((job, i) => {
                    const theme = (job.color || "cyan") as ThemeColor;
                    const styles = THEME_STYLES[theme] || THEME_STYLES.cyan;
                    const meta = getMetadata(job.title);
                    
                    return (
                      <motion.div 
                        key={job.title}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        onMouseEnter={playHover}
                      >
                        <SpotlightCard className={clsx("p-6 md:p-8 bg-[#0A0A0A]/40 backdrop-blur-xl group transition-all duration-500 cursor-pointer relative overflow-hidden", styles.cardBorder)}>
                          
                          {/* Top corner accents */}
                          <div className="absolute -top-6 -left-6 w-4 h-4 border-t border-l border-white/20 group-hover:border-white/50 transition-colors pointer-events-none" />
                          <div className="absolute -bottom-6 -right-6 w-4 h-4 border-b border-r border-white/20 group-hover:border-white/50 transition-colors pointer-events-none" />
      
                          {/* Cryptographic Top Bar */}
                          <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                              <Code size={12} className={styles.accent} />
                              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{job.client} <span className="text-white/20 mx-1">|</span> VAULT: <span className={clsx("font-bold text-white/80", styles.accent)}>{meta.hash}</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest hidden sm:flex">
                               <span className="text-gray-500 flex items-center gap-1.5"><Activity size={10} className="text-amber-400 animate-pulse" /> <span className="text-white/80 font-bold">{meta.bidders}</span> Bidding</span>
                               <span className="text-white/20">|</span>
                               <span className="text-gray-500">T-MINUS <span className="text-white/80 font-bold">{meta.hours}H {meta.mins}M</span></span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                            <div className="flex-1 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className={clsx("text-xl md:text-2xl font-display font-black tracking-tight transition-colors drop-shadow-md pr-4", styles.titleGlow)}>{job.title}</h3>
                                  <div className="flex items-center flex-wrap gap-3 text-[10px] font-mono uppercase tracking-widest mt-3">
                                    {job.verified && <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]"><ShieldCheck size={10} /> Verified</span>}
                                    <span className="text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/20">{job.type}</span>
                                    <span className={clsx("flex items-center gap-1.5 font-bold", styles.accent)}><Zap size={10} /> {meta.match}% NEURAL MATCH</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-3xl font-black font-display tracking-tight text-white drop-shadow-sm">{job.budget}</p>
                                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Allocation</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 pt-2">
                                {job.tags.map(tag => (
                                  <span key={tag} className={clsx("text-[10px] font-sans font-medium uppercase tracking-widest px-3 py-1.5 border rounded-md shadow-inner transition-colors", styles.tagBg)}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 pl-0 md:pl-8 shrink-0 min-w-[140px]">
                              <div className="flex flex-col items-center group/ring">
                                <TrustRing score={job.trust_required} size={64} />
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-3 transition-colors group-hover/ring:text-white/80">Clearance Required</span>
                              </div>
                              
                              <button 
                                onClick={(e) => handleSignContract(e, i)}
                                disabled={signingJobs[i] || signedJobs[i]}
                                className={clsx(
                                  "mt-6 md:mt-0 flex items-center justify-center gap-2 px-6 py-3 w-full border rounded-lg font-sans font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm",
                                  signedJobs[i] 
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                    : styles.button,
                                  !signedJobs[i] && !signingJobs[i] ? "hover:scale-105 active:scale-95 group-hover:border-white/30 bg-white/5 border-white/10" : ""
                                )}
                              >
                                {signingJobs[i] ? (
                                  <><Loader2 size={14} className="animate-spin" /> Handshake...</>
                                ) : signedJobs[i] ? (
                                  <><Check size={14} /> Protocol Signed</>
                                ) : (
                                  <>Sign Contract <ChevronRight size={14} /></>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Match Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.02]">
                            <div className={clsx("h-full transition-all duration-1000", styles.tagBg.split(' ')[0])} style={{ width: `${meta.match}%` }} />
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
      </div>
    </AppShell>
  );
}
