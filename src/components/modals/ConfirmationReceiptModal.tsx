import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

interface ConfirmationReceiptModalProps {
  confirmation: {
    show: boolean;
    requestId: string;
    studentName: string;
    matricula: string;
    date: string;
    bookTitle: string;
    bookAuthor: string;
  };
  onClose: () => void;
}

export const ConfirmationReceiptModal: React.FC<ConfirmationReceiptModalProps> = ({ 
  confirmation, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
        className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full space-y-6 my-8"
      >
        <div className="flex justify-between items-start">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="p-2 hover:bg-violet-50 rounded-xl transition-colors text-violet-600"
              title="Imprimir"
            >
              <FileSpreadsheet className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-violet-50 rounded-xl transition-colors">
              <X className="w-6 h-6 text-violet-400" />
            </button>
          </div>
        </div>
        
        <div className="space-y-6 print:m-0" id="printable-receipt">
          <div className="text-center">
            <h3 className="text-3xl font-serif font-bold text-violet-950">¡Donación Confirmada!</h3>
            <p className="text-violet-500">Comprobante de Solicitud de Donación</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-violet-50 rounded-3xl border border-violet-100">
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">ID de Solicitud</p>
              <p className="text-violet-900 font-mono font-bold">{confirmation.requestId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Fecha</p>
              <p className="text-violet-900 font-bold">{confirmation.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Nombre</p>
              <p className="text-violet-900 font-bold">{confirmation.studentName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Matrícula</p>
              <p className="text-violet-900 font-bold">{confirmation.matricula}</p>
            </div>
            <div className="col-span-full border-t border-violet-100 pt-4 mt-2">
              <p className="text-violet-400 uppercase font-bold text-[10px] mb-2">Libro para Donación</p>
              <div className="bg-white p-4 rounded-2xl border border-violet-100">
                <p className="text-lg font-serif font-bold text-violet-950">{confirmation.bookTitle}</p>
                <p className="text-sm text-violet-500">{confirmation.bookAuthor}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold uppercase">Instrucciones Importantes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Presenta este comprobante (digital o impreso) en la biblioteca.</li>
                <li>Este libro es para tu proceso de donación para titulación.</li>
                <li>Asegúrate de entregar el libro físico para completar el trámite.</li>
              </ul>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full print:hidden">Cerrar</button>
      </motion.div>
    </div>
  );
};
