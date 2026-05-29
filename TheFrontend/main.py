# main.py
# ---------------------------------------------------------------
# SmartVisionAI — FastAPI Backend (Connected Version)
# ---------------------------------------------------------------
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware  # Added for Connection
from app.ocr import extract_text_from_image
from app.digit_recognition import predict_digit, load_model as load_digit_model
from app.doodle_recognition import predict_doodle, load_doodle_model
import uvicorn

app = FastAPI(
    title="SmartVisionAI",
    description="Handwritten text, digit, and doodle recognition API",
    version="2.0.0",
)

# ── 1. THE SECURITY BRIDGE (CORS) ──────────────────────────────────────────
# This allows your mobile app (Expo Go) to talk to this Replit server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all devices
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, etc.
    allow_headers=["*"],
)

# ── STARTUP ──────────────────────────────────────────────────────────────────


@app.on_event("startup")
async def startup_event():
    print("=" * 40)
    print("  SmartVisionAI Backend Starting...")
    print("=" * 40)
    load_digit_model()
    load_doodle_model()
    print("💡 OCR will load on first /ocr request")
    print("✅ Backend is ready!")
    print("=" * 40)


# ── HOME ─────────────────────────────────────────────────────────────────────


@app.get("/")
def home():
    return {
        "status": "online",
        "app": "SmartVisionAI",
        "endpoints": {
            "ocr": "POST /ocr",
            "digit": "POST /predict-digit",
            "doodle": "POST /predict-doodle",
        },
    }


# ── FEATURE 1: OCR ───────────────────────────────────────────────────────────


@app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    print(f"📥 OCR Request: {file.filename}")
    data = await file.read()
    result = extract_text_from_image(data)
    # Ensure result keys match what the frontend expects
    print(f"📤 OCR Result: {result}")
    return result


# ── FEATURE 2: SINGLE DIGIT ─────────────────────────────────────────────────


@app.post("/predict-digit")
async def digit_endpoint(file: UploadFile = File(...)):
    print(f"📥 Single Digit Request: {file.filename}")
    data = await file.read()
    result = predict_digit(data)
    print(f"📤 Single Digit Result: {result}")
    return result


# ── FEATURE 3: DOODLE RECOGNITION ────────────────────────────────────────────


@app.post("/predict-doodle")
async def doodle_endpoint(file: UploadFile = File(...)):
    print(f"📥 Doodle Request: {file.filename}")
    data = await file.read()
    result = predict_doodle(data)
    print(f"📤 Doodle Result: {result}")
    return result


# ── RUN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Replit usually runs on 0.0.0.0 and port 8080
    uvicorn.run(app, host="0.0.0.0", port=8080)
