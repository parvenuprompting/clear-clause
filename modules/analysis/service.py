import asyncio
import json
from typing import Dict, Any, Optional, List
from openai import RateLimitError, APIConnectionError, APIError
from .models import (
    AnalysisResponse,
    PrivacyAnalysisResponse,
    GebruikersvoorwaardenResponse,
    LetterAnalysisResponse,
    ResponseLetterOutput,
)
from .utils import count_tokens, split_text
from .modes import AnalysisMode
from modules.shared.openai_client import openai_client
from modules.shared.logging import get_logger

# Import prompts
from .prompts import algemene_voorwaarden, privacy_beleid, gebruikersvoorwaarden, brieven_analyse, reactie_brief, zakelijke_onderhandelingen, web_deals

# Mode naar Prompt mapping
PROMPT_MAP = {
    AnalysisMode.ALGEMENE_VOORWAARDEN: algemene_voorwaarden.SYSTEM_PROMPT,
    AnalysisMode.PRIVACY_BELEID: privacy_beleid.SYSTEM_PROMPT,
    AnalysisMode.GEBRUIKERSVOORWAARDEN: gebruikersvoorwaarden.SYSTEM_PROMPT,
    AnalysisMode.BRIEVEN_ANALYSE: brieven_analyse.SYSTEM_PROMPT,
    AnalysisMode.REACTIE_BRIEF: reactie_brief.SYSTEM_PROMPT,
    AnalysisMode.ZAKELIJKE_ONDERHANDELINGEN: zakelijke_onderhandelingen.SYSTEM_PROMPT,
    AnalysisMode.WEB_DEALS: web_deals.SYSTEM_PROMPT,
}
logger = get_logger(__name__)

# Mode naar Model mapping
MODEL_MAP = {
    AnalysisMode.ALGEMENE_VOORWAARDEN: AnalysisResponse,
    AnalysisMode.PRIVACY_BELEID: PrivacyAnalysisResponse,
    AnalysisMode.GEBRUIKERSVOORWAARDEN: GebruikersvoorwaardenResponse,
    AnalysisMode.BRIEVEN_ANALYSE: LetterAnalysisResponse,
    AnalysisMode.REACTIE_BRIEF: ResponseLetterOutput,
    AnalysisMode.ZAKELIJKE_ONDERHANDELINGEN: AnalysisResponse,
    AnalysisMode.WEB_DEALS: AnalysisResponse,
}

async def _analyze_chunk(
    chunk: str,
    mode: AnalysisMode,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """Analyseer één chunk van tekst."""
    system_prompt = PROMPT_MAP[mode]
    response_model = MODEL_MAP[mode]
    
    # Bouw user message
    if mode == AnalysisMode.REACTIE_BRIEF and context:
        user_message = f"""ORIGINELE BRIEF:
{chunk}

CONTEXT/DOEL VAN REACTIE:
{context}

Genereer een professionele reactie brief op basis van bovenstaande informatie."""
    else:
        user_message = f"Analyseer dit document:\n\n{chunk}"

        response = await openai_client.chat.completions.create(  # type: ignore[call-overload]
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": f"{mode.value}_response",
                    "schema": response_model.model_json_schema()  # type: ignore[attr-defined]
            }
        }
    )
    
    content = response.choices[0].message.content
    if not content:
        raise ValueError("De AI-provider retourneerde geen analyse-inhoud.")
    return json.loads(content)

