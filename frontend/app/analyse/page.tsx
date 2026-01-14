"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnalysisForm } from "@/components/AnalysisForm";
import { LoadingState } from "@/components/LoadingState";
import { ResultatenDashboard } from "@/components/ResultatenDashboard";
import { analyzeDocument, type AnalysisResponse } from "@/lib/api";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

export default function AnalysePage() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentMode, setCurrentMode] = useState(searchParams.get("mode") || "algemene_voorwaarden");
    const [demoText, setDemoText] = useState("");

    useEffect(() => {
        const mode = searchParams.get("mode");
        const isDemo = searchParams.get("demo") === "true";

        if (mode) {
            setCurrentMode(mode);
        }

        if (isDemo) {
            fetch("/demo_terms.txt")
                .then(res => res.text())
                .then(text => setDemoText(text))
                .catch(err => console.error("Kon demo tekst niet laden:", err));
        }
    }, [searchParams]);

    const handleAnalyze = async (text: string, documentName: string, mode: string, context?: string) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setCurrentMode(mode);

        try {
            const response = await analyzeDocument({
                text,
                document_name: documentName,
                mode,
                context
            });
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    return (
        <TooltipProvider>
            {/* Ken Burns Background */}
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

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/">
                                <Button variant="outline" className="glass border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                                    <Home className="h-4 w-4" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Terug naar home</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </nav>

            <main className="min-h-screen relative pt-24 py-12 px-4">
                <div className="container mx-auto">
                    {!isLoading && !result && !error && (
                        <div className="fade-in">
                            <AnalysisForm 
                                onSubmit={handleAnalyze} 
                                isLoading={isLoading} 
                                initialMode={currentMode} 
                                initialText={demoText}
                            />
                        </div>
                    )}

                    {isLoading && (
                        <div className="fade-in">
                            <LoadingState />
                        </div>
                    )}

                    {error && (
                        <Card className="w-full max-w-4xl mx-auto glass glass-hover border-red-500/30 fade-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-400">
                                    <AlertCircle className="h-5 w-5" />
                                    Fout bij Analyse
                                </CardTitle>
                                <CardDescription className="text-red-300/60">{error}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={handleReset} className="bg-red-500/20 text-red-300 hover:bg-red-500/30">
                                    Probeer Opnieuw
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {result && (
                        <div className="space-y-6 fade-in">
                            <div className="flex justify-end gap-4">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href="/">
                                            <Button variant="outline" className="glass glass-hover">
                                                <Home className="mr-2 h-4 w-4" />
                                                Home
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Terug naar mode selectie</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button onClick={handleReset} variant="outline" className="glass glass-hover">
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Nieuw Document
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Reset en analyseer een nieuw document</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <ResultatenDashboard data={result} />
                        </div>
                    )}
                </div>
            </main>
        </TooltipProvider>
    );
}
