import React from 'react';
import { Search, Clock } from 'lucide-react';
import { Student } from '../../types';

interface AdminStudentsProps {
  students: Student[];
  studentSearch: string;
  setStudentSearch: (val: string) => void;
  peFilter: string;
  setPeFilter: (val: string) => void;
  allPEs: string[];
  setArchiveModal: (val: any) => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({ 
  students, 
  studentSearch, 
  setStudentSearch, 
  peFilter, 
  setPeFilter, 
  allPEs,
  setArchiveModal
}) => {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-violet-50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-violet-950">Listado de Alumnos</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setArchiveModal({ show: true, type: 'students' })}
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
              placeholder="Buscar por nombre o matrícula..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
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
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Matrícula</th>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">PE / Carrera</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-violet-900">{s.matricula}</td>
                <td className="px-6 py-4 text-sm text-violet-600">{s.nombreAlumno} {s.apellidoPaterno} {s.apellidoMaterno}</td>
                <td className="px-6 py-4 text-sm text-violet-500">{s.programaEducativo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
