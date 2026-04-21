import cv2
import numpy as np

# Create a dummy grayscale image (128x128)
img = np.random.randint(0, 255, (128, 128), dtype=np.uint8)
cv2.imwrite("test_sample.png", img)
print("Created test_sample.png")
