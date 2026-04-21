import os
from datetime import datetime
import pymongo
from pymongo.errors import ConnectionFailure
import gridfs
from dotenv import load_dotenv
from bson.objectid import ObjectId

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

class MongoDBClient:
    def __init__(self, uri=None, database_name="breast_cancer_db"):
        """
        Initialise le client MongoDB et se connecte à la base de données spécifiée.
        """
        self.uri = uri or os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.database_name = database_name
        
        try:
            self.client = pymongo.MongoClient(self.uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[self.database_name]
            # Initialisation de GridFS pour stocker les images lourdes
            self.fs = gridfs.GridFS(self.db)
        except Exception as e:
            print(f"Échec de la connexion à MongoDB: {e}")
            self.client = None
            self.db = None
            self.fs = None

    def test_connection(self):
        """Teste la connexion au serveur MongoDB."""
        if not self.client:
            return False
        try:
            self.client.admin.command('ping')
            print("Connexion à MongoDB réussie.")
            return True
        except ConnectionFailure as e:
            print(f"Échec du test de connexion: {e}")
            return False

    def save_patient(self, patient_data):
        """Saves a new patient to the 'patients' collection."""
        if self.db is None:
            return None, "Database not connected."
            
        collection = self.db["patients"]
        patient_data["created_at"] = datetime.utcnow()
        try:
            result = collection.insert_one(patient_data)
            return str(result.inserted_id), None
        except Exception as e:
            err_msg = f"Failed to save patient: {str(e)}"
            print(err_msg)
            return None, err_msg

    def get_patients(self):
        """Retrieves all patients from the 'patients' collection."""
        if self.db is not None:
            try:
                patients = list(self.db["patients"].find().sort("created_at", -1))
                for p in patients:
                    p["_id"] = str(p["_id"])
                return patients
            except Exception as e:
                print(f"Failed to get patients: {e}")
        return []

    def get_patient(self, patient_id):
        """Retrieves a single patient by ID."""
        if self.db is not None:
            try:
                patient = self.db["patients"].find_one({"_id": ObjectId(patient_id)})
                if patient:
                    patient["_id"] = str(patient["_id"])
                return patient
            except Exception as e:
                print(f"Failed to get patient: {e}")
        return None

    def get_images_by_patient(self, patient_id):
        """Retrieves all predictions for a specific patient."""
        if self.db is not None:
            try:
                images = list(self.db["predictions"].find({"patient_id": patient_id}).sort("timestamp", -1))
                for img in images:
                    img["_id"] = str(img["_id"])
                    if "image_id" in img and isinstance(img["image_id"], ObjectId):
                        img["image_id"] = str(img["image_id"])
                return images
            except Exception as e:
                print(f"Failed to get images for patient: {e}")
        return []

    def upload_image(self, file_data, filename, metadata=None):
        """Stocke une image dans GridFS avec métadonnées."""
        if self.fs is None:
            return None
        if metadata is None:
            metadata = {}
        file_id = self.fs.put(file_data, filename=filename, metadata=metadata)
        return file_id

    def get_image(self, file_id):
        """Récupère la donnée binaire de l'image stockée dans GridFS."""
        if self.fs is not None:
            try:
                file_id_obj = ObjectId(file_id) if isinstance(file_id, str) else file_id
                file_data = self.fs.get(file_id_obj).read()
                return file_data
            except Exception as e:
                print(f"Failed to get image data: {e}")
        return None

    def save_prediction(self, prediction_data, image_bytes=None, filename="prediction_img.jpg"):
        """Saves a prediction result and its image into GridFS."""
        if self.db is not None:
            collection = self.db["predictions"]
            prediction_data["timestamp"] = datetime.utcnow()
            
            # Utilisation de GridFS au lieu de stocker en binaire dans la collection principale
            if image_bytes and self.fs:
                image_id = self.upload_image(image_bytes, filename, metadata={"type": "prediction"})
                if image_id:
                    prediction_data["image_id"] = image_id
            
            try:
                result = collection.insert_one(prediction_data)
                return str(result.inserted_id)
            except Exception as e:
                print(f"Failed to insert prediction: {e}")
        return None

if __name__ == "__main__":
    print("Tentative de connexion à MongoDB...")
    client = MongoDBClient()
    client.test_connection()
