import React from 'react';
import { ChevronRight as ChevronRightIcon } from 'lucide-react';

interface AdminHeaderProps {
  adminSubView: string;
  setAdminSubView: (view: any) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ adminSubView, setAdminSubView }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-violet-400">
          <button 
            onClick={() => setAdminSubView('dashboard')}
            className="hover:text-violet-600 transition-colors"
          >
            Dashboard
          </button>
          {adminSubView !== 'dashboard' && (
            <>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-violet-600">
                {adminSubView === 'students' ? 'Alumnos' : 
                 adminSubView === 'books' ? 'Libros' : 
                 adminSubView === 'communal' ? 'Donaciones Comunales' : 
                 adminSubView === 'bookings' ? 'Donaciones' : 
                 adminSubView === 'donations' ? 'Donaciones' :
                 adminSubView === 'history' ? 'Registros de Cierres' :
                 adminSubView === 'requests' ? 'Solicitudes' : adminSubView}
              </span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-serif font-bold text-violet-950">Panel de Administración</h1>
        <p className="text-violet-500">Gestiona el inventario, alumnos y solicitudes.</p>
      </div>
    </div>
  );
};
