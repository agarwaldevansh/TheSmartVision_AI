---
title: SmartVision-API
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# 🚀 AI Vision Studio

This is the Python AI backend for the AI Vision Studio mobile application. It uses **FastAPI**, **OpenCV**, and **TensorFlow/Keras** to process images and run predictive machine learning models.

## 📱 The Ecosystem
This backend connects to a React Native (Expo) mobile app that features three distinct AI modules:
1. **Digit Recognition:** Analyzes hand-drawn numbers.
2. **Object/Doodle Classification:** Detects doodles (e.g., car, tree, apple).
3. **Text Extraction (OCR):** Extracts document text.

## ⚙️ Image Preprocessing Pipeline (Crucial Context)
* **Transparency Handling:** Mobile WebViews occasionally pass alpha channels. The backend decodes images using `cv2.IMREAD_UNCHANGED`. If a 4-channel image is detected, a custom script isolates the alpha mask, generates a solid white background, and overlays the dark strokes before converting to grayscale.
* **Fallback Inversion:** If the resulting image is still detected as mostly black (`np.mean < 127`), it triggers a `bitwise_not` inversion to ensure dark strokes on a white background.
* **Edge Detection (Doodle Route):** The doodle classifier uses `cv2.GaussianBlur` followed by `cv2.Canny(50, 150)` to isolate sharp pen lines.

## 🚀 Deployment
This server is containerized via Docker and configured to run on Hugging Face Spaces using a Python 3.10 environment with Tesseract-OCR installed at the system level.