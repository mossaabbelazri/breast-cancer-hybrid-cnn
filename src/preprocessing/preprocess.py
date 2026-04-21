import cv2
import numpy as np

def preprocess_image(image_bytes, img_size=128):
    """
    Standard preprocessing for mammography images.
    - Decodes bytes to grayscale
    - Resizes to specified img_size
    - Normalizes to [0, 1]
    - Reshapes for batch inference (1, H, W, 1)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    
    if img is None:
        raise ValueError("Invalid image file")
    
    img = cv2.resize(img, (img_size, img_size))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=(0, -1)) # Shape: (1, img_size, img_size, 1)
    
    return img
