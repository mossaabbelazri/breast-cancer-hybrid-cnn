# 🧠 Détection et Classification des Tumeurs Mammaires par CNN Hybride avec Stockage NoSQL

## 📌 Description du projet

Ce projet a pour objectif de développer un système intelligent basé sur le Deep Learning pour la **détection et la classification des tumeurs mammaires** à partir d’images médicales (mammographies).

Le système utilise un **CNN hybride** pour analyser les images et une base de données **NoSQL (MongoDB)** pour stocker les résultats et les métadonnées.

---

## 🎯 Objectifs

* Détecter automatiquement les tumeurs dans les images mammaires
* Classifier les tumeurs en **bénignes** ou **malignes**
* Stocker les résultats dans une base NoSQL
* Fournir une API pour interagir avec le modèle

---

## 🏗️ Architecture du projet

```
project/
│
├── data/
│   ├── raw/                # Données brutes (images)
│   ├── processed/          # Données prétraitées
│   └── annotations/        # Labels
│
├── notebooks/
│   └── exploration.ipynb   # Analyse exploratoire
│
├── src/
│   ├── preprocessing/
│   │   └── preprocess.py   # Nettoyage & transformation
│   │
│   ├── models/
│   │   ├── cnn_model.py    # CNN de base
│   │   ├── hybrid_model.py # CNN hybride
│   │   └── train.py        # Entraînement
│   │
│   ├── evaluation/
│   │   └── metrics.py      # Accuracy, Precision, Recall
│   │
│   ├── database/
│   │   └── mongo.py        # Connexion MongoDB
│   │
│   ├── api/
│   │   └── app.py          # API Flask/FastAPI
│   │
│   └── utils/
│       └── helpers.py      # Fonctions utilitaires
│
├── models/                 # Modèles sauvegardés
│   └── best_model.h5
│
├── config/
│   └── config.yaml         # Paramètres du projet
│
├── tests/
│   └── test_model.py
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Technologies utilisées

* Python
* TensorFlow / Keras ou PyTorch
* OpenCV
* MongoDB
* Flask / FastAPI
* Docker

---

## 📊 Pipeline du projet

1. **Collecte des données**
2. **Prétraitement**

   * Redimensionnement
   * Normalisation
   * Augmentation des données
3. **Entraînement du modèle CNN hybride**
4. **Évaluation du modèle**
5. **Déploiement via API**
6. **Stockage des résultats dans MongoDB**

---

## 🧪 Installation

```bash
# Cloner le projet
git clone https://github.com/username/breast-cancer-cnn.git
cd breast-cancer-cnn

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Installer les dépendances
pip install -r requirements.txt
```

---

## 🚀 Utilisation

### ▶️ Entraîner le modèle

```bash
python src/models/train.py
```

### ▶️ Lancer l’API

```bash
python src/api/app.py
```

---

## 🔌 API Endpoints

### 📤 Upload d’image

```
POST /predict
```

**Body :**

* image : fichier image

**Réponse :**

```json
{
  "prediction": "malignant",
  "confidence": 0.92
}
```

---

## 🗄️ Base de données (MongoDB)

### Exemple de document stocké :

```json
{
  "image_id": "12345",
  "prediction": "benign",
  "confidence": 0.87,
  "timestamp": "2026-04-19"
}
```

---

## 📈 Évaluation du modèle

* Accuracy
* Precision
* Recall
* F1-score
* Matrice de confusion

---

## 🐳 Docker

### Build et lancement

```bash
docker-compose up --build
```

---

## ⚠️ Limitations

* Dépendance à la qualité des données
* Besoin de validation médicale
* Ne remplace pas un professionnel de santé

---

## 🚀 Améliorations futures

* Interface web (React)
* Intégration de modèles pré-entraînés (ResNet, EfficientNet)
* Détection en temps réel
* Explicabilité (Grad-CAM)

---

## 👨‍💻 Auteur

**Oussama Es Salehy**
Master Big Data & Intelligence Artificielle

---

## 📄 Licence

Ce projet est à but académique.
