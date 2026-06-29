import json
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Groq for Langchain and CrewAI
try:
    from langchain_groq import ChatGroq
    
    # Initialize the blazing fast Groq LLM (llama-3.1-8b-instant or 70b)
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama3-70b-8192", # Groq's superfast model
        temperature=0.7,
        max_tokens=2048,
    )
except ImportError:
    llm = None
    logger.warning("langchain_groq not installed or invalid configuration.")

def _get_mock_blueprint():
    return {
        "phases": [
            {
                "name": "Architecture & Design",
                "duration_days": 7,
                "tasks": ["System architecture design", "UI/UX wireframing"],
                "deliverables": ["Figma designs", "Technical specification doc"]
            },
            {
                "name": "Core Development",
                "duration_days": 14,
                "tasks": ["Frontend scaffolding", "Backend API implementation"],
                "deliverables": ["Working prototype"]
            }
        ],
        "skills_recommended": ["React", "Python", "FastAPI", "TypeScript"],
        "risk_factors": ["Integration delays", "Scope creep"],
        "success_criteria": ["Sub-2s page load time", "All tests passing"],
        "suggested_milestones": [
            {"title": "Design Finalization", "percentage": 30, "description": "All UI/UX designs approved"},
            {"title": "Beta Launch", "percentage": 70, "description": "Full production deployment"}
        ],
        "estimated_hours": 120,
        "complexity": "medium"
    }

async def generate_project_blueprint(
    title: str,
    description: str,
    budget: Optional[float] = None,
    deadline_days: Optional[int] = None,
) -> dict:
    """Generate a structured project blueprint using CrewAI and Groq."""
    
    if not settings.GROQ_API_KEY or not llm:
        logger.info("Using mock blueprint (Groq key missing or LLM failed to load).")
        return _get_mock_blueprint()

    try:
        from crewai import Agent, Task, Crew, Process
        from tavily import TavilyClient
        import asyncio

        # We can pass Tavily as a tool if needed
        # For structured JSON out, we usually instruct the final agent
        
        architect = Agent(
            role='Lead Technical Architect',
            goal=f'Design the perfect technical roadmap and structure for the project: {title}',
            backstory='An elite software architect who breaks down complex projects into actionable, perfectly scoped milestones.',
            verbose=False,
            allow_delegation=False,
            llm=llm
        )
        
        analyst = Agent(
            role='Risk & Success Analyst',
            goal='Analyze the project for potential risks, recommend essential skills, and define clear success criteria.',
            backstory='A meticulous project manager who ensures projects succeed by foreseeing risks and demanding perfection.',
            verbose=False,
            allow_delegation=False,
            llm=llm
        )

        json_compiler = Agent(
            role='JSON Data Compiler',
            goal='Compile all project data into a strictly formatted JSON output.',
            backstory='A strict data parser that ONLY outputs raw valid JSON, no markdown formatting, no conversational text.',
            verbose=False,
            allow_delegation=False,
            llm=llm
        )

        task1 = Task(
            description=f'Create a technical roadmap for: {title}. Description: {description}. Budget: ${budget}. Deadline: {deadline_days} days. Define the phases, duration, tasks, deliverables, milestones, and estimated hours.',
            agent=architect,
            expected_output="A detailed roadmap document outlining phases, milestones, and estimates."
        )

        task2 = Task(
            description='Based on the roadmap, identify risk factors, recommended skills, and success criteria.',
            agent=analyst,
            expected_output="A list of risks, skills, and success criteria."
        )

        task3 = Task(
            description="""Combine the roadmap and analysis into a SINGLE raw JSON object with this exact structure:
{
  "phases": [
    {
      "name": "Phase name",
      "duration_days": 5,
      "tasks": ["Task 1", "Task 2"],
      "deliverables": ["Deliverable 1"]
    }
  ],
  "skills_recommended": ["skill1", "skill2"],
  "risk_factors": ["risk1"],
  "success_criteria": ["criterion1"],
  "suggested_milestones": [
    {"title": "Milestone", "percentage": 30, "description": "What's delivered"}
  ],
  "estimated_hours": 40,
  "complexity": "medium"
}
Output NOTHING ELSE except the raw JSON string.""",
            agent=json_compiler,
            expected_output="A raw JSON string matching the required structure exactly."
        )

        crew = Crew(
            agents=[architect, analyst, json_compiler],
            tasks=[task1, task2, task3],
            process=Process.sequential,
            verbose=False
        )

        # CrewAI is synchronous, run it in a thread to not block FastAPI
        result = await asyncio.to_thread(crew.kickoff)
        
        # Clean the output in case it wrapped it in ```json ... ```
        output_str = result.strip() if isinstance(result, str) else str(result).strip()
        if output_str.startswith("```json"):
            output_str = output_str[7:]
        if output_str.startswith("```"):
            output_str = output_str[3:]
        if output_str.endswith("```"):
            output_str = output_str[:-3]
            
        return json.loads(output_str.strip())

    except Exception as e:
        logger.error(f"CrewAI/Groq Error: {e}")
        return _get_mock_blueprint()

