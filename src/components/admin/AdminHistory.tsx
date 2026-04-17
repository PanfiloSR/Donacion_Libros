import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Archive, Search, Download, Users, BookOpen, Clock, Calendar } from 'lucide-react';
import { firestoreService } from '../../dal/firestoreService';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';

export const AdminHistory: React.FC = () => {
  const [category, setCategory] = useState<'students' | 'books' | 'bookings'>('bookings');
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPeriods = async () => {
      const p = await firestoreService.getAllArchivedPeriods(category);
      setPeriods(p);
      if (p.length > 0) {
        setSelectedPeriod(p[p.length - 1]);
      } else {
        setSelectedPeriod('');
        setResults([]);
      }
    };
    fetchPeriods();
  }, [category]);

  useEffect(() => {
    if (selectedPeriod) {
      handleSearch();
    }
  }, [selectedPeriod]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getArchivedData(category, selectedPeriod);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, `Reporte_${category}_${selectedPeriod}.xlsx`);
  };

  const filteredResults = results.filter(item => {
    const searchStr = JSON.stringify(item).toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-violet-950">Registros de Cierres</h2>
          <p className="text-violet-500">Consulta y descarga información de periodos anteriores.</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={results.length === 0}
          className="btn-primary py-2 px-6 flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      <div className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-violet-50 p-1 rounded-2xl">
            {[
              { id: 'students', label: 'Alumnos', icon: Users },
              { id: 'books', label: 'Libros', icon: BookOpen },
              { id: 'bookings', label: 'Donaciones', icon: Clock },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  category === cat.id 
                    ? "bg-white text-violet-600 shadow-sm" 
                    : "text-violet-400 hover:text-violet-600"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px]">
             <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-violet-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-200 outline-none appearance-none cursor-pointer"
              >
                <option value="">Seleccionar Periodo</option>
                {periods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input
              type="text"
              placeholder="Buscar en registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-violet-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-200 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-violet-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-violet-50/50">
                <tr>
                  {category === 'students' && (
                    <>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Matricula</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Alumno</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">PE</th>
                    </>
                  )}
                  {category === 'books' && (
                    <>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">PE</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Título</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Autor</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Donación</th>
                    </>
                  )}
                  {category === 'bookings' && (
                    <>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Fecha</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Alumno</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Libro</th>
                      <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Estado</th>
                    </>
                  )}
                  <th className="p-4 text-xs font-bold text-violet-400 uppercase tracking-widest">Archivado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {filteredResults.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-violet-50/30 transition-colors">
                    {category === 'students' && (
                      <>
                        <td className="p-4 text-sm font-medium text-violet-950 font-mono">{item.matricula}</td>
                        <td className="p-4 text-sm text-violet-700">{item.nombreAlumno} {item.apellidoPaterno}</td>
                        <td className="p-4 text-sm text-violet-500">{item.programaEducativo}</td>
                      </>
                    )}
                    {category === 'books' && (
                      <>
                        <td className="p-4 text-sm font-medium text-violet-950">{item.programaEducativo}</td>
                        <td className="p-4 text-sm text-violet-700">{item.tituloLibro}</td>
                        <td className="p-4 text-sm text-violet-500">{item.autor}</td>
                        <td className="p-4 text-sm text-violet-500">{item.bookingCount}/6</td>
                      </>
                    )}
                    {category === 'bookings' && (
                      <>
                        <td className="p-4 text-sm text-violet-500">{item.bookingDate}</td>
                        <td className="p-4 text-sm font-medium text-violet-950">
                          {item.studentName}
                          <p className="text-[10px] text-violet-400 font-mono">{item.studentMatricula}</p>
                        </td>
                        <td className="p-4 text-sm text-violet-700">{item.bookTitle}</td>
                        <td className="p-4 text-sm">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            item.status === 'donated' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {item.status === 'donated' ? 'Completada' : 'Activa'}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="p-4 text-sm text-violet-400 italic">
                      {item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <Archive className="w-12 h-12 text-violet-100" />
            <div>
              <p className="text-violet-950 font-medium">No se encontraron registros</p>
              <p className="text-sm text-violet-400">Selecciona un periodo o cambia la categoría para consultar el historial.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
