import React from 'react';
import { Search, Plus, Clock, UsersRound } from 'lucide-react';
import { Book } from '../../types';
import { cn } from '../../lib/utils';

interface AdminBooksProps {
  books: Book[];
  bookSearch: string;
  setBookSearch: (val: string) => void;
  showOnlyCommunal: boolean;
  setShowOnlyCommunal: (val: boolean) => void;
  peFilter: string;
  setPeFilter: (val: string) => void;
  allPEs: string[];
  setAddBookModal: (val: boolean) => void;
  setArchiveModal: (val: any) => void;
}

export const AdminBooks: React.FC<AdminBooksProps> = ({ 
  books, 
  bookSearch, 
  setBookSearch, 
  showOnlyCommunal, 
  setShowOnlyCommunal, 
  peFilter, 
  setPeFilter, 
  allPEs,
  setAddBookModal,
  setArchiveModal
}) => {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-violet-50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-violet-950">Inventario de Libros</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setAddBookModal(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-emerald-100"
            >
              <Plus className="w-3 h-3" /> Agregar Libro
            </button>
            <button 
              onClick={() => setArchiveModal({ show: true, type: 'books' })}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-rose-100"
            >
              <Clock className="w-3 h-3" /> Archivar Periodo
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input 
              type="text" 
              placeholder="Buscar por título o autor..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowOnlyCommunal(!showOnlyCommunal)}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm font-bold transition-all flex items-center gap-2",
                showOnlyCommunal 
                  ? "bg-amber-100 text-amber-700 border-amber-200" 
                  : "bg-white text-violet-400 border-violet-100 hover:text-violet-600"
              )}
            >
              <UsersRound className="w-4 h-4" /> Solo Comunales
            </button>
            <select 
              value={peFilter}
              onChange={(e) => setPeFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white text-sm"
            >
              <option value="all">Todas las Carreras</option>
              {allPEs.map(pe => (
                <option key={pe} value={pe}>{pe}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Autor</th>
              <th className="px-6 py-4">Carrera</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50">
            {books.map(b => (
              <tr key={b.id} className="hover:bg-violet-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-violet-900">{b.tituloLibro}</td>
                <td className="px-6 py-4 text-sm text-violet-600">{b.autor}</td>
                <td className="px-6 py-4 text-sm text-violet-500">{b.programaEducativo}</td>
                <td className="px-6 py-4">
                  {b.isCommunal && (
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                      Comunal
                    </span>
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
