import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Shield, ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [portal, setPortal] = useState<'STUDENT' | 'LIBRARIAN' | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // --- Client-side Validation ---
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!gender) {
        setError('Please select your gender');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (portal === 'LIBRARIAN' && !adminCode) {
        setError('Admin Authorization Code is required for staff registration');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password, portalRole: portal } 
        : { name, email, password, role: portal, adminCode, gender: gender === '' ? null : gender };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection refused. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/30 rounded-full blur-[160px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn("w-full relative z-10 transition-all duration-700", !portal ? "max-w-xl" : "max-w-md")}
      >
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-brand-dark text-white rounded-[1.5rem] shadow-2xl rotate-[-8deg] border border-white/10">
              <BookOpen size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-brand-dark uppercase leading-none">
                Smart<span className="text-indigo-600">lib</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Library Management System</span>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-white/40 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16" />
          
          <AnimatePresence mode="wait">
            {!portal ? (
              <motion.div
                key="portal-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-brand-dark mb-2 tracking-tight">Select Portal</h2>
                  <p className="text-slate-500 font-medium text-xs tracking-wide">Please select your access level to continue</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    onClick={() => setPortal('STUDENT')}
                    className="flex-1 p-10 bg-white border border-slate-100 hover:border-indigo-200 rounded-[2.5rem] transition-all duration-500 group flex flex-col items-center justify-center gap-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/30 transition-colors" />
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-inner z-10 border border-slate-100/50">
                      <GraduationCap size={56} strokeWidth={1} />
                    </div>
                    <div className="z-10">
                      <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Student</h3>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Member Portal</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPortal('LIBRARIAN')}
                    className="flex-1 p-10 bg-white border border-slate-100 hover:border-emerald-200 rounded-[2.5rem] transition-all duration-500 group flex flex-col items-center justify-center gap-6 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/30 transition-colors" />
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-inner z-10 border border-slate-100/50">
                      <Shield size={56} strokeWidth={1} />
                    </div>
                    <div className="z-10">
                      <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Staff</h3>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Librarian Portal</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-10 relative flex items-center justify-center">
                  <button 
                    onClick={() => { setPortal(null); setError(''); }}
                    className="absolute left-0 p-3 text-slate-300 hover:text-brand-dark hover:bg-slate-100 rounded-2xl transition-all"
                  >
                    <ArrowRight size={22} className="rotate-180" />
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-brand-dark mb-1 tracking-tight">
                      {portal === 'LIBRARIAN' ? 'Staff Login' : 'Student Login'}
                    </h2>
                    <p className="text-slate-500 font-medium text-xs tracking-tight">
                      Please enter your credentials to {isLogin ? 'sign in' : 'create an account'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-dark transition-colors" size={20} />
                            <input 
                              type="text" 
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Full Name" 
                              className="w-full pl-14 pr-6 py-4.5 bg-slate-50/50 border-2 border-slate-50/50 rounded-[1.25rem] outline-none focus:border-indigo-100 focus:bg-white transition-all font-bold text-brand-dark shadow-inner text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">Gender</label>
                          <div className="relative group">
                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={18} />
                            <select
                              required
                              value={gender}
                              onChange={(e) => setGender(e.target.value as any)}
                              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-brand-dark appearance-none cursor-pointer text-sm"
                            >
                              <option value="" disabled>Select</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com" 
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-brand-dark text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-dark transition-colors" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password" 
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-brand-dark text-sm"
                      />
                    </div>
                  </div>

                  {!isLogin && portal === 'LIBRARIAN' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="text-[9px] font-bold uppercase tracking-wider text-rose-500 px-2">Admin Authorization</label>
                      <div className="relative group">
                        <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-red-400 group-focus-within:text-red-600 transition-colors" size={20} />
                        <input 
                          type="password" 
                          required
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          placeholder="Enter Admin Code" 
                          className="w-full pl-14 pr-6 py-4.5 bg-rose-50/30 border-2 border-rose-50 rounded-[1.25rem] outline-none focus:border-rose-200 focus:bg-white transition-all font-bold text-brand-dark shadow-inner text-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-rose-600 text-xs font-bold px-2"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    disabled={loading}
                    className={cn(
                      "w-full py-4 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 mt-6 shadow-lg",
                      portal === 'LIBRARIAN' ? "bg-slate-800 hover:bg-slate-900 shadow-slate-900/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                    )}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={18} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-dark transition-colors"
                  >
                    {isLogin ? "Register New Account" : "Return to Sign In"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className="mt-10 text-center text-[11px] text-slate-500 font-medium tracking-wide">
          © 2026 Smart Library Pro. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
