import React, { useState, useEffect } from 'react';
import { Layers, ChevronLeft, ChevronRight, Star, Plus, AlertTriangle, X } from 'lucide-react';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'Request failed. Please try again.';

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
    setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading flashcards...</div>;

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Layers size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Flashcards Yet</h3>
        <p className="text-sm text-slate-500 mb-6">Let AI generate a study deck from this document.</p>
        <button 
          onClick={generateFlashcards}
          disabled={generating}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          {generating ? 'Generating (takes a minute)...' : <><Plus size={18} /> Generate Deck</>}
        </button>
      </div>
    );
  }

  const card = flashcards[currentIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-slate-500">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <button 
          onClick={generateFlashcards}
          disabled={generating}
          className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md font-semibold transition-colors disabled:opacity-50"
        >
          {generating ? 'Generating...' : '+ Add More'}
        </button>
      </div>

      {/* 3D Flip Card Container */}
      <div className="flex-1 flex items-center justify-center relative perspective-1000 w-full mb-6 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full max-w-md h-80 transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-100 shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center text-center">
            <button onClick={toggleFavorite} className="absolute top-4 right-4 text-slate-300 hover:text-yellow-400 z-10 transition-colors">
              <Star size={24} fill={card.isFavorite ? 'currentColor' : 'none'} className={card.isFavorite ? 'text-yellow-400' : ''} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 leading-snug">{card.front}</h3>
            <p className="absolute bottom-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Click to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-purple-50 border-2 border-purple-100 shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center text-center rotate-y-180">
            <p className="text-lg text-slate-700 leading-relaxed">{card.back}</p>
            <p className="absolute bottom-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">Click to flip back</p>
          </div>
          
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-6 mt-auto">
        <button 
          onClick={prevCard} 
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
        <button 
          onClick={nextCard} 
          disabled={currentIndex === flashcards.length - 1}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Required CSS for 3D Flip */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardsTab;
