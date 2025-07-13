from fastapi import BackgroundTasks, FastAPI, APIRouter
from uuid import uuid4
import time  
from app.call_ollama import analyze_With_ollama
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path
#from app.gemini import analyze_with_gemini
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
    f"Opis posla:\n{job_description}\n\n"
    "Sada slijedi analiza životopisa kandidata u odnosu na opis posla.\n\n"
    "🔹 Na prvoj liniji **OBAVEZNO** napiši samo brojčanu ocjenu prikladnosti kandidata (npr. `7.5`).\n"
    "🔹 Koristi decimalnu vrijednost sa jednom decimalom (obavezno).\n"
    "🔹 Nakon toga, napiši **detaljnu analizu** zašto si dodijelio tu ocjenu.\n"
    "🔹 Analiziraj kompetencije, iskustvo, edukaciju i kompatibilnost sa opisom posla.\n"
    "🔹 Navedi koje su prednosti i nedostaci kandidata u odnosu na opisani posao.\n"
    "🔹 Piši isključivo na bosanskom jeziku.\n"
    "🔹 Format odgovora:\n"
    "```\n"
    "8.3\n"
    "Kandidat ima bogato iskustvo u XYZ. Posebno se ističe u...\n"
    "...\n"
    "```"
    )


    analysis_result = analyze_With_ollama(text, prompt)

    import re
    score_match = re.search(r"(\d{1,2}\.\d)", analysis_result)
    score = float(score_match.group(1)) if score_match else 0.0

    supabase.table("application_analysis").update({
        "analysis": analysis_result,
        "score": score
    }).eq("id", analysis_id).execute()


#@router.get("/get-analysis/{analysis_id}")
#def get_analysis(analysis_id: str):
 #   result = supabase.table("application_analysis").select("analysis, score").eq("id", analysis_id).execute()
  #  if not result.data:
   #     return {"error": "Ne postoji zapis."}
   # return result.data[0]


#@router.get("/get-analysis/{analysis_id}")
#ef get_analysis(analysis_id: str):
 #   result = supabase.table("application_analysis").select("cv_text, job_description").eq("id", analysis_id).execute()

  #  if not result.data:
   #     return {"error": "Ne postoji zapis."}

    #cv_text = result.data[0]["cv_text"]
  #  job_description = result.data[0]["job_description"]
#
 #   ai_result = analyze_with_gemini(cv_text, job_description)

   # return {"result": ai_result}