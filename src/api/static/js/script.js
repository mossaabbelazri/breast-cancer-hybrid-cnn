document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const dropZoneContent = document.querySelector('.drop-zone-content');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsPanel = document.getElementById('results-panel');
    const serverStatus = document.getElementById('server-status');

    // Patient Elements
    const patientSelect = document.getElementById('patient-select');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientModal = document.getElementById('patient-modal');
    const closeModal = document.getElementById('close-modal');
    const patientForm = document.getElementById('patient-form');
    const patientInfoCard = document.getElementById('patient-info-card');

    let selectedFile = null;
    let patients = [];

    // --- System Status ---
    async function checkStatus() {
        try {
            const res = await fetch('/status');
            const data = await res.json();
            if (data.message) {
                serverStatus.classList.add('online');
                serverStatus.innerHTML = '<span class="status-dot"></span> System Online';
            }
        } catch (e) {
            serverStatus.innerHTML = '<span class="status-dot"></span> System Offline';
        }
    }
    checkStatus();

    // --- Patient Management ---
    async function fetchPatients() {
        try {
            const res = await fetch('/patients');
            patients = await res.json();
            updatePatientSelect();
        } catch (e) { console.error("Failed to fetch patients", e); }
    }
    fetchPatients();

    function updatePatientSelect() {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>';
        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p._id;
            opt.textContent = p.name;
            patientSelect.appendChild(opt);
        });
    }

    patientSelect.addEventListener('change', () => {
        const p = patients.find(p => p._id === patientSelect.value);
        if (p) {
            document.getElementById('disp-age').textContent = p.age;
            document.getElementById('disp-gender').textContent = p.gender;
            document.getElementById('disp-history').textContent = p.history || 'None';
            patientInfoCard.classList.remove('hidden');
        } else {
            patientInfoCard.classList.add('hidden');
        }
    });

    addPatientBtn.addEventListener('click', () => patientModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => patientModal.classList.add('hidden'));

    patientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('p-name').value,
            age: parseInt(document.getElementById('p-age').value),
            gender: document.getElementById('p-gender').value,
            history: document.getElementById('p-history').value
        };

        try {
            const res = await fetch('/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                patientModal.classList.add('hidden');
                patientForm.reset();
                fetchPatients();
            } else {
                const errData = await res.json();
                alert("Failed to save patient: " + (errData.error || "Unknown error"));
            }
        } catch (err) {
            alert("Network error: Could not connect to the server.");
            console.error(err);
        }
    });

    // --- File Handling ---
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files[0]));

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files[0]);
    });

    function handleFiles(file) {
        if (file && file.type.startsWith('image/')) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (re) => {
                imagePreview.src = re.target.result;
                previewContainer.hidden = false;
                dropZoneContent.hidden = true;
                analyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = null;
        previewContainer.hidden = true;
        dropZoneContent.hidden = false;
        analyzeBtn.disabled = true;
        resultsPanel.classList.add('hidden');
        fileInput.value = '';
    });

    // --- Analysis ---
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        if (patientSelect.value) {
            formData.append('patient_id', patientSelect.value);
        }

        const btnText = analyzeBtn.querySelector('.btn-text');
        const loader = analyzeBtn.querySelector('.loader');

        analyzeBtn.disabled = true;
        btnText.style.opacity = '0.5';
        loader.hidden = false;

        try {
            const response = await fetch('/predict', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            showResults(result);
        } catch (error) {
            alert('Analysis failed: ' + error.message);
        } finally {
            analyzeBtn.disabled = false;
            btnText.style.opacity = '1';
            loader.hidden = true;
        }
    });

    function showResults(data) {
        resultsPanel.classList.remove('hidden');
        const label = document.getElementById('prediction-label');
        label.textContent = data.prediction;
        label.style.color = getSeverityColor(data.prediction);

        const percentage = Math.round(data.confidence * 100);
        const circle = document.getElementById('confidence-circle');
        const text = document.getElementById('confidence-text');

        circle.style.strokeDasharray = `${percentage}, 100`;
        circle.style.stroke = getSeverityColor(data.prediction);
        text.textContent = `${percentage}%`;

        // Scores Breakdown - we need to reach it. It might be outside or inside according to HTML
        // Let's check where to put it. I'll add a placeholder if missing.
        let breakdown = document.getElementById('scores-breakdown');
        if (!breakdown) {
            const bd = document.createElement('div');
            bd.id = 'scores-breakdown';
            bd.className = 'scores-breakdown';
            resultsPanel.querySelector('.result-display').appendChild(bd);
            breakdown = bd;
        }
        breakdown.innerHTML = '';

        Object.entries(data.all_scores).forEach(([name, score]) => {
            const p = Math.round(score * 100);
            const color = getSeverityColor(name);
            breakdown.innerHTML += `
                <div class="score-item">
                    <div class="score-header">
                        <span>${name.toUpperCase()}</span>
                        <span>${p}%</span>
                    </div>
                    <div class="score-bar-bg">
                        <div class="score-bar-fill" style="width: ${p}%; background: ${color}"></div>
                    </div>
                </div>
            `;
        });
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }

    function getSeverityColor(type) {
        switch (type.toLowerCase()) {
            case 'normal': return '#10b981';
            case 'benign': return '#f59e0b';
            case 'malignant': return '#ef4444';
            default: return '#06b6d4';
        }
    }
});
