import os
from typing import Dict, Any
from openai import OpenAI
from .models import AnalysisResponse
from .utils import count_tokens
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
"""

def analyze_document(text: str) -> Dict[str, Any]:
    """
    Analyseert een document met behulp van GPT-4o en de drie persona protocol.
    """
    # Token check (ticker)
    token_count = count_tokens(text)
    print(f"[*] Analyse gestart. Aantal tokens: {token_count}")
    
    if token_count > 120000:
        raise ValueError("Document is te groot voor de huidige context window.")

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
