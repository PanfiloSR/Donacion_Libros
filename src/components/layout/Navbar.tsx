import React from 'react';
import { Book as BookIcon, LogOut, Shield, User } from 'lucide-react';
import { auth, signInWithGoogle } from '../../firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../../types';

interface NavbarProps {
  user: UserProfile | null;
  view: 'student' | 'admin' | 'communal-booking';
  setView: (view: 'student' | 'admin' | 'communal-booking') => void;
  setAdminSubView: (view: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, view, setView, setAdminSubView }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 purple-gradient rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
            <BookIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-violet-950 leading-tight">Donación de Libros</h1>
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Sistema de Gestión</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <button 
              onClick={() => {
                if (view !== 'admin') {
                  setAdminSubView('dashboard');
                }
                setView(view === 'admin' ? 'student' : 'admin');
              }}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              {view === 'admin' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              <span className="hidden xs:block">{view === 'admin' ? 'Vista Alumno' : 'Panel Admin'}</span>
            </button>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-violet-700 hidden md:block">{user.email}</span>
              <button onClick={() => signOut(auth)} className="p-2 text-violet-400 hover:text-violet-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="btn-primary py-2 px-6">
              Ingresar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
