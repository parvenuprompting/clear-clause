import os
from typing import Dict, Any, Optional
from openai import OpenAI, RateLimitError, APIConnectionError, APIError
from .models import (
    AnalysisResponse,
    PrivacyAnalysisResponse,
    GebruikersvoorwaardenResponse,
    LetterAnalysisResponse,
    ResponseLetterOutput
)
from .utils import count_tokens, chunk_text
from .modes import AnalysisMode

# Import prompts
from .prompts import algemene_voorwaarden, privacy_beleid, gebruikersvoorwaarden, brieven_analyse, reactie_brief

# Initialiseer OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Mode naar Prompt mapping
PROMPT_MAP = {
    AnalysisMode.ALGEMENE_VOORWAARDEN: algemene_voorwaarden.SYSTEM_PROMPT,
    AnalysisMode.PRIVACY_BELEID: privacy_beleid.SYSTEM_PROMPT,
    AnalysisMode.GEBRUIKERSVOORWAARDEN: gebruikersvoorwaarden.SYSTEM_PROMPT,
    AnalysisMode.BRIEVEN_ANALYSE: brieven_analyse.SYSTEM_PROMPT,
    AnalysisMode.REACTIE_BRIEF: reactie_brief.SYSTEM_PROMPT,
}

# Mode naar Model mapping
MODEL_MAP = {
    AnalysisMode.ALGEMENE_VOORWAARDEN: AnalysisResponse,
    AnalysisMode.PRIVACY_BELEID: PrivacyAnalysisResponse,
    AnalysisMode.GEBRUIKERSVOORWAARDEN: GebruikersvoorwaardenResponse,
    AnalysisMode.BRIEVEN_ANALYSE: LetterAnalysisResponse,
    AnalysisMode.REACTIE_BRIEF: ResponseLetterOutput,
}

def analyze_document(
    text: str,
    mode: AnalysisMode = AnalysisMode.ALGEMENE_VOORWAARDEN,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Analyseert een document met behulp van GPT-4o en mode-specifieke prompts.
    
    Args:
        text: De te analyseren tekst
        mode: De analyse modus (default: Algemene Voorwaarden)
        context: Optionele context (gebruikt voor Reactie Brief mode)
    
    Returns:
        JSON response volgens het mode-specifieke schema
    """
    # Token check
    token_count = count_tokens(text)
    print(f"[*] Analyse gestart. Mode: {mode.value}, Tokens: {token_count}")
    
    # Chunking logica voor grote documenten
    if token_count > 100000:
        print(f"[!] Document overschrijdt 100k tokens. Chunking wordt toegepast.")
        chunks = chunk_text(text, max_tokens=90000)
        
        if len(chunks) > 2:
            raise ValueError(
                f"Document is te groot ({token_count} tokens). "
                f"Maximum ondersteund: ~180.000 tokens (2 chunks). "
                f"Overweeg het document te splitsen."
            )
        
        # Voor nu: analyseer alleen eerste chunk met waarschuwing
        print(f"[!] Waarschuwing: Alleen eerste deel wordt geanalyseerd ({len(chunks)} delen gedetecteerd)")
        text = chunks[0]
    
    if token_count > 120000:
        raise ValueError("Document is te groot voor de huidige context window.")

    # Selecteer prompt en model op basis van mode
    system_prompt = PROMPT_MAP[mode]
    response_model = MODEL_MAP[mode]
    
    # Bouw user message
    if mode == AnalysisMode.REACTIE_BRIEF and context:
        user_message = f"""ORIGINELE BRIEF:
{text}

CONTEXT/DOEL VAN REACTIE:
{context}

Genereer een professionele reactie brief op basis van bovenstaande informatie."""
    else:
        user_message = f"Analyseer dit document:\n\n{text}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": f"{mode.value}_response",
                    "schema": response_model.model_json_schema()
                }
            }
        )
        
        return response.choices[0].message.content
        
    except RateLimitError as e:
        print(f"[!] Rate limit bereikt: {e}")
        raise ValueError(
            "De OpenAI API rate limit is bereikt. "
            "Probeer het over enkele minuten opnieuw."
        )
    
    except APIConnectionError as e:
        print(f"[!] Verbindingsfout met OpenAI API: {e}")
        raise ValueError(
            "Kan geen verbinding maken met de OpenAI API. "
            "Controleer je internetverbinding en probeer opnieuw."
        )
    
    except APIError as e:
        print(f"[!] OpenAI API fout: {e}")
        raise ValueError(
            f"Er is een fout opgetreden bij de OpenAI API: {str(e)}"
        )
