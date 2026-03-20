"""
backend/services/voice.py
Voice message transcription using OpenAI Whisper.
"""

import structlog
import httpx

from backend.config import config

log = structlog.get_logger()

WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.ogg") -> str:
    """Transcribe a voice message using OpenAI Whisper.

    Args:
        audio_bytes: Raw audio file bytes
        filename: Original filename (used to determine format)

    Returns:
        Transcribed text string

    Raises:
        RuntimeError: If OpenAI API key is missing or transcription fails
    """
    if not config.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not configured — cannot transcribe audio")

    log.info("transcribe_start", filename=filename, size_bytes=len(audio_bytes))

    headers = {"Authorization": f"Bearer {config.OPENAI_API_KEY}"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            WHISPER_API_URL,
            headers=headers,
            files={"file": (filename, audio_bytes, _mime_type(filename))},
            data={"model": "whisper-1", "language": "en"},
        )
        r.raise_for_status()
        text = r.json().get("text", "").strip()

    log.info("transcribe_complete", chars=len(text))
    return text


def _mime_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower()
    return {
        "ogg": "audio/ogg",
        "mp3": "audio/mpeg",
        "mp4": "audio/mp4",
        "m4a": "audio/mp4",
        "wav": "audio/wav",
        "webm": "audio/webm",
        "flac": "audio/flac",
    }.get(ext, "audio/ogg")
