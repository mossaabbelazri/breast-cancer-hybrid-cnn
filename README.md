# 🧠 Breast Cancer Tumor Detection & Classification (Hybrid CNN-SVM with NoSQL)

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

## 📌 Project Overview

This project implements an intelligent Deep Learning system for the **detection and classification of breast cancer tumors** using medical imaging (mammography).

The system utilizes a **Hybrid Model (CNN for feature extraction + SVM for classification)** to analyze the images with high accuracy. The backend is powered by a **NoSQL Database (MongoDB Atlas)** to securely store prediction results, patient records, and medical metadata. Additionally, the application features an **interactive React Dashboard** designed for healthcare professionals.

---

## 🎯 Key Achievements

* ✅ Automated tumor detection in mammography images.
* ✅ Multi-class tumor classification: **Normal**, **Benign**, or **Malignant**.
* ✅ Seamless integration of a Hybrid Model combining Deep Learning (CNN) and classical Machine Learning (SVM).
* ✅ Scalable and flexible metadata storage using NoSQL (MongoDB).
* ✅ Real-time inference API built with Flask/FastAPI.
* ✅ Interactive web dashboard (React) to display patient records and predictions.

---

## 📂 Dataset

The model is trained on a robust public dataset available on Kaggle:

👉 [Mammography Dataset (INbreast, MIAS, DDSM)](https://www.kaggle.com/datasets/emiliovenegas1/mammography-dataset-from-inbreast-mias-and-ddsm)

### 📊 Dataset Details

* Contains mammography images classified into:
  * **Normal**
  * **Benign**
  * **Malignant**
* Curated from widely recognized databases: INbreast, MIAS, and DDSM.
* Images are pre-processed and augmented (Data Augmentation) to improve model generalization.

---

## 🏗️ Architecture

```bash
project/
│
├── data/                   # Raw, processed, and annotated data
├── notebooks/              # Exploratory Data Analysis (EDA)
├── src/
│   ├── preprocessing/      # Data cleaning & transformations
│   ├── models/             # Models (cnn_model.py, hybrid_model.py, train.py)
│   ├── evaluation/         # Performance metrics
│   ├── database/           # MongoDB connection (mongo.py)
│   └── api/                # Flask/FastAPI backend (app.py)
│
├── frontend/               # React Web Application (Dashboard, PatientDetails)
├── models/                 # Saved models (.h5, .pkl)
├── config/                 # Project configurations
├── tests/                  # Unit and integration tests
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Technology Stack

* **Backend & AI**: Python, TensorFlow / Keras, Scikit-Learn (SVM), OpenCV
* **Database**: MongoDB Atlas (NoSQL), PyMongo
* **API Framework**: Flask / FastAPI
* **Frontend**: React.js, TailwindCSS / Vanilla CSS
* **Deployment**: Docker

---

## 📊 Project Pipeline

1. **Preprocessing**: Image resizing, normalization, and data augmentation.
2. **Hybrid Model Execution**: 
   * **CNN**: Acts as an automatic feature extractor.
   * **SVM**: Replaces the final classification layer to enhance prediction boundaries (Normal, Benign, Malignant).
3. **API & Database**: Secure saving of patient metadata and model predictions directly to MongoDB.
4. **Web Interface**: Real-time display of predictions on a React dashboard for clinical review.

---

## 🧪 Installation

```bash
git clone https://github.com/your-username/breast-cancer-hybrid-cnn.git
cd breast-cancer-hybrid-cnn

# 1. Backend Installation (Python)
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt

# 2. Frontend Installation (React)
cd frontend
npm install
cd ..
```

---

## 🚀 Usage

### ▶️ 1. Train the Hybrid Model
```bash
python src/models/train.py
```

### ▶️ 2. Start the API (Backend)
```bash
python src/api/app.py
```
*The API will be available at `http://localhost:5000` or `http://localhost:8000`.*

### ▶️ 3. Start the Dashboard (Frontend)
```bash
cd frontend
npm start
```
*The web interface will be accessible at `http://localhost:3000`.*

---

## 🔌 API Endpoints

### 📤 Upload Image for Prediction

```http
POST /predict
```
**JSON Response:**
```json
{
  "prediction": "malignant",
  "confidence": 0.94,
  "patient_id": "12345"
}
```

---

## 🗄️ Database (MongoDB)

We utilize **MongoDB Atlas** for scalable NoSQL storage.

**Patient/Prediction Document Structure:**
```json
{
  "_id": "ObjectId('...')",
  "patient_name": "Jane Doe",
  "age": 45,
  "image_path": "/uploads/mammography_1.png",
  "prediction": "malignant",
  "confidence": 0.94,
  "model_version": "hybrid_cnn_svm_v1",
  "date": "2026-04-26T18:00:00Z"
}
```

---

## 📈 Model Evaluation

The hybrid model's performance is heavily evaluated using the following metrics, with a strict emphasis on **Recall (Sensitivity)** to critically minimize false medical negatives:
* Accuracy
* Precision & Recall
* F1-score
* Confusion Matrix

---

## 🚀 Future Enhancements

* **Explainable AI (Grad-CAM)**: To visually highlight the affected areas on the mammogram for the physician.
* **Full Cloud Deployment**: Scaling the architecture using AWS or GCP.
* **Clinical Trials**: Expanding the dataset and testing in real-world diagnostic workflows.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
