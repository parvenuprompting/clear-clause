import tiktoken
from typing import List

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """
    Tel het aantal tokens in de gegeven tekst voor een specifiek model.
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fallback naar cl100k_base voor nieuwe modellen
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))

def check_context_window(text: str, max_tokens: int = 120000) -> bool:
    """
    Controleer of de tekst binnen de context window past.
    """
    token_count = count_tokens(text)
    return token_count <= max_tokens

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
    # Split op paragrafen
    paragraphs = text.split('\n\n')
    
    chunks = []
    current_chunk = []
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
                    overlap_text = current_chunk[-1] if current_chunk else ""
                    current_chunk = [overlap_text, sentence] if overlap_text else [sentence]
                    current_tokens = count_tokens('\n\n'.join(current_chunk))
                else:
                    current_chunk.append(sentence)
                    current_tokens += sent_tokens
        
        # Normale paragraaf
        elif current_tokens + para_tokens > max_tokens and current_chunk:
            # Chunk is vol, opslaan
            chunks.append('\n\n'.join(current_chunk))
            
            # Start nieuwe chunk met overlap (laatste paragraaf)
            overlap_text = current_chunk[-1] if current_chunk else ""
            current_chunk = [overlap_text, para] if overlap_text else [para]
            current_tokens = count_tokens('\n\n'.join(current_chunk))
        else:
            current_chunk.append(para)
            current_tokens += para_tokens
    
    # Laatste chunk toevoegen
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
    
    return chunks

def chunk_text(text: str, max_tokens: int = 90000, model: str = "gpt-4o") -> List[str]:
    """
    Splitst een tekst in chunks van maximaal max_tokens.
    Probeert te splitsen op natuurlijke grenzen (paragrafen).
    """
    # Als de tekst al klein genoeg is, return als single chunk
    if count_tokens(text, model) <= max_tokens:
        return [text]
    
    # Split op dubbele newlines (paragrafen)
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    for paragraph in paragraphs:
        para_tokens = count_tokens(paragraph, model)
        
        # Als een enkele paragraaf te groot is, forceer split
        if para_tokens > max_tokens:
            # Voeg huidige chunk toe als die niet leeg is
            if current_chunk:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = []
                current_tokens = 0
            
            # Split de grote paragraaf op zinnen
            sentences = paragraph.split(". ")
            temp_chunk = []
            temp_tokens = 0
            
            for sentence in sentences:
                sent_tokens = count_tokens(sentence, model)
                if temp_tokens + sent_tokens > max_tokens:
                    if temp_chunk:
                        chunks.append(". ".join(temp_chunk) + ".")
                    temp_chunk = [sentence]
                    temp_tokens = sent_tokens
                else:
                    temp_chunk.append(sentence)
                    temp_tokens += sent_tokens
            
            if temp_chunk:
                chunks.append(". ".join(temp_chunk))
            continue
        
        # Check of toevoegen van deze paragraaf de limiet overschrijdt
        if current_tokens + para_tokens > max_tokens:
            # Sla huidige chunk op en start nieuwe
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [paragraph]
            current_tokens = para_tokens
        else:
            current_chunk.append(paragraph)
            current_tokens += para_tokens
    
    # Voeg laatste chunk toe
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
    
    return chunks
