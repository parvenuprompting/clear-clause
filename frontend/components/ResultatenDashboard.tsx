"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Lightbulb, Shield, Copy, Check, Briefcase, Tag } from "lucide-react";
import type { AnalysisResponse, RedFlag } from "@/lib/api";
import { ChatSection } from "./ChatSection";
import { ExportResultaten } from "./export/ExportResultaten";




interface ResultatenDashboardProps {
    data: AnalysisResponse;
    analyzedText: string;
    mode?: string;
    documentName?: string;
}

type ReviewStatus = "open" | "gecontroleerd" | "actie_nodig" | "afgehandeld";

const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
    open: "Open",
    gecontroleerd: "Gecontroleerd",
    actie_nodig: "Actie nodig",
    afgehandeld: "Afgehandeld",
};

function getSeverityColor(score: number): string {
    if (score >= 1 && score <= 3) return "bg-blue-500";
    if (score >= 4 && score <= 7) return "bg-orange-500";
    return "bg-red-500";
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

function ModeDetails({ data }: { data: AnalysisResponse }) {
    if (data.mode === "privacy_beleid") {
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

    if (data.mode === "gebruikersvoorwaarden") {
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

    if (data.mode === "brieven_analyse") {
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

    if (data.mode === "reactie_brief") {
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

export function ResultatenDashboard({ data, analyzedText, mode, documentName = "Document" }: ResultatenDashboardProps) {
    const [copied, setCopied] = useState(false);
    const [activePassageId, setActivePassageId] = useState<string | null>(null);
    const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({});
    const [severityFilter, setSeverityFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
    const passageRefs = useRef<Record<string, HTMLSpanElement | null>>({});
    const activeMode = data.mode || mode;
    
    // Determine context based on mode
    const isNegotiation = activeMode === "zakelijke_onderhandelingen";
    const isWebDeal = activeMode === "web_deals";
    
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
    } else if (activeMode === "privacy_beleid") {
        scoreLabel = "GDPR Score";
        scoreDescription = "Beoordeling van GDPR-compliance";
    } else if (activeMode === "gebruikersvoorwaarden") {
        scoreLabel = "Fairness Score";
        scoreDescription = "Balans tussen platform en gebruiker";
    } else if (activeMode === "brieven_analyse") {
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

    const setStatus = (passageId: string, status: ReviewStatus) => {
        setReviewStatuses((current) => ({ ...current, [passageId]: status }));
    };

    const focusPassage = (flag: RedFlag) => {
        const passageId = flag.source_match?.passage_id;
        if (!passageId || flag.source_match?.start == null || flag.source_match.end == null) return;
        setActivePassageId(passageId);
        requestAnimationFrame(() => passageRefs.current[passageId]?.scrollIntoView({ behavior: "smooth", block: "center" }));
    };

    const visibleFlags = data.red_flags.filter((flag) => {
        const index = data.red_flags.indexOf(flag);
        const passageId = flag.source_match?.passage_id ?? `unmatched-${index}`;
        const status = reviewStatuses[passageId] || "open";
        const severityMatches = severityFilter === "all" || (severityFilter === "high" ? flag.severity_score >= 8 : severityFilter === "medium" ? flag.severity_score >= 4 && flag.severity_score <= 7 : flag.severity_score <= 3);
        return severityMatches && (riskFilter === "all" || flag.risk_type === riskFilter) && (statusFilter === "all" || status === statusFilter);
    });
    const riskTypes = Array.from(new Set(data.red_flags.map((flag) => flag.risk_type)));

    const renderDocument = () => {
        const ranges = data.red_flags
            .map((flag) => ({ flag, match: flag.source_match }))
            .filter(({ match }) => match?.start != null && match.end != null && match.status !== "not_found")
            .sort((a, b) => (a.match!.start! - b.match!.start!));
        const parts: ReactNode[] = [];
        let cursor = 0;
        ranges.forEach(({ flag, match }) => {
            const start = Math.max(cursor, match!.start!);
            const end = Math.max(start, match!.end!);
            if (start > cursor) parts.push(<span key={`text-${cursor}`}>{analyzedText.slice(cursor, start)}</span>);
            if (end > cursor) {
                const passageId = match!.passage_id;
                parts.push(
                    <span
                        key={passageId}
                        ref={(node) => { passageRefs.current[passageId] = node; }}
                        className={`rounded px-0.5 transition-colors ${activePassageId === passageId ? "bg-yellow-300 text-black ring-2 ring-yellow-200" : flag.severity_score >= 8 ? "bg-red-500/40" : "bg-orange-400/30"}`}
                        title={`${flag.risk_type} (${match!.match_confidence * 100}% match)`}
                    >
                        {analyzedText.slice(start, end)}
                    </span>
                );
                cursor = end;
            }
        });
        if (cursor < analyzedText.length) parts.push(<span key={`text-${cursor}`}>{analyzedText.slice(cursor)}</span>);
        return parts;
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
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopySummary}
                                className="gap-2 border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white transition-all"
                            >
                                {copied ? <><Check className="h-4 w-4" />Gekopieerd!</> : <><Copy className="h-4 w-4" />Kopieer</>}
                            </Button>
                             <ExportResultaten data={data} documentName={documentName} reviewStatuses={reviewStatuses} />
                        </div>
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

            {/* Evidence review */}
            <Card className="glass glass-hover border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        Bewijsgerichte review ({data.red_flags.length})
                    </CardTitle>
                    <CardDescription className="text-white/70">Klik een risico om de onderliggende bronpassage te controleren.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5">
                        <div className="rounded-lg border border-white/10 bg-black/20 p-4 max-h-[650px] overflow-auto" aria-label="Geëxtraheerde documenttekst">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-cyan-200">Bron: {documentName}</h3>
                                <span className="text-xs text-white/50">{analyzedText.length.toLocaleString("nl-NL")} tekens</span>
                            </div>
                            <p className="whitespace-pre-wrap font-mono text-xs leading-6 text-slate-200">{analyzedText ? renderDocument() : "Geen geëxtraheerde tekst beschikbaar."}</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2" aria-label="Reviewfilters">
                                <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="rounded border border-white/15 bg-black/40 px-2 py-1 text-xs text-white" aria-label="Filter op ernst">
                                    <option value="all">Alle ernst</option><option value="high">Hoog (8-10)</option><option value="medium">Gemiddeld (4-7)</option><option value="low">Laag (1-3)</option>
                                </select>
                                <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="rounded border border-white/15 bg-black/40 px-2 py-1 text-xs text-white" aria-label="Filter op risicotype">
                                    <option value="all">Alle typen</option>{riskTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ReviewStatus | "all")} className="rounded border border-white/15 bg-black/40 px-2 py-1 text-xs text-white" aria-label="Filter op status">
                                    <option value="all">Alle statussen</option>{Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                            </div>
                            {visibleFlags.length === 0 ? <p className="text-sm text-white/60">Geen risico&apos;s voldoen aan deze filters.</p> : visibleFlags.map((flag, index) => {
                                const passageId = flag.source_match?.passage_id || `unmatched-${index}`;
                                const status = reviewStatuses[passageId] || "open";
                                const canNavigate = flag.source_match?.start != null && flag.source_match.end != null && flag.source_match.status !== "not_found";
                                return <article key={passageId} className={`rounded-lg border p-4 transition-colors ${activePassageId === passageId ? "border-yellow-300/70 bg-yellow-300/10" : "border-white/10 bg-black/20"}`}>
                                    <button type="button" onClick={() => focusPassage(flag)} disabled={!canNavigate} className="w-full text-left disabled:cursor-default" aria-label={canNavigate ? "Toon bronpassage" : "Bronpassage niet gevonden"}>
                                        <div className="flex flex-wrap items-center gap-2"><code className="text-xs text-cyan-200">{flag.risk_type}</code><Badge className={getSeverityColor(flag.severity_score) + " text-white border-none"}>{flag.severity_score}/10</Badge><Badge className="bg-white/10 text-white border-white/10">{REVIEW_STATUS_LABELS[status]}</Badge></div>
                                        <blockquote className="mt-2 border-l-2 border-red-400 pl-3 font-mono text-xs italic text-slate-200">&quot;{flag.clause_citation}&quot;</blockquote>
                                        <p className="mt-2 text-sm text-slate-200">{flag.explanation}</p>
                                    </button>
                                    <p className={`mt-2 text-xs ${canNavigate ? "text-green-300" : "text-orange-300"}`}>{canNavigate ? `Bronanker gevonden (${Math.round((flag.source_match?.match_confidence || 0) * 100)}% zekerheid)` : "Bronpassage niet betrouwbaar gevonden; controleer handmatig."}</p>
                                    <p className="mt-2 rounded-md border border-orange-400/20 bg-orange-400/10 p-2 text-sm text-orange-100"><strong>Wat nu?</strong> {flag.action_required}</p>
                                    <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Reviewstatus">
                                        {Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => <button key={value} type="button" onClick={() => setStatus(passageId, value as ReviewStatus)} className={`rounded border px-2 py-1 text-xs transition-colors ${status === value ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/10 text-white/60 hover:bg-white/10"}`}>{label}</button>)}
                                    </div>
                                </article>;
                            })}
                        </div>
                    </div>
                    {data.red_flags.length === 0 && (
                        <p className="text-white/60">Geen significante risico&apos;s gedetecteerd.</p>
                    )}
                </CardContent>
            </Card>

            <ModeDetails data={data} />

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

            {data.mode === "reactie_brief" && data.draft_letter && (
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
