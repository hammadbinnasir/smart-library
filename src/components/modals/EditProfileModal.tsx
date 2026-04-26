import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EditProfileModalProps {
  show: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export const EditProfileModal = ({ show, onClose, user, onUpdate }: EditProfileModalProps) => {
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender })
      });
      
      const data = await res.json();
      if (res.ok) {
        onUpdate(data);
        onClose();
      } else {
        setError(data.error || 'Update failed');
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
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Edit Profile</h2>
                <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Display Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name" 
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Gender Identification</label>
                  <div className="relative group">
                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-slate-900 shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
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
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-200 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Save Changes <CheckCircle2 size={18} /></>
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
