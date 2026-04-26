import React from 'react';
import { Clock, Book as BookIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface HistoryProps {
  history: any[];
}

export const History = ({ history }: HistoryProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-8 group shadow-lg shadow-indigo-100/20">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
            <Clock size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            Borrowing History
          </h3>
        </div>

        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md group/item relative overflow-hidden">
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-2",
                    item.status === 'RETURNED' ? "bg-emerald-400" : 
                    item.status === 'OVERDUE' ? "bg-rose-400" : "bg-indigo-400"
                  )}></div>
                  
                  <div className="flex items-center gap-5 pl-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover/item:scale-110 transition-transform",
                      item.status === 'RETURNED' ? "bg-emerald-50 text-emerald-600" : 
                      item.status === 'OVERDUE' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      <BookIcon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight mb-1 group-hover/item:text-indigo-600 transition-colors">{item.bookTitle}</p>
                      {item.userName && (
                        <p className="text-[10px] text-indigo-500 font-bold mb-1 uppercase tracking-widest">{item.userName}</p>
                      )}
                      <p className="text-[11px] text-slate-500 font-medium">
                        Borrowed on {format(new Date(item.borrowDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2 pr-2">
                    <span className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border",
                      item.status === 'RETURNED' ? "bg-emerald-100/50 text-emerald-700 border-emerald-100" : 
                      item.status === 'OVERDUE' ? "bg-rose-100/50 text-rose-700 border-rose-100" : "bg-indigo-100/50 text-indigo-700 border-indigo-100"
                    )}>
                      {item.status}
                    </span>
                    <p className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {item.status === 'RETURNED' ? `Returned ${format(new Date(item.returnDate), 'MMM dd')}` : `Due ${format(new Date(item.dueDate), 'MMM dd')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-slate-50">
                <BookIcon size={32} />
              </div>
              <p className="font-bold text-slate-500 text-sm">No borrowing history found</p>
              <p className="text-slate-400 text-xs mt-2">When you borrow books, they will appear here.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
