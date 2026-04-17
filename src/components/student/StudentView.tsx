import React from 'react';
import { motion } from 'motion/react';
import { StudentProfile } from './StudentProfile';
import { BookList } from './BookList';
import { Student, Book, Booking, CommunalDonationRequest } from '../../types';

interface StudentViewProps {
  student: Student;
  activeBooking: Booking | undefined;
  availableBooks: Book[];
  filteredAvailableBooks: Book[];
  communalRequests: CommunalDonationRequest[];
  showOnlyCommunal: boolean;
  setShowOnlyCommunal: (val: boolean) => void;
  handleBook: (book: Book) => void;
  setCommunalModal: (val: any) => void;
  setSwapModal: (val: any) => void;
  setBookingMessage: (val: any) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  student,
  activeBooking,
  availableBooks,
  filteredAvailableBooks,
  communalRequests,
  showOnlyCommunal,
  setShowOnlyCommunal,
  handleBook,
  setCommunalModal,
  setSwapModal,
  setBookingMessage
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <StudentProfile 
        student={student}
        activeBooking={activeBooking}
        availableBooks={availableBooks}
        setSwapModal={setSwapModal}
        setBookingMessage={setBookingMessage}
      />

      <BookList 
        books={filteredAvailableBooks}
        activeBooking={activeBooking}
        handleBook={handleBook}
        setCommunalModal={setCommunalModal}
        communalRequests={communalRequests}
        showOnlyCommunal={showOnlyCommunal}
        setShowOnlyCommunal={setShowOnlyCommunal}
      />
    </div>
  );
};
