import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';
import { auth } from './firebase';
import { 
  onAuthStateChanged, 
} from 'firebase/auth';

// Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationToast } from './components/ui/NotificationToast';
import { StudentHero } from './components/student/StudentHero';
import { StudentSearch } from './components/student/StudentSearch';
import { StudentView } from './components/student/StudentView';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminBooks } from './components/admin/AdminBooks';
import { AdminBookings } from './components/admin/AdminBookings';
import { AdminCommunalRequests } from './components/admin/AdminCommunalRequests';
import { AdminQuickActions } from './components/admin/AdminQuickActions';
import { AdminHistory } from './components/admin/AdminHistory';
import { SwapModal } from './components/modals/SwapModal';
import { CommunalModal } from './components/modals/CommunalModal';
import { AddBookModal } from './components/modals/AddBookModal';
import { BookDetailModal } from './components/modals/BookDetailModal';
import { EmailConfirmationModal } from './components/modals/EmailConfirmationModal';
import { AdminReceiptModal } from './components/modals/AdminReceiptModal';
import { ArchiveModal } from './components/modals/ArchiveModal';
import { ConfirmationReceiptModal } from './components/modals/ConfirmationReceiptModal';

// DAL & BLL
import { firestoreService } from './dal/firestoreService';
import { bookingLogic } from './bll/bookingLogic';

// Types
import { 
  Student, 
  Book, 
  Booking, 
  CommunalDonationRequest, 
  CommunalBooking,
  AdminStats,
  UserProfile
} from './types';

import CommunalBookingView from './components/CommunalBookingView';

