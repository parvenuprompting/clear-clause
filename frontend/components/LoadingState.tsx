"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Scale, Shield, MessageSquare } from "lucide-react";

export function LoadingState() {
    return (
        <Card className="w-full max-w-4xl mx-auto glass glass-hover border-white/20 overflow-hidden relative">
            {/* Background Video */}
            {/* Ambient Background with Ken Burns */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black animate-[kenBurns_20s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <CardContent className="py-12 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-cyan-400">
                            Analyse in uitvoering
                        </h2>
                        <p className="text-white/60 text-sm animate-pulse">
                            De drie experts bestuderen uw document...
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {/* Jurist */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl glass-card float">
                            <div className="p-4 bg-blue-400/20 rounded-full backdrop-blur-md border border-blue-400/30">
                                <Scale className="h-8 w-8 text-blue-300" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">Jurist</h3>
                            <p className="text-sm text-center text-white/70">
                                Analyseert clausules op juridische risico&apos;s
                            </p>
                        </div>

                        {/* Ethicus */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl glass-card float" style={{ animationDelay: "0.5s" }}>
                            <div className="p-4 bg-purple-400/20 rounded-full backdrop-blur-md border border-purple-400/30">
                                <Shield className="h-8 w-8 text-purple-300" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">Ethicus</h3>
                            <p className="text-sm text-center text-white/70">
                                Beoordeelt eerlijkheid en transparantie
                            </p>
                        </div>

                        {/* Vertaler */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-xl glass-card float" style={{ animationDelay: "1s" }}>
                            <div className="p-4 bg-green-400/20 rounded-full backdrop-blur-md border border-green-400/30">
                                <MessageSquare className="h-8 w-8 text-green-300" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">Vertaler</h3>
                            <p className="text-sm text-center text-white/70">
                                Vertaalt juridisch jargon naar mensentaal
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-md space-y-3">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                            <div className="h-full bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-medium">
                            <span>Systeem Scannen</span>
                            <span>Tokens Verwerken</span>
                            <span>Rapport Genereren</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
