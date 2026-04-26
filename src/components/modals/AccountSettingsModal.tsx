import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccountSettingsModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AccountSettingsModal = ({ show, onClose, onSuccess }: AccountSettingsModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.message);
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Password update failed');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-100"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Security</h2>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Update your account password to maintain security. Choose a strong password you don't use elsewhere.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Current Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">New Password</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters" 
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Confirm New Password</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password" 
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-indigo-100 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Update Password <ShieldCheck size={18} /></>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
