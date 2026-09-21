"""
memory_service.py — Cognee-powered case memory for FixFlow.

Every completed diagnosis is stored as a text document in Cognee's
knowledge graph (cognee.add → cognee.cognify). Before each live analysis,
we search for similar past cases (cognee.search) and inject them into the
Groq prompt as additional context — "We've seen this before" intelligence.

Architecture:
  ANALYZE REQUEST
       │
       ├─ cognee.search(description) ──→ past similar cases (may be empty)
       │                                   injected into prompt as context
       │
       ├─ Groq vision API call (with enriched prompt)
       │
       ├─ Pydantic validation
       │
       └─ cognee.add + cognee.cognify ──→ store case in knowledge graph
                                           (async, non-blocking to user)
"""

import os
import asyncio
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("fixflow.memory")

# ── Cognee is an optional enhancement.
# ── If it fails to load / configure, FixFlow degrades gracefully.
_cognee_available = False
_cognee_initialized = False

try:
    import cognee
    _cognee_available = True
except Exception as e:
    logger.warning(f"cognee could not be loaded (ensure Python >= 3.10). Case memory disabled. Error: {e}")


def _is_configured() -> bool:
    """Check that the OpenAI key (required by Cognee's embedding layer) is set."""
    # Cognee requires an LLM key for its embedding model.
    # It defaults to using OpenAI — but we configure it to use Groq.
    return bool(os.getenv("GROQ_API_KEY", "").strip())


async def _initialize_cognee():
    """Set up Cognee to use Groq as the LLM provider and local SQLite as the graph store."""
    global _cognee_initialized
    if _cognee_initialized or not _cognee_available:
        return

    try:
        groq_key = os.getenv("GROQ_API_KEY", "").strip()
        if not groq_key:
            return

        # Configure Cognee to use Groq's OpenAI-compatible endpoint
        cognee.config.set_llm_config({
            "provider": "openai",
            "model": "openai/gpt-oss-120b",  # text-only, best model on this account
            "api_key": groq_key,
            "endpoint": "https://api.groq.com/openai/v1",
        })

        # Use a lightweight local vector store (no external DB needed)
        data_dir = Path(__file__).parent / ".cognee_data"
        data_dir.mkdir(exist_ok=True)
        cognee.config.set_vector_db_config({
            "vector_db_provider": "lancedb",
            "vector_db_url": str(data_dir / "vectors"),
        })

        await cognee.prune.prune_system(metadata=False)  # don't wipe data, just reset session
        _cognee_initialized = True
        logger.info("[Cognee] Initialized. Case memory is active.")
    except Exception as e:
        logger.warning(f"[Cognee] Initialization failed — memory disabled. {e}")


def _format_case_document(problem: str, category: str, severity: str,
                           evidence: list, diagnosis: str, actions: list,
                           description: str) -> str:
    """Format a completed diagnosis as a text document for Cognee to ingest."""
    evidence_str = "\n".join(f"  - {e}" for e in evidence[:4])
    actions_str = "\n".join(f"  {i+1}. {a}" for i, a in enumerate(actions[:3]))
    return f"""FIXFLOW CASE RECORD
Category: {category}
Severity: {severity}
User Description: {description}
Problem: {problem}
Evidence:
{evidence_str}
Root Cause: {diagnosis}
Actions Taken:
{actions_str}
"""


async def recall_similar_cases(description: str) -> Optional[str]:
    """
    Search Cognee's knowledge graph for similar past cases.
    Returns a formatted string of relevant past cases, or None if unavailable.
    """
    if not _cognee_available or not _is_configured():
        return None

    await _initialize_cognee()
    if not _cognee_initialized:
        return None

    try:
        results = await asyncio.wait_for(
            cognee.search(description, query_type="CHUNKS"),
            timeout=5.0
        )
        if not results:
            return None

        # Deduplicate and cap at 2 most relevant cases
        seen = set()
        snippets = []
        for r in results[:4]:
            text = getattr(r, "text", None) or str(r)
            key = text[:80]
            if key not in seen and "FIXFLOW CASE RECORD" in text:
                seen.add(key)
                snippets.append(text.strip())
            if len(snippets) >= 2:
                break

        if not snippets:
            return None

        return "SIMILAR PAST CASES FROM MEMORY:\n\n" + "\n\n---\n\n".join(snippets)
    except asyncio.TimeoutError:
        logger.debug("[Cognee] Recall timed out — continuing without memory context.")
        return None
    except Exception as e:
        logger.debug(f"[Cognee] Recall failed: {e}")
        return None


async def remember_case(problem: str, category: str, severity: str,
                         evidence: list, diagnosis: str, actions: list,
                         description: str) -> None:
    """
    Store a completed diagnosis in Cognee's knowledge graph.
    Called after a successful analysis — runs async, non-blocking.
    """
    if not _cognee_available or not _is_configured():
        return

    await _initialize_cognee()
    if not _cognee_initialized:
        return

    try:
        doc = _format_case_document(
            problem=problem, category=category, severity=severity,
            evidence=evidence, diagnosis=diagnosis,
            actions=actions, description=description,
        )
        await asyncio.wait_for(cognee.add(doc), timeout=10.0)
        await asyncio.wait_for(cognee.cognify(), timeout=30.0)
        logger.info(f"[Cognee] Stored case: {problem[:60]}")
    except asyncio.TimeoutError:
        logger.debug("[Cognee] Remember timed out.")
    except Exception as e:
        logger.debug(f"[Cognee] Remember failed: {e}")


def is_memory_active() -> bool:
    """Return True if Cognee is installed and configured."""
    return _cognee_available and _is_configured()

