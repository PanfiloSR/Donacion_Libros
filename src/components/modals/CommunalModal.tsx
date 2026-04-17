import React from 'react';
import { motion } from 'motion/react';
import { UsersRound } from 'lucide-react';
import { Book } from '../../types';

interface CommunalModalProps {
  book: Book | null;
  email: string;
  reason: string;
  setEmail: (val: string) => void;
  setReason: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CommunalModal: React.FC<CommunalModalProps> = ({ 
  book,
  email, 
  reason, 
  setEmail, 
  setReason, 
  onClose, 
  onConfirm 
}) => {
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
        <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
          <UsersRound className="w-8 h-8" />
        </div>
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-serif font-bold text-violet-950">Donación Comunal</h3>
          <p className="text-lg text-violet-700 font-medium">
            Si este libro {book?.tituloLibro ? `"${book.tituloLibro}"` : ""} es costoso puedes solicitar donarlo con alguien mas.
          </p>
          <p className="text-sm text-violet-400">
            Se enviará una solicitud al administrador para habilitar la donación colaborativa para este título.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-violet-900">Tu Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com"
              className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-violet-900">Motivo (Opcional)</label>
            <textarea 
              placeholder="¿Por qué solicitas donación comunal?"
              className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950 min-h-[100px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button 
            onClick={onConfirm} 
            disabled={!email}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Solicitar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
