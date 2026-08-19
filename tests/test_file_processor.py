import asyncio
from types import SimpleNamespace

import fitz

from modules.analysis import file_processor


def test_extract_text_from_pdf_reads_page_content():
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "ClearClause bronpassage")
    pdf_bytes = document.tobytes()
    document.close()

    extracted = file_processor.extract_text_from_pdf(pdf_bytes)

    assert "ClearClause bronpassage" in extracted


def test_extract_text_from_image_returns_provider_content(monkeypatch):
    response = SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content="OCR tekst"))]
    )

    class FakeCompletions:
        async def create(self, **kwargs):
            return response

    monkeypatch.setattr(
        file_processor,
        "openai_client",
        SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions())),
    )

    extracted = asyncio.run(file_processor.extract_text_from_image(b"image-bytes"))

    assert extracted == "OCR tekst"
