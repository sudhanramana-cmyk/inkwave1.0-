import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { X, Eye, EyeOff, Sparkles, User, Mail, Lock, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModal, login, register, quickSwitch } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(authModal.mode);

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [resetPass, setResetPass] = useState('');

  if (!authModal.isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailOrUsername || !password) {
      setErrorMsg('Please enter both your identifier and password');
      return;
    }
    setLoading(true);
    try {
      await login(emailOrUsername, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name || !username || !email || !password) {
      setErrorMsg('All fields are required');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name, username, email, password });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      if (resetPass) {
        // Reset password directly
        await api.resetPassword({ email, new_password: resetPass });
        toast('Password has been updated. Please sign in with your new credentials.', 'success');
        setTab('login');
        setPassword(resetPass);
        setEmailOrUsername(email);
      } else {
        const res = await api.forgotPassword(email);
        setForgotSubmitted(true);
        toast(res.message, 'info');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process password request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={authModal.close}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold">
              INKWAVE Access
            </span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-stone-900 dark:text-stone-50">
            {tab === 'login' && 'Return to your stories'}
            {tab === 'register' && 'Begin your craft'}
            {tab === 'forgot' && 'Account recovery'}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {tab === 'login' && 'Sign in to publish, discuss, and curate ideas that endure.'}
            {tab === 'register' && 'Join an editorial guild dedicated to considered writing.'}
            {tab === 'forgot' && 'Enter your email address to reset your key.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 mr-6 ${
              tab === 'login'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 mr-6 ${
              tab === 'register'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setTab('forgot'); setErrorMsg(''); }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'forgot'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Reset
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. elena or elena@inkwave.io"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Julian Sorel"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="julian_s"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="julian@example.com"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="elena@inkwave.io"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {forgotSubmitted && (
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Enter New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={resetPass}
                    onChange={e => setResetPass(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : forgotSubmitted ? 'Reset Password' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        {/* ONE-CLICK DEMO ACCOUNTS HELPER */}
        <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 mb-2.5 text-stone-500 dark:text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Instant Demo Sign-in
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                quickSwitch('elena');
                authModal.close();
              }}
              className="p-2 text-left bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/60 dark:hover:bg-stone-800 rounded-lg transition-colors border border-stone-200/60 dark:border-stone-700/50"
            >
              <div className="font-semibold text-stone-900 dark:text-stone-100">Elena Rostova</div>
              <div className="text-[10px] text-stone-500">Design Essayist</div>
            </button>
            <button
              type="button"
              onClick={() => {
                quickSwitch('marcus');
                authModal.close();
              }}
              className="p-2 text-left bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/60 dark:hover:bg-stone-800 rounded-lg transition-colors border border-stone-200/60 dark:border-stone-700/50"
            >
              <div className="font-semibold text-stone-900 dark:text-stone-100">Marcus Vance</div>
              <div className="text-[10px] text-stone-500">Systems Thinker</div>
            </button>
            <button
              type="button"
              onClick={() => {
                quickSwitch('sofia');
                authModal.close();
              }}
              className="p-2 text-left bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/60 dark:hover:bg-stone-800 rounded-lg transition-colors border border-stone-200/60 dark:border-stone-700/50"
            >
              <div className="font-semibold text-stone-900 dark:text-stone-100">Sofia Chen</div>
              <div className="text-[10px] text-stone-500">Culture Critic</div>
            </button>
            <button
              type="button"
              onClick={() => {
                quickSwitch('admin');
                authModal.close();
              }}
              className="p-2 text-left bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200/60 dark:border-blue-800/50"
            >
              <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Arjun (Admin)
              </div>
              <div className="text-[10px] text-blue-700/70 dark:text-blue-300/70">Lead Curator</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
