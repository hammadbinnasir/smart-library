import React from 'react';
import { 
  Book as BookIcon, 
  Clock, 
  AlertCircle, 
  BarChart as BarChartIcon, 
  Bell, 
  CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { cn } from '../lib/utils';

interface DashboardProps {
  stats: any;
  loading: boolean;
  handleReturn: (id: string) => void;
  handleProcessOverdue: () => void;
  handleProcessDueSoon: () => void;
  notifications: any[];
  handleMarkAsRead: (id: string) => void;
  user: any;
}

export const Dashboard = ({ 
  stats, 
  loading, 
  handleReturn, 
  handleProcessOverdue, 
  handleProcessDueSoon,
  notifications,
  handleMarkAsRead,
  user
}: DashboardProps) => {
  // We no longer return null if stats is missing, so Students can see their Inbox.
  const overdueCount = stats?.overdue?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Student Welcome Header */}
      {user?.role === 'STUDENT' && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4 tracking-tight">Welcome back, {user.name}! 👋</h1>
            <p className="text-indigo-100 text-lg font-medium max-w-xl leading-relaxed">
              "Your next great adventure is just a search away. Manage your borrowings, check for due dates, and explore our vast collection."
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid - Librarian Only */}
      {user?.role === 'LIBRARIAN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            label="Total Books" 
            value={stats?.totalBooks || 0} 
            icon={BookIcon} 
            color="indigo" 
          />
          <StatCard 
            label="Active Reservations" 
            value={stats?.activeReservations || 0} 
            icon={Clock} 
            color="amber" 
          />
          <StatCard 
            label="Overdue Items" 
            value={stats?.overdue?.length || 0} 
            icon={AlertCircle} 
            color="rose" 
          />
        </div>
      )}

      {user?.role === 'LIBRARIAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most Borrowed Chart */}
          <Card className="p-10 group overflow-visible relative">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-indigo-50/50 text-indigo-600 rounded-[1.25rem] group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-indigo-100/50">
                <BarChartIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark tracking-tight">
                Most Popular Books
              </h3>
            </div>
            <div className="h-80 w-full px-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.mostBorrowed || []} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    width={140} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600, letterSpacing: '0.02em' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(79, 70, 229, 0.03)' }}
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.4)', 
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', 
                      padding: '16px' 
                    }}
                  />
                  <Bar dataKey="borrowedCount" radius={[0, 12, 12, 0]} barSize={28}>
                    {(stats?.mostBorrowed || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#312E81', '#4338CA', '#4F46E5', '#6366F1', '#818CF8'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Overdue List */}
          <Card className="p-10 group shadow-2xl shadow-rose-900/5 border-rose-50/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[60px] rounded-full -mr-16 -mt-16" />
            
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-[1.25rem] group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-brand-dark tracking-tight">
                  Current Overdue Books
                </h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleProcessDueSoon}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-2xl hover:bg-indigo-600 hover:text-white shadow-sm transition-all disabled:opacity-50 active:scale-95 border border-indigo-100/50"
                >
                  {loading ? 'Processing...' : 'Process Due Tomorrow Alerts'}
                </button>
                <button 
                  onClick={handleProcessOverdue}
                  disabled={loading}
                  className="px-6 py-3 bg-brand-dark text-white text-xs font-bold rounded-2xl hover:bg-slate-800 shadow-md transition-all disabled:opacity-50 active:scale-95 border border-white/10"
                >
                  {loading ? 'Processing...' : 'Send Overdue Notifications'}
                </button>
              </div>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {stats?.overdue?.length > 0 ? stats.overdue.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-rose-50/50 rounded-2xl border border-rose-100 hover:bg-rose-50 transition-colors group/item">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-50 group-hover/item:scale-110 transition-transform">
                      <BookIcon size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.bookTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase bg-white px-2 py-0.5 rounded border border-slate-100">{item.userName}</span>
                        <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                          <Clock size={12} /> {format(new Date(item.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleReturn(item.id)}
                    className="px-4 py-2 bg-white text-rose-600 text-xs font-bold uppercase tracking-wider rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                    Return
                  </button>
                </div>
              )) : (
                <div className="text-center py-16 text-slate-400">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100 border-dashed">
                    <CheckCircle2 size={40} />
                  </div>
                  <p className="font-bold text-slate-400">Perfect Record! No overdues.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Student Notifications Inbox */}
      {user?.role === 'STUDENT' && (
        <Card className="p-10 group shadow-2xl shadow-indigo-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -ml-32 -mt-32" />
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[1.25rem] group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <Bell size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark tracking-tight">
              Your Alerts Inbox
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {notifications.length > 0 ? notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-6 rounded-[2rem] border transition-all flex items-start gap-4 group/notif",
                  notif.isRead 
                    ? "bg-slate-50/50 border-slate-100 opacity-60" 
                    : "bg-white border-indigo-100 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl shrink-0 transition-colors",
                  notif.type === 'DUE_SOON' ? "bg-amber-50 text-amber-500" : "bg-indigo-50 text-indigo-500"
                )}>
                  {notif.type === 'DUE_SOON' ? <Clock size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {notif.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {format(new Date(notif.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-4">{notif.message}</p>
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      Mark as read <CheckCircle2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">Your inbox is clear! Check back later.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Notification Logs (Librarian only) */}
      {user?.role === 'LIBRARIAN' && (
        <Card className="p-8 group">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Bell size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Recent Activity Log</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.notificationLogs && stats.notificationLogs.length > 0 ? stats.notificationLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{log.message}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase border border-indigo-200">Recorded</span>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Activity logs are clear. No recent events.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
