import React from 'react';
import { motion } from 'motion/react';
import { Archive } from 'lucide-react';

interface ArchiveModalProps {
  type: string | null;
  periodoId: string;
  setPeriodoId: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({ 
  type, 
  periodoId, 
  setPeriodoId, 
  onClose, 
  onConfirm, 
  loading 
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-violet-100"
      >
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Archive className="text-amber-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-violet-950 text-center mb-2">Archivar Periodo</h2>
        <p className="text-violet-500 text-center mb-6">
          Los registros actuales de <span className="font-bold text-violet-900 uppercase">{type}</span> se marcarán como archivados. 
          Por favor, ingresa un identificador para este periodo (ej. 2026-Q1).
        </p>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">ID del Periodo</label>
            <input 
              type="text" 
              placeholder="Ej. 2026-Q1"
              className="w-full px-6 py-4 rounded-2xl bg-violet-50 border border-violet-100 focus:ring-2 focus:ring-violet-500 outline-none font-bold text-violet-900"
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-violet-400 hover:bg-violet-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={!periodoId.trim() || loading}
            className="flex-1 py-4 rounded-2xl font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Archivando...' : 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
