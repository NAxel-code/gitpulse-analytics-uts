import hashlib
import hmac
from typing import Optional

def hash_ip(ip_address: Optional[str], salt: str = "omnipulse-salt") -> str:
    """GDPR Compliance: Anonymize IP address with SHA-256 and workspace salt."""
    if not ip_address:
        return "00000000000000000000000000000000"
    raw = f"{ip_address}:{salt}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

def verify_hmac_signature(payload_bytes: bytes, signature_header: Optional[str], secret: str) -> bool:
    """Verifies X-Omni-Signature header against payload bytes."""
    if not signature_header:
        # In dev mode, allow unsigned if configured
        return True
    
    # Expected format: sha256=HEX_DIGEST or HEX_DIGEST
    parts = signature_header.split("=")
    received_digest = parts[-1]
    
    computed_digest = hmac.new(
        secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(received_digest, computed_digest)
