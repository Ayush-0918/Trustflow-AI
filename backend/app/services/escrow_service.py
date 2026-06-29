import stripe
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_payment_intent(
    amount_usd: float,
    project_id: int,
    milestone_id: int,
    client_email: str,
) -> dict:
    """Create a Stripe PaymentIntent for escrow funding."""
    if not settings.STRIPE_SECRET_KEY:
        logger.warning(f"[DEV] Mock Stripe PaymentIntent for ${amount_usd}")
        return {
            "client_secret": "mock_secret_123",
            "payment_intent_id": "pi_mock_123",
        }
        
    try:
        intent = await stripe.PaymentIntent.create_async(
            amount=int(amount_usd * 100),  # cents
            currency="usd",
            metadata={
                "project_id": str(project_id),
                "milestone_id": str(milestone_id),
                "purpose": "escrow",
            },
            receipt_email=client_email,
            description=f"TrustFlow Escrow — Project #{project_id}, Milestone #{milestone_id}",
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
        }
    except Exception as e:
        logger.error(f"Stripe PaymentIntent creation failed: {e}")
        raise


async def create_stripe_connect_account(
    email: str,
    full_name: str,
) -> str:
    """Create a Stripe Connect Express account for a freelancer."""
    if not settings.STRIPE_SECRET_KEY:
        logger.warning(f"[DEV] Mock Stripe Connect Account for {email}")
        return "acct_mock_123"

    try:
        account = await stripe.Account.create_async(
            type="express",
            email=email,
            capabilities={
                "transfers": {"requested": True},
            },
            business_profile={
                "name": full_name,
                "mcc": "7372",  # Software programming
            },
        )
        return account.id
    except Exception as e:
        logger.error(f"Stripe Connect Account creation failed: {e}")
        raise


async def create_connect_onboarding_link(
    account_id: str,
    return_url: str,
    refresh_url: str,
) -> str:
    """Generate an onboarding link for Stripe Connect."""
    if not settings.STRIPE_SECRET_KEY:
        logger.warning(f"[DEV] Mock Stripe Onboarding Link for {account_id}")
        return f"{return_url}?onboarded=mock_true"

    try:
        link = await stripe.AccountLink.create_async(
            account=account_id,
            refresh_url=refresh_url,
            return_url=return_url,
            type="account_onboarding",
        )
        return link.url
    except Exception as e:
        logger.error(f"Stripe AccountLink creation failed: {e}")
        raise


async def release_escrow_to_freelancer(
    payment_intent_id: str,
    freelancer_stripe_account: str,
    amount_usd: float,
    platform_fee_pct: float = 0.05,
) -> dict:
    """Release held funds to freelancer via Stripe Transfer."""
    platform_fee = int(amount_usd * platform_fee_pct * 100)
    net_amount = int(amount_usd * 100) - platform_fee

    if not settings.STRIPE_SECRET_KEY:
        logger.warning(f"[DEV] Mock Stripe Transfer of ${net_amount/100} to {freelancer_stripe_account}")
        return {"transfer_id": "tr_mock_123", "amount_transferred": net_amount / 100}

    try:
        transfer = await stripe.Transfer.create_async(
            amount=net_amount,
            currency="usd",
            destination=freelancer_stripe_account,
            metadata={"source_payment_intent": payment_intent_id},
        )
        return {"transfer_id": transfer.id, "amount_transferred": net_amount / 100}
    except Exception as e:
        logger.error(f"Stripe Transfer failed: {e}")
        raise


def construct_webhook_event(payload: bytes, sig_header: str):
    """Verify and construct a Stripe webhook event. (Synchronous operation as it's crypto verification)."""
    return stripe.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )
