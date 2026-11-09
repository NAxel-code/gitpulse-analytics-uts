from fastapi import APIRouter, Request, Header, HTTPException, status
from typing import Optional, List, Union
from app.models.events import IngestEventPayload, IngestResponse
from app.services.buffer import event_buffer
from app.core.security import verify_hmac_signature, hash_ip
from app.core.config import settings

router = APIRouter(prefix="/events", tags=["Ingestion"])

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_event(
    request: Request,
    event: Union[IngestEventPayload, List[IngestEventPayload]],
    x_omni_signature: Optional[str] = Header(None, alias="X-Omni-Signature")
):
    """
    High-throughput async event ingestion endpoint.
    Buffered into async memory/stream queue and responds in < 15ms with 202 Accepted.
    """
    raw_body = await request.body()
    if not verify_hmac_signature(raw_body, x_omni_signature, settings.HMAC_SECRET):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid HMAC signature"
        )

    # Anonymize client IP
    client_host = request.client.host if request.client else "127.0.0.1"
    hashed_ip = hash_ip(client_host)

    if isinstance(event, list):
        items = []
        for e in event:
            e_dict = e.model_dump()
            e_dict["ip_hashed"] = hashed_ip
            items.append(e_dict)
        await event_buffer.push_batch(items)
        count = len(items)
    else:
        e_dict = event.model_dump()
        e_dict["ip_hashed"] = hashed_ip
        await event_buffer.push_event(e_dict)
        count = 1

    return IngestResponse(
        status="accepted",
        received_count=count,
        message=f"{count} event(s) queued for batch ingestion"
    )
