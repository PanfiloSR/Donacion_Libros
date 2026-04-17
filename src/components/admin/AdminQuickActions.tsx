import React from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminQuickActionsProps {
  uploadStatus: { type: 'success' | 'error' | 'warning', text: string } | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'students' | 'books') => void;
  setArchiveModal: (val: { show: boolean, type: string | null }) => void;
}

export const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  uploadStatus,
  handleFileUpload,
  setArchiveModal
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
          <Upload className="w-5 h-5 text-violet-600" /> Carga Masiva
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-violet-700">Alumnos (Excel)</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, 'students')}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Seleccionar
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-violet-700">Libros (Excel)</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, 'books')}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Seleccionar
              </div>
            </div>
          </div>
        </div>
        {uploadStatus && (
          <div className={cn(
            "p-4 rounded-2xl text-sm font-medium flex items-center gap-2",
            uploadStatus.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          )}>
            <FileSpreadsheet className="w-4 h-4" /> {uploadStatus.text}
          </div>
        )}
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-6">
        <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-rose-600" /> Cierre de Periodo
        </h3>
        <p className="text-sm text-violet-500">Archiva los registros actuales para comenzar un nuevo cuatrimestre.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setArchiveModal({ show: true, type: 'students' })}
            className="p-4 rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Archivar Alumnos
          </button>
          <button 
            onClick={() => setArchiveModal({ show: true, type: 'books' })}
            className="p-4 rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Archivar Libros
          </button>
          <button 
            onClick={() => setArchiveModal({ show: true, type: 'bookings' })}
            className="p-4 rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold flex items-center justify-center gap-2 col-span-full"
          >
            <FileSpreadsheet className="w-4 h-4" /> Archivar Donaciones
          </button>
        </div>
      </div>
    </div>
  );
};
