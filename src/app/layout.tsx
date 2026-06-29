import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Share_Tech_Mono } from "next/font/google";
import "cal-sans";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/layout/Providers";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { AudioProvider } from "@/lib/AudioProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: { default: "TrustFlow AI", template: "%s | TrustFlow AI" },
  description: "The intelligent freelancer marketplace powered by AI trust scoring",
  keywords: ["freelance", "AI", "trust", "escrow", "marketplace"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans ${orbitron.variable} ${shareTechMono.variable} antialiased selection:bg-brand-500/30 selection:text-brand-200 min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SmoothScrollProvider>
            <AudioProvider>
              <Providers>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    className: "font-sans text-sm glass !bg-background/80 !text-foreground",
                    duration: 4000,
                  }}
                />
              </Providers>
            </AudioProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
