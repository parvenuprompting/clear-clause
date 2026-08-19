export interface RedFlag {
    clause_citation: string;
    risk_type: string;
    explanation: string;
    severity_score: number;
}

export interface UserRightStatus {
    right_name: string;
    description: string;
    is_present: boolean;
}

export interface AnalysisResponse {
    mode?: string;
    summary: string[];
    red_flags: RedFlag[];
    suggestions: string[];
    privacy_score: number;
    privacy_motivatie: string;
    extracted_text?: string;
    gdpr_compliance_score?: number;
    compliance_gaps?: string[];
    recommendations?: string[];
    data_categories?: string[];
    third_parties?: string[];
    user_rights?: UserRightStatus[] | string[];
    retention_policies?: string | null;
    restrictions?: string[];
    termination_policy?: string;
    fairness_score?: number;
    urgency_level?: number;
    letter_type?: string;
    sentiment?: string;
    action_points?: string[];
    deadlines?: string[];
    legal_claims?: string[];
    risk_assessment?: string;
    response_strategy?: string;
    draft_letter?: string;
    tone?: string;
    key_points?: string[];
    next_steps?: string[];
    legal_review_needed?: boolean;
}

export interface AnalyzeRequest {
    text: string;
    document_name?: string;
    mode?: string;
    context?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

function getAuthHeaders(): Record<string, string> {
    return API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};
}

export async function analyzeDocument(request: AnalyzeRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
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
            ...getAuthHeaders(),
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
             ...getAuthHeaders(),
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