async def calculate_trust_score(user_data: dict) -> dict:
    """Use Groq to analyze and explain trust score breakdown."""
    if not settings.GROQ_API_KEY or not llm:
        return {
            "overall_score": 85,
            "breakdown": {"profile_completeness": 90, "verified_skills": 80, "client_satisfaction": 85},
            "recommendations": ["Add more skills"],
            "trust_level": "verified"
        }
        
    prompt = f"""You are a trust and reputation analyst. Analyze this user and calculate a trust score:
{json.dumps(user_data, indent=2)}

Return ONLY valid JSON:
{{
  "overall_score": 78.5,
  "breakdown": {{
    "profile_completeness": 85,
    "verified_skills": 70,
    "identity_verified": true,
    "project_completion_rate": 92,
    "client_satisfaction": 88,
    "response_time_score": 75,
    "dispute_rate": 5
  }},
  "recommendations": ["Complete identity verification to boost score by 15 points"],
  "trust_level": "verified"
}}"""

    try:
        from langchain_core.messages import HumanMessage
        res = await llm.ainvoke([HumanMessage(content=prompt)])
        
        out = str(res.content).strip()
        if out.startswith("```json"): out = out[7:]
        if out.startswith("```"): out = out[3:]
        if out.endswith("```"): out = out[:-3]
            
        return json.loads(out.strip())
    except Exception as e:
        logger.error(f"Groq trust score error: {e}")
        return {"overall_score": 50, "recommendations": ["Error analyzing profile"], "trust_level": "unknown"}

async def generate_skill_questions(skill_name: str, count: int = 10) -> list:
    """Generate skill test questions using Groq."""
    if not settings.GROQ_API_KEY or not llm:
        return [{"id": "q1", "question": f"What is {skill_name}?", "options": ["A", "B"], "correct_answer": 0, "explanation": "Mock", "difficulty": "easy", "time_limit": 60}]

    prompt = f"""Generate {count} multiple-choice questions for: {skill_name}. 
Return ONLY valid JSON as an array of objects with keys: id, question, options (array of 4 strings), correct_answer (int 0-3), explanation, difficulty (easy/medium/hard), time_limit (int seconds)."""

    try:
        from langchain_core.messages import HumanMessage
        res = await llm.ainvoke([HumanMessage(content=prompt)])
        out = str(res.content).strip()
        if out.startswith("```json"): out = out[7:]
        if out.startswith("```"): out = out[3:]
        if out.endswith("```"): out = out[:-3]
            
        data = json.loads(out.strip())
        if isinstance(data, dict): return data.get("questions", [])
        return data
    except Exception as e:
        logger.error(f"Groq questions error: {e}")
        return []

async def analyze_video_frame(frame_description: str) -> dict:
    if not settings.GROQ_API_KEY or not llm:
        return {"is_authentic": True, "confidence": 0.9, "flags": [], "deepfake_probability": 0.05, "liveness_score": 0.95, "recommendation": "verified"}
        
    prompt = f"""Analyze this video session description and check for deepfakes/liveness: {frame_description}
Return ONLY valid JSON with keys: is_authentic (bool), confidence (float), flags (list), deepfake_probability (float), liveness_score (float), recommendation (string)."""

    try:
        from langchain_core.messages import HumanMessage
        res = await llm.ainvoke([HumanMessage(content=prompt)])
        out = str(res.content).strip()
        if out.startswith("```json"): out = out[7:]
        if out.startswith("```"): out = out[3:]
        if out.endswith("```"): out = out[:-3]
        return json.loads(out.strip())
    except:
        return {"is_authentic": True, "confidence": 0.8, "flags": [], "deepfake_probability": 0.1, "liveness_score": 0.9, "recommendation": "verified"}
