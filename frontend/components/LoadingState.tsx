"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Scale, Shield, MessageSquare } from "lucide-react";

export function LoadingState() {
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center space-y-8">
                    <h2 className="text-2xl font-bold text-center">
                        Onze Experts Analyseren Je Document
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {/* Jurist */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 animate-pulse">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-lg">De Jurist</h3>
                            <p className="text-sm text-center text-muted-foreground">
                                Analyseert clausules en juridische risico's
                            </p>
                        </div>

                        {/* Ethicus */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-purple-50 dark:bg-purple-950/20 animate-pulse [animation-delay:200ms]">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-lg">De Ethicus</h3>
                            <p className="text-sm text-center text-muted-foreground">
                                Beoordeelt eerlijkheid en transparantie
                            </p>
                        </div>

                        {/* Vertaler */}
                        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-green-50 dark:bg-green-950/20 animate-pulse [animation-delay:400ms]">
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-lg">De Vertaler</h3>
                            <p className="text-sm text-center text-muted-foreground">
                                Vertaalt juridisch jargon naar begrijpelijke taal
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-md">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
