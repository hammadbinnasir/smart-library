import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  activeTab: string;
  notifications?: any[];
}

const tabTitles: Record<string, string> = {
  dashboard: 'Librarian Dashboard',
  search: 'Advanced Book Search',
  reservations: 'Reservation Queue',
  moderation: 'Inventory Moderation',
  history: 'My Borrowing History',
};

export const Navbar = ({ user, onLogout, activeTab, notifications = [] }: NavbarProps) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-xl sticky top-0 py-6 z- 20 border-b border-white/20 -mx-8 px-8">
      <div>
        <h2 className="text-3xl font-bold text-brand-dark tracking-tight leading-none">
          {tabTitles[activeTab] || 'Library System'}
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-xs tracking-tight">Active User: {user?.name}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md border border-white/10"
          >
            Sign Out
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className={cn(
                "p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all relative group shadow-sm",
                showNotifs && "text-indigo-600 border-indigo-200 ring-4 ring-indigo-50"
              )}
            >
              <Bell size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-4 w-96 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h3>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100">{notifications.length}</span>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif: any, i) => (
                      <div key={notif.id || i} className="p-5 border-b border-slate-50 hover:bg-white/50 transition-colors group">
                        <p className="text-xs font-bold text-slate-700 leading-relaxed group-hover:text-indigo-600 transition-colors">{notif.message}</p>
                        {notif.timestamp && (
                          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest opacity-50">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Bell size={28} className="opacity-30" />
                      </div>
                      <p className="text-xs font-medium text-slate-400">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-brand-dark tracking-tight">{user?.name}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">{user?.role}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 p-1 ring-2 ring-white shadow-xl rotate-3">
            <div className="w-full h-full rounded-xl overflow-hidden bg-white">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.gender?.toLowerCase() || 'neutral'}-${user?.id || 'Felix'}`}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
