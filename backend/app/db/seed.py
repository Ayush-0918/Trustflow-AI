"""
Seed the database with demo users and projects.
Run with: python -m app.db.seed
"""
import asyncio
from app.db.session import AsyncSessionLocal
from app.models import User, Project, Milestone, Wallet
from app.core.security import hash_password
from typing import Any, Dict, List


DEMO_USERS: List[Dict[str, Any]] = [
    {
        "email": "alice@demo.com",
        "username": "alice_client",
        "full_name": "Alice Johnson",
        "role": "client",
        "bio": "Startup founder looking for top talent.",
        "location": "San Francisco, CA",
        "trust_score": 88.0,
        "is_verified": True,
        "skills": [],
    },
    {
        "email": "bob@demo.com",
        "username": "bob_dev",
        "full_name": "Bob Martinez",
        "role": "freelancer",
        "bio": "Full-stack developer with 8 years experience. React, Python, PostgreSQL.",
        "location": "Austin, TX",
        "hourly_rate": 95.0,
        "trust_score": 92.5,
        "is_verified": True,
        "identity_verified": True,
        "skills": ["React", "Python", "PostgreSQL", "TypeScript", "FastAPI"],
    },
    {
        "email": "carol@demo.com",
        "username": "carol_design",
        "full_name": "Carol Chen",
        "role": "freelancer",
        "bio": "UI/UX designer. Figma expert. 200+ projects delivered.",
        "location": "New York, NY",
        "hourly_rate": 85.0,
        "trust_score": 78.0,
        "is_verified": True,
        "skills": ["Figma", "UI/UX", "React"],
    },
]

DEMO_PROJECTS: List[Dict[str, Any]] = [
    {
        "title": "E-commerce Platform Redesign",
        "description": "Redesign our Shopify store with a modern, conversion-optimized UI. Need both design and frontend development.",
        "status": "in_progress",
        "budget_min": 3000.0,
        "budget_max": 5000.0,
        "agreed_price": 4200.0,
        "skills_required": ["Figma", "React", "Shopify"],
        "milestones": [
            {"title": "Design mockups approved", "amount": 1260.0, "status": "released"},
            {"title": "Frontend implementation", "amount": 1680.0, "status": "funded"},
            {"title": "Testing & launch", "amount": 1260.0, "status": "pending"},
        ],
    },
    {
        "title": "REST API for Mobile App",
        "description": "Build a FastAPI backend for our iOS/Android app. Auth, push notifications, PostgreSQL.",
        "status": "open",
        "budget_min": 2000.0,
        "budget_max": 3500.0,
        "skills_required": ["FastAPI", "Python", "PostgreSQL", "Docker"],
        "milestones": [],
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        print("Seeding demo users...")
        users = {}
        for u_data in DEMO_USERS:
            user = User(
                hashed_password=hash_password("demo1234"),
                phone_verified=u_data.get("is_verified", False),
                identity_verified=u_data.get("identity_verified", False),
                **{k: v for k, v in u_data.items() if k != "identity_verified"},
            )
            db.add(user)
            await db.flush()
            wallet = Wallet(user_id=user.id, balance=500.0, total_earned=u_data.get("hourly_rate", 0) * 10)
            db.add(wallet)
            users[u_data["username"]] = user

        print("Seeding demo projects...")
        for p_data in DEMO_PROJECTS:
            milestones = p_data.pop("milestones")
            project = Project(
                client_id=users["alice_client"].id,
                freelancer_id=users["bob_dev"].id if p_data["status"] == "in_progress" else None,
                **p_data,
            )
            db.add(project)
            await db.flush()
            for ms_data in milestones:
                ms = Milestone(project_id=project.id, **ms_data)
                db.add(ms)

        await db.commit()
        print("✓ Seed complete!")
        print("\nDemo accounts:")
        print("  alice@demo.com  / demo1234  (client)")
        print("  bob@demo.com    / demo1234  (freelancer)")
        print("  carol@demo.com  / demo1234  (freelancer)")


        # Add Ayush
        user_ayush = User(
            email="ayushpandey10851@gmail.com",
            username="ayush_hacker",
            full_name="Ayush Pandey",
            hashed_password=hash_password("12345678"),
            role="freelancer",
            is_verified=True,
            identity_verified=True,
            trust_score=99.9
        )
        db.add(user_ayush)
        await db.commit()
        print("Added Ayush!")

if __name__ == "__main__":
    asyncio.run(seed())
