"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Lightbulb, Shield, Copy, Check } from "lucide-react";
import type { AnalysisResponse } from "@/lib/api";

interface ResultatenDashboardProps {
    data: AnalysisResponse;
}

function getSeverityColor(score: number): string {
    if (score >= 1 && score <= 3) return "bg-blue-500";
    if (score >= 4 && score <= 7) return "bg-orange-500";
    return "bg-red-500";
}

function getSeverityLabel(score: number): string {
    if (score >= 1 && score <= 3) return "Laag";
    if (score >= 4 && score <= 7) return "Gemiddeld";
    return "Kritiek";
}

export function ResultatenDashboard({ data }: ResultatenDashboardProps) {
    const [copied, setCopied] = useState(false);
    const privacyPercentage = (data.privacy_score / 10) * 100;

    const handleCopySummary = async () => {
        const summaryText = data.summary.join("\n• ");
        await navigator.clipboard.writeText(`ClearClause Analyse Samenvatting:\n\n• ${summaryText}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Samenvatting */}
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <CardTitle>Samenvatting</CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopySummary}
                            className="gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Gekopieerd!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Kopieer
                                </>
                            )}
                        </Button>
                    </div>
                    <CardDescription>De belangrijkste punten uit het document</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.summary.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Rode Vlaggen */}
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Rode Vlaggen ({data.red_flags.length})
                    </CardTitle>
                    <CardDescription>Gedetecteerde risico's en dark patterns</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.red_flags.length === 0 ? (
                        <p className="text-muted-foreground">Geen significante risico's gedetecteerd.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Clausule</TableHead>
                                    <TableHead>Risico Type</TableHead>
                                    <TableHead>Uitleg</TableHead>
                                    <TableHead className="text-right">Ernst</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.red_flags.map((flag, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono text-xs max-w-xs truncate">
                                            {flag.clause_citation}
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {flag.risk_type}
                                            </code>
                                        </TableCell>
                                        <TableCell className="max-w-md">{flag.explanation}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className={getSeverityColor(flag.severity_score)}>
                                                {flag.severity_score}/10 - {getSeverityLabel(flag.severity_score)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suggesties */}
                <Card className="glass glass-hover border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                            Suggesties
                        </CardTitle>
                        <CardDescription>Aanbevelingen voor actie</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-3">
                            {data.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-semibold">
                                        {index + 1}
                                    </span>
                                    <span className="pt-0.5">{suggestion}</span>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                {/* Privacy Score */}
                <Card className="glass glass-hover border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Privacy Score
                        </CardTitle>
                        <CardDescription>Beoordeling van privacyvriendelijkheid</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        className="text-gray-200 dark:text-gray-700 stroke-current"
                                        strokeWidth="10"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                    />
                                    <circle
                                        className="text-blue-600 stroke-current"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - privacyPercentage / 100)}`}
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold">{data.privacy_score}/10</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Progress value={privacyPercentage} className="h-2" />
                            <p className="text-sm text-muted-foreground">{data.privacy_motivatie}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