export default function App() {
  // Auth & View State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'student' | 'admin' | 'communal-booking'>('student');
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'books' | 'students' | 'bookings' | 'requests' | 'donations' | 'history'>('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Student State
  const [matricula, setMatricula] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [showOnlyCommunalStudent, setShowOnlyCommunalStudent] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [swapModal, setSwapModal] = useState<{ show: boolean, newBook: Book | null }>({ show: false, newBook: null });
  const [communalModal, setCommunalModal] = useState<{ show: boolean, book: Book | null, reason: string, email: string }>({ show: false, book: null, reason: '', email: '' });
  const [emailModal, setEmailModal] = useState<{ show: boolean, book: Book | null }>({ show: false, book: null });
  const [studentEmail, setStudentEmail] = useState('');
  const [receiptModal, setReceiptModal] = useState<{ show: boolean, booking: Booking | null }>({ show: false, booking: null });
  const [addBookModal, setAddBookModal] = useState(false);
  const [newBookData, setNewBookData] = useState<Omit<Book, 'id' | 'bookingCount'>>({
    tituloLibro: '',
    autor: '',
    año: '',
    editorial: '',
    programaEducativo: '',
    consecutivo: 0
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    requestId: string;
    studentName: string;
    matricula: string;
    date: string;
    bookTitle: string;
    bookAuthor: string;
  } | null>(null);

  // Admin State
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [communalRequests, setCommunalRequests] = useState<CommunalDonationRequest[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showOnlyCommunal, setShowOnlyCommunal] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [peFilter, setPeFilter] = useState('all');
  const [archiveModal, setArchiveModal] = useState<{ show: boolean, type: string | null }>({ show: false, type: null });
  const [periodoId, setPeriodoId] = useState('');
  
  // UI State
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [selectedBookInfo, setSelectedBookInfo] = useState<Book | null>(null);
  const [bookPage, setBookPage] = useState(1);
  const itemsPerPage = 10;

  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (uploadStatus) {
      const timer = setTimeout(() => setUploadStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  useEffect(() => {
    if (bookingMessage) {
      const timer = setTimeout(() => setBookingMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingMessage]);

  const [communalBookingId, setCommunalBookingId] = useState<string | null>(null);
  const [communalJoinId, setCommunalJoinId] = useState<string | null>(null);
  const [communalRequestData, setCommunalRequestData] = useState<CommunalDonationRequest | null>(null);
  const [communalBookingData, setCommunalBookingData] = useState<CommunalBooking | null>(null);

  const [allCommunalBookings, setAllCommunalBookings] = useState<CommunalBooking[]>([]);

  // Detect communal booking from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    const bookingId = params.get('bookingId');
    if (requestId) {
      setCommunalBookingId(requestId);
      setView('communal-booking');
    } else if (bookingId) {
      setCommunalJoinId(bookingId);
      setView('communal-booking');
    }
  }, []);

  // Derived Stats
  const adminStats = useMemo(() => ({
    students: allStudents.length,
    books: allBooks.length,
    bookings: allBookings.filter(b => b.status === 'active').length,
    donations: allBookings.filter(b => b.status === 'donated').length,
    requests: communalRequests.filter(r => r.status === 'pending').length
  }), [allStudents, allBooks, allBookings, communalRequests]);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const role = firebaseUser.email === 'jesanchezrom@gmail.com' ? 'admin' : 'student';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role
        });
        if (role === 'admin') setView('admin');
      } else {
        setUser(null);
        setView('student');
      }
      setIsAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (communalBookingId) {
      const fetchRequest = async () => {
        const requests = await firestoreService.getCommunalRequests();
        const req = requests.find(r => r.id === communalBookingId);
        if (req) {
          setCommunalRequestData(req);
        }
      };
      fetchRequest();
    }
  }, [communalBookingId]);

  useEffect(() => {
    if (communalJoinId) {
      const fetchBooking = async () => {
        const booking = await firestoreService.getCommunalBooking(communalJoinId);
        if (booking) {
          setCommunalBookingData(booking);
        }
      };
      fetchBooking();
    }
  }, [communalJoinId]);

  useEffect(() => {
    if (!isAuthReady) return;

    // Books and public communal bookings can be seen by everyone
    const unsubBooks = firestoreService.subscribeToBooks(setAllBooks);
    const unsubCommunalBookings = firestoreService.subscribeToCommunalBookings(setAllCommunalBookings);

    let unsubBookings: (() => void) | undefined;
    let unsubCommunal: (() => void) | undefined;
    let unsubStudents: (() => void) | undefined;

    // Sensitive data listeners only for authenticated users
    if (user) {
      unsubBookings = firestoreService.subscribeToBookings(setAllBookings);
      unsubCommunal = firestoreService.subscribeToCommunalRequests(setCommunalRequests);
      
      if (user.role === 'admin') {
        unsubStudents = firestoreService.subscribeToStudents(setAllStudents);
      }
    } else {
      // Clear sensitive state for guests
      setAllBookings([]);
      setCommunalRequests([]);
      setAllStudents([]);
    }

    return () => {
      unsubBooks();
      unsubCommunalBookings();
      if (unsubBookings) unsubBookings();
      if (unsubCommunal) unsubCommunal();
      if (unsubStudents) unsubStudents();
    };
  }, [user, isAuthReady]);

  // Student Handlers
  const handleValidateStudent = async () => {
    if (!matricula.trim()) return;
    setLoading(true);
    try {
      const student = await firestoreService.getStudentByMatricula(matricula.trim());
      if (student) {
        setCurrentStudent(student);
        setBookingMessage(null);
      } else {
        setBookingMessage({ type: 'error', text: 'Matrícula no encontrada.' });
        setCurrentStudent(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Add a listener for the current student's bookings if they are not logged in but have validated
  useEffect(() => {
    if (!currentStudent || user) return;

    const unsub = firestoreService.subscribeToBookingsByMatricula(currentStudent.matricula, (bookings) => {
      setAllBookings(bookings);
    });

    return () => unsub();
  }, [currentStudent, user]);

  const availableBooks = useMemo(() => {
    if (!currentStudent) return [];
    return allBooks.filter(b => b.programaEducativo?.trim().toUpperCase() === currentStudent.programaEducativo?.trim().toUpperCase());
  }, [allBooks, currentStudent]);

  const studentBookings = useMemo(() => {
    if (!currentStudent) return [];
    return allBookings.filter(b => b.studentMatricula === currentStudent.matricula);
  }, [allBookings, currentStudent]);

  const filteredAvailableBooks = useMemo(() => {
    return availableBooks.filter(b => {
      const matchesCommunal = !showOnlyCommunalStudent || b.isCommunal;
      return matchesCommunal;
    });
  }, [availableBooks, showOnlyCommunalStudent]);

  const activeBooking = useMemo(() => {
    return studentBookings.find(b => b.status === 'active');
  }, [studentBookings]);

  // Filtered Lists
  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const matchesSearch = (s.nombreAlumno + ' ' + s.matricula).toLowerCase().includes(studentSearch.toLowerCase());
      const matchesPe = peFilter === 'all' || (s.programaEducativo && s.programaEducativo.toUpperCase() === peFilter);
      return matchesSearch && matchesPe;
    });
  }, [allStudents, studentSearch, peFilter]);

  const filteredBooks = useMemo(() => {
    return allBooks.filter(b => {
      const matchesSearch = (b.tituloLibro + ' ' + b.autor).toLowerCase().includes(bookSearch.toLowerCase());
      const matchesPe = peFilter === 'all' || (b.programaEducativo && b.programaEducativo.toUpperCase() === peFilter);
      const matchesCommunal = !showOnlyCommunal || b.isCommunal;
      return matchesSearch && matchesPe && matchesCommunal;
    });
  }, [allBooks, bookSearch, peFilter, showOnlyCommunal]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => {
      const matchesSearch = (b.studentName + ' ' + b.studentMatricula + ' ' + b.bookTitle).toLowerCase().includes(bookingSearch.toLowerCase());
      return matchesSearch;
    });
  }, [allBookings, bookingSearch]);

  const allPEs = useMemo(() => {
    const pes = new Set<string>();
    allStudents.forEach(s => {
      if (s.programaEducativo) pes.add(s.programaEducativo.trim().toUpperCase());
    });
    allBooks.forEach(b => {
      if (b.programaEducativo) pes.add(b.programaEducativo.trim().toUpperCase());
    });
    return Array.from(pes).sort();
  }, [allStudents, allBooks]);

  const handleBook = async (book: Book) => {
    if (!currentStudent) return;
    
    const { allowed, currentBooking } = await bookingLogic.canBook(currentStudent.matricula);
    
    if (!allowed && currentBooking) {
      setSwapModal({ show: true, newBook: book });
      return;
    }

    setEmailModal({ show: true, book });
  };

  const confirmBooking = async () => {
    if (!currentStudent || !emailModal.book || !studentEmail.trim()) return;
    
    setLoading(true);
    try {
      const book = emailModal.book;
      const bookingId = await bookingLogic.performBooking(currentStudent.matricula, currentStudent.nombreAlumno, book);
      
      setConfirmationModal({
        show: true,
        requestId: bookingId || Math.random().toString(36).substr(2, 9).toUpperCase(),
        studentName: currentStudent.nombreAlumno,
        matricula: currentStudent.matricula,
        date: new Date().toLocaleDateString(),
        bookTitle: book.tituloLibro,
        bookAuthor: book.autor
      });

      setEmailModal({ show: false, book: null });
      setStudentEmail('');
      setBookingMessage({ type: 'success', text: `Se ha registrado la donación de "${book.tituloLibro}".` });
    } catch (error: any) {
      setBookingMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!currentStudent || !activeBooking || !swapModal.newBook) return;
    try {
      const newBookingId = await bookingLogic.swapBooking(currentStudent.matricula, currentStudent.nombreAlumno, activeBooking, swapModal.newBook);
      
      setConfirmationModal({
        show: true,
        requestId: newBookingId || Math.random().toString(36).substr(2, 9).toUpperCase(),
        studentName: currentStudent.nombreAlumno,
        matricula: currentStudent.matricula,
        date: new Date().toLocaleDateString(),
        bookTitle: swapModal.newBook.tituloLibro,
        bookAuthor: swapModal.newBook.autor
      });

      setBookingMessage({ type: 'success', text: `Se ha cambiado la donación por "${swapModal.newBook.tituloLibro}".` });
      setSwapModal({ show: false, newBook: null });
    } catch (error: any) {
      setBookingMessage({ type: 'error', text: error.message });
    }
  };

  const handleCommunalRequest = async () => {
    if (!currentStudent || !communalModal.book || !communalModal.email) return;
    try {
      await bookingLogic.requestCommunalDonation(currentStudent.matricula, currentStudent.nombreAlumno, communalModal.email, communalModal.book, communalModal.reason || "Solicitud de donación comunal");
      setBookingMessage({ type: 'success', text: 'Solicitud de donación comunal enviada.' });
      setCommunalModal({ show: false, book: null, reason: '', email: '' });
    } catch (error: any) {
      setBookingMessage({ type: 'error', text: error.message });
    }
  };

  // Admin Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'students' | 'books') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: 'warning', text: 'Procesando archivo...' });
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (type === 'students') {
          for (const item of data as any[]) {
            await firestoreService.addStudent({
              matricula: String(item.Matricula || ''),
              apellidoPaterno: item['Apellido paterno'] || '',
              apellidoMaterno: item['Apellido materno'] || '',
              nombreAlumno: item['Nombre del alumno'] || '',
              programaEducativo: (item.PE || '').trim().toUpperCase()
            });
          }
        } else {
          for (const item of data as any[]) {
            await firestoreService.addBook({
              consecutivo: Number(item['#'] || 0),
              programaEducativo: (item['Programa Educativo'] || '').trim().toUpperCase(),
              tituloLibro: item['Título del Libro'] || '',
              autor: item.Autor || '',
              año: String(item['Año'] || ''),
              editorial: item.Editorial || '',
              bookingCount: 0
            });
          }
        }
        setUploadStatus({ type: 'success', text: 'Carga completada con éxito.' });
      } catch (error) {
        setUploadStatus({ type: 'error', text: 'Error al procesar el archivo.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleRelease = async (booking: Booking) => {
    await bookingLogic.releaseBooking(booking);
  };

  const handleMarkDonated = async (booking: Booking) => {
    await bookingLogic.markAsDonated(booking);
  };

  const handleArchive = async () => {
    if (!archiveModal.type || !periodoId.trim()) return;
    setLoading(true);
    try {
      await firestoreService.archiveCollection(archiveModal.type, periodoId);
      setUploadStatus({ type: 'success', text: `Periodo ${periodoId} archivado para ${archiveModal.type}.` });
      setArchiveModal({ show: false, type: null });
      setPeriodoId('');
    } catch (error) {
      setUploadStatus({ type: 'error', text: 'Error al archivar el periodo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCommunalAction = async (requestId: string, status: 'approved' | 'rejected') => {
    await bookingLogic.handleCommunalRequest(requestId, status);
  };

  const handleAddBook = async () => {
    if (!newBookData.tituloLibro || !newBookData.autor || !newBookData.programaEducativo) return;
    setLoading(true);
    try {
      await firestoreService.addBook({
        ...newBookData,
        programaEducativo: newBookData.programaEducativo.trim().toUpperCase(),
        bookingCount: 0
      });
      setAddBookModal(false);
      setNewBookData({
        tituloLibro: '',
        autor: '',
        año: '',
        editorial: '',
        programaEducativo: '',
        consecutivo: 0
      });
      setUploadStatus({ type: 'success', text: 'Libro agregado manualmente.' });
    } catch (error) {
      setUploadStatus({ type: 'error', text: 'Error al agregar el libro.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <RefreshCw className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} view={view} setView={setView} setAdminSubView={setAdminSubView} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'student' ? (
            <motion.div 
              key="student"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <StudentHero />
              
              <StudentSearch 
                matricula={matricula} 
                setMatricula={setMatricula} 
                handleValidateStudent={handleValidateStudent}
                bookingMessage={bookingMessage}
              />

              {currentStudent && (
                <StudentView 
                  student={currentStudent}
                  activeBooking={activeBooking}
                  availableBooks={availableBooks}
                  filteredAvailableBooks={filteredAvailableBooks}
                  communalRequests={communalRequests}
                  showOnlyCommunal={showOnlyCommunalStudent}
                  setShowOnlyCommunal={setShowOnlyCommunalStudent}
                  handleBook={handleBook}
                  setCommunalModal={setCommunalModal}
                  setSwapModal={setSwapModal}
                  setBookingMessage={setBookingMessage}
                />
              )}
            </motion.div>
          ) : view === 'admin' ? (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <AdminHeader adminSubView={adminSubView} setAdminSubView={setAdminSubView} />

              {adminSubView === 'dashboard' && (
                <div className="space-y-8">
                  <AdminDashboard stats={adminStats} setAdminSubView={setAdminSubView} />
                  <AdminQuickActions 
                    uploadStatus={uploadStatus}
                    handleFileUpload={handleFileUpload}
                    setArchiveModal={setArchiveModal}
                  />
                </div>
              )}

              {adminSubView === 'students' && (
                <AdminStudents 
                  students={filteredStudents}
                  studentSearch={studentSearch}
                  setStudentSearch={setStudentSearch}
                  peFilter={peFilter}
                  setPeFilter={setPeFilter}
                  allPEs={allPEs}
                  setArchiveModal={setArchiveModal}
                />
              )}

              {adminSubView === 'books' && (
                <AdminBooks 
                  books={filteredBooks}
                  bookSearch={bookSearch}
                  setBookSearch={setBookSearch}
                  showOnlyCommunal={showOnlyCommunal}
                  setShowOnlyCommunal={setShowOnlyCommunal}
                  peFilter={peFilter}
                  setPeFilter={setPeFilter}
                  allPEs={allPEs}
                  setAddBookModal={setAddBookModal}
                  setArchiveModal={setArchiveModal}
                />
              )}

              {adminSubView === 'requests' && (
                <AdminCommunalRequests 
                  communalRequests={communalRequests}
                  allBooks={allBooks}
                  setSelectedBookInfo={setSelectedBookInfo}
                  handleCommunalAction={handleCommunalAction}
                />
              )}

              {adminSubView === 'bookings' && (
                <AdminBookings 
                  bookings={filteredBookings}
                  bookingSearch={bookingSearch}
                  setBookingSearch={setBookingSearch}
                  setArchiveModal={setArchiveModal}
                  setReceiptModal={setReceiptModal}
                  handleMarkDonated={handleMarkDonated}
                  handleRelease={handleRelease}
                />
              )}

              {adminSubView === 'donations' && (
                <AdminBookings 
                  bookings={allBookings}
                  bookingSearch={bookingSearch}
                  setBookingSearch={setBookingSearch}
                  setArchiveModal={setArchiveModal}
                  setReceiptModal={setReceiptModal}
                  handleMarkDonated={handleMarkDonated}
                  handleRelease={handleRelease}
                  showHistory={true}
                />
              )}

              {adminSubView === 'history' && (
                <AdminHistory />
              )}
            </motion.div>
          ) : null}

          {view === 'communal-booking' && (
            <motion.div
              key="communal-booking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <CommunalBookingView 
                requestId={communalBookingId || undefined}
                bookingId={communalJoinId || undefined}
                requestData={communalRequestData || undefined}
                bookingData={communalBookingData || undefined}
                onBack={() => {
                  setView(user?.role === 'admin' ? 'admin' : 'student');
                  setCommunalBookingId(null);
                  setCommunalJoinId(null);
                  setCommunalRequestData(null);
                  setCommunalBookingData(null);
                }}
                onSuccess={(msg) => setNotification({ show: true, message: msg, type: 'success' })}
                onError={(msg) => setNotification({ show: true, message: msg, type: 'error' })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {swapModal.show && (
          <SwapModal 
            activeBooking={activeBooking} 
            newBook={swapModal.newBook} 
            onClose={() => setSwapModal({ show: false, newBook: null })} 
            onConfirm={handleSwap} 
          />
        )}

        {communalModal.show && (
          <CommunalModal 
            book={communalModal.book} 
            email={communalModal.email} 
            reason={communalModal.reason} 
            setEmail={(email) => setCommunalModal({ ...communalModal, email })} 
            setReason={(reason) => setCommunalModal({ ...communalModal, reason })} 
            onClose={() => setCommunalModal({ show: false, book: null, reason: '', email: '' })} 
            onConfirm={handleCommunalRequest} 
          />
        )}

        {addBookModal && (
          <AddBookModal 
            loading={loading} 
            newBookData={newBookData} 
            setNewBookData={setNewBookData} 
            onClose={() => setAddBookModal(false)} 
            onConfirm={handleAddBook} 
          />
        )}

        {selectedBookInfo && (
          <BookDetailModal 
            book={selectedBookInfo} 
            onClose={() => setSelectedBookInfo(null)} 
          />
        )}

        {emailModal.show && (
          <EmailConfirmationModal 
            studentEmail={studentEmail} 
            setStudentEmail={setStudentEmail} 
            onClose={() => setEmailModal({ show: false, book: null })} 
            onConfirm={confirmBooking} 
          />
        )}

        {confirmationModal?.show && (
          <ConfirmationReceiptModal 
            confirmation={confirmationModal} 
            onClose={() => setConfirmationModal(null)} 
          />
        )}

        {receiptModal.show && receiptModal.booking && (
          <AdminReceiptModal 
            booking={receiptModal.booking} 
            onClose={() => setReceiptModal({ show: false, booking: null })} 
          />
        )}

        {archiveModal.show && (
          <ArchiveModal 
            type={archiveModal.type} 
            periodoId={periodoId} 
            setPeriodoId={setPeriodoId} 
            loading={loading} 
            onClose={() => setArchiveModal({ show: false, type: null })} 
            onConfirm={handleArchive} 
          />
        )}
      </AnimatePresence>

      <Footer />

      <NotificationToast notification={notification} />
    </div>
  );
}
