import os
import sys

# Ajout du dossier racine au PYTHON_PATH pour que les imports 'src.x' fonctionnent
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import numpy as np
import io
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
from flask_cors import CORS

# Internal imports
from src.preprocessing.preprocess import preprocess_image
from src.database.mongo import MongoDBClient
from src.models.hybrid_model import HybridCNN_SVM

# Load environment variables absolutely from the project root
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env'))
load_dotenv(dotenv_path=env_path)

# Configure Flask to use correct folders relative to this file
app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')
CORS(app) # Enable CORS for all routes (important for React frontend)

# Configuration from .env
MODEL_PATH = os.getenv("MODEL_PATH", "models/hybrid_svm.pkl")
CLASS_NAMES = ['benign', 'malignant', 'normal']
PORT = int(os.getenv("PORT", 5000))
HOST = os.getenv("HOST", "0.0.0.0")

# Initialize components
model = None
db = MongoDBClient(
    uri=os.getenv("MONGO_URI", "mongodb://localhost:27017/"),
    database_name=os.getenv("DATABASE_NAME", "CNN_tumeurs")
)

def load_cnn_model():
    global model
    # Convert to absolute path to be safe
    abs_model_path = os.path.abspath(MODEL_PATH)
    if os.path.exists(abs_model_path):
        try:
            # Initialisation de notre modèle Hybride (charge VGG16 en base)
            model = HybridCNN_SVM(input_shape=(128, 128, 3))
            # Chargement de la "tête" intelligente SVM
            success = model.load_model(abs_model_path)
            
            if success:
                print(f"Hybrid Model loaded successfully from {abs_model_path}")
            else:
                model = None
        except Exception as e:
            print(f"Error loading model: {e}")
            model = None
    else:
        print(f"Model file not found at {abs_model_path}")

# Load model on startup
load_cnn_model()


@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({
        "message": "Mammography CNN Flask API is running",
        "model_loaded": model is not None,
        "database_connected": db.db is not None
    })

# --- Patient Routes ---

@app.route("/patients", methods=["GET"])
def list_patients():
    return jsonify(db.get_patients())

@app.route("/patients", methods=["POST"])
def create_patient():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Name is required"}), 400
    
    patient_id, error = db.save_patient(data)
    if patient_id:
        return jsonify({"id": patient_id, "message": "Patient created"}), 201
    return jsonify({"error": error or "Failed to create patient"}), 500

@app.route("/patients/<patient_id>", methods=["GET"])
def get_patient(patient_id):
    patient = db.get_patient(patient_id)
    if patient:
        return jsonify(patient)
    return jsonify({"error": "Patient not found"}), 404

# --- Image Routes ---

@app.route("/images/<patient_id>", methods=["GET"])
def list_images(patient_id):
    images = db.get_images_by_patient(patient_id)
    return jsonify(images)

@app.route("/image/<image_id>", methods=["GET"])
def get_image(image_id):
    image_data = db.get_image(image_id)
    if image_data:
        return send_file(
            io.BytesIO(image_data),
            mimetype='image/png', # Could dynamically detect format but frontend usually handles standard images fine
            as_attachment=False
        )
    return jsonify({"error": "Image not found"}), 404

# --- Prediction Route ---

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server"}), 503
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    patient_id = request.form.get("patient_id") # Optional patient link

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        contents = file.read()
        processed_img = preprocess_image(contents)
        
        # Inference avec le modèle Hybride
        prediction_val, probabilities = model.predict_image(processed_img)
        
        # prediction_val est l'index de la classe (0, 1 ou 2) retourné par le SVM
        predicted_class_idx = int(prediction_val)
        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = float(probabilities[predicted_class_idx])
        
        result = {
            "prediction": predicted_class,
            "confidence": round(confidence, 4),
            "all_scores": {CLASS_NAMES[i]: round(float(probabilities[i]), 4) for i in range(len(CLASS_NAMES))}
        }
        
        # Save to MongoDB
        db.save_prediction({
            "patient_id": patient_id,
            "filename": file.filename,
            "prediction": result["prediction"],
            "confidence": result["confidence"]
        }, image_bytes=contents) # Save raw image!
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 400

if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=False)
