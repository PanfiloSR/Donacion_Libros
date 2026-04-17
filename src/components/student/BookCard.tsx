import React from 'react';
import { BookOpen, UsersRound, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Book, Booking, CommunalDonationRequest } from '../../types';

interface BookCardProps {
  book: Book;
  activeBooking: Booking | undefined;
  handleBook: (book: Book) => void;
  setCommunalModal: (val: any) => void;
  communalRequests: CommunalDonationRequest[];
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  activeBooking, 
  handleBook, 
  setCommunalModal, 
  communalRequests 
}) => {
  const availableSlots = 6 - (book.bookingCount || 0);
  const hasAcceptedCommunal = communalRequests.some(r => r.bookId === book.id && r.status === 'approved');
  const hideCommunalRequest = hasAcceptedCommunal && availableSlots === 1;

  return (
    <motion.div 
      layout
      className="glass-card p-5 rounded-3xl border border-violet-50 card-hover flex flex-col justify-between gap-4"
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start" id={`book-header-${book.id}`}>
          <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {book.isCommunal && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-lg flex items-center gap-1">
                <UsersRound className="w-3 h-3" /> Comunal
              </span>
            )}
            <span className={cn(
              "text-[10px] font-bold px-2 py-1 rounded-lg",
              availableSlots > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            )}>
              {availableSlots} {availableSlots === 1 ? 'ejemplar' : 'ejemplares'} disponible{availableSlots === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <h4 className="text-lg font-serif font-bold text-violet-950 line-clamp-2">{book.tituloLibro}</h4>
        <p className="text-sm text-violet-500">{book.autor}</p>
      </div>

      <div className="flex flex-col gap-2">
        <button 
          onClick={() => handleBook(book)}
          disabled={availableSlots === 0 && activeBooking?.bookId !== book.id}
          className={cn(
            "w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
            activeBooking?.bookId === book.id 
              ? "bg-emerald-100 text-emerald-700 cursor-default"
              : availableSlots === 0 
                ? "bg-violet-50 text-violet-300 cursor-not-allowed"
                : "btn-primary"
          )}
        >
          {activeBooking?.bookId === book.id ? (
            <><CheckCircle className="w-4 h-4" /> Donación</>
          ) : availableSlots === 0 ? (
            'Agotado'
          ) : (
            <><Plus className="w-4 h-4" /> Donar</>
          )}
        </button>
        {!hideCommunalRequest && (
          <button 
            onClick={() => setCommunalModal({ show: true, book, reason: '', email: '' })}
            className="w-full py-2 text-xs font-bold text-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-1"
          >
            <UsersRound className="w-3 h-3" /> Solicitar donación comunal
          </button>
        )}
      </div>
    </motion.div>
  );
};
