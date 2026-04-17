import React from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, X } from 'lucide-react';
import { Booking } from '../../types';

interface AdminReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

export const AdminReceiptModal: React.FC<AdminReceiptModalProps> = ({ booking, onClose }) => {
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
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
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
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-3xl font-serif font-bold text-violet-950">Comprobante de Donación</h3>
            <p className="text-violet-500">Documento Oficial de Registro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-violet-50 rounded-3xl border border-violet-100">
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">ID de Registro</p>
              <p className="text-violet-900 font-mono font-bold">{booking.id?.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Fecha de Donación</p>
              <p className="text-violet-900 font-bold">{new Date(booking.bookingDate).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Nombre del Alumno</p>
              <p className="text-violet-900 font-bold">{booking.studentName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Matrícula</p>
              <p className="text-violet-900 font-bold">{booking.studentMatricula}</p>
            </div>
            <div className="col-span-full border-t border-violet-100 pt-4 mt-2">
              <p className="text-violet-400 uppercase font-bold text-[10px] mb-2">Libro para Donación</p>
              <div className="bg-white p-4 rounded-2xl border border-violet-100">
                <p className="text-lg font-serif font-bold text-violet-950">{booking.bookTitle}</p>
                <p className="text-sm text-violet-500">Estado: {booking.status}</p>
              </div>
            </div>
            <div className="col-span-full">
              <p className="text-violet-400 uppercase font-bold text-[10px]">Fecha Límite de Entrega</p>
              <p className="text-rose-600 font-bold">{new Date(booking.deadlineDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 text-center">
            <p className="text-[10px] text-violet-400 uppercase font-bold tracking-widest">Sello Digital de Validación</p>
            <div className="mt-2 font-mono text-[8px] text-violet-300 break-all">
              {btoa(JSON.stringify(booking)).substring(0, 128)}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full">Cerrar</button>
      </motion.div>
    </div>
  );
};
