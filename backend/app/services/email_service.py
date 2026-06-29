import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Only import resend if the API key is present, to allow local dev without it
if settings.RESEND_API_KEY:
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
    except ImportError:
        logger.warning("resend package not installed. Run 'pip install resend'.")

async def send_welcome_email(email_to: str, username: str):
    """Send a welcome email to a newly registered user."""
    
    if not settings.RESEND_API_KEY:
        logger.info(f"📧 [MOCK EMAIL] Welcome email sent to {email_to}")
        return True

    try:
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <h1 style="color: #2c3e50; text-align: center;">Welcome to TrustFlow, {username}! 🚀</h1>
            <p style="color: #34495e; font-size: 16px;">We are incredibly excited to have you on board.</p>
            <p style="color: #34495e; font-size: 16px;">TrustFlow is the next-generation escrow and freelancer platform where trust is built-in.</p>
            <br>
            <a href="https://trustflow.ai" style="display: block; width: 200px; margin: 0 auto; padding: 12px; background-color: #3498db; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
            <br>
            <p style="color: #7f8c8d; font-size: 14px; text-align: center;">Build with trust. Work with freedom.</p>
        </div>
        """
        
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": email_to,
            "subject": "Welcome to TrustFlow! 🚀",
            "html": html_content
        })
        logger.info(f"📧 Real email sent via Resend to {email_to}: {response}")
        return response
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False

async def send_milestone_funded_email(email_to: str, project_title: str, amount: float):
    """Send an email when a milestone is funded in escrow."""
    
    if not settings.RESEND_API_KEY:
        logger.info(f"📧 [MOCK EMAIL] Milestone funded email sent to {email_to}")
        return True

    try:
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <h2 style="color: #27ae60; text-align: center;">Funds Secured in Escrow 💰</h2>
            <p style="color: #34495e; font-size: 16px;">Great news! The client has successfully funded the milestone for <strong>{project_title}</strong>.</p>
            <p style="color: #34495e; font-size: 16px;">Amount: <strong style="color: #27ae60;">${amount:.2f}</strong></p>
            <p style="color: #34495e; font-size: 16px;">You can now safely begin working on this milestone. The funds are locked in TrustFlow escrow and will be released to your wallet upon approval.</p>
            <br>
            <a href="https://trustflow.ai/dashboard" style="display: block; width: 200px; margin: 0 auto; padding: 12px; background-color: #27ae60; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold;">View Project</a>
        </div>
        """
        
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": email_to,
            "subject": f"Funds Secured: {project_title}",
            "html": html_content
        })
        logger.info(f"📧 Real email sent via Resend to {email_to}")
        return response
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False
