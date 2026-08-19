import fitz  # PyMuPDF
import base64
from modules.shared.openai_client import openai_client
from modules.shared.logging import get_logger
from modules.shared.metrics import record_openai_usage
from modules.shared.config import OPENAI_MODEL


logger = get_logger(__name__)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extraheert tekst uit een PDF bestand."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

async def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Gebruikt GPT-4o Vision om tekst uit een screenshot of afbeelding te halen.
    Ideaal voor online deals waarbij tekst vaak in afbeeldingen staat.
    """
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    response = await openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Je bent een OCR expert. Extraheer ALLE tekst uit de aangeboden afbeelding. Behoud de structuur van prijzen, voorwaarden en kleine lettertjes."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extraheer de tekst uit deze screenshot van een online deal:"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=2000
    )
    usage = record_openai_usage(response, OPENAI_MODEL, "ocr")
    logger.info("OpenAI OCR usage", extra={"model": OPENAI_MODEL, **usage})
    
    content = response.choices[0].message.content
    if not content:
        raise ValueError("De OCR-provider retourneerde geen tekst.")
    return content
