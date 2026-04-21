import os
<<<<<<< HEAD
import pymongo
from pymongo.errors import ConnectionFailure
import gridfs
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

class MongoDBClient:
    def __init__(self, uri=None, database_name="breast_cancer_db"):
        """
        Initialise le client MongoDB et se connecte à la base de données spécifiée.
        """
        self.uri = uri or os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.database_name = database_name
        self.client = pymongo.MongoClient(self.uri)
        self.db = self.client[self.database_name]
        
        # Initialisation de GridFS pour stocker les images de mammographies
        self.fs = gridfs.GridFS(self.db)

    def test_connection(self):
        """
        Teste la connexion au serveur MongoDB.
        """
        try:
            # La commande ping est utilisée pour vérifier la connexion
            self.client.admin.command('ping')
            print("Connexion à MongoDB réussie.")
            return True
        except ConnectionFailure as e:
            print(f"Échec de la connexion à MongoDB: {e}")
            return False

    def upload_image(self, file_data, filename, metadata=None):
        """
        Stocke une image dans GridFS avec des métadonnées optionnelles.
        
        :param file_data: Les données binaires de l'image (par exemple, retournées par file.read()).
        :param filename: Le nom du fichier.
        :param metadata: Un dictionnaire contenant des informations supplémentaires (patient_id, date, etc.).
        :return: L'ID du fichier enregistré (ObjectId).
        """
        if metadata is None:
            metadata = {}
        
        # Utilisation de GridFS pour stocker le fichier
        file_id = self.fs.put(file_data, filename=filename, metadata=metadata)
        return file_id

    def get_image(self, file_id):
        """
        Récupère une image depuis GridFS à partir de son ID.
        
        :param file_id: L'ObjectId du fichier.
        :return: Les données binaires de l'image, ou None si non trouvé.
        """
        try:
            file_data = self.fs.get(file_id).read()
            return file_data
        except gridfs.errors.NoFile:
            print(f"Aucune image trouvée dans GridFS pour l'ID: {file_id}")
            return None

if __name__ == "__main__":
    print("Tentative de connexion à MongoDB...")
    client = MongoDBClient()
    client.test_connection()
=======
from datetime import datetime
try:
    from pymongo import MongoClient
    from bson.binary import Binary
except ImportError:
    MongoClient = None
    Binary = None

class MammographyDB:
    def __init__(self, uri="mongodb://localhost:27017/", db_name="CNN_tumeurs"):
        self.client = None
        self.db = None
        if MongoClient:
            try:
                self.client = MongoClient(uri, serverSelectionTimeoutMS=2000)
                self.db = self.client[db_name]
                # Test connection
                self.client.server_info()
            except Exception as e:
                print(f"MongoDB connection failed: {e}")
                self.client = None
                self.db = None

    def save_patient(self, patient_data):
        """
        Saves a new patient to the 'patients' collection.
        Returns (id, error_message)
        """
        if self.db is None:
            return None, "Database not connected. Please start MongoDB."
            
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
        """
        Retrieves all patients from the 'patients' collection.
        """
        if self.db is not None:
            try:
                patients = list(self.db["patients"].find().sort("created_at", -1))
                for p in patients:
                    p["_id"] = str(p["_id"]) # Convert ObjectId to string for JSON
                return patients
            except Exception as e:
                print(f"Failed to get patients: {e}")
        return []

    def get_patient(self, patient_id):
        """
        Retrieves a single patient by ID.
        """
        if self.db is not None:
            try:
                from bson.objectid import ObjectId
                patient = self.db["patients"].find_one({"_id": ObjectId(patient_id)})
                if patient:
                    patient["_id"] = str(patient["_id"])
                return patient
            except Exception as e:
                print(f"Failed to get patient: {e}")
        return None

    def get_images_by_patient(self, patient_id):
        """
        Retrieves all predictions/images for a specific patient.
        """
        if self.db is not None:
            try:
                # Find all images associated with this patient
                images = list(self.db["predictions"].find({"patient_id": patient_id}).sort("timestamp", -1))
                for img in images:
                    img["_id"] = str(img["_id"])
                    # We don't want to return the raw binary 'image_data' in the JSON response
                    # as it will cause serialization issues and make the response huge.
                    # The frontend will fetch the image through a separate endpoint instead.
                    if "image_data" in img:
                        del img["image_data"]
                return images
            except Exception as e:
                print(f"Failed to get images for patient: {e}")
        return []

    def get_image(self, image_id):
        """
        Retrieves the binary image data for a specific prediction.
        """
        if self.db is not None:
            try:
                from bson.objectid import ObjectId
                record = self.db["predictions"].find_one({"_id": ObjectId(image_id)})
                if record and "image_data" in record:
                    return record["image_data"]
                return None
            except Exception as e:
                print(f"Failed to get image data: {e}")
        return None

    def save_prediction(self, prediction_data, image_bytes=None):
        """
        Saves prediction result and raw image data.
        """
        if self.db is not None:
            collection = self.db["predictions"]
            prediction_data["timestamp"] = datetime.utcnow()
            
            # Convert image to binary if provided
            if image_bytes and Binary:
                prediction_data["image_data"] = Binary(image_bytes)
            
            try:
                result = collection.insert_one(prediction_data)
                return str(result.inserted_id)
            except Exception as e:
                print(f"Failed to insert prediction: {e}")
        return None
>>>>>>> a0cd1975eafbed1422f1f595fb68973e7ff4f7a5
