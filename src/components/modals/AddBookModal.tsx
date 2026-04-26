import React from 'react';
import { X, Plus, Book as BookIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';

interface AddBookModalProps {
  show: boolean;
  onClose: () => void;
  newBook: any;
  setNewBook: (b: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const AddBookModal = ({ show, onClose, newBook, setNewBook, handleSubmit }: AddBookModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl overflow-visible relative border-t-8 border-indigo-600 bg-white rounded-3xl">
              <button 
                onClick={onClose}
                className="absolute -top-3 -right-3 p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl shadow-xl border border-slate-100 transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 border border-indigo-100">
                    <BookIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Add New Book</h3>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Catalog Management</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Book Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. The Art of Leadership"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 font-semibold transition-all placeholder:text-slate-300"
                      value={newBook.title}
                      onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Author Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Full name of author"
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 font-semibold transition-all placeholder:text-slate-300"
                        value={newBook.author}
                        onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                      <select 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 font-semibold transition-all text-slate-700 cursor-pointer"
                        value={newBook.category}
                        onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                      >
                        <option value="Fiction">Fiction</option>
                        <option value="Dystopian">Dystopian</option>
                        <option value="Classic">Classic</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="History">History</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 font-semibold transition-all"
                      value={newBook.totalCopies}
                      onChange={(e) => setNewBook({...newBook, totalCopies: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Cover Image (Optional)</label>
                    
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all group relative overflow-hidden">
                      {newBook.imagePreview ? (
                        <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-xl border-2 border-white">
                          <img src={newBook.imagePreview} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setNewBook({ ...newBook, coverFile: null, imagePreview: null })}
                            className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-3 shadow-sm border border-slate-100">
                            <Plus size={24} />
                          </div>
                          <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">Click to upload cover</p>
                          <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-widest font-semibold">JPG, PNG or WEBP</p>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewBook({ 
                                ...newBook, 
                                coverFile: file, 
                                imagePreview: reader.result as string 
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 ml-1 text-center">Leaving this empty will use the automatic book cover generator</p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-slate-900 text-white font-bold uppercase tracking-wider rounded-3xl hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
                  >
                    <Plus size={20} />
                    Add to Catalog
                  </button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
