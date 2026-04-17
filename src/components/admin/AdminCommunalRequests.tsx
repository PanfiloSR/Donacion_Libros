import React from 'react';
import { CommunalDonationRequest, Book } from '../../types';
import { cn } from '../../lib/utils';

interface AdminCommunalRequestsProps {
  communalRequests: CommunalDonationRequest[];
  allBooks: Book[];
  setSelectedBookInfo: (book: Book) => void;
  handleCommunalAction: (requestId: string, status: 'approved' | 'rejected') => void;
}

export const AdminCommunalRequests: React.FC<AdminCommunalRequestsProps> = ({ 
  communalRequests, 
  allBooks, 
  setSelectedBookInfo, 
  handleCommunalAction 
}) => {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-violet-50">
        <h3 className="text-xl font-bold text-violet-950">Solicitudes de Donación Comunal</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Libro</th>
              <th className="px-6 py-4">Alumno</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4">Motivo</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50">
            {communalRequests.map(req => (
              <tr key={req.id} className="hover:bg-violet-50/30 transition-colors">
                <td className="px-6 py-4">
                  <button 
                    onClick={() => {
                      const book = allBooks.find(b => b.id === req.bookId);
                      if (book) setSelectedBookInfo(book);
                    }}
                    className="font-bold text-black hover:text-violet-900 transition-colors text-left"
                  >
                    {req.bookTitle}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-violet-950">{req.studentName}</td>
                <td className="px-6 py-4 text-sm text-violet-500">{req.studentEmail}</td>
                <td className="px-6 py-4 text-sm text-violet-900 max-w-xs truncate">{req.reason}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                    req.status === 'pending' ? "bg-amber-100 text-amber-700" :
                    req.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                    "bg-rose-100 text-rose-700"
                  )}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {req.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleCommunalAction(req.id!, 'approved')}
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleCommunalAction(req.id!, 'rejected')}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
