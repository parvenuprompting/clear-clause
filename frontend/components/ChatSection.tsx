"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, User, Bot } from "lucide-react";
import { askFollowUp, type ChatMessage } from "@/lib/api";

interface ChatSectionProps {
    contextText: string;
}

export function ChatSection({ contextText }: ChatSectionProps) {
    const [question, setQuestion] = useState("");
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [questionsAsked, setQuestionsAsked] = useState(0);
    const MAX_QUESTIONS = 3;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoading || questionsAsked >= MAX_QUESTIONS) return;

        const newQuestion = question;
        setQuestion("");
        setIsLoading(true);

        const updatedHistory = [
            ...history,
            { role: "user", content: newQuestion } as ChatMessage
        ];
        setHistory(updatedHistory);
        setQuestionsAsked(prev => prev + 1);

        try {
            const response = await askFollowUp({
                question: newQuestion,
                context_text: contextText,
                history: history
            });

            setHistory([
                ...updatedHistory,
                { role: "assistant", content: response.answer }
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            // Revert on error
            setHistory(history); 
            setQuestionsAsked(prev => prev - 1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="glass glass-hover border-white/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                    AI Assistent
                </CardTitle>
                <CardDescription className="text-white/70">
                    Stel nog {MAX_QUESTIONS - questionsAsked} vervolgvragen over dit document.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 && (
                        <p className="text-sm text-white/40 italic text-center py-4">
                            Geen vragen gesteld. Waar kan ik je mee helpen?
                        </p>
                    )}
                    
                    {history.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="h-8 w-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                                    <Bot className="h-4 w-4 text-cyan-400" />
                                </div>
                            )}
                            
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-2 text-sm
                                ${msg.role === 'user' 
                                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/20 rounded-tr-sm' 
                                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm'
                                }
                            `}>
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start gap-3">
                             <div className="h-8 w-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                                <Bot className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-sm border border-white/10">
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-white/5">
                    <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Typ je vraag..."
                        className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                        disabled={isLoading || questionsAsked >= MAX_QUESTIONS}
                    />
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={isLoading || !question.trim() || questionsAsked >= MAX_QUESTIONS}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
