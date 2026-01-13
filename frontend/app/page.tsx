"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Landing() {
  const modes = [
    {
      value: "algemene_voorwaarden",
      naam: "Algemene Voorwaarden",
      beschrijving: "Detecteer Dark Patterns en juridische risico's",
      icon: FileText,
      color: "cyan"
    },
    {
      value: "privacy_beleid",
      naam: "Privacy Beleid",
      beschrijving: "GDPR compliance analyse",
      icon: Shield,
      color: "blue"
    },
    {
      value: "gebruikersvoorwaarden",
      naam: "Gebruikersvoorwaarden",
      beschrijving: "User rights en fairness check",
      icon: Users,
      color: "magenta"
    },
    {
      value: "brieven_analyse",
      naam: "Brieven Analyse",
      beschrijving: "Sentiment, urgentie en juridische claims",
      icon: Mail,
      color: "purple"
    },
    {
      value: "reactie_brief",
      naam: "Reactie Brief Generator",
      beschrijving: "AI-gedreven reactie brieven",
      icon: PenTool,
      color: "pink"
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
        {/* Hero Section - Zwarte achtergrond */}
        <section className="relative bg-black py-20 px-4 border-b border-cyan-500/20">
          <div className="container mx-auto text-center">
            {/* Professional Logo */}
            <div className="mb-8 flex justify-center">
              <img
                src="/clearclause-logo.png"
                alt="ClearClause - AI Juridische Assistent Suite"
                className="h-32 md:h-40 w-auto drop-shadow-2xl"
              />
            </div>

            <p className="text-cyan-100/60 max-w-2xl mx-auto mb-12 text-lg">
              Analyseer juridische documenten met geavanceerde AI.
              Kies een analyse modus om te beginnen.
            </p>
          </div>
        </section>

        {/* Modes Grid - Bewegende achtergrond met blur */}
        <section className="relative py-12 px-4 backdrop-blur-sm">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">
              KIES EEN ANALYSE MODUS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {modes.map((mode) => {
                return (
                  <Link key={mode.value} href={`/analyse?mode=${mode.value}`}>
                    <Card className="glass window-frame cursor-pointer p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 group">
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="font-bold text-xl text-cyan-300 group-hover:text-cyan-200">
                          {mode.naam}
                        </h3>

                        <p className="text-sm text-cyan-100/60 group-hover:text-cyan-100/80">
                          {mode.beschrijving}
                        </p>

                        <Button
                          className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold"
                        >
                          START ANALYSE
                        </Button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-8 px-4 text-center backdrop-blur-sm">
          <p className="text-cyan-300/40 text-sm">
            Powered by GPT-4o • Multi-Expert AI Analysis
          </p>
        </footer>
      </main>
    </>
  );
}
