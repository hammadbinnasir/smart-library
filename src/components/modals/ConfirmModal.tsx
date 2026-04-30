import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning';
}

export const ConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete",
  type = 'danger' 
}: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto border border-slate-100"
            >
              <div className="relative p-10 text-center">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>

                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500",
                  type === 'danger' ? "bg-rose-50 text-rose-500 shadow-rose-100" : "bg-amber-50 text-amber-500 shadow-amber-100"
                )}>
                  <AlertTriangle size={40} strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4 font-medium">
                  {message}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 border border-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await onConfirm();
                      onClose();
                    }}
                    className={cn(
                      "flex-1 py-4 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-xl",
                      type === 'danger' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-brand-dark hover:bg-slate-800 shadow-slate-200"
                    )}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
