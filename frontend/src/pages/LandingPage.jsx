import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, MessageSquare, Lightbulb, Layers, Target,
  Upload, ArrowRight, Sparkles, CheckCircle2, Zap, Shield,
  ChevronRight, Play, Users, BookOpen, TrendingUp, Star,
  FileText, BarChart2, Menu, X,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const features = [
  {
    icon: MessageSquare,
    label: 'AI Chat',
    title: 'Talk to your document like a person',
    desc: 'Ask nuanced questions, request summaries, or dig into details — the AI answers using only your document as its source of truth.',
    accent: '#6366f1',
    light: '#eef2ff',
  },
  {
    icon: Layers,
    label: 'Flashcards',
    title: 'From 50 pages to 20 cards in seconds',
    desc: 'The AI identifies the most important terms and concepts, then builds a full 3D flip-card study deck you can run through anywhere.',
    accent: '#8b5cf6',
    light: '#f5f3ff',
  },
  {
    icon: Target,
    label: 'Quizzes',
    title: 'Test yourself before the test tests you',
    desc: 'Auto-generated MCQ quizzes with instant answer feedback, explanations, and a running score tracker to benchmark progress.',
    accent: '#10b981',
    light: '#ecfdf5',
  },
  {
    icon: Lightbulb,
    label: 'Explainer',
    title: 'Break down any concept, in plain English',
    desc: 'Drop any term into the Concept Explainer and get a clear, document-contextualised explanation written for clarity.',
    accent: '#f59e0b',
    light: '#fffbeb',
  },
];

const steps = [
  {
    n: '01',
    icon: Upload,
    title: 'Upload your PDF',
    body: 'Drag and drop any text-based PDF — lecture slides, research papers, legal docs, manuals.',
  },
  {
    n: '02',
    icon: BrainCircuit,
    title: 'AI reads & understands',
    body: 'Gemini extracts, indexes, and models every sentence so it can answer with surgical precision.',
  },
  {
    n: '03',
    icon: Sparkles,
    title: 'Study your way',
    body: 'Chat, flip cards, take quizzes, or get concepts explained — all inside one workspace.',
  },
];

const stats = [
  { value: '10×', label: 'Faster than rereading' },
  { value: '94%', label: 'Avg quiz accuracy gain' },
  { value: '< 5s', label: 'Flashcard generation' },
  { value: '∞', label: 'Documents supported' },
];

