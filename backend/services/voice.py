"""
backend/services/voice.py
Voice message transcription using OpenAI Whisper.
"""

import structlog

log = structlog.get_logger()


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.ogg") -> str:
    """Transcribe a voice message using OpenAI Whisper.

    Args:
        audio_bytes: Raw audio file bytes
        filename: Original filename (used to determine format)

    Returns:
        Transcribed text string
    """
    # TODO Phase 3: implement with openai.Audio.transcriptions.create
    raise NotImplementedError("transcribe_audio: implement in Phase 3")
