from typing import List, Literal
from pydantic import BaseModel
from modules.shared.openai_client import openai_client

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

async def generate_chat_response(
    question: str, 
    context_text: str, 
    history: List[ChatMessage]
) -> str:
    """
    Genereert een antwoord op een vervolgvraag over een juridisch document.
    """
    
    system_prompt = """Je bent een Senior Juridisch Adviseur. Je doel is om vragen over een specifiek document te beantwoorden.
    
REGELS:
1. Baseer je antwoord ENKEL op de verstrekte documenttekst hieronder.
2. Als het antwoord niet in de tekst staat, zeg dan eerlijk dat je het niet kunt vinden.
3. Wees beknopt, professioneel en direct.
4. Spreek de gebruiker aan met 'u'.
5. Geef geen algemeen juridisch advies buiten de context van dit document.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Voeg context toe (het document)
    messages.append({
        "role": "system", 
        "content": f"### DOCUMENT CONTEXT ###\n\n{context_text[:15000]}" # Truncate voor veiligheid
    })
    
    # Voeg chatgeschiedenis toe
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
        
    # Voeg de huidige vraag toe
    messages.append({"role": "user", "content": question})

    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o",  # Of gpt-3.5-turbo afhankelijk van budget/voorkeur
            messages=messages,
            temperature=0.3,
            max_tokens=500
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("De chat-provider retourneerde geen antwoord.")
        return content
    except Exception as e:
        print(f"Chat error: {e}")
        raise ValueError("De chat kon niet worden verwerkt.") from e
