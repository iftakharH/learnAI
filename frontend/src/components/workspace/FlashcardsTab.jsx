import React, { useState, useEffect } from 'react';
import { Layers, ChevronLeft, ChevronRight, Star, Plus, AlertTriangle, X, Sparkles } from 'lucide-react';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'We could not load your flashcards. Please try again.';

const FlashcardsTab = ({ documentId }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const clearError = () => setError('');

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/flashcards?document=${documentId}`);
      setFlashcards(res.data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    try {
      setGenerating(true);
      clearError();
      const res = await api.post(`/ai/${documentId}/flashcards`, { count: 10 });
      const generated = res.data && res.data.flashcards;
      if (!Array.isArray(generated) || generated.length === 0) {
        throw new Error('No valid flashcards were generated. Please try again with a text-based PDF.');
      }
      // Bulk save generated flashcards
      const saveRes = await api.post('/flashcards/bulk', { 
        documentId, 
        flashcards: generated,
      });
      if (!saveRes || !saveRes.data || (Array.isArray(saveRes.data) && saveRes.data.length === 0)) {
        throw new Error('Generated flashcards could not be saved.');
      }
      await fetchFlashcards();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    const currentCard = flashcards[currentIndex];
    try {
      const res = await api.put(`/flashcards/${currentCard._id}/favorite`);
      const updatedCards = [...flashcards];
      updatedCards[currentIndex] = res.data;
      setFlashcards(updatedCards);
    } catch (err) {
      console.error(err);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1)), 50);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => Math.max(prev - 1, 0)), 50);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading flashcards…</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        {error && (
          <div className="w-full mb-5 p-3 border border-red-200 bg-red-50 rounded-xl flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1 text-red-700 font-medium">{error}</div>
            <button onClick={clearError}><X className="h-4 w-4 text-red-400 hover:text-red-600" /></button>
          </div>
        )}
        <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Layers size={36} className="text-violet-400" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">No Flashcards Yet</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs">Let AI generate a smart study deck from this document in seconds.</p>
        <button
          onClick={generateFlashcards}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generating deck…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Deck
            </>
          )}
        </button>
      </div>
    );
  }

  const card = flashcards[currentIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 flex-shrink-0">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Card</span>
          <span className="ml-2 text-lg font-extrabold text-slate-900">{currentIndex + 1}</span>
          <span className="text-slate-300 mx-1">/</span>
          <span className="text-slate-400 font-semibold">{flashcards.length}</span>
        </div>
        <button
          onClick={generateFlashcards}
          disabled={generating}
          className="flex items-center gap-1.5 text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          {generating ? (
            <div className="w-3 h-3 border-2 border-violet-400/40 border-t-violet-500 rounded-full animate-spin" />
          ) : (
            <Plus size={12} />
          )}
          {generating ? 'Generating…' : 'Add More'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-xl flex items-start gap-2 text-sm flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 text-red-700 font-medium">{error}</div>
          <button onClick={clearError}><X className="h-4 w-4 text-red-400" /></button>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer perspective-1000 w-full min-h-0"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full max-w-sm h-64 transform-style-3d transition-all duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-100 shadow-xl rounded-3xl p-7 flex flex-col justify-center items-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 rounded-3xl" />
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 z-10 transition-transform hover:scale-125"
            >
              <Star
                size={20}
                fill={card.isFavorite ? 'currentColor' : 'none'}
                className={card.isFavorite ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-300'}
              />
            </button>
            <p className="relative z-10 text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Question</p>
            <h3 className="relative z-10 text-lg font-bold text-slate-800 leading-snug">{card.front}</h3>
            <p className="absolute bottom-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-violet-400 shadow-xl rounded-3xl p-7 flex flex-col justify-center items-center text-center rotate-y-180 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <p className="relative z-10 text-xs font-bold text-violet-200 uppercase tracking-widest mb-3">Answer</p>
            <p className="relative z-10 text-base text-white leading-relaxed font-medium">{card.back}</p>
            <p className="absolute bottom-4 text-xs font-semibold text-violet-300 uppercase tracking-wider">Tap to flip back</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-6 mt-5 flex-shrink-0">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardsTab;
