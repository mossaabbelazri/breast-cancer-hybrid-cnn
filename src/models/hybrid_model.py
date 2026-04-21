import os
import joblib
import numpy as np
from tensorflow.keras.applications import VGG16
from tensorflow.keras.applications.vgg16 import preprocess_input
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

class HybridCNN_SVM:
    def __init__(self, input_shape=(128, 128, 3), random_state=42):
        self.input_shape = input_shape
        # Base CNN : VGG16 (pré-entraîné sur ImageNet), on retire la tête (include_top=False)
        self.cnn_extractor = VGG16(weights='imagenet', include_top=False, input_shape=self.input_shape)
        
        # On gèle le réseau CNN car on ne l'utilise que comme extracteur de forme/texture
        self.cnn_extractor.trainable = False
        
        # Classificateur SVM : probability=True permet d'obtenir le degré de confiance
        self.svm_classifier = SVC(kernel='rbf', probability=True, random_state=random_state)
        
    def _preprocess_for_vgg(self, X):
        """
        VGG16 s'attend à un prétraitement spécifique (centrage 0, format BGR).
        Assure également que les tenseurs sont en float32.
        """
        # Note : Si les mammographies sont en niveaux de gris (1 shape au lieu de 3),
        # il faudra s'assurer en amont de dupliquer la couche de gris 3 fois (np.repeat).
        return preprocess_input(X.astype('float32'))

    def extract_features(self, X):
        """
        Passe un lot d'images au travers de VGG16 pour extraire leurs caractéristiques vectorielles 1D.
        """
        print(f"Extraction automatique des features pour {len(X)} images via VGG16...")
        X_prep = self._preprocess_for_vgg(X)
        features = self.cnn_extractor.predict(X_prep, verbose=0)
        
        # Le tenseur (batch, H, W, Canaux) est aplati en 2D : (batch, features) pour le classificateur
        features_flattened = features.reshape(features.shape[0], -1)
        return features_flattened

    def train(self, X_train, y_train):
        """
        Lance le pipeline entier :
        1. Extrait les features visuelles des images via le CNN profond.
        2. Entraîne le SVM sur ces descripteurs.
        """
        features_train = self.extract_features(X_train)
        print("Entraînement du SVM en cours...")
        self.svm_classifier.fit(features_train, y_train)
        print("Entraînement terminé avec succès.")
        
    def evaluate(self, X_test, y_test):
        """
        Évalue le modèle complet sur le jeu de test.
        """
        features_test = self.extract_features(X_test)
        predictions = self.svm_classifier.predict(features_test)
        acc = accuracy_score(y_test, predictions)
        return acc

    def predict_image(self, img_array):
        """
        Prédit la classe et la probabilité pour une unique image préparée (ex: envoyée par l'API).
        """
        if len(img_array.shape) == 3:
            img_array = np.expand_dims(img_array, axis=0) # Ajout de la dimension batch
            
        features = self.extract_features(img_array)
        prediction = self.svm_classifier.predict(features)[0]
        probabilities = self.svm_classifier.predict_proba(features)[0]
        
        return prediction, probabilities

    def save_model(self, save_dir="models", svm_filename="hybrid_svm.pkl"):
        """
        Sauvegarde uniquement l'intelligence finale (le SVM). 
        Le VGG16 étant un composant générique, Keras le rechargera à la volée.
        """
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        svm_path = os.path.join(save_dir, svm_filename)
        joblib.dump(self.svm_classifier, svm_path)
        print(f"Modèle SVM sauvegardé sous : {svm_path}")
        
    def load_model(self, model_path):
        """
        Charge un modèle SVM qui a été préalablement entraîné.
        """
        if os.path.exists(model_path):
            self.svm_classifier = joblib.load(model_path)
            print(f"Modèle SVM chargé avec succès depuis : {model_path}")
            return True
        else:
            print(f"Erreur : Aucun modèle trouvé à l'emplacement {model_path}")
            return False
