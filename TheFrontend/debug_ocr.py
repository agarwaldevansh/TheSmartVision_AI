import shutil
import pytesseract
import os

# 1. Check if Tesseract is installed in the system
tesseract_cmd = shutil.which("tesseract")
print(f"🔍 Checking Tesseract System Path: {tesseract_cmd}")

if tesseract_cmd:
    print("✅ Tesseract is installed!")
else:
    print("❌ Tesseract NOT found. Did you create replit.nix?")

# 2. Check if Python can see it
try:
    version = pytesseract.get_tesseract_version()
    print(f"✅ Python binding working. Tesseract Version: {version}")
except Exception as e:
    print(f"❌ Python cannot communicate with Tesseract: {e}")

# 3. Check for English Language Data
# Tesseract needs 'eng.traineddata' to read english.
print("\n🔍 Checking for Language Data...")
try:
    # This command lists available languages
    languages = pytesseract.get_languages()
    print(f"📂 Available Languages: {languages}")

    if 'eng' in languages:
        print("✅ English data found. OCR should work.")
    else:
        print("⚠️ English data MISSING. We need to download it.")
except Exception as e:
    print(f"❌ Could not check languages: {e}")
