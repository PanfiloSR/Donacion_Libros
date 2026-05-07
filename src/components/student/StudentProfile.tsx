import React from "react";
import { User, Clock, RefreshCw } from "lucide-react";
import { Student, Booking, Book } from "../../types";

interface StudentProfileProps {
  student: Student;
  activeBooking: Booking | undefined;
  availableBooks: Book[];
  setSwapModal: (val: any) => void;
  setBookingMessage: (val: any) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  activeBooking,
  availableBooks,
  setSwapModal,
  setBookingMessage,
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="glass-card p-6 rounded-3xl shadow-xl shadow-violet-100/50 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-950">
              {student.nombreAlumno}
            </h2>
            <p className="text-violet-500 font-medium">{student.matricula}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-violet-400">Carrera</span>
            <span className="font-bold text-violet-900">
              {student.programaEducativo}
            </span>
          </div>
        </div>

        {activeBooking ? (
          <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 space-y-3">
            <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
              <Clock className="w-4 h-4" />
              Donación Actual
            </div>
            <p className="font-serif font-bold text-violet-950">
              {activeBooking.bookTitle}
            </p>
            <div className="text-xs text-violet-400">
              Expira:{" "}
              {new Date(activeBooking.deadlineDate).toLocaleDateString()}
            </div>
            <p className="text-[10px] text-violet-400 mt-2 italic leading-tight">
              Para cambiar tu donación, simplemente busca otro libro en la lista
              y selecciónalo.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center text-stone-400 text-sm italic">
            No tienes libros apartados actualmente.
          </div>
        )}
      </div>
    </div>
  );
};
