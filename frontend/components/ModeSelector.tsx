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
        <div className="w-full max-w-6xl mx-auto mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {modes.map((mode) => {
                    const IconComponent = MODE_ICONS[mode.icon as keyof typeof MODE_ICONS];
                    const isSelected = selectedMode === mode.value;

                    return (
                        <Card
                            key={mode.value}
                            onClick={() => onSelectMode(mode.value)}
                            className={`
                glass cursor-pointer p-5 text-center transition-all duration-300
                ${isSelected
                                    ? 'border-cyan-400 border-2 shadow-lg shadow-cyan-500/50 bg-cyan-500/10'
                                    : 'border-cyan-500/20 hover:border-cyan-400/50'
                                }
              `}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <div className={`
                  p-3 rounded-full backdrop-blur-sm transition-all
                  ${isSelected
                                        ? 'bg-cyan-400/20 scale-110 neon-pulse'
                                        : 'bg-black/30'
                                    }
                `}>
                                    <IconComponent className={`h-6 w-6 ${isSelected ? 'text-cyan-400' : 'text-cyan-300/60'}`} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-xs ${isSelected ? 'text-cyan-300' : 'text-cyan-100/70'}`}>
                                        {mode.naam}
                                    </h3>
                                    <p className="text-[10px] text-cyan-300/40 mt-1">{mode.beschrijving}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
