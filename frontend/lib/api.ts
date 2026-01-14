export interface RedFlag {
    clause_citation: string;
    risk_type: string;
    explanation: string;
    severity_score: number;
}

export interface AnalysisResponse {
    summary: string[];
    red_flags: RedFlag[];
    suggestions: string[];
    privacy_score: number;
    privacy_motivatie: string;
    extracted_text?: string;
}

export interface AnalyzeRequest {
    text: string;
    document_name?: string;
    mode?: string;
    context?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function analyzeDocument(request: AnalyzeRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token' // Development Mock Token
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to analyze document');
    }

    return response.json();
}

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface ChatRequest {
    question: string;
    context_text: string;
    history: ChatMessage[];
}

export interface ChatResponse {
    answer: string;
}

export async function askFollowUp(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token' // Development Mock Token
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to get chat response');
    }

    return response.json();
}

export async function analyzeFile(file: File, mode: string, documentName?: string): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    if (documentName) formData.append('document_name', documentName);

    const response = await fetch(`${API_BASE_URL}/analyze-file`, {
        method: 'POST',
        headers: {
             'Authorization': 'Bearer mock-token' // Development Mock Token
        },
        body: formData, // No Content-Type header needed for FormData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to analyze file');
    }

    return response.json();
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
}