async def _merge_results(
    results: List[Dict[str, Any]],
    mode: AnalysisMode
) -> Dict[str, Any]:
    """
    Merge resultaten van meerdere chunks.
    Strategie is mode-afhankelijk.
    """
    if not results:
        return {}
    
    if len(results) == 1:
        return results[0]
    
    logger.info("Merging chunk results", extra={"chunk_count": len(results), "mode": mode.value})
    
    # Algemene Voorwaarden merge
    # Algemene Voorwaarden, Zakelijke Onderhandelingen & Web Deals merge (delen zelfde structuur)
    if mode in [AnalysisMode.ALGEMENE_VOORWAARDEN, AnalysisMode.ZAKELIJKE_ONDERHANDELINGEN, AnalysisMode.WEB_DEALS]:
        # Merge red flags (remove exact duplicates)
        all_red_flags = []
        seen_citations = set()
        for result in results:
            for flag in result.get('red_flags', []):
                citation = flag.get('clause_citation', '')
                if citation not in seen_citations:
                    all_red_flags.append(flag)
                    seen_citations.add(citation)
        
        # Average privacy score
        scores = [r.get('privacy_score', 0) for r in results]
        avg_score = int(sum(scores) / len(scores))
        
        # Combine suggestions (unique)
        all_suggestions = []
        seen_suggestions = set()
        for result in results:
            for sugg in result.get('suggestions', []):
                if sugg not in seen_suggestions:
                    all_suggestions.append(sugg)
                    seen_suggestions.add(sugg)
        
        # Combine summaries and let LLM rewrite
        all_summaries = []
        for result in results:
            all_summaries.extend(result.get('summary', []))
        
        # LLM rewrite summary
        summary_prompt = f"""Herschrijf de volgende punten tot een beknopte samenvatting van maximaal 5 bullets:

{chr(10).join(['- ' + s for s in all_summaries])}

Geef alleen de 5 belangrijkste punten terug."""
        
        summary_response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Je bent een juridische samenvatter. Maak beknopte punten."},
                {"role": "user", "content": summary_prompt}
            ]
        )
        
        summary_text = summary_response.choices[0].message.content
        if not summary_text:
            raise ValueError("De AI-provider retourneerde geen samenvatting.")
        final_summary = [line.strip('- ').strip() for line in summary_text.split('\n') if line.strip()][:5]
        
        return {
            "summary": final_summary,
            "red_flags": all_red_flags,
            "suggestions": all_suggestions,
            "privacy_score": avg_score,
            "privacy_motivatie": f"Gemiddelde score over {len(results)} document secties"
        }
    
    # Privacy Beleid merge
    elif mode == AnalysisMode.PRIVACY_BELEID:
        # Merge unique arrays
        all_data_cats = set()
        all_third_parties = set()
        all_user_rights = set()
        all_compliance_gaps = set()
        all_recommendations = []
        
        for result in results:
            all_data_cats.update(result.get('data_categories', []))
            all_third_parties.update(result.get('third_parties', []))
            all_user_rights.update(result.get('user_rights', []))
            all_compliance_gaps.update(result.get('compliance_gaps', []))
            all_recommendations.extend(result.get('recommendations', []))
        
        # Average GDPR score
        scores = [r.get('gdpr_compliance_score', 0) for r in results]
        avg_score = int(sum(scores) / len(scores))
        
        return {
            "gdpr_compliance_score": avg_score,
            "data_categories": list(all_data_cats),
            "third_parties": list(all_third_parties),
            "user_rights": list(all_user_rights),
            "recommendations": list(set(all_recommendations)),
            "compliance_gaps": list(all_compliance_gaps),
            "retention_policies": results[0].get('retention_policies')
        }
    
    # Voor andere modi: return eerste result (brief moet coherent blijven)
    else:
        return results[0]

async def analyze_document(
    text: str,
    mode: AnalysisMode = AnalysisMode.ALGEMENE_VOORWAARDEN,
    context: Optional[str] = None
) -> str:
    """
    Analyseert een document met behulp van GPT-4o en mode-specifieke prompts.
    Gebruikt map-reduce voor grote documenten.
    
    Args:
        text: De te analyseren tekst
        mode: De analyse modus (default: Algemene Voorwaarden)
        context: Optionele context (gebruikt voor Reactie Brief mode)
    
    Returns:
        JSON string response volgens het mode-specifieke schema
    """
    # Token check
    token_count = count_tokens(text)
    logger.info("Analysis started", extra={"mode": mode.value, "token_count": token_count})
    
    try:
        # Check if chunking needed
        if token_count > 15000:
            logger.info("Chunking large document", extra={"token_count": token_count})
            chunks = split_text(text, max_tokens=15000, overlap=500)
            logger.info("Document split into chunks", extra={"chunk_count": len(chunks)})
            
            # MAP: Analyze each chunk
            logger.info("Analyzing chunks concurrently", extra={"chunk_count": len(chunks)})
            chunk_results = await asyncio.gather(*(
                _analyze_chunk(chunk, mode, context)
                for chunk in chunks
            ))
            
            # REDUCE: Merge results
            final_result = await _merge_results(chunk_results, mode)
            return json.dumps(final_result, ensure_ascii=False)
        
        # Single chunk analysis
        else:
            result = await _analyze_chunk(text, mode, context)
            return json.dumps(result, ensure_ascii=False)
        
    except RateLimitError:
        logger.warning("OpenAI rate limit reached", exc_info=True)
        raise ValueError(
            "De OpenAI API rate limit is bereikt. "
            "Probeer het over enkele minuten opnieuw."
        )
    
    except APIConnectionError:
        logger.error("OpenAI connection failed", exc_info=True)
        raise ValueError(
            "Kan geen verbinding maken met de OpenAI API. "
            "Controleer je internetverbinding en probeer opnieuw."
        )
    
    except APIError as e:
        logger.error("OpenAI API request failed", exc_info=True)
        raise ValueError(
            f"Er is een fout opgetreden bij de OpenAI API: {str(e)}"
        )
    except (json.JSONDecodeError, TypeError):
        logger.error("OpenAI returned invalid response", exc_info=True)
        raise ValueError("De AI-provider retourneerde een ongeldig analyseformaat.")
