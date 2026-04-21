import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Users, Image as ImageIcon, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        patients: 0,
        images: 0,
        benign: 0,
        malignant: 0,
        normal: 0
    });

    useEffect(() => {
        async function fetchAggregateStats() {
            try {
                const patients = await api.getPatients();
                let totalImages = 0;
                let benign = 0;
                let malignant = 0;
                let normal = 0;

                for (const pt of patients.slice(0, 50)) {
                    const imgs = await api.getImagesByPatient(pt._id);
                    totalImages += imgs.length;
                    imgs.forEach(img => {
                        if (img.prediction === 'malignant') malignant++;
                        else if (img.prediction === 'benign') benign++;
                        else normal++;
                    });
                }

                setStats({
                    patients: patients.length,
                    images: totalImages,
                    benign,
                    malignant,
                    normal
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        }
        fetchAggregateStats();
    }, []);

    const totalAnalyzed = stats.benign + stats.malignant + stats.normal;
    const benignPercentage = totalAnalyzed === 0 ? 0 : Math.round((stats.benign / totalAnalyzed) * 100);
    const malignantPercentage = totalAnalyzed === 0 ? 0 : Math.round((stats.malignant / totalAnalyzed) * 100);
    const normalPercentage = totalAnalyzed === 0 ? 0 : Math.round((stats.normal / totalAnalyzed) * 100);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Overview / Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg"><Users className="w-6 h-6 text-primary-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Patients</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.patients}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg"><ImageIcon className="w-6 h-6 text-blue-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Scans</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.images}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-emerald-100 p-3 rounded-lg"><ShieldCheck className="w-6 h-6 text-emerald-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Normal</p>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-2xl font-bold text-slate-800">{stats.normal}</p>
                            <span className="text-sm font-medium text-emerald-600">({normalPercentage}%)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Benign</p>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-2xl font-bold text-slate-800">{stats.benign}</p>
                            <span className="text-sm font-medium text-green-600">({benignPercentage}%)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Malignant</p>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-2xl font-bold text-slate-800">{stats.malignant}</p>
                            <span className="text-sm font-medium text-red-600">({malignantPercentage}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mt-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">System Status</h3>
                <p className="text-slate-600">Mammary Tumor Detection AI is <strong>Online</strong> and connected to MongoDB.</p>
            </div>
        </div>
    );
}
