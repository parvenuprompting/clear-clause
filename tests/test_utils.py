from modules.analysis.utils import split_text


def test_split_text_keeps_all_paragraph_content():
    text = "Eerste alinea.\n\nTweede alinea.\n\nDerde alinea."

    chunks = split_text(text, max_tokens=5, overlap=1)

    combined = " ".join(chunks)
    assert "Eerste alinea." in combined
    assert "Tweede alinea." in combined
    assert "Derde alinea." in combined
