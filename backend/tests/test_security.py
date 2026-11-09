import pytest
import hmac
import hashlib
from app.core.security import verify_hmac_signature, hash_ip
from app.services.ai_engine import ai_engine

def test_ip_anonymization_gdpr():
    raw_ip = "192.168.1.100"
    hashed = hash_ip(raw_ip, salt="test-salt")
    
    assert len(hashed) == 64
    assert hashed != raw_ip
    # Same input & salt produces deterministic output
    assert hash_ip(raw_ip, salt="test-salt") == hashed
    # Different salt produces different output
    assert hash_ip(raw_ip, salt="other-salt") != hashed

def test_ip_anonymization_empty():
    assert hash_ip(None) == "00000000000000000000000000000000"
    assert hash_ip("") == "00000000000000000000000000000000"

def test_hmac_signature_verification():
    secret = "my-secret-key"
    payload = b'{"event": "push", "repo": "test/repo"}'
    valid_sig = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()

    # Valid with sha256= prefix
    assert verify_hmac_signature(payload, f"sha256={valid_sig}", secret) is True
    # Valid with raw hex
    assert verify_hmac_signature(payload, valid_sig, secret) is True
    # Invalid signature
    assert verify_hmac_signature(payload, "invalid_signature", secret) is False
    # Tampered payload
    assert verify_hmac_signature(b'tampered payload', f"sha256={valid_sig}", secret) is False

def test_sql_ast_sanitizer_valid_queries():
    valid_queries = [
        "SELECT * FROM github_events LIMIT 10",
        "SELECT actor_login, COUNT(*) as cnt FROM github_events GROUP BY actor_login ORDER BY cnt DESC",
        "SELECT strftime(time, '%Y-%m-%d') as dt, SUM(commit_count) FROM github_events WHERE repo_name = 'test' GROUP BY dt",
        "SELECT actor_login, lines_added, lines_deleted FROM github_events WHERE lines_added > 100",
    ]
    for q in valid_queries:
        assert ai_engine.validate_sql(q) is True, f"Expected safe query to pass: {q}"

def test_sql_ast_sanitizer_destructive_queries():
    malicious_queries = [
        "DROP TABLE github_events",
        "DELETE FROM github_events WHERE 1=1",
        "UPDATE github_events SET commit_count = 0",
        "INSERT INTO github_events VALUES ('a', 'b', 'c', 'd', 'e', 'f', 1, 'g', 'h', 1, 1, '{}')",
        "ALTER TABLE github_events ADD COLUMN hacked INT",
        "TRUNCATE TABLE github_events",
        "SELECT * FROM github_events; DROP TABLE github_events;",
    ]
    for q in malicious_queries:
        assert ai_engine.validate_sql(q) is False, f"Expected dangerous query to fail: {q}"
