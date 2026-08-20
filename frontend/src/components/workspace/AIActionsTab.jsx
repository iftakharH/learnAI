import React, { useState } from 'react';
import { FileText, Lightbulb, Save, AlertTriangle, X } from 'lucide-react';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'Request failed. Please try again.';

const AIActionsTab = ({ documentId }) => {
  const [summary, setSummary] = useState('');
  const [explanation, setExplanation] = useState('');
  const [concept, setConcept] = useState('');
  const [loadingAction, setLoadingAction] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [explainError, setExplainError] = useState('');

  const generateSummary = async () => {
    setLoadingAction('summary');
    setSummaryError('');
    try {
      const res = await api.post(`/ai/${documentId}/summary`);
      setSummary(res.data.summary);
    } catch (err) {
      setSummaryError(getApiErrorMessage(err));
    } finally {
      setLoadingAction('');
    }
  };

  const explainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setLoadingAction('explain');
    setExplainError('');
    try {
      const res = await api.post(`/ai/${documentId}/explain`, { concept });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplainError(getApiErrorMessage(err));
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
        {summaryError && (
          <div className="mx-5 mt-4 p-3 border border-red-200 bg-red-50 rounded-lg flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-red-800">{summaryError}</div>
            <button onClick={() => setSummaryError('')} className="text-red-500 hover:text-red-700 shrink-0" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
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
          {explainError && (
            <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded-lg flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 text-red-800">{explainError}</div>
              <button onClick={() => setExplainError('')} className="text-red-500 hover:text-red-700 shrink-0" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
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
