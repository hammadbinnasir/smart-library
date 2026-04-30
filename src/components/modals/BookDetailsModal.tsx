import React from 'react';
import { X, Book as BookIcon, History as HistoryIcon, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface BookDetailsModalProps {
  show: boolean;
  onClose: () => void;
  details: any;
  loading: boolean;
  onCancelReservation?: (reservationId: string, bookId: string) => void;
  currentUser?: any;
}

export const BookDetailsModal = ({ show, onClose, details, loading, onCancelReservation, currentUser }: BookDetailsModalProps) => {
  const [imgTier, setImgTier] = React.useState<'ol' | 'google' | 'fallback'>('ol');

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 450 }}
            className="w-full max-w-4xl"
          >
            <Card className="shadow-2xl overflow-hidden relative border border-slate-100 bg-white/95 rounded-3xl">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Left Side: Info */}
                <div className="w-full md:w-1/3 bg-slate-50/50 p-8 border-r border-slate-100 flex flex-col items-center">
                    <div className="w-full aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl mb-8 group bg-slate-200 flex items-center justify-center">
                      {loading && !details?.book?.isbn ? (
                        <div className="w-full h-full animate-pulse" />
                      ) : (details?.book?.imageUrl || imgTier !== 'fallback') ? (
                        <img 
                          src={
                            details?.book?.imageUrl || (
                              imgTier === 'ol' 
                                ? `https://covers.openlibrary.org/b/isbn/${details?.book?.isbn?.replace(/-/g, '')}-L.jpg`
                                : `https://books.google.com/books/content?vid=ISBN:${details?.book?.isbn?.replace(/-/g, '')}&printsec=frontcover&img=1&zoom=1`
                            )
                          }
                          alt={details?.book?.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => {
                            if (details?.book?.imageUrl) setImgTier('fallback');
                            else if (imgTier === 'ol') setImgTier('google');
                            else setImgTier('fallback');
                          }}
                        />
                      ) : (
                        <div className={cn(
                          "w-full h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden",
                          details?.book?.category === 'Technology' ? "bg-indigo-600" :
                          details?.book?.category === 'Science' ? "bg-emerald-600" :
                          details?.book?.category === 'Philosophy' ? "bg-amber-600" :
                          details?.book?.category === 'Psychology' ? "bg-rose-600" :
                          "bg-slate-700"
                        )}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <BookIcon size={48} className="text-white/40 mb-6" />
                          <h5 className="text-white font-bold text-lg leading-tight mb-4 uppercase tracking-wide">
                            {details?.book?.title}
                          </h5>
                          <div className="w-12 h-1 bg-white/30 mb-4" />
                          <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
                            {details?.book?.author}
                          </p>
                          <div className="absolute -bottom-10 -right-10 opacity-10">
                            <BookIcon size={160} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  
                  <div className="space-y-2 w-full text-center">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                      {details?.book?.title}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm">by {details?.book?.author}</p>
                  </div>
                  
                  <div className="space-y-4 pt-10">
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                        <span>ISBN</span>
                        <span className="text-indigo-600 font-medium tracking-tight">
                          {details?.book?.isbn || "..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                        <span>Category</span>
                        <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">{details?.book?.category || "..."}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                        <span>Stock Status</span>
                        <span className="text-slate-600 uppercase tracking-tight">{details?.book?.totalCopies ? `${details?.book?.totalCopies} COPIES` : "..."}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Data Lists */}
                <div className="flex-1 p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Latest Activity */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><HistoryIcon size={18} /></div>
                         <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Activity</h4>
                      </div>
                      <div className="space-y-3">
                        {loading && details?.history?.length === 0 ? (
                          [1,2].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />)
                        ) : details?.history?.length > 0 ? details.history.map((t: any) => (
                          <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all shadow-sm group">
                             <div className="flex justify-between items-start mb-1">
                               <p className="text-xs font-bold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{t.userName}</p>
                               <span className={cn(
                                 "text-[8px] font-bold uppercase px-2 py-0.5 rounded shadow-inner",
                                 t.status === 'RETURNED' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                               )}>{t.status}</span>
                             </div>
                             <p className="text-[10px] text-slate-500 font-medium tracking-tight">Borrowed {format(new Date(t.borrowDate), 'MMM dd, yyyy')}</p>
                          </div>
                        )) : (
                          <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-100 opacity-50">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Activity Yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Waiting Queue */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={18} /></div>
                         <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Waiting List</h4>
                      </div>
                      <div className="space-y-3">
                        {loading && details?.queue?.length === 0 ? (
                          [1,2].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />)
                        ) : details?.queue?.length > 0 ? details.queue.map((r: any) => {
                          const canCancel = currentUser && (currentUser.id === r.userId || currentUser.role === 'LIBRARIAN');
                          return (
                          <div key={r.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 hover:bg-white transition-all shadow-sm group flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-amber-600 border border-amber-50 shadow-sm font-bold text-[10px]">Q{r.queuePosition}</div>
                                <div>
                                   <p className="text-xs font-bold text-slate-800 uppercase tracking-tight group-hover:text-amber-600 transition-colors">{r.userName}</p>
                                   <p className="text-[10px] text-slate-400 font-medium tracking-tight">Joined {format(new Date(r.reservedAt), 'MMM dd')}</p>
                                </div>
                             </div>
                             {canCancel && onCancelReservation ? (
                               <button
                                 onClick={() => onCancelReservation(r.id, details?.book?.id)}
                                 className="p-1.5 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-100 hover:border-rose-500"
                                 title="Cancel reservation"
                               >
                                 <X size={12} />
                               </button>
                             ) : (
                               <ArrowRight size={14} className="text-amber-200" />
                             )}
                          </div>
                          );
                        }) : (
                          <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-100 opacity-50">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Is Empty</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-slate-100 rounded-3xl text-slate-800 border border-slate-200">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                           <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">Total Borrowers</p>
                            <p className="text-sm font-medium text-slate-600 tracking-tight">
                              {loading && !details?.book?.borrowedCount ? "..." : (
                                <>This book has been borrowed <span className="text-brand-dark font-bold">{details?.book?.borrowedCount || 0} times</span></>
                              )}
                            </p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
