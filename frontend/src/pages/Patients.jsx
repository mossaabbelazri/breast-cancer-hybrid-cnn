import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ChevronRight } from 'lucide-react';

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', age: '', identifier: '' });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await api.getPatients();
            setPatients(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createPatient({
                name: formData.name,
                age: parseInt(formData.age),
                identifier: formData.identifier
            });
            setShowForm(false);
            setFormData({ name: '', age: '', identifier: '' });
            fetchPatients();
        } catch (e) {
            console.error(e);
            alert('Error creating patient');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Patients Directory</h2>
                    <p className="text-slate-500 mt-1">Manage and view patient records</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Patient
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                        <input required type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border" placeholder="45" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID (optional)</label>
                        <input type="text" value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border" placeholder="PT-1034" />
                    </div>
                    <div>
                        <button type="submit" className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium">Save Record</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
                    <Search className="w-5 h-5 text-slate-400 mr-2" />
                    <input type="text" placeholder="Search patients..." className="bg-transparent border-none focus:ring-0 text-slate-700 w-full" />
                </div>
                <ul className="divide-y divide-slate-100">
                    {patients.map(p => (
                        <li key={p._id} className="hover:bg-slate-50 transition-colors">
                            <Link to={`/patients/${p._id}`} className="flex items-center justify-between p-4 px-6 cursor-pointer">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{p.name}</p>
                                        <p className="text-sm text-slate-500">ID: {p.identifier || p._id} • Age: {p.age}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </Link>
                        </li>
                    ))}
                    {patients.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No patients found. Add one to get started.</div>
                    )}
                </ul>
            </div>
        </div>
    );
}
