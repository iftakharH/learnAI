import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, XCircle, ChevronRight, Award, AlertTriangle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'Request failed. Please try again.';

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
      // Submit score to DB
      const finalScore = score;
      setIsFinished(true);
      try {
        await api.put(`/quizzes/${activeQuiz._id}/submit`, { score: finalScore });
        fetchQuizzes(); // Refresh list to update score
        
        // Trigger confetti for good scores
        if (finalScore / activeQuiz.totalQuestions > 0.6) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && quizzes.length === 0) return <div className="text-center py-10 text-slate-500">Loading quizzes...</div>;

  // Render Quiz Listing
  if (!activeQuiz) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)]">
        <button 
          onClick={generateQuiz}
          disabled={generating}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors mb-6"
        >
          {generating ? 'Generating Quiz...' : 'Generate New Quiz'}
        </button>

        {quizzes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
            <Target size={48} className="mb-4 opacity-50" />
            <p>No quizzes available yet. Generate one to test your knowledge!</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pb-4 pr-2">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="bg-white border border-slate-200 p-5 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800">{quiz.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{quiz.totalQuestions} Questions • Best Score: {quiz.score}/{quiz.totalQuestions}</p>
                </div>
                <button 
                  onClick={() => startQuiz(quiz)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Quiz Results
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <Award size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Quiz Complete!</h2>
        <p className="text-lg text-slate-600 mb-8">You scored <span className="font-bold text-emerald-600">{score}</span> out of {activeQuiz.totalQuestions}</p>
        
        <button 
          onClick={() => setActiveQuiz(null)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Render Quiz Player
  const q = activeQuiz.questions[currentQIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setActiveQuiz(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700">← Exit Quiz</button>
        <div className="text-sm font-bold text-emerald-600">Question {currentQIndex + 1} / {activeQuiz.totalQuestions}</div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">{q.question}</h3>
        
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let itemClass = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700";
            let icon = null;

            if (isAnswered) {
              if (opt === q.correctAnswer) {
                itemClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                icon = <CheckCircle2 className="text-emerald-500" />;
              } else if (opt === selectedOption) {
                itemClass = "border-red-500 bg-red-50 text-red-800";
                icon = <XCircle className="text-red-500" />;
              } else {
                itemClass = "border-slate-200 text-slate-400 opacity-60";
              }
            } else if (opt === selectedOption) {
              itemClass = "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/50 text-emerald-800";
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${itemClass}`}
              >
                <span className="font-medium">{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h4 className="font-bold text-blue-800 mb-2">Explanation</h4>
            <p className="text-blue-900/80 text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        {!isAnswered ? (
          <button
            onClick={submitAnswer}
            disabled={!selectedOption}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            {currentQIndex < activeQuiz.totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizzesTab;
