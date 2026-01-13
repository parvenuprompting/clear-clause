"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Sparkles } from "lucide-react";
import { ModeSelector } from "@/components/ModeSelector";

interface AnalysisFormProps {
    onSubmit: (text: string, documentName: string, mode: string, context?: string) => void;
    isLoading: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
    const [text, setText] = useState("");
    const [documentName, setDocumentName] = useState("");
    const [selectedMode, setSelectedMode] = useState("algemene_voorwaarden");
    const [context, setContext] = useState("");

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
        <>
            <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

            <Card className="w-full max-w-4xl mx-auto glass glass-hover border-white/20">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Sparkles className="h-8 w-8 text-purple-400 float" />
                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            ClearClause
                        </CardTitle>
                        <Sparkles className="h-8 w-8 text-blue-400 float" style={{ animationDelay: "1s" }} />
                    </div>
                    <p className="text-white/80 text-sm">AI-gedreven juridische analyse</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                placeholder="Document naam (optioneel)"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-white/50 text-white backdrop-blur-sm transition-all hover:bg-white/15"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={isReactieBrief ? "Plak hier de originele brief..." : "Plak hier je juridische tekst..."}
                                className="min-h-[300px] bg-white/10 border-white/20 focus:ring-purple-400 placeholder-white/50 text-white backdrop-blur-sm resize-none transition-all hover:bg-white/15"
                                disabled={isLoading}
                            />
                        </div>

                        {isReactieBrief && (
                            <div className="space-y-2">
                                <Textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="Wat wil je bereiken met je reactie? (bijv. bezwaar maken, opheldering vragen, etc.)"
                                    className="min-h-[120px] bg-white/10 border-white/20 focus:ring-purple-400 placeholder-white/50 text-white backdrop-blur-sm resize-none transition-all hover:bg-white/15"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="submit"
                                disabled={!text.trim() || isLoading}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                size="lg"
                            >
                                <FileText className="mr-2 h-5 w-5" />
                                {isLoading ? "Analyseren..." : "Analyseer"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                                className="glass glass-hover border-white/30 text-white hover:bg-white/20"
                                size="lg"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload PDF
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
