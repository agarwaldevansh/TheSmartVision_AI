# 🚀 SmartVision AI

SmartVision AI is a full-stack, cross-platform mobile application that bridges the gap between analog ideation and digital data. By combining an interactive digital drawing canvas with three specialized Computer Vision models, it instantly extracts and classifies handwritten text, single digits, and hand-drawn objects.

## ✨ Features

* **Interactive Digital Canvas:** Draw directly on the screen using a built-in signature pad with dynamic stroke thickness and erasure tools.
* **Photo Upload & Camera Integration:** Import existing photos from your gallery or capture them live.
* **Three Specialized AI Engines:**
  * **Text Recognition (OCR):** Extracts handwritten words and paragraphs using EasyOCR, enhanced with a custom two-stage Regex and Spellchecker pipeline for high accuracy.
  * **Digit Analysis:** Classifies handwritten numbers (0-9) using a custom Convolutional Neural Network (CNN) trained on the MNIST dataset.
  * **Object Vision:** Recognizes specific hand-drawn doodles (e.g., tree, car, apple) using a custom Canny Edge Detection pipeline and CNN.
* **Real-time Confidence Scoring:** Displays the AI's confidence percentage alongside the predicted result.

---

## 🛠️ Tech Stack

### **Frontend (The Mobile Client)**
* **Framework:** React Native & Expo
* **UI/UX:** Custom Neon-Glassmorphism styling, React Native Signature Canvas
* **State Management:** React Hooks (`useState`, `useRef`)
* **Network:** Asynchronous `fetch` API for `multipart/form-data` uploads

### **Backend (The API Server)**
* **Framework:** FastAPI & Uvicorn (Python)
* **Hosting:** Replit (or any cloud VPS)
* **Image Processing:** OpenCV (`cv2`), NumPy, SciPy

### **Machine Learning & AI**
* **OCR:** EasyOCR (PyTorch base)
* **Image Classification:** TensorFlow & Keras (Custom `.keras` CNN models)

---

## 🏗️ System Architecture

1. **User Input:** The user draws on the mobile canvas or uploads a photo.
2. **Client Request:** The React Native app packages the image into a `FormData` object and sends an HTTP POST request to the FastAPI server.
3. **Preprocessing:** The backend receives the image and uses OpenCV to clean it (Gaussian Blur, Adaptive Thresholding, Canny Edge Detection, Centering).
4. **Prediction:** The cleaned 64x64 pixel image is fed into the respective TensorFlow/Keras model or EasyOCR engine.
5. **Response:** The backend returns a JSON payload containing the detected label (`extracted_text`, `digit`, or `doodle`) and a confidence score, which the mobile app displays in a modal.

---

## 🚀 Installation & Setup

To run this project locally, you will need to start both the Backend API and the Frontend Mobile App.

### **1. Backend Setup (FastAPI)**
1. Clone the repository and navigate to the backend folder.
2. Install the required Python dependencies:
   ```bash
   pip install fastapi uvicorn tensorflow opencv-python-headless numpy easyocr pyspellchecker