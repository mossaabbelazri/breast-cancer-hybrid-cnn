import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Users, LayoutDashboard } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "bg-primary-50 text-primary-700 font-medium border-r-4 border-primary-600" : "text-slate-700 hover:bg-slate-100";
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Activity className="w-6 h-6 text-primary-600 mr-2" />
        <span className="text-xl font-bold text-slate-800">OncoVision</span>
      </div>
      <nav className="py-4 space-y-1">
        <Link to="/" className={`flex items-center px-6 py-3 transition-colors ${isActive('/')}`}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </Link>
        <Link to="/patients" className={`flex items-center px-6 py-3 transition-colors ${location.pathname.startsWith('/patients') ? "bg-primary-50 text-primary-700 font-medium border-r-4 border-primary-600" : "text-slate-700 hover:bg-slate-100"}`}>
          <Users className="w-5 h-5 mr-3" />
          Patients
        </Link>
      </nav>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 z-10 sticky top-0 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-800">Intelligent Mammogram Diagnostics</h1>
          </header>
          <div className="p-8 flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
