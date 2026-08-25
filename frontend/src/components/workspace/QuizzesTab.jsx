import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, XCircle, ChevronRight, Award, AlertTriangle, X, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'We could not load your quiz. Please try again.';

const QuizzesTab = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Quiz taking state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const clearError = () => setError('');

  useEffect(() => {
    fetchQuizzes();
  }, [documentId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quizzes?document=${documentId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setGenerating(true);
      clearError();
      const res = await api.post(`/ai/${documentId}/quiz`, { numQuestions: 5 });
      const questions = res.data && res.data.quiz;
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No valid quiz questions were generated. Please try again with a text-based PDF.');
      }
      const newQuiz = await api.post('/quizzes', { 
        documentId, 
        title: `Quiz ${quizzes.length + 1}`,
        questions,
      });
      if (!newQuiz || !newQuiz.data || !newQuiz.data._id) {
        throw new Error('Generated quiz could not be saved.');
      }
      setQuizzes([newQuiz.data, ...quizzes]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setSelectedOption('');
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const submitAnswer = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    if (selectedOption === activeQuiz.questions[currentQIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption('');
      setIsAnswered(false);
    } else {
      const finalScore = score;
      setIsFinished(true);
      try {
        await api.put(`/quizzes/${activeQuiz._id}/submit`, { score: finalScore });
        fetchQuizzes();
        if (finalScore / activeQuiz.totalQuestions > 0.6) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err));
      }
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading quizzes…</p>
      </div>
    );
  }

  // Quiz Listing
  if (!activeQuiz) {
    return (
      <div className="flex flex-col h-full">
        {/* Generate Button */}
        <button
          onClick={generateQuiz}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all mb-5 flex-shrink-0"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generating Quiz…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate New Quiz
            </>
          )}
        </button>

        {error && (
          <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-xl flex items-start gap-2 text-sm flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1 text-red-700 font-medium">{error}</div>
            <button onClick={clearError}><X className="h-4 w-4 text-red-400" /></button>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-emerald-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No quizzes yet. Generate one above!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Target size={14} className="text-emerald-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{quiz.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 pl-9">
                    {quiz.totalQuestions} questions
                    <span className="mx-1.5">·</span>
                    Best: <span className="font-bold text-emerald-600">{quiz.score}/{quiz.totalQuestions}</span>
                  </p>
                </div>
                <button
                  onClick={() => startQuiz(quiz)}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  Start <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Results Screen
  if (isFinished) {
    const percentage = Math.round((score / activeQuiz.totalQuestions) * 100);
    const isGood = percentage >= 60;
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${isGood ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-slate-300 to-slate-400'}`}>
          {isGood ? <Trophy size={44} className="text-white" /> : <Award size={44} className="text-white" />}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-1">You scored</p>
        <p className={`text-6xl font-black mb-6 ${isGood ? 'text-emerald-500' : 'text-slate-500'}`}>{percentage}%</p>
        <p className="text-slate-400 text-sm mb-8">{score} correct out of {activeQuiz.totalQuestions}</p>
        
        <div className="flex gap-3">
          <button
            onClick={() => startQuiz(activeQuiz)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-colors text-sm"
          >
            Retry Quiz
          </button>
          <button
            onClick={() => setActiveQuiz(null)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all text-sm"
          >
            All Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Quiz Player
  const q = activeQuiz.questions[currentQIndex];
  const progress = ((currentQIndex + 1) / activeQuiz.totalQuestions) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <button
          onClick={() => setActiveQuiz(null)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
        >
          ← Exit
        </button>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          {currentQIndex + 1} / {activeQuiz.totalQuestions}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question + Options */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Question {currentQIndex + 1}</p>
          <h3 className="text-base font-bold text-slate-900 leading-relaxed">{q.question}</h3>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let cls = 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-slate-700';
            let icon = null;
            const letter = ['A', 'B', 'C', 'D'][i];

            if (isAnswered) {
              if (opt === q.correctAnswer) {
                cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                icon = <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />;
              } else if (opt === selectedOption) {
                cls = 'border-red-400 bg-red-50 text-red-800';
                icon = <XCircle size={16} className="text-red-500 flex-shrink-0" />;
              } else {
                cls = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
              }
            } else if (opt === selectedOption) {
              cls = 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-50 text-emerald-800';
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}
              >
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  opt === selectedOption && !isAnswered ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {letter}
                </span>
                <span className="font-medium text-sm flex-1">{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <h4 className="font-bold text-blue-800 text-sm mb-1.5">Explanation</h4>
            <p className="text-blue-700/80 text-xs leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-4 flex justify-end flex-shrink-0">
        {!isAnswered ? (
          <button
            onClick={submitAnswer}
            disabled={!selectedOption}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 text-white px-7 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-3 rounded-2xl font-bold transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
          >
            {currentQIndex < activeQuiz.totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizzesTab;
