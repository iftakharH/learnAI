import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  MessageSquare,
  Lightbulb,
  Layers,
  Target,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Zap,
  Shield,
  Star,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Document Chat',
    desc: 'Ask anything about your document and get instant, context-aware answers powered by Gemini.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    icon: Lightbulb,
    title: 'Concept Explainer',
    desc: 'Paste any complex term and get a clear, concise explanation contextualized to your document.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Layers,
    title: 'Smart Flashcards',
    desc: 'Automatically generate a full study deck of interactive 3D flip cards from any uploaded PDF.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: Target,
    title: 'Adaptive Quizzes',
    desc: 'Test your understanding with auto-generated multiple choice quizzes and track your best scores.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your PDF',
    desc: 'Drag and drop any text-based PDF — lecture notes, research papers, textbooks, or documentation.',
    icon: Upload,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    number: '02',
    title: 'AI Extracts & Learns',
    desc: 'Our Gemini-powered engine reads and understands your document so it can answer questions with pinpoint accuracy.',
    icon: BrainCircuit,
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
  {
    number: '03',
    title: 'Study & Master',
    desc: 'Chat, generate flashcard decks, get concepts explained, and take quizzes — all in one sleek workspace.',
    icon: Sparkles,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
];

const testimonials = [
  { name: 'Sarah K.', role: 'Med Student', quote: 'LearnAI cut my study time in half. The flashcards it generates are incredibly accurate!', avatar: 'SK' },
  { name: 'Marcus T.', role: 'CS Researcher', quote: 'Being able to chat with my research papers is a complete game changer. Outstanding tool.', avatar: 'MT' },
  { name: 'Priya R.', role: 'Law Student', quote: 'The concept explainer is perfect for breaking down complex legal terms. Absolutely love it.', avatar: 'PR' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Learn<span className="gradient-text">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all pulse-glow">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/60" />
        {/* Animated blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-600 mb-8 shadow-sm">
            <Sparkles size={14} className="text-indigo-500" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
            Study Smarter,<br />
            Not Harder.
            <span className="gradient-text"> With AI.</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any PDF and instantly unlock AI-powered chat, smart flashcards,
            concept explanations, and adaptive quizzes — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all pulse-glow"
            >
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white border border-slate-200 text-slate-700 text-base font-semibold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-slate-500">
            {['No credit card needed', 'Free to get started', 'Powered by Gemini'].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {text}
              </span>
            ))}
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative mx-auto max-w-4xl">
            <div className="glass rounded-3xl shadow-2xl border border-white/80 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-400 font-mono">learnai.app/workspace</span>
              </div>
              <div className="grid grid-cols-2 bg-slate-50 min-h-[280px]">
                <div className="border-r border-slate-200 p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Document</p>
                  <div className="space-y-2">
                    <div className="shimmer h-3 rounded w-full" />
                    <div className="shimmer h-3 rounded w-5/6" />
                    <div className="shimmer h-3 rounded w-4/5" />
                    <div className="shimmer h-3 rounded w-full" />
                    <div className="shimmer h-3 rounded w-3/4" />
                    <div className="shimmer h-3 rounded w-full" />
                    <div className="shimmer h-3 rounded w-5/6" />
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Chat</p>
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="bg-indigo-600 text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                          Summarize the key points
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-700 text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                          Here are the 3 key takeaways from your document…
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['AI Chat', 'Flashcards', 'Quiz'].map((tab, i) => (
                      <div key={tab} className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {tab}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <Target size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Quiz Score</p>
                <p className="text-xs text-emerald-600 font-semibold">4/5 ✓</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                <Layers size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Flashcards</p>
                <p className="text-xs text-violet-600 font-semibold">10 generated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-600 mb-4">
              <Zap size={14} />
              Core Features
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to <span className="gradient-text">Master</span> Any Topic
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Four powerful AI tools, one seamless workspace. Upload once, study forever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`card-hover bg-white border ${f.border} rounded-2xl p-7 shadow-sm hover:shadow-lg`}>
                <div className={`${f.bg} ${f.color} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Extras */}
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              { icon: Shield, text: 'Secure JWT Authentication', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: BookOpen, text: 'PDF Text Extraction & Parsing', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: Star, text: 'Favorite & Track Your Flashcards', color: 'text-yellow-500', bg: 'bg-yellow-50' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-5 py-4">
                <div className={`${item.bg} ${item.color} p-2 rounded-lg`}>
                  <item.icon size={18} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 text-sm font-semibold text-violet-600 mb-4">
              <ChevronRight size={14} />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Up and Running in <span className="gradient-text">Minutes</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              Three steps to transform any document into a complete study session.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-emerald-200" />
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                <div className={`${step.bg} ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md relative z-10`}>
                  <step.icon size={28} />
                </div>
                <div className="absolute top-0 right-1/3 -translate-y-1 text-6xl font-black text-slate-100 select-none">{step.number}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Students <span className="gradient-text">Love</span> LearnAI
            </h2>
            <p className="mt-3 text-slate-500">Join thousands of learners who study smarter every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card-hover bg-white border border-slate-100 rounded-2xl p-7 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to Supercharge<br />Your Studies?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Create your free account and start converting PDFs into mastery — no setup required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 font-bold text-base px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            Get Started — It's Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">LearnAI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {['React', 'Node.js', 'MongoDB', 'Google Gemini', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 text-xs font-medium">{tech}</span>
              ))}
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} LearnAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
