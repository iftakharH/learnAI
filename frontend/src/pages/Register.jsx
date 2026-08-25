import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, BrainCircuit, Eye, EyeOff, Sparkles } from 'lucide-react';
import { getAuthErrorMessage } from '../utils/authErrors';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to register. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left: Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 order-2 lg:order-1">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">Learn<span className="gradient-text">AI</span></span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h1>
              <p className="mt-2 text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-11 pr-11 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    className="w-full pl-11 pr-11 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-xs text-slate-400">
            <Link to="/" className="hover:text-indigo-500 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>

      {/* Right: Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 items-center justify-center overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-10 right-10 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-blob" />
        <div className="relative z-10 text-center text-white p-12">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Sparkles size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Start for free.</h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-sm mx-auto">
            Upload your first PDF and experience AI-powered learning in seconds.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left max-w-xs mx-auto">
            {[
              { label: 'AI Chat', value: 'Unlimited' },
              { label: 'Flashcards', value: '10 / deck' },
              { label: 'Quizzes', value: '5 questions' },
              { label: 'Documents', value: 'Unlimited' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
