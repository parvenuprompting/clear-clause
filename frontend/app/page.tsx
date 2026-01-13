"use client";

import { useState } from "react";
import { AnalysisForm } from "@/components/AnalysisForm";
import { LoadingState } from "@/components/LoadingState";
import { ResultatenDashboard } from "@/components/ResultatenDashboard";
import { analyzeDocument, type AnalysisResponse } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string, documentName: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeDocument({ text, document_name: documentName });
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto">
        {!isLoading && !result && !error && (
          <AnalysisForm onSubmit={handleAnalyze} isLoading={isLoading} />
        )}

        {isLoading && <LoadingState />}

        {error && (
          <Card className="w-full max-w-4xl mx-auto border-red-200 dark:border-red-800">
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Analyse Resultaten</h1>
              <Button onClick={handleReset} variant="outline">
                Nieuw Document Analyseren
              </Button>
            </div>
            <ResultatenDashboard data={result} />
          </div>
        )}
      </div>
    </main>
  );
}
