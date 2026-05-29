import keras
import numpy as np
import cv2

# --- THE MASTER KERAS 3 PATCH ---
# This intercepts Keras 3 and deletes old Keras 2 tags before they crash the server
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

# --- CONFIGURATION ---
CLASSES = ["car", "tree", "apple", "flower", "cat", "house"]
IMG_SIZE = 64
MODEL_FILE = "doodle_model_fixed.keras"
# ---------------------

model = None


def load_doodle_model():
    global model
    try:
        model = keras.models.load_model(MODEL_FILE, compile=False)
        print(f"✅ HD Doodle AI Loaded Successfully! Classes: {CLASSES}")
    except Exception as e:
        print(f"❌ Error loading model '{MODEL_FILE}': {e}")
        model = None


def preprocess_doodle(image_bytes):
    # 1. Decode Image (Read UNCHANGED to capture the Alpha/Transparency layer)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_unchanged = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

    if img_unchanged is None:
        return None

    # 2. THE TRANSPARENCY LENS
    if len(img_unchanged.shape) == 3 and img_unchanged.shape[2] == 4:
        alpha = img_unchanged[:, :, 3] / 255.0
        white_bg = np.ones_like(img_unchanged[:, :, :3], dtype=np.uint8) * 255
        for c in range(3):
            white_bg[:, :, c] = (
                alpha * img_unchanged[:, :, c] + (1 - alpha) * white_bg[:, :, c]
            )
        img = cv2.cvtColor(white_bg, cv2.COLOR_BGR2GRAY)
    elif len(img_unchanged.shape) == 3:
        img = cv2.cvtColor(img_unchanged, cv2.COLOR_BGR2GRAY)
    else:
        img = img_unchanged

    # 3. SAFETY NET
    if np.mean(img) < 127:
        img = cv2.bitwise_not(img)

    # 4. Gaussian Blur
    img = cv2.GaussianBlur(img, (5, 5), 0)

    # 5. HIGH-ACCURACY CANNY EDGE DETECTION
    img = cv2.Canny(img, 30, 120)

    # 6. Connect Gaps
    kernel = np.ones((3, 3), np.uint8)
    img = cv2.dilate(img, kernel, iterations=1)

    # 7. FIND & FILTER CONTOURS
    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return None

    largest_contour = max(contours, key=cv2.contourArea)

    if cv2.contourArea(largest_contour) < 100:
        return None

    mask = np.zeros_like(img)
    cv2.drawContours(mask, [largest_contour], -1, 255, thickness=cv2.FILLED)
    img = cv2.bitwise_and(img, mask)

    # 8. Crop to Content
    coords = cv2.findNonZero(img)
    if coords is None:
        return None
    x, y, w, h = cv2.boundingRect(coords)

    padding = 10
    x = max(x - padding, 0)
    y = max(y - padding, 0)
    w = min(w + padding * 2, img.shape[1] - x)
    h = min(h + padding * 2, img.shape[0] - y)

    digit = img[y : y + h, x : x + w]

    # 9. Resize to Fit 64x64 Box
    target_size = 50
    rows, cols = digit.shape

    if rows == 0 or cols == 0:
        return None

    if rows > cols:
        factor = target_size / rows
        rows = target_size
        cols = int(round(cols * factor))
    else:
        factor = target_size / cols
        cols = target_size
        rows = int(round(rows * factor))

    digit = cv2.resize(digit, (cols, rows), interpolation=cv2.INTER_AREA)

    # 10. Center Image on the Canvas
    final_img = np.zeros((IMG_SIZE, IMG_SIZE), dtype=np.uint8)
    pad_top = (IMG_SIZE - rows) // 2
    pad_left = (IMG_SIZE - cols) // 2
    final_img[pad_top : pad_top + rows, pad_left : pad_left + cols] = digit

    # 11. Final Polish & Normalize
    final_img = final_img.astype("float32") / 255.0
    final_img = final_img.reshape(1, IMG_SIZE, IMG_SIZE, 1)

    return final_img


def predict_doodle(image_bytes):
    if model is None:
        load_doodle_model()
        if model is None:
            return {"error": f"Model file '{MODEL_FILE}' not found."}

    try:
        processed_image = preprocess_doodle(image_bytes)

        if processed_image is None:
            return {"error": "No clear edges found. Try drawing a bit larger."}

        prediction = model.predict(processed_image)
        class_id = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        return {
            "doodle": CLASSES[class_id],
            "confidence": f"{confidence * 100:.2f}%",
            "Classes": CLASSES,
        }
    except Exception as e:
        return {"error": str(e)}
