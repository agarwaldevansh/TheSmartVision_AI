# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies (Tesseract OCR is required for pytesseract)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code into the container
COPY . .

# Hugging Face Spaces route traffic to port 7860 by default
EXPOSE 7860

# Command to run the FastAPI app 
# IMPORTANT: Change "main:app" if your main python file is named something else (e.g., "app:app" if it is named app.py)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]