import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight } from 'lucide-react';
import { Book, Booking } from '../../types';

interface SwapModalProps {
  activeBooking: Booking | undefined;
  newBook: Book | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ activeBooking, newBook, onClose, onConfirm }) => {
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
        className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <ArrowLeftRight className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-violet-950">Cambiar Donación</h3>
          <p className="text-violet-500">Ya tienes un libro seleccionado para donación. ¿Deseas liberar "{activeBooking?.bookTitle}" y seleccionar "{newBook?.tituloLibro}"?</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={onConfirm} className="btn-primary flex-1">Confirmar Cambio</button>
        </div>
      </motion.div>
    </div>
  );
};
