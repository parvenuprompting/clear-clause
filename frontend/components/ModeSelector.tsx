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
                glass glass-hover cursor-pointer p-6 text-center transition-all duration-300
                ${isSelected
                                    ? 'border-purple-400 border-2 shadow-lg shadow-purple-500/50'
                                    : 'border-white/20 hover:border-white/40'
                                }
              `}
                        >
                            <div className="flex flex-col items-center space-y-3">
                                <div className={`
                  p-4 rounded-full backdrop-blur-sm transition-all
                  ${isSelected
                                        ? 'bg-purple-400/30 scale-110'
                                        : 'bg-white/10'
                                    }
                `}>
                                    <IconComponent className={`h-6 w-6 ${isSelected ? 'text-purple-300' : 'text-white/70'}`} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-sm ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                                        {mode.naam}
                                    </h3>
                                    <p className="text-xs text-white/60 mt-1">{mode.beschrijving}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
