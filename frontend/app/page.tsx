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
        {/* Hero Section - Heldere Video Achtergrond */}
        <section className="relative h-[300px] md:h-[250px] overflow-hidden flex items-center justify-center border-b border-cyan-500/20 bg-black">
          {/* Video Background - Full Opacity */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src="/videos/loading-background.mp4" type="video/mp4" />
          </video>
          
          <div className="container mx-auto text-center relative z-10">
            {/* Logo en tekst in video nu optimaal zichtbaar zonder overlays */}
          </div>
        </section>

        {/* Modes Grid - Minimalist Premium */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {modes.map((mode) => {
                const href = (mode as any).isDemo 
                  ? `/analyse?mode=algemene_voorwaarden&demo=true`
                  : `/analyse?mode=${mode.value}`;
                  
                return (
                  <Link key={mode.value} href={href}>
                    <Card className={`premium-card glass window-frame cursor-pointer p-10 border-white/5 transition-all group ${(mode as any).isDemo ? 'border-cyan-500/50 bg-cyan-900/10' : ''}`}>
                      <div className="flex flex-col items-start text-left space-y-4">
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
        <footer className="relative py-12 px-4 text-center border-t border-white/5">
          <p className="text-white/20 text-xs tracking-[0.2em] uppercase">
            Powered by KairOS Multi-Expert AI Analysis
          </p>
        </footer>
      </main>
    </>
  );
}
