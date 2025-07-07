from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Form, HTTPException
from uuid import uuid4
import os
import re
import time
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai
import pdfplumber
from PIL import Image
import pytesseract

router = APIRouter()

# ENV VARS
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
pytesseract.pytesseract.tesseract_cmd = r"C:\Tesseract\tesseract.exe"
os.environ['TESSDATA_PREFIX'] = r"C:\Tesseract"


@router.post("/upload-cv")
async def upload_cv(user_id: str = Form(...), file: UploadFile = File(...)):
    os.makedirs("temp_uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[-1].lower()
    path = f"temp_uploads/{user_id}{ext}"
    with open(path, "wb") as f:
        f.write(await file.read())
    return {"success": True}


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

    for _ in range(5):
        job_data = supabase.from_("jobs").select("description").eq("id", job_id).single().execute()
        if job_data.data and job_data.data.get("description"):
            break
        time.sleep(1)

    # PROVJERA FAJLA
    file_path_pdf = f"temp_uploads/{user_id}.pdf"
    file_path_img = f"temp_uploads/{user_id}.png"
    text = ""

    if os.path.exists(file_path_pdf):
        text = parse_pdf(file_path_pdf)
    elif os.path.exists(file_path_img):
        text = parse_image(file_path_img)
    else:
        return

    if not text.strip():
        return

    job_description = job_data.data["description"]
    prompt = build_prompt(job_description, text)

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        analysis_result = response.text if hasattr(response, "text") else str(response)
    except Exception as e:
        analysis_result = f"❌ Greška pri AI analizi: {str(e)}"

    score_match = re.search(r"(\d{1,2}\.\d)", analysis_result)
    score = float(score_match.group(1)) if score_match else 0.0

    supabase.table("application_analysis").update({
        "analysis": analysis_result,
        "score": score
    }).eq("id", analysis_id).execute()


def parse_pdf(file_path: str):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


def parse_image(image_path: str):
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)


@router.get("/get-analysis/{analysis_id}")
def get_analysis(analysis_id: str):
    try:
        result = supabase.table("application_analysis").select("analysis, score").eq("id", analysis_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Nema analize")
        record = result.data[0]
        return {
            "analysis": record["analysis"],
            "score": record["score"],
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Greška prilikom dohvata analize")


@router.get("/get-existing-analysis/{user_id}/{job_id}")
def get_existing_analysis(user_id: str, job_id: str):
    try:
        response = (
            supabase.table("application_analysis")
            .select("analysis")
            .eq("user_id", user_id)
            .eq("job_id", job_id)
            .execute()
        )

        if not response.data or len(response.data) == 0:
            return {"analysis": None}

        record = response.data[0]
        return {
            "analysis": record.get("analysis"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška prilikom dohvata analize: {str(e)}")


def build_prompt(job_description: str, cv_text: str) -> str:
    return (
        f"📄 Opis posla:\n{job_description}\n\n"
        f"📄 CV kandidata:\n{cv_text}\n\n"
        "🔍 Sada slijedi analiza životopisa kandidata u odnosu na opis posla.\n\n"
        "📌 Upute za analizu:\n"
        "🔹 Na prvoj liniji **OBAVEZNO** napiši samo brojčanu ocjenu prikladnosti kandidata (npr. `7.5`).\n"
        "🔹 Koristi decimalnu vrijednost sa jednom decimalom (obavezno).\n"
        "🔹 Odgovor mora biti **100% zasnovan isključivo** na podacima iz CV-a i opisa posla. Nemoj izmišljati informacije koje nisu navedene.\n\n"
        "🔹 Nakon toga napiši **DETALJNU i STRUKTURIRANU** analizu kandidata.\n"
        "🔹 Tvoj odgovor treba biti organizovan u sljedeće sekcije (podnaslove):\n"
        "1. Kompetencije\n"
        "2. Iskustvo\n"
        "3. Edukacija\n"
        "4. Kompatibilnost\n"
        "5. Prednosti kandidata (navedi najmanje 3)\n"
        "6. Nedostaci kandidata (navedi najmanje 3)\n"
        "7. Preporuke\n\n"
        "🔹 Piši isključivo na **bosanskom jeziku**.\n"
        "🔹 Format odgovora:\n"
        "```\n"
        "8.3\n"
        "1. Kompetencije:\n...\n"
        "2. Iskustvo:\n...\n"
        "...\n"
        "```"
    )

# testiranje find my job opcije hehe
@router.get("/find-my-jobs/{user_id}")
def find_my_jobs(user_id: str):
    import json

    file_path_pdf = f"temp_uploads/{user_id}.pdf"
    file_path_img = f"temp_uploads/{user_id}.png"
    cv_text = ""

    if os.path.exists(file_path_pdf):
        cv_text = parse_pdf(file_path_pdf)
    elif os.path.exists(file_path_img):
        cv_text = parse_image(file_path_img)
    else:
        raise HTTPException(status_code=404, detail="CV nije pronađen")

    if not cv_text.strip():
        raise HTTPException(status_code=400, detail="CV je prazan")

    prompt = f"""
    📄 Tekst CV-a:
    {cv_text}

    Izdvoji samo one ključne riječi koje se eksplicitno pojavljuju u tekstu CV-a — nemoj izmišljati dodatne podatke.

 Vrati samo one izraze, tehnologije, alate ili pozicije koje su *tačno spomenute* u tekstu. Bez pretpostavki.

Vrati rezultat kao Python listu stringova, npr:
["node.js", "react", "html", "css", "postgresql", "fastapi", "git"]
"""

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    keywords_raw = response.text.strip()

    try:
        keywords = json.loads(keywords_raw)
    except:
        keywords = [kw.strip().lower() for kw in re.findall(r'\w+', keywords_raw)]

    if not keywords:
        raise HTTPException(status_code=400, detail="Nema pronađenih ključnih riječi")

    # 3. Dohvati sve poslove iz baze
    jobs_response = supabase.table("jobs").select("*").execute()
    jobs = jobs_response.data if jobs_response.data else []

    # 4. Rangiraj po broju poklapanja ključnih riječi
    def match_score(job):
        combined_text = f"{job['title']} {job['description']}".lower()
        return sum(1 for kw in keywords if kw.lower() in combined_text)

    ranked_jobs = sorted(jobs, key=match_score, reverse=True)

    return {
        "keywords": keywords,
        "results": ranked_jobs[:10]  # po zelji koliko poslova da trazim
    }
