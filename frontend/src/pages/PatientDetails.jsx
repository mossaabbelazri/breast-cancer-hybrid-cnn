import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { UploadCloud, ArrowLeft, Maximize2, Activity, Calendar } from 'lucide-react';

export default function PatientDetails() {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState('all'); // all, malignant, benign
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // For modal
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPatientData();
    }, [id]);

    const fetchPatientData = async () => {
        try {
            const pt = await api.getPatient(id);
            setPatient(pt);
            const imgs = await api.getImagesByPatient(id);
            setImages(imgs);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            await api.predictImage(selectedFile, id);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            await fetchPatientData();
        } catch (e) {
            console.error(e);
            alert('Upload or prediction failed.');
        } finally {
            setUploading(false);
        }
    };

    const filteredImages = images.filter(img => {
        if (filter === 'all') return true;
        return img.prediction === filter;
    });

    if (!patient) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Link to="/patients" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Patients
            </Link>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
                    <p className="text-slate-500 mt-1">Age: {patient.age} • Identifier: {patient.identifier || patient._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">Scans & Predictions</h3>
                            <div className="flex space-x-2">
                                {['all', 'malignant', 'benign', 'normal'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${filter === f ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredImages.map(img => (
                                <div key={img._id} className="relative group rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="aspect-square bg-slate-900 relative">
                                        <img
                                            src={api.getImageUrl(img.image_id)}
                                            alt="Scan"
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <button
                                            onClick={() => setSelectedImage(img)}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
                                        >
                                            <Maximize2 className="w-8 h-8 text-white" />
                                        </button>
                                        {/* Badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full shadow border ${img.prediction === 'malignant' || img.prediction === 'Malignant' ? 'bg-red-500 text-white border-red-600' : 'bg-green-500 text-white border-green-600'
                                                }`}>
                                                {img.prediction.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white">
                                        <p className="font-semibold text-slate-800 flex justify-between capitalize">
                                            {img.prediction}
                                            <span className="text-slate-500 text-sm">{(img.confidence * 100).toFixed(1)}%</span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(img.timestamp || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {filteredImages.length === 0 && (
                                <div className="col-span-2 p-8 text-center text-slate-500">No images found.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <UploadCloud className="w-5 h-5 mr-2 text-primary-600" />
                            New Analysis
                        </h3>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex justify-center items-center mb-3">
                                        <UploadCloud className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Click to upload mammogram</span>
                                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG</span>
                                </label>
                            </div>

                            {selectedFile && (
                                <div className="bg-slate-50 p-3 rounded-lg text-sm flex justify-between items-center border border-slate-200">
                                    <span className="truncate max-w-[200px] text-slate-700">{selectedFile.name}</span>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="bg-primary-600 text-white px-3 py-1 rounded shadow-sm text-xs font-bold hover:bg-primary-700 transition"
                                    >
                                        {uploading ? 'Analyzing...' : 'Predict'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="md:w-2/3 bg-black flex justify-center items-center p-4">
                            <img src={api.getImageUrl(selectedImage.image_id)} alt="Enlarged Scan" className="max-h-[80vh] object-contain" />
                        </div>
                        <div className="md:w-1/3 p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Scan Details</h3>
                                <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">&times;</button>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <p className="text-sm text-slate-500 uppercase tracking-wider mb-1 font-semibold">Prediction Result</p>
                                    <div className="flex items-center">
                                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${selectedImage.prediction === 'malignant' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        <span className="text-lg font-bold text-slate-800 capitalize">{selectedImage.prediction}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 uppercase tracking-wider mb-1 font-semibold">Confidence</p>
                                    <p className="text-3xl font-light text-slate-700">{(selectedImage.confidence * 100).toFixed(2)}%</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 uppercase tracking-wider mb-1 font-semibold">Diagnosis Date</p>
                                    <p className="text-md font-medium text-slate-700 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                        {new Date(selectedImage.timestamp || Date.now()).toLocaleString()}
                                    </p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100">
                                    <div className="bg-amber-50 text-amber-800 p-4 rounded-lg flex items-start text-sm">
                                        <Activity className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                        <p>AI predictions are for decision support only and should be verified by a licensed radiologist.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
