import React from 'react';
import { UsersRound } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Book, Booking, CommunalDonationRequest } from '../../types';
import { BookCard } from './BookCard';

interface BookListProps {
  books: Book[];
  activeBooking: Booking | undefined;
  handleBook: (book: Book) => void;
  setCommunalModal: (val: any) => void;
  communalRequests: CommunalDonationRequest[];
  showOnlyCommunal: boolean;
  setShowOnlyCommunal: (val: boolean) => void;
}

export const BookList: React.FC<BookListProps> = ({ 
  books, 
  activeBooking, 
  handleBook, 
  setCommunalModal, 
  communalRequests,
  showOnlyCommunal,
  setShowOnlyCommunal
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-serif font-bold text-violet-950">Libros Disponibles</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowOnlyCommunal(!showOnlyCommunal)}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
              showOnlyCommunal 
                ? "bg-amber-100 text-amber-700 border border-amber-200" 
                : "bg-violet-50 text-violet-400 border border-violet-100 hover:text-violet-600"
            )}
          >
            <UsersRound className="w-3.5 h-3.5" /> Solo Comunales
          </button>
          <span className="text-sm font-medium text-violet-500">{books.length} resultados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map(book => (
          <BookCard 
            key={book.id} 
            book={book} 
            activeBooking={activeBooking}
            handleBook={handleBook}
            setCommunalModal={setCommunalModal}
            communalRequests={communalRequests}
          />
        ))}
      </div>
    </div>
  );
};
