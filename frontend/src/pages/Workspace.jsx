import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Lightbulb, Layers, Target, FileText } from 'lucide-react';
import api from '../api/axios';

// PDF Viewer (Optional placeholder if react-pdf is tricky in some environments)
// In a real production build with react-pdf, we'd setup the worker here.
// For simplicity in this UI iteration, we'll render a mock PDF viewer 
// or an iframe if the storedFilepath was served publicly.
// We will just show metadata and a placeholder for the PDF split screen.

import AIChatTab from '../components/workspace/AIChatTab';
import AIActionsTab from '../components/workspace/AIActionsTab';
import FlashcardsTab from '../components/workspace/FlashcardsTab';
import QuizzesTab from '../components/workspace/QuizzesTab';

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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading workspace...</div>;
  }

  if (!document) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">Document not found</div>;
  }

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'actions', label: 'AI Actions', icon: Lightbulb },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quizzes', label: 'Quizzes', icon: Target }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Workspace Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2 text-slate-800">
            <FileText size={20} className="text-blue-600" />
            <h1 className="font-semibold text-lg truncate max-w-md">{document.originalFilename}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Document Viewer */}
        <section className="w-1/2 h-full border-r border-slate-200 bg-slate-100 p-4">
          <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
            {/* Mocking a PDF viewer for the sake of the UI layout */}
            <div className="absolute inset-0 p-8 overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{document.originalFilename}</h2>
              <div className="prose prose-slate max-w-none text-slate-700 leading-loose whitespace-pre-wrap">
                {document.extractedText}
              </div>
            </div>
            {/* Gradient overlay to indicate it's a viewer */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        </section>

        {/* Right Side: Interactive AI Panel */}
        <section className="w-1/2 h-full bg-white p-6 overflow-hidden">
          {activeTab === 'chat' && <AIChatTab documentId={document._id} />}
          {activeTab === 'actions' && <AIActionsTab documentId={document._id} />}
          {activeTab === 'flashcards' && <FlashcardsTab documentId={document._id} />}
          {activeTab === 'quizzes' && <QuizzesTab documentId={document._id} />}
        </section>

      </main>
    </div>
  );
};

export default Workspace;
