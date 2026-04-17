import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface AddBookModalProps {
  newBookData: {
    tituloLibro: string;
    autor: string;
    año: string;
    editorial: string;
    programaEducativo: string;
  };
  setNewBookData: (data: any) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ 
  newBookData, 
  setNewBookData, 
  onClose, 
  onConfirm, 
  loading 
}) => {
  return (
    <div className="fixed inset-0 bg-violet-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif font-bold text-violet-950">Agregar Libro Manual</h3>
          <button onClick={onClose} className="p-2 hover:bg-violet-50 rounded-xl transition-colors">
            <X className="w-5 h-5 text-violet-400" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Título del Libro</label>
            <input 
              type="text"
              value={newBookData.tituloLibro}
              onChange={(e) => setNewBookData({...newBookData, tituloLibro: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="Ej. Cálculo Diferencial"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Autor</label>
            <input 
              type="text"
              value={newBookData.autor}
              onChange={(e) => setNewBookData({...newBookData, autor: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="Nombre del autor"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Año</label>
              <input 
                type="text"
                value={newBookData.año}
                onChange={(e) => setNewBookData({...newBookData, año: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                placeholder="2023"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Editorial</label>
              <input 
                type="text"
                value={newBookData.editorial}
                onChange={(e) => setNewBookData({...newBookData, editorial: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                placeholder="Pearson"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Carrera / PE</label>
            <input 
              type="text"
              value={newBookData.programaEducativo}
              onChange={(e) => setNewBookData({...newBookData, programaEducativo: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="Ej. Ingeniería en Software"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-violet-100 text-violet-600 font-bold hover:bg-violet-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading || !newBookData.tituloLibro || !newBookData.autor || !newBookData.programaEducativo}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 disabled:opacity-50"
          >
            {loading ? 'Agregando...' : 'Guardar Libro'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
