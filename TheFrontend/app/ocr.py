import os
import json
import io
from PIL import Image
from tenacity import retry, stop_after_attempt, wait_exponential

# 1. Corrected 2026 SDK Imports
from google import genai
from google.genai import types

# 2. Initialize Gemini Client
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("⚠️ WARNING: GEMINI_API_KEY is not set in Secrets!")

try:
    # The new SDK uses a Client() object rather than global configuration
    client = genai.Client(api_key=api_key)
    print("✅ Gemini API Engine Initialized Successfully!")
except Exception as e:
    print(f"❌ Gemini Initialization Failed: {e}")
    client = None


# 3. Configure the Model
# Switched to the current state-of-the-art multimodal model
MODEL_NAME = "gemini-2.5-flash"

# The new SDK uses types.GenerateContentConfig for parameters
generation_config = types.GenerateContentConfig(
    temperature=0.1,  # Low temperature for factual transcription
    response_mime_type="application/json",  # Force strict JSON output
)


# 4. Image Optimization
# Inside app/ocr.py
def optimize_image_for_gemini(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes))

    # This prevents the "black square" bug from transparent phone images
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        white_bg = Image.new("RGB", img.size, (255, 255, 255))
        white_bg.paste(img, mask=img.convert("RGBA").split()[3])
        img = white_bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    return img


# 5. The Core OCR Function
# 5. The Core OCR Function
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def extract_text_from_image(image_bytes: bytes) -> dict:
    if client is None:
        return {"error": "Gemini client is not configured."}

    try:
        # CRITICAL FIX: Actually run the image through your white-background generator!
        clean_image = optimize_image_for_gemini(image_bytes)

        prompt = """
        You are an expert handwriting transcription AI. Read all handwritten text in this image.

        Rules:
        1. Transcribe the text exactly as written.
        2. Preserve original line breaks using standard newline characters.
        3. Do not add conversational intro text or metadata.

        Respond STRICTLY in this JSON format layout:
        {
            "extracted_text": "The full transcribed text goes here",
            "lines": ["Line 1", "Line 2"],
            "confidence": "95.00%"
        }
        """

        # Pass the clean_image directly into the contents array
        response = client.models.generate_content(
            model=MODEL_NAME, contents=[prompt, clean_image], config=generation_config
        )

        # Sanitize response string to protect against markdown blocks (```json ... ```)
        clean_text = response.text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.split("```")[1]
            if clean_text.startswith("json"):
                clean_text = clean_text[4:]
        clean_text = clean_text.strip("`").strip()

        result_json = json.loads(clean_text)

        return {
            "extracted_text": result_json.get("extracted_text", ""),
            "confidence": result_json.get("confidence", "95.00%"),
            "lines": result_json.get("lines", []),
            "source_type": "gemini_2.5_flash_vision",
        }

    except Exception as e:
        return {"error": f"Gemini Processing Error: {str(e)}"}
