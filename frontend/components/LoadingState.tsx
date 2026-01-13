"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Scale, Shield, MessageSquare } from "lucide-react";

export function LoadingState() {
    return (
        <Card className="w-full max-w-4xl mx-auto glass glass-hover border-white/20">
            <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <h2 className="text-2xl font-bold text-center text-white">
                        Analyse in uitvoering
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {/* Jurist */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg glass glass-hover float">
                            <div className="p-4 bg-blue-400/20 rounded-full backdrop-blur-sm">
                                <Scale className="h-8 w-8 text-blue-300" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">Jurist</h3>
                            <p className="text-sm text-center text-white/70">
                                Analyseert clausules
                            </p>
                        </div>

                        {/* Ethicus */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg glass glass-hover float" style={{ animationDelay: "0.5s" }}>
                            <div className="p-4 bg-purple-400/20 rounded-full backdrop-blur-sm">
                                <Shield className="h-8 w-8 text-purple-300" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">Ethicus</h3>
                            <p className="text-sm text-center text-white/70">
                                Beoordeelt eerlijkheid
                            </p>
                        </div>

                        {/* Vertaler */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg glass glass-hover float" style={{ animationDelay: "1s" }}>
                            <div className="p-4 bg-green-400/20 rounded-full backdrop-blur-sm">
                                <MessageSquare className="h-8 w-8 text-green-300" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">Vertaler</h3>
                            <p className="text-sm text-center text-white/70">
                                Vertaalt jargon
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-md">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
