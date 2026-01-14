"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Landing() {
  const modes = [
    {
      value: "algemene_voorwaarden",
      naam: "Algemene Voorwaarden",
      beschrijving: "Detecteer Dark Patterns en juridische risico's"
    },
    {
      value: "privacy_beleid",
      naam: "Privacy Beleid",
      beschrijving: "GDPR compliance analyse"
    },
    {
      value: "zakelijke_onderhandelingen",
      naam: "Zakelijke Onderhandelingen",
      beschrijving: "Deal Score, risico's & onderhandelingstips"
    },
    {
      value: "gebruikersvoorwaarden",
      naam: "Gebruikersvoorwaarden",
      beschrijving: "User rights en fairness check"
    },
    {
      value: "brieven_analyse",
      naam: "Brieven Analyse",
      beschrijving: "Sentiment, urgentie en juridische claims"
    },
    {
      value: "reactie_brief",
      naam: "Reactie Brief Generator",
      beschrijving: "AI-gedreven reactie brieven"
    },
    {
      value: "demo_intro", // Dummy value, link is custom
      naam: "Demo: Scan ClearClause",
      beschrijving: "Test de app direct met onze eigen voorwaarden",
      isDemo: true
    }
  ];

  return (
    <>
      {/* Statische zwarte achtergrond voor hero */}
      <div className="fixed top-0 left-0 right-0 h-screen bg-black z-[-3]" />

      {/* Bewegende gradient achtergrond voor de rest */}
      <div className="ken-burns-bg" />
      <div className="gradient-overlay" />

      <main className="min-h-screen relative">
        {/* Simple Navigation Menu */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 backdrop-blur-md">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <img src="/logo-full.png" alt="ClearClause Logo" className="h-12 w-auto" />
             </div>
             <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-cyan-500/50 bg-cyan-900/10 border border-cyan-500/20 px-2 py-1 rounded">BETA</span>
             </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-10 px-4 overflow-hidden">
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 animate-fade-in-up">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-medium text-cyan-300 tracking-wide uppercase">AI-Powered Legal Guardian</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight animate-fade-in-up delay-100">
              Juridische helderheid <br />
              <span className="text-white">in seconden.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
              ClearClause vertaalt complexe kleine lettertjes naar heldere taal. 
              Ontdek risico's, begrijp je rechten en teken nooit meer blind een contract.
            </p>

            {/* Visual Abstract Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
          </div>
        </section>

        {/* Modes Grid - Minimalist Premium */}
        <section className="relative pt-10 pb-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {modes.map((mode) => {
                const href = (mode as any).isDemo 
                  ? `/analyse?mode=algemene_voorwaarden&demo=true`
                  : `/analyse?mode=${mode.value}`;
                  
                return (
                  <Link key={mode.value} href={href} className="h-full block">
                    <Card className={`h-full premium-card glass window-frame cursor-pointer p-10 border-white/5 transition-all group ${(mode as any).isDemo ? 'border-cyan-500/50 bg-cyan-900/10' : ''}`}>
                      <div className="flex flex-col items-start text-left space-y-4 h-full">
                        <div className={`h-px w-8 ${(mode as any).isDemo ? 'bg-cyan-400 w-16' : 'bg-cyan-500/50'} group-hover:w-full transition-all duration-500`} />
                        <h3 className="font-medium text-2xl tracking-tight text-white/90 group-hover:text-cyan-400">
                          {mode.naam}
                        </h3>

                        <p className="text-sm leading-relaxed text-white/40 group-hover:text-white/60">
                          {mode.beschrijving}
                        </p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 px-4 border-t border-white/5 flex flex-col items-center gap-4">
          <img src="/kairos-brain.png" alt="KairOS Logo" className="h-8 w-auto opacity-40 hover:opacity-100 transition-opacity" />
          <p className="text-white/20 text-xs tracking-[0.2em] uppercase text-center">
            Powered by KairOS Multi-Expert AI Analysis
          </p>
        </footer>
      </main>
    </>
  );
}
