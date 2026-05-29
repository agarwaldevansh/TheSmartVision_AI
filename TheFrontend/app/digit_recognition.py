import keras
import numpy as np
import cv2
from scipy import ndimage

# --- THE MASTER KERAS 3 PATCH ---
original_conv2d_init = keras.layers.Conv2D.__init__


def patched_conv2d_init(self, *args, **kwargs):
    kwargs.pop("batch_input_shape", None)
    kwargs.pop("batch_shape", None)
    original_conv2d_init(self, *args, **kwargs)


keras.layers.Conv2D.__init__ = patched_conv2d_init

original_dense_init = keras.layers.Dense.__init__


def patched_dense_init(self, *args, **kwargs):
    kwargs.pop("batch_input_shape", None)
    kwargs.pop("batch_shape", None)
    original_dense_init(self, *args, **kwargs)


keras.layers.Dense.__init__ = patched_dense_init

original_input_init = keras.layers.InputLayer.__init__


def patched_input_init(self, *args, **kwargs):
    if "batch_shape" in kwargs:
        kwargs["batch_input_shape"] = kwargs.pop("batch_shape")
    original_input_init(self, *args, **kwargs)


keras.layers.InputLayer.__init__ = patched_input_init
# --------------------------------

# Global placeholder for the model
model = None


def load_model():
    global model
    try:
        model = keras.models.load_model("handwriting_model_64.keras", compile=False)
        print("✅ High-Res Handwriting Model Loaded Successfully!")
    except Exception as e:
        print(f"❌ Error Loading Model: {e}")


def preprocess_digit(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    # Thresholding
    img = cv2.adaptiveThreshold(
        img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5
    )

    # Thicken lines for better detection
    kernel = np.ones((3, 3), np.uint8)
    img = cv2.dilate(img, kernel, iterations=1)

    # Find the Digit
    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    cnt = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(cnt)
    digit = img[y : y + h, x : x + w]

    # Resize to 48x48
    rows, cols = digit.shape
    factor = 48.0 / max(rows, cols)
    digit = cv2.resize(digit, (int(round(cols * factor)), int(round(rows * factor))))

    # Place in 64x64 Canvas
    final_box = np.zeros((64, 64), dtype=np.uint8)
    r, c = digit.shape
    start_r, start_c = (64 - r) // 2, (64 - c) // 2
    final_box[start_r : start_r + r, start_c : start_c + c] = digit

    # Smooth edges for AI
    final_box = cv2.GaussianBlur(final_box, (3, 3), 0)

    return final_box.astype("float32").reshape(1, 64, 64, 1) / 255.0


def predict_digit(image_bytes):
    global model
    if model is None:
        load_model()
    try:
        processed = preprocess_digit(image_bytes)
        if processed is None:
            return {"error": "Empty"}

        prediction = model.predict(processed)

        return {
            "digit": int(np.argmax(prediction)),
            "confidence": f"{np.max(prediction) * 100:.2f}%",
        }
    except Exception as e:
        return {"error": str(e)}
