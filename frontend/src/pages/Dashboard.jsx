import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText, Upload, BrainCircuit, Activity, Trash2 } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ totalDocuments: 0, flashcardCount: 0, quizzesTaken: 0, averageScore: 0 });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, docsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/documents')
      ]);
      setStats(statsRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const deleteDocument = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(doc => doc._id !== id));
      setStats(prev => ({ ...prev, totalDocuments: prev.totalDocuments - 1 }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      setLoading(true);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDashboardData();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-blue-600">
          <BrainCircuit size={28} />
          <span className="text-xl font-bold text-slate-800">LearnAI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
            {user?.name}
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Flashcards', value: stats.flashcardCount, icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Quizzes Taken', value: stats.quizzesTaken, icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Average Score', value: `${stats.averageScore}%`, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Documents Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Your Workspace</h2>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium text-sm flex items-center gap-2 transition-colors">
            <Upload size={18} />
            Upload PDF
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center">
            <div className="bg-blue-50 p-6 rounded-full text-blue-500 mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No documents yet</h3>
            <p className="text-slate-500 mb-6">Upload your first PDF to start generating flashcards and quizzes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div 
                key={doc._id} 
                onClick={() => navigate(`/workspace/${doc._id}`)}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-b border-slate-100 relative">
                  <FileText size={48} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <button 
                    onClick={(e) => deleteDocument(doc._id, e)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800 truncate mb-1" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </h3>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-3">
                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
