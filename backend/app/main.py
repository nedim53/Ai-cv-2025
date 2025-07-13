from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from docx import Document
import pdfplumber
from io import BytesIO
import pytesseract
from app.gemini import router as gemini_router
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

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/applications/by_hr/{hr_id}")
def get_applications_by_hr(hr_id: str):
    response = supabase.from_("application_analysis").select(
        "*, jobs(*), users(*)"
    ).eq("jobs.hr_id", hr_id).execute()
    return response.data

@app.get("/")
def root():
    return {"message": "AI Resume Analyzer backend (Gemini) is running."}

# routes
app.include_router(gemini_router)
