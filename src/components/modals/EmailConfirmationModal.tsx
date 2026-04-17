import React from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface EmailConfirmationModalProps {
  studentEmail: string;
  setStudentEmail: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ 
  studentEmail, 
  setStudentEmail, 
  onClose, 
  onConfirm, 
  loading 
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
        className="relative bg-white dark:bg-violet-950 rounded-3xl p-8 shadow-2xl max-w-md w-full space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-violet-950 dark:text-white">Confirmar Donación</h3>
          <p className="text-violet-500">Ingresa tu correo electrónico para recibir la confirmación de tu donación.</p>
        </div>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="tu@correo.com"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button 
            onClick={onConfirm} 
            disabled={!studentEmail || loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
