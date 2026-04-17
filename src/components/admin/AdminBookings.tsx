import React from 'react';
import { Search, Archive } from 'lucide-react';
import { Booking } from '../../types';

interface AdminBookingsProps {
  bookings: Booking[];
  bookingSearch: string;
  setBookingSearch: (val: string) => void;
  setArchiveModal: (val: any) => void;
  setReceiptModal: (val: any) => void;
  handleMarkDonated: (booking: Booking) => void;
  handleRelease: (booking: Booking) => void;
  showHistory?: boolean;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({ 
  bookings, 
  bookingSearch, 
  setBookingSearch, 
  setArchiveModal, 
  setReceiptModal,
  handleMarkDonated,
  handleRelease,
  showHistory = false
}) => {
  if (showHistory) {
    return (
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-violet-50">
          <h3 className="text-xl font-bold text-violet-950">Historial de Donaciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Alumno</th>
                <th className="px-6 py-4">Libro</th>
                <th className="px-6 py-4">Fecha Donación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {bookings.filter(b => b.status === 'donated').map(b => (
                <tr key={b.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-black">{b.studentName}</div>
                    <div className="text-xs text-violet-900">{b.studentMatricula}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-violet-950">{b.bookTitle}</td>
                  <td className="px-6 py-4 text-sm text-violet-900">{new Date(b.bookingDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-violet-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-violet-950">Gestión de Donaciones</h3>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input 
              type="text" 
              placeholder="Buscar alumno, matrícula o libro..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-100 focus:ring-2 focus:ring-violet-500 outline-none text-sm"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setArchiveModal({ show: true, type: 'bookings' })}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-amber-100"
          >
            <Archive className="w-3 h-3" /> Archivar Periodo
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Alumno</th>
              <th className="px-6 py-4">Libro</th>
              <th className="px-6 py-4">Fecha Donación</th>
              <th className="px-6 py-4">Fecha Límite</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-violet-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-black">{b.studentName}</div>
                  <div className="text-xs text-violet-900">{b.studentMatricula}</div>
                </td>
                <td className="px-6 py-4 font-medium text-violet-950">{b.bookTitle}</td>
                <td className="px-6 py-4 text-sm text-violet-900">{new Date(b.bookingDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-violet-900">{new Date(b.deadlineDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button 
                    onClick={() => setReceiptModal({ show: true, booking: b })}
                    className="text-violet-600 hover:text-violet-700 font-bold text-xs"
                  >
                    Comprobante
                  </button>
                  <button 
                    onClick={() => handleMarkDonated(b)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                  >
                    Donar
                  </button>
                  <button 
                    onClick={() => handleRelease(b)}
                    className="text-rose-600 hover:text-rose-700 font-bold text-xs"
                  >
                    Liberar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
