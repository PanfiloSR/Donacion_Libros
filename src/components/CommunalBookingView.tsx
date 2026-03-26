import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CommunalDonationRequest, CommunalBooking, Student } from '../types';
import { bookingLogic } from '../bll/bookingLogic';
import { UsersRound, Link, Globe, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface Props {
  requestId?: string;
  bookingId?: string;
  requestData?: CommunalDonationRequest | null;
  bookingData?: CommunalBooking | null;
  onBack: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function CommunalBookingView({ requestId, bookingId, requestData, bookingData, onBack, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleCreate = async (type: 'private' | 'public') => {
    if (!requestId) return;
    setLoading(true);
    try {
      const id = await bookingLogic.createCommunalBooking(requestId, type);
      if (type === 'private') {
        const link = `${window.location.origin}/communal-booking?bookingId=${id}`;
        setShareLink(link);
        onSuccess("Apartado privado creado. Comparte el enlace con tu compañero.");
      } else {
        onSuccess("Apartado público creado. Otros alumnos podrán unirse desde el buscador.");
        onBack();
      }
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!bookingId || !matricula || !name || !email) return;
    setLoading(true);
    try {
      await bookingLogic.joinCommunalBooking(bookingId, matricula, name, email);
      onSuccess("¡Te has unido exitosamente! Se ha enviado un correo a ambos participantes.");
      onBack();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (requestId && requestData) {
    return (
      <div className="min-h-screen bg-violet-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
        >
          <button onClick={onBack} className="flex items-center gap-2 text-violet-600 hover:text-violet-800 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> Volver
          </button>

          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-serif font-bold text-violet-950">Solicitud Aprobada</h2>
            <p className="text-violet-600 text-lg">
              Tu solicitud para el libro <span className="font-bold">"{requestData.bookTitle}"</span> ha sido aprobada.
            </p>
          </div>

          {!shareLink ? (
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => handleCreate('private')}
                disabled={loading}
                className="group p-8 rounded-[2rem] border-2 border-violet-100 hover:border-violet-500 transition-all text-left space-y-4 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-colors">
                  <Link className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-violet-950">Apartado Privado</h4>
                  <p className="text-sm text-violet-500">Genera un enlace para compartirlo directamente con un compañero.</p>
                </div>
              </button>

              <button 
                onClick={() => handleCreate('public')}
                disabled={loading}
                className="group p-8 rounded-[2rem] border-2 border-violet-100 hover:border-violet-500 transition-all text-left space-y-4 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-colors">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-violet-950">Apartado Público</h4>
                  <p className="text-sm text-violet-500">Cualquier alumno podrá ver tu solicitud y unirse desde el buscador.</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-[2rem] bg-violet-50 space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-sm font-bold text-violet-950 uppercase tracking-wider">Enlace Compartible</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={shareLink}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white border-none text-violet-950 font-mono text-sm"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      onSuccess("Enlace copiado al portapapeles.");
                    }}
                    className="p-4 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <p className="text-sm text-violet-500 italic">
                Envía este enlace a la persona con la que quieres compartir la donación.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (bookingId && bookingData) {
    return (
      <div className="min-h-screen bg-violet-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
              <UsersRound className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-violet-950">Unirse a Donación</h2>
            <p className="text-violet-600">
              Vas a unirte a la donación del libro <span className="font-bold">"{bookingData.bookTitle}"</span> con <span className="font-bold">{bookingData.participants[0].name}</span>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-violet-900">Tu Matrícula</label>
              <input 
                type="text" 
                placeholder="Ingresa tu matrícula"
                className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-violet-900">Tu Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Nombre y Apellidos"
                className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-violet-900">Tu Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleJoin}
            disabled={loading || !matricula || !name || !email}
            className="w-full btn-primary py-5 text-lg disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Confirmar Unión'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-violet-950">Solicitud no encontrada</h2>
        <button onClick={onBack} className="btn-secondary">Volver al Inicio</button>
      </div>
    </div>
  );
}
