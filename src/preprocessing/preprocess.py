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
    # VGG16 a besoin d'images en couleurs (3 canaux). Imdecode va s'en occuper
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image file")
    
    img = cv2.resize(img, (img_size, img_size))
    # Ne PAS diviser par 255 ! VGG16 a sa propre logique avec preprocess_input()
    img = np.expand_dims(img, axis=0) # Ajout du lot (batch) : Shape (1, img_size, img_size, 3)
    
    return img
