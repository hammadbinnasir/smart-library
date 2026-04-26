import React from 'react';
import { Clock, Users, Bell, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface ReservationsProps {
  stats: any;
  reservations: any[];
  handleCancel: (reservationId: string, bookId: string) => void;
  user: any;
}

export const Reservations = ({ stats, reservations, handleCancel, user }: ReservationsProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-10 text-center max-w-3xl mx-auto group shadow-2xl shadow-indigo-100/40 relative overflow-hidden bg-white border-slate-100 transition-all hover:border-indigo-200">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full group-hover:scale-125 transition-transform duration-1000 -z-0"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-50/50 rounded-full group-hover:scale-125 transition-transform duration-1000 -z-0"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-100/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-indigo-100">
            <Clock size={48} />
          </div>
          
          <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
            Reservation System
          </h3>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
            "When a book returns, the first member in line is automatically notified. Reservations are held for 
            <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded mx-1 font-semibold">48 Hours</span> 
            before moving to the next member."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-slate-50/50 rounded-3xl p-8 border-2 border-slate-100/50 hover:bg-white hover:border-indigo-100 transition-all shadow-sm group/card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover/card:bg-indigo-600 group-hover/card:text-white transition-colors">
                  <Users size={22} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">System Capacity</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Active Reservations</span>
                  <span className="font-bold px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600">{stats?.activeReservations || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Average Wait Time</span>
                  <span className="font-bold px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100 text-amber-600">4.2 Days</span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Load</span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Optimized</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-50">
                    <div className="bg-indigo-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-3xl p-8 border-2 border-slate-100/50 hover:bg-white hover:border-amber-100 transition-all shadow-sm group/card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover/card:bg-amber-600 group-hover/card:text-white transition-colors">
                  <Bell size={22} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Personal Notifications</h4>
              </div>
              <div className="space-y-3">
                 <div className="flex items-start gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="mt-0.5 text-amber-500 shrink-0"><Info size={16} /></div>
                    <p className="text-xs text-slate-600 font-medium">Email and SMS notifications are sent once availability is confirmed.</p>
                 </div>
                 <div className="flex items-start gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="mt-0.5 text-indigo-500 shrink-0"><CheckCircle2 size={16} /></div>
                    <p className="text-xs text-slate-600 font-medium">Members can forfeit queue positions at any time without penalty.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Waiting List Records */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Clock size={18} /></div>
             <h3 className="text-xl font-bold text-slate-800">
               {user?.role === 'LIBRARIAN' ? 'Global Waiting List' : 'My Reservations'}
             </h3>
          </div>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {reservations.length} Active Entries
          </span>
        </div>

        {reservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservations.map((res: any) => (
              <Card key={res.id} className="p-6 bg-white border-slate-100 hover:border-indigo-200 transition-all shadow-sm group">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-16 bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100 shrink-0">
                    <img 
                      src={`https://covers.openlibrary.org/b/isbn/${res.book.isbn.replace(/-/g, '')}-M.jpg`}
                      alt={res.book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543005128-d39e54a02fd3?q=80&w=100' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{res.book.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">by {res.book.author}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-bold rounded uppercase border border-amber-100">
                        WAITING
                      </span>
                    </div>
                    
                    <div className="flex items-end justify-between mt-4">
                       <div className="space-y-1">
                         {user?.role === 'LIBRARIAN' && (
                           <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-2">
                             <Users size={12} /> {res.user.name}
                           </div>
                         )}
                         <div className="flex items-center gap-2">
                           <div className="px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tight">Position: #{res.queuePosition}</div>
                           <div className="text-[10px] text-slate-400 font-medium tracking-tight">Joined {format(new Date(res.reservedAt), 'MMM dd, yyyy')}</div>
                         </div>
                       </div>
                       
                       <button
                         onClick={() => handleCancel(res.id, res.bookId)}
                         className="px-3 py-1.5 bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                       >
                         Remove
                       </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm text-slate-300">
               <Clock size={40} />
            </div>
            <p className="font-bold text-slate-500">No Active Reservations</p>
            <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
              Books that are out of stock will appear here when you join the waiting list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
