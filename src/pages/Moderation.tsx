import React from 'react';
import { Plus, Users, ShieldCheck, Database, Book as BookIcon, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface ModerationProps {
  books: any[];
  allUsers: any[];
  setShowAddModal: (s: boolean) => void;
  fetchBookDetails: (book: any) => void;
  handleDeleteUser: (id: string) => void;
}

export const Moderation = ({ books, allUsers, setShowAddModal, fetchBookDetails, handleDeleteUser }: ModerationProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Management */}
        <Card className="lg:col-span-2 p-8 group shadow-lg shadow-indigo-100/10">
          <div className="flex justify-between items-center mb-10 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <Database size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Control</h3>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-4 bg-indigo-600 text-white font-bold uppercase tracking-wider rounded-2xl hover:bg-slate-900 transition-all flex items-center gap-2 shadow-xl shadow-indigo-200 active:scale-95"
            >
              <Plus size={20} />
              Add New Book
            </button>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-10 rounded-tl-2xl">Book Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-6 rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-indigo-50/50 transition-colors group/row text-sm">
                    <td className="px-6 py-5 pl-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover/row:scale-110 transition-transform">
                          <BookIcon size={18} />
                        </div>
                        <p className="font-bold text-slate-800 group-hover/row:text-indigo-600 transition-colors uppercase tracking-tight">{book.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-slate-500 font-medium tracking-tight">by {book.author}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            book.availableCopies > 0 ? "bg-emerald-500" : "bg-rose-500"
                          )}></div>
                          <span className="text-xs font-bold text-slate-700">
                            {book.availableCopies} / {book.totalCopies} Available
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              book.availableCopies > (book.totalCopies / 2) ? "bg-emerald-400" : "bg-amber-400"
                            )}
                            style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right pr-6">
                      <button 
                        onClick={() => fetchBookDetails(book)}
                        className="px-4 py-2 bg-white text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1 ml-auto"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* User Management & Access */}
        <Card className="p-8 group shadow-lg shadow-slate-100/10 border-indigo-50/50 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
          
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Member Directory</h3>
          </div>

          <div className="space-y-4 relative z-10">
            {allUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner p-0.5">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.gender?.toLowerCase() || 'neutral'}-${u.id}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover bg-white rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">{u.email}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-inner",
                      u.role === 'LIBRARIAN' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {u.role === 'LIBRARIAN' ? <ShieldCheck size={12} className="inline mr-1" /> : null}
                      {u.role}
                    </div>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors shadow-sm"
                      title="Remove Member"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                  </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-100 relative z-10">
            <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1">
               Administrative Note
            </p>
            <p className="text-xs text-indigo-700 leading-relaxed font-semibold">
              All administrative changes are logged by the system. Ensure book details are accurate before adding.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
