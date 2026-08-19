import tiktoken
from functools import lru_cache
from typing import List
from modules.shared.config import OPENAI_MODEL


@lru_cache(maxsize=4)
def _encoding_for_model(model: str):
    try:
        return tiktoken.encoding_for_model(model)
    except KeyError:
        return tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str, model: str = OPENAI_MODEL) -> int:
    """
    Tel het aantal tokens in de gegeven tekst voor een specifiek model.
    """
    return len(_encoding_for_model(model).encode(text))

def split_text(text: str, max_tokens: int = 15000, overlap: int = 500) -> List[str]:
    """
    Split tekst in chunks op logische punten (paragrafen, zinnen).
    
    Strategie:
    1. Split eerst op dubbele enters (paragrafen)
    2. Groepeer paragrafen tot chunks van ~max_tokens
    3. Voeg overlap toe tussen chunks voor context
    
    Args:
        text: Te splitsen tekst
        max_tokens: Maximum tokens per chunk
        overlap: Aantal overlap tokens tussen chunks
    
    Returns:
        List van text chunks
    """
    def overlap_text(chunks: list[str]) -> str:
        if overlap <= 0 or not chunks:
            return ""
        encoded = _encoding_for_model(OPENAI_MODEL).encode("\n\n".join(chunks))
        return _encoding_for_model(OPENAI_MODEL).decode(encoded[-overlap:])

    # Split op paragrafen
    paragraphs = text.split('\n\n')
    
    chunks = []
    current_chunk: list[str] = []
    current_tokens = 0
    
    for para in paragraphs:
        para_tokens = count_tokens(para)
        
        # Als deze paragraaf alleen al te groot is, split op zinnen
        if para_tokens > max_tokens:
            sentences = para.split('. ')
            for sentence in sentences:
                sentence = sentence.strip() + '. '
                sent_tokens = count_tokens(sentence)
                
                if current_tokens + sent_tokens > max_tokens and current_chunk:
                    # Chunk is vol, opslaan
                    chunks.append('\n\n'.join(current_chunk))
                    
                    # Start nieuwe chunk met overlap
                    previous_text = overlap_text(current_chunk)
                    current_chunk = [previous_text, sentence] if previous_text else [sentence]
                    current_tokens = count_tokens('\n\n'.join(current_chunk))
                else:
                    current_chunk.append(sentence)
                    current_tokens += sent_tokens
        
        # Normale paragraaf
        elif current_tokens + para_tokens > max_tokens and current_chunk:
            # Chunk is vol, opslaan
            chunks.append('\n\n'.join(current_chunk))
            
            # Start nieuwe chunk met overlap (laatste paragraaf)
            previous_text = overlap_text(current_chunk)
            current_chunk = [previous_text, para] if previous_text else [para]
            current_tokens = count_tokens('\n\n'.join(current_chunk))
        else:
            current_chunk.append(para)
            current_tokens += para_tokens
    
    # Laatste chunk toevoegen
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
    
    return chunks
