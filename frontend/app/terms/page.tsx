"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TermsPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const CLEARCLAUSE_TERMS = `
ALGEMENE VOORWAARDEN CLEARCLAUSE

Laatst bijgewerkt: 13 januari 2026

1. DEFINITIES
ClearClause ("wij", "ons") biedt een AI-gedreven juridische analyse service aan gebruikers ("u", "gebruiker").

2. GEBRUIK VAN DE SERVICE
2.1 U mag ClearClause gebruiken voor het analyseren van juridische documenten.
2.2 De analyses zijn bedoeld als hulpmiddel en vervangen geen professioneel juridisch advies.
2.3 U bent verantwoordelijk voor de documenten die u uploadt.

3. PRIVACY & DATA
3.1 Wij verwerken uw documenten alleen voor analyse doeleinden.
3.2 Documenten worden niet opgeslagen na analyse.
3.3 Wij gebruiken OpenAI GPT-4o voor analyses.
3.4 Zie ons Privacy Beleid voor meer details.

4. INTELLECTUEEL EIGENDOM
4.1 ClearClause en alle gerelateerde technologie blijven ons eigendom.
4.2 De analyse resultaten zijn eigendom van de gebruiker.

5. AANSPRAKELIJKHEID
5.1 ClearClause wordt geleverd "as is" zonder garanties.
5.2 Wij zijn niet aansprakelijk voor beslissingen genomen op basis van onze analyses.
5.3 Maximale aansprakelijkheid is beperkt tot het bedrag betaald voor de service.

6. WIJZIGINGEN
6.1 Wij behouden het recht deze voorwaarden te wijzigen.
6.2 Wijzigingen worden gecommuniceerd via de website.

7. TOEPASSELIJK RECHT
Deze voorwaarden vallen onder Nederlands recht.

Contact: info@clearclause.ai
  `.trim();

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Encode de terms in URL parameter
        const encodedTerms = encodeURIComponent(CLEARCLAUSE_TERMS);
        router.push(`/analyse?mode=algemene_voorwaarden&autoAnalyze=true&text=${encodedTerms}`);
    };

    return (
        <>
            {/* Background */}
            <div className="fixed top-0 left-0 right-0 h-screen bg-black z-[-3]" />
            <div className="ken-burns-bg" />
            <div className="gradient-overlay" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyan-500/20">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform">
                            ClearClause
                        </h1>
                    </Link>

                    <Link href="/">
                        <Button variant="outline" className="glass border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="min-h-screen relative pt-24 py-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-magenta-400 bg-clip-text text-transparent mb-4">
                            Algemene Voorwaarden
                        </h1>
                        <p className="text-cyan-100/60">
                            Transparantie is belangrijk. Daarom kun je onze eigen voorwaarden direct analyseren.
                        </p>
                    </div>

                    {/* Terms Card */}
                    <Card className="glass window-frame mb-8">
                        <CardHeader>
                            <CardTitle className="text-cyan-300">ClearClause Algemene Voorwaarden</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/40 p-6 rounded-lg border border-cyan-500/20 max-h-96 overflow-y-auto">
                                <pre className="text-cyan-100/80 text-sm whitespace-pre-wrap font-mono">
                                    {CLEARCLAUSE_TERMS}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Action */}
                    <Card className="glass window-frame border-cyan-400/50 bg-cyan-500/5">
                        <CardContent className="p-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Sparkles className="h-8 w-8 text-cyan-400 neon-pulse" />
                                <h3 className="text-2xl font-bold text-cyan-300">
                                    Analyseer Onze Voorwaarden
                                </h3>
                                <Sparkles className="h-8 w-8 text-magenta-400 neon-pulse" />
                            </div>

                            <p className="text-cyan-100/70 mb-6 max-w-2xl mx-auto">
                                Wij praktiseren wat wij prediken. Gebruik ClearClause om onze eigen algemene voorwaarden
                                te analyseren op Dark Patterns en juridische risico's.
                            </p>

                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-lg px-8 py-6"
                                size="lg"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                        Voorbereiden...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Analyseer Deze Voorwaarden
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            <p className="text-cyan-300/40 text-xs mt-4">
                                Dit is een live demonstratie van ClearClause's analyse capabilities
                            </p>
                        </CardContent>
                    </Card>

                    {/* Footer Link */}
                    <div className="text-center mt-12">
                        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            ← Terug naar home
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
