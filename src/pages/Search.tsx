import React from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BookCard } from '../components/books/BookCard';
import { cn } from '../lib/utils';

interface SearchProps {
  books: any[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  filterAvailable: boolean;
  setFilterAvailable: (a: boolean) => void;
  allCategories: string[];
  fetchBooks: () => void;
  handleBorrow: (id: string) => void;
  handleReserve: (id: string) => void;
  fetchBookDetails: (book: any) => void;
}

export const Search = ({ 
  books, 
  loading, 
  searchQuery, 
  setSearchQuery, 
  filterCategory, 
  setFilterCategory, 
  filterAvailable, 
  setFilterAvailable, 
  allCategories,
  fetchBooks,
  handleBorrow,
  handleReserve,
  fetchBookDetails
}: SearchProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Floating Sticky Search Header */}
      <div className="sticky top-[-32px] z-20 -mx-8 px-8 py-4 bg-slate-50/80 backdrop-blur-md transition-all duration-500">
        <Card className="p-6 group shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] overflow-visible border-white bg-white/90">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 relative group/input">
              <SearchIcon 
                className={cn(
                  "absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-all duration-300",
                  searchQuery && "text-indigo-600"
                )} 
                size={20} 
                strokeWidth={2.5}
              />
              <input 
                type="text" 
                placeholder="Search catalog by title, author, or ISBN..."
                className="w-full pl-14 pr-8 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm text-slate-800 font-semibold placeholder:font-medium placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative group/select">
                <select 
                  className="pl-12 pr-10 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-600 font-bold text-[11px] appearance-none cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-indigo-600" size={16} strokeWidth={2} />
              </div>
              
              <label className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group/label">
                <input 
                  type="checkbox" 
                  checked={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 transition-transform cursor-pointer accent-indigo-600"
                />
                <span className="text-[11px] text-slate-600 font-bold">Available Only</span>
              </label>
              
              <button 
                onClick={fetchBooks}
                className="px-8 py-4 bg-brand-dark text-white font-bold text-[11px] rounded-2xl hover:bg-slate-800 shadow-lg transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
              >
                <SearchIcon size={16} strokeWidth={2} />
                Search
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid Header */}
      <div className="flex justify-between items-center py-4 border-b border-slate-200 mb-6">
        <h3 className="text-sm font-bold text-slate-500">
           Found {books.length} entries matching search
        </h3>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Connected</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl border-2 border-slate-50"></div>
          ))
        ) : books.length > 0 ? books.map(book => (
          <BookCard 
            key={book.id} 
            book={book} 
            handleBorrow={handleBorrow} 
            handleReserve={handleReserve}
            fetchBookDetails={fetchBookDetails}
          />
        )) : (
          <div className="col-span-full text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon size={48} />
            </div>
            <h4 className="text-xl font-bold text-slate-600">No books found</h4>
            <p className="text-slate-500 font-medium mt-2 px-10">
              We couldn't find any books matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
