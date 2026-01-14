"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, FileText, Sparkles } from "lucide-react";
import { ModeSelector } from "@/components/ModeSelector";

interface AnalysisFormProps {
    onSubmit: (text: string, documentName: string, mode: string, context?: string) => void;
    isLoading: boolean;
    initialMode?: string;
    initialText?: string;
}

export function AnalysisForm({ onSubmit, isLoading, initialMode, initialText }: AnalysisFormProps) {
    const [text, setText] = useState(initialText || "");
    const [documentName, setDocumentName] = useState("");
    const [selectedMode, setSelectedMode] = useState(initialMode || "algemene_voorwaarden");
    const [context, setContext] = useState("");

    useEffect(() => {
        if (initialMode) {
            setSelectedMode(initialMode);
        }
    }, [initialMode]);

    useEffect(() => {
        if (initialText) {
            setText(initialText);
        }
    }, [initialText]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(
                text,
                documentName || "Onbekend Document",
                selectedMode,
                selectedMode === "reactie_brief" ? context : undefined
            );
        }
    };

    const isReactieBrief = selectedMode === "reactie_brief";

    return (
        <TooltipProvider delayDuration={300}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start max-w-7xl mx-auto">
                {/* Main Form Area - Left Side */}
                <div className="lg:col-span-3">
                    <Card className="w-full glass window-frame scanline">
                        <CardHeader className="text-center pb-2">
                            <div className="flex items-center justify-center mb-2">
                                <img src="/logo-full.png" alt="ClearClause" className="h-16 w-auto" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        placeholder="Document naam (optioneel)"
                                        className="w-full px-4 py-3 bg-black/40 border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-cyan-300/30 text-cyan-100 backdrop-blur-sm transition-all hover:border-cyan-400/50"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder={isReactieBrief ? "Plak hier de originele brief..." : "Plak hier je juridische tekst..."}
                                        className="min-h-[400px] bg-black/40 border-cyan-500/30 focus:ring-cyan-400 placeholder-cyan-300/30 text-cyan-100 backdrop-blur-sm resize-none transition-all hover:border-cyan-400/50 font-mono text-sm"
                                        disabled={isLoading}
                                    />
                                </div>

                                {isReactieBrief && (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={context}
                                            onChange={(e) => setContext(e.target.value)}
                                            placeholder="Wat wil je bereiken met je reactie? (bijv. bezwaar maken, opheldering vragen, etc.)"
                                            className="min-h-[120px] bg-black/40 border-magenta-500/30 focus:ring-magenta-400 placeholder-magenta-300/30 text-cyan-100 backdrop-blur-sm resize-none transition-all hover:border-magenta-400/50"
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="submit"
                                                disabled={!text.trim() || isLoading}
                                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold border-0 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all hover:scale-105"
                                                size="lg"
                                            >
                                                <FileText className="mr-2 h-5 w-5" />
                                                {isLoading ? "ANALYSEREN..." : "ANALYSEER"}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Start AI analyse van het document</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isLoading}
                                                className="glass border-magenta-500/30 text-magenta-300 hover:bg-magenta-500/10 hover:border-magenta-400 hover:text-magenta-200"
                                                size="lg"
                                            >
                                                <Upload className="mr-2 h-5 w-5" />
                                                UPLOAD PDF
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upload PDF document (binnenkort beschikbaar)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Navigation - Right Side */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="sticky top-24">
                        <h3 className="text-xs font-semibold text-cyan-500/70 uppercase tracking-widest mb-4 pl-1">
                            Analyse Modus
                        </h3>
                        <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
