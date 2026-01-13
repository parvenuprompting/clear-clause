"use client";

import { useState } from "react";
import { AnalysisForm } from "@/components/AnalysisForm";
import { LoadingState } from "@/components/LoadingState";
import { ResultatenDashboard } from "@/components/ResultatenDashboard";
import { analyzeDocument, type AnalysisResponse } from "@/lib/api";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState("algemene_voorwaarden");

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

      <main className="min-h-screen relative py-12 px-4">
        <div className="container mx-auto">
          {!isLoading && !result && !error && (
            <div className="fade-in">
              <AnalysisForm onSubmit={handleAnalyze} isLoading={isLoading} />
            </div>
          )}

          {isLoading && (
            <div className="fade-in">
              <LoadingState />
            </div>
          )}

          {error && (
            <Card className="w-full max-w-4xl mx-auto glass glass-hover border-red-200 dark:border-red-800 fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Fout bij Analyse
                </CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleReset}>Probeer Opnieuw</Button>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6 fade-in">
              <div className="flex justify-end">
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
              {/* Voor nu gebruiken we de standaard ResultatenDashboard voor alle modi */}
              {/* TODO: Implementeer mode-specifieke dashboards */}
              <ResultatenDashboard data={result} />
            </div>
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}
