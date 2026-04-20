import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const api = {
    // Patients
    getPatients: () => axios.get(`${API_BASE_URL}/patients`).then(res => res.data),
    getPatient: (id) => axios.get(`${API_BASE_URL}/patients/${id}`).then(res => res.data),
    createPatient: (data) => axios.post(`${API_BASE_URL}/patients`, data).then(res => res.data),

    // Images/Predictions
    getImagesByPatient: (patientId) => axios.get(`${API_BASE_URL}/images/${patientId}`).then(res => res.data),
    predictImage: (file, patientId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (patientId) {
            formData.append('patient_id', patientId);
        }
        return axios.post(`${API_BASE_URL}/predict`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },

    // Stats (simulated via fetching patients and images for now)
    // In a real app we would have a dedicated endpoint for dashboard stats
    getImageUrl: (imageId) => `${API_BASE_URL}/image/${imageId}`
};
