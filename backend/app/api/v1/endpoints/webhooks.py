from fastapi import APIRouter, Request, HTTPException, Header, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
import logging
import stripe

from app.db.session import get_db
from app.models import Milestone, Wallet, Transaction, User
from app.services.escrow_service import construct_webhook_event

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()

    try:
        # Syncyhronous call since we changed it to `def`
        event = construct_webhook_event(payload, stripe_signature)
    except stripe.error.SignatureVerificationError as e: # type: ignore
        logger.error("⚠️  Webhook signature verification failed.")
        raise HTTPException(400, "Invalid signature")
    except Exception as e:
        logger.error(f"⚠️  Webhook error: {e}")
        raise HTTPException(400, f"Webhook error: {str(e)}")

    logger.info(f"🔔 Received Stripe Webhook event: {event['type']}")

    if event["type"] == "payment_intent.succeeded":
        pi = event["data"]["object"]
        milestone_id = pi.get("metadata", {}).get("milestone_id")
        if milestone_id:
            result = await db.execute(
                select(Milestone).where(Milestone.id == int(milestone_id))
            )
            milestone = result.scalar_one_or_none()
            if milestone:
                milestone.status = "funded"  # type: ignore
                milestone.stripe_payment_intent_id = pi["id"]  # type: ignore
                await db.commit()
                logger.info(f"✅ Milestone {milestone_id} funded successfully.")
            else:
                logger.warning(f"Milestone {milestone_id} not found for payment_intent.")

    elif event["type"] == "transfer.created":
        # Funds released to freelancer — update wallet
        transfer = event["data"]["object"]
        amount = transfer["amount"] / 100  # cents → dollars
        stripe_account = transfer["destination"]
        
        # Look up freelancer by stripe account via Wallet
        result = await db.execute(
            select(Wallet).where(Wallet.stripe_account_id == stripe_account)
        )
        wallet = result.scalar_one_or_none()
        if wallet:
            wallet.balance += amount  # type: ignore
            await db.commit()
            
            # Get user for logging
            user_res = await db.execute(select(User).where(User.id == wallet.user_id))
            freelancer = user_res.scalar_one_or_none()
            username = freelancer.username if freelancer else "Unknown"
            
            logger.info(f"💸 Transfer recorded: ${amount} added to {username}'s wallet.")
        else:
            logger.warning(f"Wallet with stripe_account {stripe_account} not found.")

    return {"received": True}