const testimonials = [
  {
    quote: 'I uploaded my entire pharmacology textbook and chatted with it for three hours. Absolute game changer for med school.',
    name: 'Sarah K.',
    role: 'Medical Student, Johns Hopkins',
    initials: 'SK',
    color: 'from-indigo-400 to-violet-500',
  },
  {
    quote: 'The quiz feature alone saved me 6 hours of manual prep. I just generate, study, and walk in confident.',
    name: 'Marcus T.',
    role: 'CS Researcher, MIT',
    initials: 'MT',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    quote: 'As a law student, being able to explain obscure statutes in plain English inside the document context is unreal.',
    name: 'Priya R.',
    role: 'Law Student, Harvard',
    initials: 'PR',
    color: 'from-amber-400 to-orange-500',
  },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 4000);
    return () => clearInterval(id);
  }, []);

  const af = features[activeFeature];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-100">

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              learn<span className="text-indigo-600">AI</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Testimonials'].map(n => (
              <a
                key={n}
                href={`#${n.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {n}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Get started free →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-3 shadow-lg">
            {['Features', 'How it works', 'Testimonials'].map(n => (
              <a
                key={n}
                href={`#${n.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-slate-600 hover:text-slate-900 py-1.5"
              >
                {n}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link to="/login" className="text-center text-sm font-semibold border border-slate-200 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50">Sign in</Link>
              <Link to="/register" className="text-center text-sm font-bold bg-indigo-600 text-white py-2.5 rounded-xl">Get started free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-24 overflow-hidden">

        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, transparent 85%, #fafafa),
              radial-gradient(ellipse 60% 50% at 70% 40%, #eef2ff 0%, transparent 70%),
              linear-gradient(#e2e8f0 1px, transparent 1px),
              linear-gradient(90deg, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: 'auto, auto, 48px 48px, 48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — editorial text */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
              <Sparkles size={12} />
              Powered by Google Gemini
            </div>

            <h1 className="text-5xl lg:text-[64px] font-black leading-[1.06] tracking-tight text-slate-900 mb-6">
              Study smarter.<br />
              <span className="text-indigo-600">Not harder.</span>
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed max-w-lg mb-10">
              Drop any PDF. Get AI-powered chat, flashcards, quizzes, and concept explanations — all inside one clean workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[.98]"
              >
                Start for free <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm px-7 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Sign in
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {['SK', 'MT', 'PR', 'JL'].map((i, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">Trusted by 1,000+ students</p>
              </div>
            </div>
          </div>

          {/* Right — Product UI mockup */}
          <div className="relative hidden lg:block">
            {/* Glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl blur-2xl opacity-60" />

            {/* App window */}
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-3 bg-slate-200 rounded-full h-5 px-3 flex items-center">
                  <span className="text-[10px] text-slate-400 font-mono">learnai.vercel.app/workspace</span>
                </div>
              </div>

              {/* Workspace split */}
              <div className="flex h-72 text-xs">
                {/* Doc panel */}
                <div className="w-1/2 border-r border-slate-100 p-4 space-y-2 overflow-hidden">
                  <p className="font-bold text-slate-700 text-[11px] mb-3">📄 lecture_notes_ch4.pdf</p>
                  {['The mitochondria is often referred to as the powerhouse...', 'ATP synthesis occurs via oxidative phosphorylation...', 'The electron transport chain consists of four protein...'].map((t, i) => (
                    <div key={i} className="h-2 rounded bg-slate-100" style={{ width: `${[90, 75, 82][i]}%`, opacity: 1 - i * 0.15 }} />
                  ))}
                  <div className="mt-4 space-y-1.5">
                    {[95, 70, 55, 80].map((w, i) => (
                      <div key={i} className="h-1.5 rounded bg-slate-100" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>

                {/* AI panel */}
                <div className="w-1/2 p-4 space-y-3">
                  {/* Tab bar */}
                  <div className="flex gap-1.5 mb-3">
                    {['Chat', 'Cards', 'Quiz'].map((t, i) => (
                      <span
                        key={t}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${i === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-100'}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Chat bubbles */}
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white text-[10px] rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[75%]">
                        What is ATP synthesis?
                      </div>
                    </div>
                    <div className="flex">
                      <div className="bg-slate-100 text-slate-700 text-[10px] rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[85%] leading-relaxed">
                        ATP synthesis is the process by which cells generate adenosine triphosphate...
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white text-[10px] rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[70%]">
                        Give me a flashcard for this
                      </div>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex items-center gap-1 mt-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge: score */}
            <div className="absolute -bottom-4 -right-6 bg-white border border-emerald-200 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Quiz Score</p>
                <p className="text-sm font-black text-slate-900">9 / 10 <span className="text-emerald-500">↑</span></p>
              </div>
            </div>

            {/* Floating badge: flashcards */}
            <div className="absolute -top-5 -left-6 bg-white border border-violet-200 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <Layers size={18} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Flashcards ready</p>
                <p className="text-sm font-black text-slate-900">20 cards <span className="text-violet-500">✓</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS BAR ══════════════════ */}
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-indigo-600 mb-1">{s.value}</p>
              <p className="text-sm text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section label */}
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Features</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 max-w-xl leading-tight">
              Everything you need to<br />master any document.
            </h2>
          </div>

          {/* Interactive feature selector */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">

            {/* Left: feature list tabs */}
            <div className="space-y-2">
              {features.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                    i === activeFeature
                      ? 'bg-white border-slate-200 shadow-lg'
                      : 'border-transparent hover:bg-white/60 hover:border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: f.light }}
                    >
                      <f.icon size={16} style={{ color: f.accent }} />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: i === activeFeature ? f.accent : '#94a3b8' }}
                    >
                      {f.label}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm leading-snug ${i === activeFeature ? 'text-slate-900' : 'text-slate-400'}`}>
                    {f.title}
                  </h3>
                </button>
              ))}
            </div>

            {/* Right: active feature detail card */}
            <div
              className="rounded-3xl p-10 min-h-[340px] flex flex-col justify-between transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${af.light} 0%, white 100%)`, border: `1.5px solid ${af.accent}22` }}
            >
              <div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7"
                  style={{ background: `${af.accent}18` }}
                >
                  <af.icon size={28} style={{ color: af.accent }} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{af.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed max-w-md">{af.desc}</p>
              </div>
              <Link
                to="/register"
                className="mt-10 inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: af.accent }}
              >
                Try it free <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how-it-works" className="py-28 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">How it works</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Three steps to mastery.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-slate-800 rounded-3xl overflow-hidden">
            {steps.map((s, i) => (
              <div key={s.n} className="bg-slate-950 p-10 flex flex-col gap-6 relative group hover:bg-slate-900 transition-colors">
                {/* Number */}
                <span className="absolute top-8 right-8 text-5xl font-black text-slate-800 select-none leading-none group-hover:text-slate-700 transition-colors">
                  {s.n}
                </span>
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                  <s.icon size={22} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white mb-3">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={16} className="text-slate-700 absolute top-1/2 -right-px z-10 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section id="testimonials" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Testimonials</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 max-w-lg leading-tight">
              Students who use it don't go back.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="group rounded-3xl border border-slate-200 bg-[#fafafa] hover:bg-white hover:border-slate-300 hover:shadow-xl p-8 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-slate-700 text-base leading-relaxed mb-8">"{t.quote}"</p>
                {/* Person */}
                <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section className="py-28 bg-slate-950 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Get started</p>
          <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
            Your next study session<br />starts here.
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Free to start. No credit card. Just upload a PDF and experience the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-10 py-4 rounded-2xl shadow-2xl shadow-indigo-900/40 transition-all hover:-translate-y-0.5"
            >
              Create free account <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-base px-10 py-4 rounded-2xl transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="bg-black border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <BrainCircuit size={14} className="text-white" />
                </div>
                <span className="text-base font-black text-white tracking-tight">learnAI</span>
              </div>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                AI-powered study workspace. Turn any PDF into flashcards, quizzes, and chat — in seconds.
              </p>
            </div>

            {/* Stack badges */}
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'MongoDB', 'Google Gemini', 'Tailwind CSS', 'Render + Vercel'].map(t => (
                <span key={t} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 text-[11px] font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} learnAI. MIT License.</p>
            <div className="flex gap-6">
              <Link to="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Sign In</Link>
              <Link to="/register" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
