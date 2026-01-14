"use client";

import { Card } from "@/components/ui/card";
import { FileText, Shield, Users, Mail, PenTool } from "lucide-react";

export interface AnalysisMode {
    value: string;
    naam: string;
    beschrijving: string;
    icon: string;
}

interface ModeSelectorProps {
    selectedMode: string;
    onSelectMode: (mode: string) => void;
}

const MODE_ICONS = {
    FileText,
    Shield,
    Users,
    Mail,
    PenTool
};

const MODE_COLORS = {
    algemene_voorwaarden: "cyan",
    privacy_beleid: "blue",
    gebruikersvoorwaarden: "magenta",
    brieven_analyse: "purple",
    reactie_brief: "pink"
};

export function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
    const modes: AnalysisMode[] = [
        {
            value: "algemene_voorwaarden",
            naam: "Algemene Voorwaarden",
            beschrijving: "Dark Patterns analyse",
            icon: "FileText"
        },
        {
            value: "privacy_beleid",
            naam: "Privacy Beleid",
            beschrijving: "GDPR compliance",
            icon: "Shield"
        },
        {
            value: "gebruikersvoorwaarden",
            naam: "Gebruikersvoorwaarden",
            beschrijving: "User rights analyse",
            icon: "Users"
        },
        {
            value: "brieven_analyse",
            naam: "Brieven Analyse",
            beschrijving: "Sentiment & urgentie",
            icon: "Mail"
        },
        {
            value: "reactie_brief",
            naam: "Reactie Brief",
            beschrijving: "AI brief schrijver",
            icon: "PenTool"
        }
    ];

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-3">
                {modes.map((mode) => {
                    const IconComponent = MODE_ICONS[mode.icon as keyof typeof MODE_ICONS];
                    const isSelected = selectedMode === mode.value;

                    return (
                        <Card
                            key={mode.value}
                            onClick={() => onSelectMode(mode.value)}
                            className={`
                                glass cursor-pointer p-3 text-left transition-all duration-300 flex items-center gap-3 group
                                ${isSelected
                                    ? 'border-cyan-400 border bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                    : 'border-cyan-500/20 hover:border-cyan-400/50 hover:bg-white/5'
                                }
                            `}
                        >
                            <div className={`
                                p-2 rounded-lg backdrop-blur-sm transition-all flex-shrink-0
                                ${isSelected
                                    ? 'bg-cyan-400/20 text-cyan-400'
                                    : 'bg-black/30 text-cyan-300/50 group-hover:text-cyan-300/80'
                                }
                            `}>
                                <IconComponent className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-xs transition-colors ${isSelected ? 'text-cyan-300' : 'text-cyan-100/70 group-hover:text-cyan-100'}`}>
                                    {mode.naam}
                                </h3>
                                <p className="text-[10px] text-cyan-500/40 truncate group-hover:text-cyan-500/60">{mode.beschrijving}</p>
                            </div>
                            
                            {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
