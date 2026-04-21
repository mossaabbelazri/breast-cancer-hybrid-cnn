import os
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
