"""
backend/routes/webhooks.py
Messaging channel webhook handlers (WhatsApp + Telegram).
"""

import structlog
from fastapi import APIRouter, HTTPException, Request, Response

log = structlog.get_logger()
router = APIRouter()


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request) -> Response:
    """Handle incoming WhatsApp messages via Twilio — placeholder until Phase 3."""
    try:
        form = await request.form()
        body = form.get("Body", "")
        from_number = form.get("From", "")
        log.info("whatsapp_message", from_number=from_number, body_len=len(str(body)))

        # Placeholder TwiML response
        twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>BRICK is initializing. Full implementation coming soon.</Message></Response>'
        return Response(content=twiml, media_type="application/xml")
    except Exception as e:
        log.error("whatsapp_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")


@router.post("/telegram")
async def telegram_webhook(request: Request) -> dict:
    """Handle incoming Telegram messages — placeholder until Phase 3."""
    try:
        data = await request.json()
        log.info("telegram_update", update_id=data.get("update_id"))
        return {"ok": True}
    except Exception as e:
        log.error("telegram_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")
