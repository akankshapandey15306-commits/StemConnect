from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.patients import router as patient_router
from app.api.donors import router as donor_router
from app.api.financial_support import router as financial_support_router
from app.api.chatbot import router as chatbot_router
from app.api.auth import router as auth_router
app = FastAPI(
    title="StemConnect API"
)
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================
# STATIC PHOTO ACCESS
# =====================================

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# =====================================
# API ROUTERS
# =====================================

app.include_router(donor_router)
app.include_router(patient_router)
app.include_router(financial_support_router)
app.include_router(chatbot_router)
app.include_router(auth_router)