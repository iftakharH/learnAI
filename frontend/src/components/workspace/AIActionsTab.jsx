import React, { useState } from 'react';
import { FileText, Lightbulb, AlertTriangle, X, Sparkles, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'We could not complete this request. Please try again.';

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
    <div className="space-y-5 h-full overflow-y-auto pb-4 pr-1">
      
      {/* Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Document Summary</p>
              <p className="text-xs text-slate-400">AI-generated overview</p>
            </div>
          </div>
          <button
            onClick={generateSummary}
            disabled={loadingAction === 'summary'}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loadingAction === 'summary' ? (
              <>
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={12} />
                {summary ? 'Regenerate' : 'Generate'}
              </>
            )}
          </button>
        </div>

        {summaryError && (
          <div className="mx-5 mt-4 p-3 border border-red-200 bg-red-50 rounded-xl flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1 text-red-700 font-medium">{summaryError}</div>
            <button onClick={() => setSummaryError('')} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>
        )}

        {summary ? (
          <div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        ) : !summaryError && (
          <div className="p-5 text-center text-slate-400 text-sm py-8">
            <FileText size={32} className="mx-auto mb-2 text-slate-200" />
            Click <span className="font-semibold text-indigo-500">Generate</span> to create an AI summary
          </div>
        )}
      </div>

      {/* Concept Explainer Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Lightbulb size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Concept Explainer</p>
              <p className="text-xs text-slate-400">Explain any term in context</p>
            </div>
          </div>
          <form onSubmit={explainConcept} className="flex gap-2">
            <input
              type="text"
              placeholder="E.g. Quantum Entanglement, Neural Networks…"
              className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-all bg-slate-50 focus:bg-white"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              disabled={loadingAction === 'explain'}
            />
            <button
              type="submit"
              disabled={loadingAction === 'explain' || !concept.trim()}
              className="flex items-center gap-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loadingAction === 'explain' ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
            </button>
          </form>

          {explainError && (
            <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded-xl flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1 text-red-700 font-medium">{explainError}</div>
              <button onClick={() => setExplainError('')} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        {explanation ? (
          <div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-amber-50/30 border-t border-amber-100/50">
            {explanation}
          </div>
        ) : !explainError && (
          <div className="p-5 text-center text-slate-400 text-sm py-8">
            <Lightbulb size={32} className="mx-auto mb-2 text-slate-200" />
            Enter a concept above to get an AI explanation
          </div>
        )}
      </div>
    </div>
  );
};

export default AIActionsTab;
