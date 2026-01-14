"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Lightbulb, Shield, Copy, Check, Download } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AnalysisPDF } from '@/components/export/AnalysisPDF';
import type { AnalysisResponse } from "@/lib/api";




interface ResultatenDashboardProps {
    data: AnalysisResponse;
    analyzedText: string;
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

export function ResultatenDashboard({ data, analyzedText }: ResultatenDashboardProps) {
    const [copied, setCopied] = useState(false);
    const privacyPercentage = (data.privacy_score / 10) * 100;
    const currentDate = new Date().toLocaleDateString('nl-NL');
    const fileName = `clearclause-analyse-${currentDate}.pdf`;

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
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <CardTitle className="text-white">Samenvatting</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopySummary}
                            className="gap-2 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white transition-all"
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
                    <CardDescription className="text-white/70">De belangrijkste punten uit het document</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.summary.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-100">{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Rode Vlaggen */}
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        Rode Vlaggen ({data.red_flags.length})
                    </CardTitle>
                    <CardDescription className="text-white/70">Gedetecteerde risico's en dark patterns</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.red_flags.length === 0 ? (
                        <p className="text-white/60">Geen significante risico's gedetecteerd.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-white/80">Clausule</TableHead>
                                    <TableHead className="text-white/80">Risico Type</TableHead>
                                    <TableHead className="text-white/80 w-full">Uitleg</TableHead>
                                    <TableHead className="text-right text-white/80 w-[150px] min-w-[150px]">Ernst</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.red_flags.map((flag, index) => (
                                    <TableRow key={index} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-mono text-xs max-w-xs truncate text-slate-200">
                                            {flag.clause_citation}
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-white/10 text-white px-2 py-1 rounded border border-white/10">
                                                {flag.risk_type}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-slate-200 break-words whitespace-normal min-w-[300px]">{flag.explanation}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap w-[150px] min-w-[150px]">
                                            <Badge className={getSeverityColor(flag.severity_score) + " text-white border-none"}>
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
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                            Suggesties
                        </CardTitle>
                        <CardDescription className="text-white/70">Aanbevelingen voor actie</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-3">
                            {data.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-semibold border border-yellow-500/30">
                                        {index + 1}
                                    </span>
                                    <span className="pt-0.5 text-slate-100">{suggestion}</span>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                {/* Privacy Score */}
                <Card className="glass glass-hover border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Shield className="h-5 w-5 text-blue-400" />
                            Privacy Score
                        </CardTitle>
                        <CardDescription className="text-white/70">Beoordeling van privacyvriendelijkheid</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        className="text-white/10 stroke-current"
                                        strokeWidth="10"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                    />
                                    <circle
                                        className="text-blue-500 stroke-current drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
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
                                    <span className="text-3xl font-bold text-white">{data.privacy_score}/10</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Progress value={privacyPercentage} className="h-2 bg-white/10" indicatorColor="bg-blue-500" />
                            <p className="text-sm text-white/70 text-center">{data.privacy_motivatie}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ChatSection contextText={analyzedText} />
        </div>
    );
}
