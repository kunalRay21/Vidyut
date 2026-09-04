import hashlib
from typing import Optional


def generate_fingerprint(
    source: str,
    external_id: Optional[str] = None,
    title: Optional[str] = None,
    organization: Optional[str] = None,
    deadline: Optional[str] = None
) -> str:
    """
    Generate a deterministic cryptographic fingerprint (SHA-256) for an opportunity.
    Per Member 5 spec:
    - Primary formula: hash(source + external_id) if external_id is present
    - Secondary formula: hash(normalized_title + normalized_org + deadline)
    """
    source_norm = (source or "UNKNOWN").strip().upper()
    
    if external_id and external_id.strip():
        raw_key = f"{source_norm}:{external_id.strip()}"
    else:
        norm_title = (title or "").strip().lower()
        norm_org = (organization or "").strip().lower()
        norm_deadline = str(deadline or "").strip()
        raw_key = f"{source_norm}:{norm_title}:{norm_org}:{norm_deadline}"
        
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
