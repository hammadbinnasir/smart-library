import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Briefcase,
  Camera,
  Heart,
  Settings,
  Edit,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { AccountSettingsModal } from '../components/modals/AccountSettingsModal';

interface ProfileProps {
  user: any;
  onUpdateUser: (user: any) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

const DetailCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group"
  >
    <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", color)}>
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-slate-900 font-semibold text-lg">{value}</p>
    </div>
  </motion.div>
);

export const Profile = ({ user, onUpdateUser, showToast }: ProfileProps) => {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500">
              <User size={48} strokeWidth={1.5} />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
              <Camera size={18} />
            </button>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">{user.name}</h1>
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                user.role === 'LIBRARIAN' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {user.role}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MapPin size={14} />
                Main Library Campus
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit size={18} />
            Edit Profile
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <Settings size={18} />
            Account Settings
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DetailCard 
          icon={Mail} 
          label="Email Address" 
          value={user.email} 
          color="bg-blue-50 text-blue-600" 
        />
        <DetailCard 
          icon={Shield} 
          label="Account Role" 
          value={user.role === 'LIBRARIAN' ? 'System Administrator' : 'Student Member'} 
          color="bg-purple-50 text-purple-600" 
        />
        <DetailCard 
          icon={Heart} 
          label="Gender" 
          value={user.gender || 'Not Specified'} 
          color="bg-rose-50 text-rose-600" 
        />
        <DetailCard 
          icon={Calendar} 
          label="Member Since" 
          value={user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'April 2026'} 
          color="bg-amber-50 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Activity className="text-indigo-500" />
                Member Statistics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
              <div className="text-center">
                <p className="text-[40px] font-black text-slate-900 leading-none mb-2">12</p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Books Borrowed</p>
              </div>
              <div className="text-center border-x border-slate-100 px-4">
                <p className="text-[40px] font-black text-indigo-600 leading-none mb-2">02</p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Reserves</p>
              </div>
              <div className="text-center">
                <p className="text-[40px] font-black text-emerald-500 leading-none mb-2">100%</p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Return Rate</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full -mb-40 -mr-40" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
                <Briefcase size={24} className="text-indigo-300" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Institutional Access</h2>
            </div>
            
            <p className="text-slate-400 mb-8 leading-relaxed relative z-10 max-w-lg">
              Your account is registered with the University Integrated Library System. You have premium access to all digital archives and physical borrowing privileges across all campus branches.
            </p>

            <div className="flex flex-wrap gap-3 relative z-10">
              {['Digital Archives', 'Physical Borrowing', 'Study Room Booking', 'Inter-library Loan'].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black mb-6">Recent Security</h3>
            <div className="space-y-6">
              {[
                { label: 'Password Changed', date: '2 days ago', status: 'Secure' },
                { label: 'New Login', date: '4 hours ago', status: 'Islamabad, PK' },
                { label: 'Email Verified', date: 'April 2026', status: 'Success' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20">
               <Shield size={64} strokeWidth={1} />
             </div>
             <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Privacy Check</p>
             <h3 className="text-lg font-bold mb-4">Your data is encrypted</h3>
             <p className="text-indigo-100 text-xs leading-relaxed mb-6">
               Your personal information is protected by industry standard encryption and is only visible to authorized personnel.
             </p>
             <button className="w-full py-3 bg-white text-indigo-700 rounded-2xl font-bold text-xs hover:bg-indigo-50 transition-colors">
               View Privacy Policy
             </button>
          </div>
        </aside>
      </div>

      <EditProfileModal 
        show={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        user={user} 
        onUpdate={(updated) => {
          onUpdateUser(updated);
          showToast('success', 'Profile updated successfully!');
        }} 
      />

      <AccountSettingsModal 
        show={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        onSuccess={(msg) => showToast('success', msg)}
      />
    </motion.div>
  );
};
