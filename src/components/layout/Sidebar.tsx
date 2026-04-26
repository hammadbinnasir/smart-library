import React from 'react';
import { 
  Library, 
  LayoutDashboard, 
  Search, 
  Clock, 
  Filter,
  Bell,
  History as HistoryIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  userRole?: string;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative",
      active 
        ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    )}
  >
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-6 bg-indigo-400 rounded-r-full"
      />
    )}
    <Icon size={22} strokeWidth={active ? 2.5 : 2} className={cn("transition-transform group-hover:scale-110", active ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-300")} />
    <span className={cn("text-[13px] font-semibold tracking-wide", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")}>{label}</span>
  </button>
);

export const Sidebar = ({ activeTab, setActiveTab, userRole }: SidebarProps) => {
  return (
    <aside className="w-72 bg-brand-dark p-8 flex flex-col gap-10 shrink-0 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full -mr-16 -mt-16" />
      
      <div className="flex items-center gap-4 px-2 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_25px_rgba(79,70,229,0.3)] rotate-[-6deg]">
          <Library size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">Smart<span className="text-indigo-400">Lib</span></h1>
          <span className="text-[10px] font-bold tracking-wider text-indigo-400/60 uppercase">Management</span>
        </div>
      </div>

      <nav className="flex flex-col gap-3 relative z-10">
        {userRole === 'LIBRARIAN' && (
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
        )}
        <SidebarItem 
          icon={Search} 
          label="Book Search" 
          active={activeTab === 'search'} 
          onClick={() => setActiveTab('search')} 
        />
        <SidebarItem 
          icon={Clock} 
          label="Reservations" 
          active={activeTab === 'reservations'} 
          onClick={() => setActiveTab('reservations')} 
        />
        <SidebarItem 
          icon={HistoryIcon} 
          label="Borrowing History" 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
        />
        {userRole === 'LIBRARIAN' && (
          <SidebarItem 
            icon={Filter} 
            label="Inventory" 
            active={activeTab === 'moderation'} 
            onClick={() => setActiveTab('moderation')} 
          />
        )}
      </nav>

    </aside>
  );
};
