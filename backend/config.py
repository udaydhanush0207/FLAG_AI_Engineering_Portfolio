"""
backend/config.py
Load and validate all environment variables for the FLAG AI platform.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # AI APIs
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    PERPLEXITY_API_KEY: str = os.getenv("PERPLEXITY_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # Messaging
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    # Security
    INGEST_API_KEY: str = os.getenv("INGEST_API_KEY", "flag-ingest-2026")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Chunking
    CHUNK_SIZE: int = 1200
    CHUNK_OVERLAP: int = 200
    RETRIEVAL_LIMIT: int = 15
    SIMILARITY_THRESHOLD: float = 0.5  # text-embedding-3-small scores typically 0.5-0.7

    def validate(self) -> list[str]:
        """Return list of missing required keys."""
        required = [
            ("ANTHROPIC_API_KEY", self.ANTHROPIC_API_KEY),
            ("SUPABASE_URL", self.SUPABASE_URL),
            ("SUPABASE_SERVICE_KEY", self.SUPABASE_SERVICE_KEY),
        ]
        return [name for name, val in required if not val or val.endswith("-here") or val.endswith("your-key")]


config = Config()
