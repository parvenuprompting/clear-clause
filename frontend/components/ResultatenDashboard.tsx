"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Lightbulb, Shield, Copy, Check, Briefcase, Tag } from "lucide-react";
import type { AnalysisResponse } from "@/lib/api";
import { ChatSection } from "./ChatSection";




interface ResultatenDashboardProps {
    data: AnalysisResponse;
    analyzedText: string;
    mode?: string;
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

function DetailList({ items, emptyLabel = "Geen gegevens beschikbaar." }: { items?: string[]; emptyLabel?: string }) {
    if (!items?.length) {
        return <p className="text-sm text-white/50">{emptyLabel}</p>;
    }

    return (
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function ModeDetails({ data, mode }: { data: AnalysisResponse; mode?: string }) {
    if (mode === "privacy_beleid") {
        return (
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="text-white">Privacy-inzichten</CardTitle>
                    <CardDescription className="text-white/70">
                        Welke gegevens en partijen in het beleid worden genoemd.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-cyan-300 mb-3">Datacategorieën</h3>
                        <DetailList items={data.data_categories} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-cyan-300 mb-3">Derde partijen</h3>
                        <DetailList items={data.third_parties} />
                    </div>
                    <div className="md:col-span-2 border-t border-white/10 pt-4">
                        <h3 className="text-sm font-semibold text-cyan-300 mb-2">Bewaartermijnen</h3>
                        <p className="text-sm text-slate-100">{data.retention_policies || "Niet expliciet gevonden."}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (mode === "gebruikersvoorwaarden") {
        return (
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="text-white">Rechten en opzegging</CardTitle>
                    <CardDescription className="text-white/70">
                        Controle van gebruikersrechten en de beëindigingsvoorwaarden.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(data.user_rights || []).map((right, index) => {
                            const name = typeof right === "string" ? right : right.right_name;
                            const description = typeof right === "string" ? "" : right.description;
                            const isPresent = typeof right === "string" ? true : right.is_present;
                            return (
                                <div key={`${name}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-100">{name}</span>
                                        <Badge className={isPresent ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                                            {isPresent ? "Aanwezig" : "Ontbreekt"}
                                        </Badge>
                                    </div>
                                    {description && <p className="text-xs text-white/50 mt-2">{description}</p>}
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                        <h3 className="text-sm font-semibold text-cyan-300 mb-2">Opzegbeleid</h3>
                        <p className="text-sm text-slate-100">{data.termination_policy || "Niet expliciet gevonden."}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (mode === "brieven_analyse") {
        return (
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="text-white">Briefprofiel</CardTitle>
                    <CardDescription className="text-white/70">De belangrijkste kenmerken van deze brief.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                        {data.letter_type && <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">{data.letter_type}</Badge>}
                        {data.sentiment && <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">Toon: {data.sentiment}</Badge>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-cyan-300 mb-3">Deadlines</h3>
                            <DetailList items={data.deadlines} emptyLabel="Geen deadlines gevonden." />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-cyan-300 mb-3">Risico-inschatting</h3>
                            <p className="text-sm text-slate-100">{data.risk_assessment || "Geen afzonderlijke risico-inschatting."}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (mode === "reactie_brief") {
        return (
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="text-white">Reactieprofiel</CardTitle>
                    <CardDescription className="text-white/70">Controleer de toon en aanbevolen vervolgstappen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {data.tone && <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">Toon: {data.tone}</Badge>}
                        <Badge className={data.legal_review_needed ? "bg-orange-500/20 text-orange-200 border-orange-500/30" : "bg-green-500/20 text-green-200 border-green-500/30"}>
                            {data.legal_review_needed ? "Juridische review aanbevolen" : "Geen review gemarkeerd"}
                        </Badge>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-cyan-300 mb-3">Kernpunten</h3>
                        <DetailList items={data.key_points} />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}

export function ResultatenDashboard({ data, analyzedText, mode }: ResultatenDashboardProps) {
    const [copied, setCopied] = useState(false);
    
    // Determine context based on mode
    const isNegotiation = mode === "zakelijke_onderhandelingen";
    const isWebDeal = mode === "web_deals";
    
    let scoreLabel = "Privacy Score";
    let scoreDescription = "Beoordeling van privacyvriendelijkheid";
    let ScoreIcon = Shield;

    if (isNegotiation) {
        scoreLabel = "Deal Score";
        scoreDescription = "Commerciële aantrekkelijkheid en balans";
        ScoreIcon = Briefcase;
    } else if (isWebDeal) {
        scoreLabel = "Consumer Safety Score";
        scoreDescription = "Beoordeling van transparantie en eerlijkheid";
        ScoreIcon = Tag;
    } else if (mode === "privacy_beleid") {
        scoreLabel = "GDPR Score";
        scoreDescription = "Beoordeling van GDPR-compliance";
    } else if (mode === "gebruikersvoorwaarden") {
        scoreLabel = "Fairness Score";
        scoreDescription = "Balans tussen platform en gebruiker";
    } else if (mode === "brieven_analyse") {
        scoreLabel = "Urgentiescore";
        scoreDescription = "Hoe snel actie nodig kan zijn";
    }
    
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
                    <CardDescription className="text-white/70">Gedetecteerde risico&apos;s en dark patterns</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.red_flags.length === 0 ? (
                        <p className="text-white/60">Geen significante risico&apos;s gedetecteerd.</p>
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

            <ModeDetails data={data} mode={mode} />

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
                            <ScoreIcon className="h-5 w-5 text-blue-400" />
                            {scoreLabel}
                        </CardTitle>
                        <CardDescription className="text-white/70">{scoreDescription}</CardDescription>
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

            {data.draft_letter && (
                <Card className="glass glass-hover border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Conceptbrief</CardTitle>
                        <CardDescription className="text-white/70">
                            Controleer deze concepttekst zorgvuldig voordat u hem gebruikt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap font-sans text-slate-100 leading-relaxed">
                            {data.draft_letter}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <ChatSection contextText={analyzedText} />
        </div>
    );
}
