"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

interface AnalysisFormProps {
    onSubmit: (text: string, documentName: string) => void;
    isLoading: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
    const [text, setText] = useState("");
    const [documentName, setDocumentName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text, documentName || "Onbekend Document");
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ClearClause AI
                </CardTitle>
                <CardDescription className="text-lg">
                    Upload of plak je juridische tekst voor een grondige analyse door onze drie experts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="documentName" className="block text-sm font-medium mb-2">
                            Document Naam (optioneel)
                        </label>
                        <input
                            id="documentName"
                            type="text"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="bijv. Algemene Voorwaarden - Bedrijf X"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="text" className="block text-sm font-medium mb-2">
                            Juridische Tekst
                        </label>
                        <Textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Plak hier de algemene voorwaarden, privacyverklaring of ander juridisch document..."
                            className="min-h-[300px] font-mono text-sm"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={!text.trim() || isLoading}
                            className="flex-1"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {isLoading ? "Analyseren..." : "Analyseer Document"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload PDF (Binnenkort)
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
