import numpy as np
import os

# Ajustement pour pouvoir importer depuis src
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from src.models.hybrid_model import HybridCNN_SVM

def create_dummy_data(num_samples=50):
    """
    Fonction utilitaire pour créer des fausses données au format image
    afin de pouvoir tester que le pipeline fonctionne avant d'avoir connecté le vrai Dataset.
    """
    X = np.random.randint(0, 255, size=(num_samples, 128, 128, 3))
    y = np.random.randint(0, 3, size=(num_samples,)) # 3 classes: benign, malignant, normal
    return X, y

def main():
    print("--- Démarrage de l'entraînement du Modèle Hybride ---")
    
    # Étape 1 : Chargement des données
    # TODO: Remplacer ceci par le script de chargement de votre véritable dataset (INbreast, MIAS, etc.)
    print("Chargement des données d'entraînement (dummy)...")
    X_train, y_train = create_dummy_data(100)
    X_test, y_test = create_dummy_data(20)
    print(f"Taille du jeu d'entraînement : {X_train.shape}")
    
    # Étape 2 : Initialisation du modèle Hybride
    # Pour l'imagerie médicale, VGG attend 3 canaux (RGB). Si vos images sont N&B, votre preprocess devra les empiler.
    model = HybridCNN_SVM(input_shape=(128, 128, 3))
    
    # Étape 3 : Entraînement
    model.train(X_train, y_train)
    
    # Étape 4 : Évaluation
    accuracy = model.evaluate(X_test, y_test)
    print(f"Précision (Accuracy) sur le jeu de test : {accuracy * 100:.2f}%")
    
    # Étape 5 : Sauvegarde
    # Le modèle SVM est sauvegardé dans le dossier models/ du répertoire courant racine
    save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))
    model.save_model(save_dir=save_path, svm_filename="hybrid_svm.pkl")
    print("--- Fin du Processus ---")

if __name__ == "__main__":
    main()
