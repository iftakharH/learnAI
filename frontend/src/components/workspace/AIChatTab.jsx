import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, X, Sparkles } from 'lucide-react';
import api from '../../api/axios';

const getApiErrorMessage = (err) => err?.response?.data?.message || err?.message || 'We could not send your message. Please try again.';

const AIChatTab = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const clearError = () => setError('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    clearError();

    const userMessage = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/ai/${documentId}/chat`, { query: userMessage.text });
      // Backend returns { messages: full history } — prefer that to stay in sync with DB
      if (res.data && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      } else if (res.data && res.data.response) {
        setMessages(prev => [...prev, { role: 'model', text: res.data.response }]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['Summarize this document', 'What are the key concepts?', 'Give me 3 main takeaways'];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 border border-red-200 bg-red-50 rounded-xl flex items-start gap-2 text-sm flex-shrink-0">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 text-red-700 font-medium">{error}</div>
          <button onClick={clearError} className="text-red-400 hover:text-red-600 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">Ask anything</h3>
            <p className="text-slate-400 text-sm mb-6">Chat with your document using AI</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-4 py-2.5 rounded-xl transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages?.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                : 'bg-slate-100 border border-slate-200'
            }`}>
              {msg.role === 'user'
                ? <User size={15} className="text-white" />
                : <Sparkles size={15} className="text-indigo-500" />
              }
            </div>
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm shadow-md'
                : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} className="text-indigo-500 animate-pulse" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm flex items-center gap-1.5">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2.5 flex-shrink-0">
        <input
          type="text"
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm bg-slate-50 focus:bg-white"
          placeholder="Ask a question about this document…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AIChatTab;
