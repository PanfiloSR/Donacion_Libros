import React from 'react';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface StudentSearchProps {
  matricula: string;
  setMatricula: (val: string) => void;
  handleValidateStudent: () => void;
  bookingMessage: { type: 'success' | 'error' | 'warning', text: string } | null;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({ 
  matricula, 
  setMatricula, 
  handleValidateStudent, 
  bookingMessage 
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 group-focus-within:text-violet-600 transition-colors z-10" />
        <input 
          type="text" 
          placeholder="Ingresa tu matrícula para comenzar..."
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleValidateStudent()}
          className="input-field !pl-14 pr-32 h-14 text-lg shadow-xl shadow-violet-100/50"
        />
        <button 
          onClick={handleValidateStudent}
          className="absolute right-2 top-2 bottom-2 btn-primary py-0 px-6 text-sm z-10"
        >
          Validar
        </button>
      </div>
      {bookingMessage && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn(
            "mt-4 p-4 rounded-2xl flex items-center gap-3",
            bookingMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
            bookingMessage.type === 'warning' ? "bg-amber-50 text-amber-700 border border-amber-100" :
            "bg-rose-50 text-rose-700 border border-rose-100"
          )}
        >
          {bookingMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{bookingMessage.text}</span>
        </motion.div>
      )}
    </div>
  );
};
