import React, { useState } from 'react';
import { FileText, Lightbulb, Save } from 'lucide-react';
import api from '../../api/axios';

const AIActionsTab = ({ documentId }) => {
  const [summary, setSummary] = useState('');
  const [explanation, setExplanation] = useState('');
  const [concept, setConcept] = useState('');
  const [loadingAction, setLoadingAction] = useState('');

  const generateSummary = async () => {
    setLoadingAction('summary');
    try {
      const res = await api.post(`/ai/${documentId}/summary`);
      setSummary(res.data.summary);
    } catch (err) {
      alert('Failed to generate summary');
    } finally {
      setLoadingAction('');
    }
  };

  const explainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setLoadingAction('explain');
    try {
      const res = await api.post(`/ai/${documentId}/explain`, { concept });
      setExplanation(res.data.explanation);
    } catch (err) {
      alert('Failed to explain concept');
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-160px)] overflow-y-auto pb-8 pr-2">
      {/* Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <FileText size={20} className="text-blue-500" />
            Document Summary
          </div>
          <button 
            onClick={generateSummary} 
            disabled={loadingAction === 'summary'}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loadingAction === 'summary' ? 'Generating...' : summary ? 'Regenerate' : 'Generate Summary'}
          </button>
        </div>
        {summary && (
          <div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        )}
      </div>

      {/* Concept Explainer Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-semibold mb-3">
            <Lightbulb size={20} className="text-amber-500" />
            Concept Explainer
          </div>
          <form onSubmit={explainConcept} className="flex gap-2">
            <input 
              type="text" 
              placeholder="E.g. Quantum Entanglement" 
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              disabled={loadingAction === 'explain'}
            />
            <button 
              type="submit" 
              disabled={loadingAction === 'explain' || !concept.trim()}
              className="text-sm bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingAction === 'explain' ? 'Explaining...' : 'Explain'}
            </button>
          </form>
        </div>
        {explanation && (
          <div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-amber-50/30">
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIActionsTab;
