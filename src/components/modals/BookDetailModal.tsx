import React from 'react';
import { motion } from 'motion/react';
import { Book as BookIcon, X, Info } from 'lucide-react';
import { Book } from '../../types';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white dark:bg-violet-950 rounded-3xl p-8 shadow-2xl max-w-sm w-full space-y-6"
      >
        <div className="flex justify-between items-start">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center">
            <BookIcon className="w-8 h-8" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-xl transition-colors">
            <X className="w-6 h-6 text-violet-400" />
          </button>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-violet-950 dark:text-white">{book.tituloLibro}</h3>
          
          <div className="space-y-4 bg-violet-50 dark:bg-violet-900/10 p-5 rounded-2xl border border-violet-100 dark:border-violet-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-violet-950 rounded-lg text-violet-400">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-violet-400 uppercase font-bold tracking-wider">Autor</p>
                <p className="text-sm font-bold text-violet-950 dark:text-violet-200">{book.autor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-violet-950 rounded-lg text-violet-400">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-violet-400 uppercase font-bold tracking-wider">Carrera</p>
                <p className="text-sm font-bold text-violet-950 dark:text-violet-200">{book.programaEducativo || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-violet-100 dark:border-violet-900/20">
              <div>
                <p className="text-[10px] text-violet-400 uppercase font-bold tracking-wider text-center">Año</p>
                <p className="text-sm font-bold text-violet-950 dark:text-violet-200 text-center">{book.año || 'N/A'}</p>
              </div>
              <div className="border-l border-violet-100 dark:border-violet-900/20">
                <p className="text-[10px] text-violet-400 uppercase font-bold tracking-wider text-center">Editorial</p>
                <p className="text-sm font-bold text-violet-950 dark:text-violet-200 text-center">{book.editorial || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full shadow-lg shadow-violet-200">Cerrar</button>
      </motion.div>
    </div>
  );
};
