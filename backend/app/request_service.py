from fastapi import BackgroundTasks, FastAPI, APIRouter
from uuid import uuid4
import time  
from app.call_ollama import analyze_With_ollama
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

@router.post("/analyze-cv/{user_id}/{job_id}")
def analyze_cv(user_id: str, job_id: str, background_tasks: BackgroundTasks):
    analysis_id = str(uuid4()) 

    supabase.table("application_analysis").insert({
        "id": analysis_id,
        "user_id": user_id,
        "job_id": job_id,
        "analysis": None,
        "score": None
    }).execute()

    background_tasks.add_task(run_analysis_task, analysis_id)

    return {"analysis_id": analysis_id}


def run_analysis_task(analysis_id: str):
    result = supabase.table("application_analysis").select("*").eq("id", analysis_id).execute()
    record = result.data[0] if result.data else None
    if not record:
        return

    user_id = record["user_id"]
    job_id = record["job_id"]

    job_data = supabase.from_("jobs").select("description").eq("id", job_id).single().execute()
    job_description = job_data.data["description"]

    text = "Ovde ide parsirani tekst iz storage-a"  # Placeholder za stvarni sadržaj CV-a

    prompt = (
        f"Opis posla: {job_description}\n\n"
        "Analiziraj CV kandidata. Na skali od 1 do 10, zaokruzi na jednoj decimali "
        "dodijeli ocjenu prikladnosti za ovaj posao kao broj  "
        "i objasni zašto. Prvo napiši ocjenu, zatim analizu, sve piši na bosanskom jeziku."
    )

    analysis_result = analyze_With_ollama(text, prompt)

    import re
    score_match = re.search(r"(\d{1,2}\.\d)", analysis_result)
    score = float(score_match.group(1)) if score_match else 0.0

    supabase.table("application_analysis").update({
        "analysis": analysis_result,
        "score": score
    }).eq("id", analysis_id).execute()

@router.get("/get-analysis/{analysis_id}")
def get_analysis(analysis_id: str):
    result = supabase.table("application_analysis").select("analysis, score").eq("id", analysis_id).execute()
    if not result.data:
        return {"error": "Ne postoji zapis."}
    return result.data[0]
