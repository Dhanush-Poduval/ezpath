"""Conservative interpretation of OSM accessibility tags.

OSM tags are evidence, not a physical accessibility audit. Missing tags remain
UNKNOWN; they are never silently promoted to accessible.
"""
from __future__ import annotations
import ast
from typing import Any


def normalize_tag(value: Any) -> str:
    if value is None:
        return "unknown"
    if isinstance(value, (list, tuple, set)):
        values = [normalize_tag(v) for v in value]
        return ";".join(v for v in values if v != "unknown") or "unknown"
    if isinstance(value, str):
        raw = value.strip()
        if raw.startswith("[") and raw.endswith("]"):
            try:
                parsed = ast.literal_eval(raw)
                if isinstance(parsed, (list, tuple, set)):
                    return normalize_tag(parsed)
            except (ValueError, SyntaxError):
                pass
        return raw.lower() if raw else "unknown"
    return str(value).strip().lower()


def get_tag(edge: dict, key: str) -> str:
    return normalize_tag(edge.get(key))


def classify_edge(edge: dict) -> str:
    """Return ACCESSIBLE, INACCESSIBLE or UNKNOWN for wheelchair travel."""
    highway = set(get_tag(edge, "highway").split(";"))
    wheelchair = set(get_tag(edge, "wheelchair").split(";"))
    access = set(get_tag(edge, "access").split(";"))
    if "steps" in highway or wheelchair == {"no"} or "no" in wheelchair:
        return "INACCESSIBLE"
    if "no" in access or "private" in access:
        return "INACCESSIBLE"
    if "yes" in wheelchair:
        return "ACCESSIBLE"
    # wheelchair=limited, designated, unknown, and missing values are not
    # treated as verified without a richer profile-specific evaluator.
    return "UNKNOWN"


def evaluate_edge(edge: dict, *, wheelchair_user: bool = True,
                  unknown_policy: str = "strict") -> tuple[bool, float, str, str]:
    """Return (allowed, uncertainty_points, status, reason_code)."""
    if unknown_policy not in {"strict", "relaxed"}:
        raise ValueError("unknown_policy must be 'strict' or 'relaxed'")
    status = classify_edge(edge)
    if not wheelchair_user:
        return True, 0.0, status, "PROFILE_DOES_NOT_REQUIRE_WHEELCHAIR_TAGS"
    if status == "INACCESSIBLE":
        return False, float("inf"), status, "WHEELCHAIR_ACCESS_PROHIBITED"
    if status == "UNKNOWN" and unknown_policy == "strict":
        return False, float("inf"), status, "ACCESSIBILITY_DATA_MISSING_OR_AMBIGUOUS"
    if status == "UNKNOWN":
        return True, 100.0, status, "ALLOWED_WITH_UNKNOWN_ACCESSIBILITY"
    return True, 0.0, status, "OSM_WHEELCHAIR_YES_TAG"
