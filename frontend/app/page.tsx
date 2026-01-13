"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Users, Mail, PenTool, Sparkles } from "lucide-react";
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
      {/* Ken Burns Background */}
      <div className="ken-burns-bg" />
      <div className="gradient-overlay" />

      <main className="min-h-screen relative">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Sparkles className="h-16 w-16 text-cyan-400 float neon-pulse" />
              <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-magenta-400 bg-clip-text text-transparent neon-text">
                ClearClause
              </h1>
              <Sparkles className="h-16 w-16 text-magenta-400 float neon-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <p className="text-2xl text-cyan-300/80 mb-4 tracking-wide">
              AI JURIDISCHE ASSISTENT SUITE
            </p>

            <p className="text-cyan-100/60 max-w-2xl mx-auto mb-12">
              Analyseer juridische documenten met geavanceerde AI.
              Kies een analyse modus om te beginnen.
            </p>
          </div>
        </section>

        {/* Modes Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">
              KIES EEN ANALYSE MODUS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {modes.map((mode) => {
                const Icon = mode.icon;

                return (
                  <Link key={mode.value} href={`/analyse?mode=${mode.value}`}>
                    <Card className="glass window-frame cursor-pointer p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 group">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-6 rounded-full bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-all neon-pulse">
                          <Icon className="h-12 w-12 text-cyan-400" />
                        </div>

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
        <footer className="py-8 px-4 text-center">
          <p className="text-cyan-300/40 text-sm">
            Powered by GPT-4o • Multi-Expert AI Analysis
          </p>
        </footer>
      </main>
    </>
  );
}
