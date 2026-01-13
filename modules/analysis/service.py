import os
from typing import Dict, Any
from openai import OpenAI, RateLimitError, APIConnectionError, APIError
from .models import AnalysisResponse
from .utils import count_tokens, chunk_text
from .lexicon import DARK_PATTERN_LEXICON

# Initialiseer OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Formatteer lexicon voor de prompt
lexicon_str = "\n".join([f"- **{k}**: {v}" for k, v in DARK_PATTERN_LEXICON.items()])

SYSTEM_PROMPT = f"""
Je bent ClearClause AI, een geavanceerde juridische assistent met drie gespecialiseerde persona's:

1. **De Jurist**: Richt zich op clausules, aansprakelijkheid, en juridische valstrikken.
2. **De Ethicus**: Beoordeelt de eerlijkheid en transparantie van de voorwaarden.
3. **De Vertaler**: Zet complex juridisch jargon om in begrijpelijke taal voor de leek.

REFERENTIEKADER (DARK PATTERNS LEXICON):
Gebruik EXACT de volgende definities om risico's te identificeren. Het veld 'risk_type' in je output MOET één van deze keys zijn:

{lexicon_str}

KRITIEKE INSTRUCTIE:
- Bij het detecteren van een rode vlag, gebruik je EXACT de key uit het lexicon hierboven als 'risk_type'.
- Bijvoorbeeld: als je een clausule vindt die past bij "Automatische omzetting van gratis naar betaald", dan is risk_type = "forced_continuity".
- Gebruik NOOIT een risk_type die niet in het lexicon staat.

TAAK:
Analyseer de verstrekte tekst sectie voor sectie vanuit deze drie perspectieven. 
Identificeer risico's (Red Flags), schrijf een samenvatting, doe suggesties en geef een privacy score.

NEGATIVE CONSTRAINT:
Genereer GEEN inleidende of afsluitende tekst, geef uitsluitend de gevraagde JSON-structuur terug.
"""

def analyze_document(text: str) -> Dict[str, Any]:
    """
    Analyseert een document met behulp van GPT-4o en de drie persona protocol.
    Bevat error handling voor rate limits en API fouten.
    """
    # Token check (ticker)
    token_count = count_tokens(text)
    print(f"[*] Analyse gestart. Aantal tokens: {token_count}")
    
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

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyseer dit document:\n\n{text}"}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "analysis_response",
                    "schema": AnalysisResponse.model_json_schema()
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
