import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Lightbulb, Layers, Target, FileText, BrainCircuit } from 'lucide-react';
import api from '../api/axios';

import AIChatTab from '../components/workspace/AIChatTab';
import AIActionsTab from '../components/workspace/AIActionsTab';
import FlashcardsTab from '../components/workspace/FlashcardsTab';
import QuizzesTab from '../components/workspace/QuizzesTab';

const tabs = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-indigo-500' },
  { id: 'actions', label: 'AI Actions', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-violet-500' },
  { id: 'quizzes', label: 'Quizzes', icon: Target, color: 'text-emerald-500' },
];

const Workspace = () => {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${documentId}`);
      setDocument(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BrainCircuit size={32} className="text-indigo-500 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <FileText size={32} className="text-red-400" />
        </div>
        <p className="text-slate-600 font-semibold">Document not found</p>
        <Link to="/dashboard" className="text-indigo-600 text-sm font-semibold hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Workspace Header */}
      <header className="glass border-b border-slate-200/60 h-16 flex items-center justify-between px-5 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 p-2 rounded-xl border border-slate-200 hover:border-indigo-200 flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-indigo-600" />
            </div>
            <h1 className="font-bold text-slate-800 text-sm truncate">{document.originalFilename}</h1>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? tab.color : ''} />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Document Viewer */}
        <section className="w-1/2 h-full border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
            <FileText size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 truncate">Document View</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5 leading-snug">{document.originalFilename}</h2>
            <div className="text-sm text-slate-600 leading-loose whitespace-pre-wrap font-light">
              {document.extractedText}
            </div>
          </div>
        </section>

        {/* Right: AI Panel */}
        <section className="w-1/2 h-full bg-slate-50 flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-white flex-shrink-0">
            {activeTabConfig && (
              <>
                <activeTabConfig.icon size={14} className={activeTabConfig.color} />
                <span className="text-xs font-bold text-slate-700">{activeTabConfig.label}</span>
              </>
            )}
          </div>
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden p-5">
            {activeTab === 'chat' && <AIChatTab documentId={document._id} />}
            {activeTab === 'actions' && <AIActionsTab documentId={document._id} />}
            {activeTab === 'flashcards' && <FlashcardsTab documentId={document._id} />}
            {activeTab === 'quizzes' && <QuizzesTab documentId={document._id} />}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Workspace;
