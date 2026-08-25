import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText, Upload, BrainCircuit, Activity, Trash2, LayoutGrid, Sparkles, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ totalDocuments: 0, flashcardCount: 0, quizzesTaken: 0, averageScore: 0 });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

    e.target.value = '';

    if (!user?.token) {
      logout();
      navigate('/login');
      alert('Please sign in again before uploading a PDF.');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Upload failed: Only PDFs are allowed');
      return;
    }
    
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      setUploading(true);
      await api.post('/documents/upload', formData);
      await fetchDashboardData();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    {
      label: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      badge: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Flashcards',
      value: stats.flashcardCount,
      icon: LayoutGrid,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      badge: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Quizzes Taken',
      value: stats.quizzesTaken,
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-20 border-b border-slate-200/60 px-6 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">Learn<span className="gradient-text">AI</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-200 hover:border-red-200 bg-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="mt-1.5 text-slate-500 text-sm">Here's your learning overview. Keep it up!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat) => (
            <div key={stat.label} className={`card-hover bg-white rounded-2xl border ${stat.border} p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.badge}`}>
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Documents Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Your Documents</h2>
            <p className="text-sm text-slate-500 mt-0.5">Click any document to open its AI workspace</p>
          </div>
          <label className={`cursor-pointer flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload PDF
              </>
            )}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* Documents */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="h-36 shimmer" />
                <div className="p-5 space-y-2">
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No documents yet</h3>
            <p className="text-slate-400 max-w-xs mx-auto">
              Upload your first PDF to unlock AI-powered chat, flashcards, and quizzes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/workspace/${doc._id}`)}
                className="card-hover bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group shadow-sm"
              >
                <div className="h-36 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center relative border-b border-slate-100">
                  <FileText size={48} className="text-indigo-200 group-hover:text-indigo-400 transition-colors" />
                  <button
                    onClick={(e) => deleteDocument(doc._id, e)}
                    title="Delete document"
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-slate-100"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-bold bg-white/80 backdrop-blur-sm text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">PDF</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 truncate text-sm mb-3" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </h3>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-500 group-hover:text-indigo-700 transition-colors">
                    Open Workspace <ChevronRight size={14} />
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
