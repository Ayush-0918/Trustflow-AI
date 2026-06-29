import random
import string
import logging
from twilio.rest import Client
from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None


def get_twilio_client() -> Client:
    global _client
    if _client is None:
        _client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    return _client


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def send_otp(phone_number: str, otp: str) -> bool:
    """Send OTP via Twilio SMS. Returns True on success."""
    if not settings.TWILIO_ACCOUNT_SID:
        # In dev mode without Twilio — just print the OTP
        logger.warning(f"[DEV] OTP for {phone_number}: {otp}")
        return True
    try:
        client = get_twilio_client()
        client.messages.create(
            body=f"Your TrustFlow verification code is: {otp}. Valid for 10 minutes.",
            from_=settings.TWILIO_FROM_NUMBER,
            to=phone_number,
        )
        logger.info(f"✅ OTP sent to {phone_number}")
        return True
    except Exception as e:
        logger.error(f"Twilio error: {e}")
        return False


def send_project_notification(phone_number: str, message: str) -> bool:
    """Send a project update SMS notification."""
    if not settings.TWILIO_ACCOUNT_SID:
        logger.warning(f"[DEV] SMS to {phone_number}: {message}")
        return True
    try:
        client = get_twilio_client()
        client.messages.create(
            body=f"TrustFlow: {message}",
            from_=settings.TWILIO_FROM_NUMBER,
            to=phone_number,
        )
        logger.info(f"✅ Notification sent to {phone_number}")
        return True
    except Exception as e:
        logger.error(f"Twilio error: {e}")
        return False
