import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ResetPasswordPageProps {
  token: string;
  onComplete: () => void;
}

export const ResetPasswordPage = ({ token, onComplete }: ResetPasswordPageProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl rotate-[-8deg]">
              <BookOpen size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase leading-none">
                Smart<span className="text-indigo-600">lib</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
              <p className="text-slate-500 font-medium">Your password has been reset successfully.</p>
              <button 
                onClick={() => {
                   window.history.replaceState({}, '', '/');
                   onComplete();
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Password</h2>
                <p className="text-slate-500 font-medium text-xs">Enter your new secure password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters" 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-brand-dark text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={18} />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password" 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-brand-dark text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-rose-600 text-xs font-bold px-2">{error}</p>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Update Password
                      <ArrowRight size={18} strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
