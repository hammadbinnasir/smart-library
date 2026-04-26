import React from 'react';
import { Book as BookIcon, ChevronRight, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface BookCardProps {
  book: any;
  handleBorrow: (id: string) => void;
  handleReserve: (id: string) => void;
  fetchBookDetails: (book: any) => void;
}

export const BookCard = ({ book, handleBorrow, handleReserve, fetchBookDetails }: BookCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const [imgTier, setImgTier] = React.useState<'ol' | 'google' | 'fallback'>('ol');
  const [actionLoading, setActionLoading] = React.useState(false);
  const isAvailable = book.availableCopies > 0;

  if (imageError) return null;

  return (
    <Card className="group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border-slate-100/50 relative overflow-visible bg-white/80 backdrop-blur-sm">
      {/* Detail Button */}
      <button 
        onClick={() => fetchBookDetails(book)}
        className="absolute top-4 right-4 p-3 bg-brand-dark text-white hover:bg-indigo-600 rounded-xl shadow-xl border border-white/10 transition-all z-20 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
      >
        <ChevronRight size={20} strokeWidth={3} />
      </button>

      <div className="relative h-72 w-full bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100">
        {book.imageUrl || imgTier !== 'fallback' ? (
          <img 
            src={
              book.imageUrl || (
                imgTier === 'ol' 
                  ? `https://covers.openlibrary.org/b/isbn/${book.isbn.replace(/-/g, '')}-L.jpg`
                  : `https://books.google.com/books/content?vid=ISBN:${book.isbn.replace(/-/g, '')}&printsec=frontcover&img=1&zoom=1`
              )
            }
            alt={book.title}
            className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-700 z-10 drop-shadow-2xl"
            onError={() => {
              if (book.imageUrl) setImgTier('fallback'); // If custom URL fails, go straight to fallback
              else if (imgTier === 'ol') setImgTier('google');
              else setImgTier('fallback');
            }}
          />
        ) : (
          <div className={cn(
            "w-2/3 h-[85%] rounded-lg shadow-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden transition-all duration-500 group-hover:scale-105",
            book.category === 'Technology' ? "bg-indigo-600" :
            book.category === 'Science' ? "bg-emerald-600" :
            book.category === 'Philosophy' ? "bg-amber-600" :
            book.category === 'Psychology' ? "bg-rose-600" :
            "bg-slate-700"
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <BookIcon size={32} className="text-white/40 mb-4" />
            <h5 className="text-white font-bold text-xs leading-tight mb-2 uppercase tracking-wide px-2">
              {book.title}
            </h5>
            <div className="w-8 h-0.5 bg-white/30 mb-2" />
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-tighter">
              {book.author}
            </p>
            <div className="absolute bottom-4 right-4 opacity-20">
              <BookIcon size={48} className="text-white" />
            </div>
          </div>
        )}
        {/* Soft elegant background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-slate-200/20" />
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
            <BookIcon size={20} />
          </div>
          <span className={cn(
            "px-3 py-1 rounded-lg text-[10px] font-bold tracking-tight shadow-sm border",
            isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
          )}>
            {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
          </span>
        </div>
        
        <h4 className="text-lg font-bold text-brand-dark mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h4>
        <p className="text-slate-500 text-xs mb-6 font-medium">by {book.author}</p>
        
        <div className="flex items-center gap-2 mb-8">
          <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-200">
            {book.category}
          </span>
          <span className="px-3 py-1 bg-indigo-50/50 text-indigo-600 text-[11px] font-semibold rounded-lg border border-indigo-100 flex items-center gap-2">
            <Clock size={12} /> 14-Day Limit
          </span>
        </div>

        <div className="flex gap-4">
          {book.isBorrowedByUser ? (
            <button 
              disabled
              className="flex-1 py-4 bg-slate-100 text-slate-400 text-xs font-bold rounded-2xl border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock size={16} />
              Already Borrowed
            </button>
          ) : isAvailable ? (
            <button 
              onClick={async () => {
                setActionLoading(true);
                await handleBorrow(book.id);
                setActionLoading(false);
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-brand-dark text-white text-xs font-bold rounded-2xl hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Borrow Book'}
            </button>
          ) : (
            <button 
              onClick={async () => {
                setActionLoading(true);
                await handleReserve(book.id);
                setActionLoading(false);
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-indigo-600 text-white text-xs font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>
                  <Clock size={16} />
                  Reserve Book
                </>
              )}
            </button>
          )}
          <button 
            onClick={() => fetchBookDetails(book)}
            className="px-4 py-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </Card>
  );
};
