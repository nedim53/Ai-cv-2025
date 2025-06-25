from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from docx import Document
import pdfplumber
from io import BytesIO
from app.call_ollama import analyze_With_ollama
import pytesseract
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# OCR setup
pytesseract.pytesseract.tesseract_cmd = r"C:\Tesseract\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"C:\Tesseract"

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI()



# CORS za frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    job_id: str = Form(...),
    user_id: str = Form(...)
):
    file_content = await file.read()

    # PARSE
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(BytesIO(file_content)) as pdf:
            text = ""
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"

    elif file.filename.endswith(".docx"):
        try:
            doc = Document(BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": f"Greška pri DOCX: {str(e)}"})

    else:
        return JSONResponse(status_code=400, content={"error": "Nepodržan tip fajla."})

    text = text.strip()
    if not text:
        return {"error": "Fajl je prazan ili nije moguće parsirati."}

    # AI analiza///////////////
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



    supabase.table("application_analysis").insert({
        "user_id": user_id,
        "job_id": job_id,
        "analysis": analysis_result,
        "score": score
    }).execute()

    return {
        "filename": file.filename,
        "parsed_text": text,
        "analysis": analysis_result,
        "score": score
    }

@app.get("/applications/by_hr/{hr_id}")
def get_applications_by_hr(hr_id: str):
    response = supabase.from_("application_analysis").select(
        "*, jobs(*), user(*)"
    ).eq("jobs.hr_id", hr_id).execute()
    return response.data


@app.get("/")
def root():
    return {"message": "AI Resume Analyzer backend (LLaMA) is running."}
