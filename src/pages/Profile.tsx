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
    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group h-full"
  >
    <div className={cn("p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform", color)}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-slate-900 font-semibold text-[15px] leading-snug break-all">{value}</p>
    </div>
  </motion.div>
);

export const Profile = ({ user, onUpdateUser, showToast }: ProfileProps) => {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  if (!user) return null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cover', file); // Use existing 'cover' field name from server

      const uploadRes = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const { imageUrl } = await uploadRes.json();

      const updateRes = await fetch('/api/me/profile-picture', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        onUpdateUser(updatedUser);
        showToast('success', 'Profile picture updated successfully!');
      } else {
        showToast('error', 'Failed to save profile picture.');
      }
    } catch (err) {
      showToast('error', 'Error uploading profile picture.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-brand-dark/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={handleUploadClick}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors z-10"
            >
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

      <div className="mt-12">
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
