import tiktoken

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """
    Telt het aantal tokens in een tekst voor een specifiek model.
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fallback naar cl100k_base voor nieuwe modellen
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))

def check_context_window(text: str, model: str = "gpt-4o", limit: int = 120000) -> bool:
    """
    Controleert of de tekst binnen de context window limiet valt.
    """
    return count_tokens(text, model) <= limit
