import React from 'react';
import { Book as BookIcon, Settings, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-violet-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 purple-gradient rounded-lg flex items-center justify-center">
            <BookIcon className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-serif font-bold text-violet-900">Donación de Libros</span>
        </div>
        <p className="text-sm text-violet-400">© 2026 Sistema de Gestión de Donaciones. Todos los derechos reservados.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-violet-400 hover:text-violet-600 transition-colors"><Settings className="w-5 h-5" /></a>
          <a href="#" className="text-violet-400 hover:text-violet-600 transition-colors"><HelpCircle className="w-5 h-5" /></a>
        </div>
      </div>
    </footer>
  );
};
