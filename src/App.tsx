import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Heart, 
  Search, 
  LogOut, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Upload, 
  Trash2, 
  ArrowRight, 
  Book as BookIcon,
  Shield,
  User,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Clock,
  RefreshCw,
  Plus,
  X,
  ArrowLeftRight,
  UsersRound,
  Sun,
  Moon,
  ChevronRight as ChevronRightIcon,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';
import { auth, signInWithGoogle } from './firebase';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

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
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'books' | 'students' | 'bookings' | 'communal' | 'requests' | 'donations'>('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Student State
  const [matricula, setMatricula] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [studentBookings, setStudentBookings] = useState<Booking[]>([]);
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
    if (user?.role === 'admin') {
      const unsubBooks = firestoreService.subscribeToBooks(setAllBooks);
      const unsubStudents = firestoreService.subscribeToStudents(setAllStudents);
      const unsubBookings = firestoreService.subscribeToBookings(setAllBookings);
      const unsubCommunal = firestoreService.subscribeToCommunalRequests(setCommunalRequests);
      return () => {
        unsubBooks();
        unsubStudents();
        unsubBookings();
        unsubCommunal();
      };
    } else {
      const unsubCommunalBookings = firestoreService.subscribeToCommunalBookings(setAllCommunalBookings);
      return () => unsubCommunalBookings();
    }
  }, [user]);

  // Student Handlers
  const handleValidateStudent = async () => {
    if (!matricula.trim()) return;
    setLoading(true);
    try {
      const students = await firestoreService.getStudents();
      const student = students.find(s => s.matricula === matricula.trim());
      if (student) {
        setCurrentStudent(student);
        const books = await firestoreService.getBooks();
        setAvailableBooks(books.filter(b => b.programaEducativo?.trim().toUpperCase() === student.programaEducativo?.trim().toUpperCase()));
        
        const bookings = await firestoreService.getBookings();
        setStudentBookings(bookings.filter(b => b.studentMatricula === student.matricula));
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
      return matchesSearch && matchesPe;
    });
  }, [allBooks, bookSearch, peFilter]);

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
      
      // Refresh student bookings
      const bookings = await firestoreService.getBookings();
      setStudentBookings(bookings.filter(b => b.studentMatricula === currentStudent.matricula));
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
      // Refresh
      const bookings = await firestoreService.getBookings();
      setStudentBookings(bookings.filter(b => b.studentMatricula === currentStudent.matricula));
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
      {/* Header */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 purple-gradient rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <BookIcon className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-serif font-bold text-violet-900 hidden sm:block">Donación de Libros</span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <button 
                onClick={() => setView(view === 'admin' ? 'student' : 'admin')}
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
              {/* Hero Section */}
              <section className="text-center space-y-4 py-8">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-violet-950">Sistema de Donación de Libros</h1>
                <p className="text-lg text-violet-700 max-w-2xl mx-auto">Busca y dona los libros que necesitas para tu titulación de forma sencilla.</p>
              </section>

              {/* Search Bar */}
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

              {currentStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Student Profile Card */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl shadow-xl shadow-violet-100/50 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
                          <User className="w-8 h-8" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-violet-950">{currentStudent.nombreAlumno}</h2>
                          <p className="text-violet-500 font-medium">{currentStudent.matricula}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-violet-400">Carrera</span>
                          <span className="font-bold text-violet-900">{currentStudent.programaEducativo}</span>
                        </div>
                      </div>

                      {activeBooking ? (
                        <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 space-y-3">
                          <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
                            <Clock className="w-4 h-4" />
                            Donación Actual
                          </div>
                          <p className="font-serif font-bold text-violet-950">{activeBooking.bookTitle}</p>
                          <div className="text-xs text-violet-400">
                            Expira: {new Date(activeBooking.deadlineDate).toLocaleDateString()}
                          </div>
                          <button 
                            onClick={() => {
                              // Find the book object to open swap modal
                              const book = availableBooks.find(b => b.id === activeBooking.bookId);
                              if (book) setSwapModal({ show: true, newBook: book });
                              else setBookingMessage({ type: 'warning', text: 'Selecciona un nuevo libro de la lista para cambiar.' });
                            }}
                            className="w-full mt-2 py-2 bg-white border border-violet-200 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-3 h-3" /> Cambiar Donación
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center text-stone-400 text-sm italic">
                          No tienes libros apartados actualmente.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Books List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-serif font-bold text-violet-950">Libros Disponibles</h3>
                      <span className="text-sm font-medium text-violet-500">{availableBooks.length} resultados</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableBooks.map(book => (
                        <motion.div 
                          key={book.id}
                          layout
                          className="glass-card p-5 rounded-3xl border border-violet-50 card-hover flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              {book.isCommunal && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-lg flex items-center gap-1">
                                  <UsersRound className="w-3 h-3" /> Comunal
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg font-serif font-bold text-violet-950 line-clamp-2">{book.tituloLibro}</h4>
                            <p className="text-sm text-violet-500">{book.autor}</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => handleBook(book)}
                              className={cn(
                                "w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                activeBooking?.bookId === book.id 
                                  ? "bg-emerald-100 text-emerald-700 cursor-default"
                                  : "btn-primary"
                              )}
                            >
                              {activeBooking?.bookId === book.id ? (
                                <><CheckCircle className="w-4 h-4" /> Donación</>
                              ) : (
                                <><Plus className="w-4 h-4" /> Donar</>
                              )}
                            </button>
                            <button 
                              onClick={() => setCommunalModal({ show: true, book, reason: '', email: '' })}
                              className="w-full py-2 text-xs font-bold text-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <UsersRound className="w-3 h-3" /> Solicitar donación comunal
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Admin Header */}
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
                           adminSubView === 'requests' ? 'Solicitudes' : adminSubView}
                        </span>
                      </>
                    )}
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-violet-950">Panel de Administración</h1>
                  <p className="text-violet-500">Gestiona el inventario, alumnos y solicitudes.</p>
                </div>
              </div>

              {adminSubView === 'dashboard' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <button 
                      onClick={() => setAdminSubView('students')}
                      className="glass-card p-5 rounded-3xl text-left card-hover group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Alumnos</p>
                      <p className="text-3xl font-serif font-bold text-violet-950">{adminStats.students}</p>
                    </button>
                    <button 
                      onClick={() => setAdminSubView('books')}
                      className="glass-card p-5 rounded-3xl text-left card-hover group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Libros</p>
                      <p className="text-3xl font-serif font-bold text-violet-950">{adminStats.books}</p>
                    </button>
                    <button 
                      onClick={() => setAdminSubView('bookings')}
                      className="glass-card p-5 rounded-3xl text-left card-hover group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Donaciones Activas</p>
                      <p className="text-3xl font-serif font-bold text-violet-950">{adminStats.bookings}</p>
                    </button>
                    <button 
                      onClick={() => setAdminSubView('donations')}
                      className="glass-card p-5 rounded-3xl text-left card-hover group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Heart className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Donaciones</p>
                      <p className="text-3xl font-serif font-bold text-violet-950">{adminStats.donations}</p>
                    </button>
                    <button 
                      onClick={() => setAdminSubView('requests')}
                      className="glass-card p-5 rounded-3xl text-left card-hover group border-violet-200 bg-violet-50/50"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Solicitudes</p>
                      <p className="text-3xl font-serif font-bold text-violet-950">{adminStats.requests}</p>
                    </button>
                  </div>

                  {/* Quick Actions / Upload */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-8 rounded-3xl space-y-6">
                      <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-violet-600" /> Carga Masiva
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-violet-700">Alumnos (Excel)</label>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept=".xlsx, .xls"
                              onChange={(e) => handleFileUpload(e, 'students')}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                              <FileSpreadsheet className="w-4 h-4" /> Seleccionar
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-violet-700">Libros (Excel)</label>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept=".xlsx, .xls"
                              onChange={(e) => handleFileUpload(e, 'books')}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                              <FileSpreadsheet className="w-4 h-4" /> Seleccionar
                            </div>
                          </div>
                        </div>
                      </div>
                      {uploadStatus && (
                        <div className={cn(
                          "p-4 rounded-2xl text-sm font-medium flex items-center gap-2",
                          uploadStatus.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        )}>
                          <CheckCircle className="w-4 h-4" /> {uploadStatus.text}
                        </div>
                      )}
                    </div>

                    <div className="glass-card p-8 rounded-3xl space-y-6">
                      <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-600" /> Cierre de Periodo
                      </h3>
                      <p className="text-sm text-violet-500">Archiva los registros actuales para comenzar un nuevo cuatrimestre.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setArchiveModal({ show: true, type: 'students' })}
                          className="p-4 rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" /> Archivar Alumnos
                        </button>
                        <button 
                          onClick={() => setArchiveModal({ show: true, type: 'books' })}
                          className="p-4 rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" /> Archivar Libros
                        </button>
                        <button 
                          onClick={() => setArchiveModal({ show: true, type: 'bookings' })}
                          className="p-4 rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold flex items-center justify-center gap-2 col-span-full"
                        >
                          <Clock className="w-4 h-4" /> Archivar Donaciones
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminSubView === 'students' && (
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-violet-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-violet-950">Listado de Alumnos</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setArchiveModal({ show: true, type: 'students' })}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-rose-100"
                        >
                          <Clock className="w-3 h-3" /> Archivar Periodo
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar por nombre o matrícula..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                      <select 
                        value={peFilter}
                        onChange={(e) => setPeFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white text-sm"
                      >
                        <option value="all">Todas las Carreras</option>
                        {allPEs.map(pe => (
                          <option key={pe} value={pe}>{pe}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Matrícula</th>
                          <th className="px-6 py-4">Nombre</th>
                          <th className="px-6 py-4">PE / Carrera</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-50">
                        {filteredStudents.map(s => (
                          <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-violet-900">{s.matricula}</td>
                            <td className="px-6 py-4 text-sm text-violet-600">{s.nombreAlumno} {s.apellidoPaterno} {s.apellidoMaterno}</td>
                            <td className="px-6 py-4 text-sm text-violet-500">{s.programaEducativo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubView === 'books' && (
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-violet-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-violet-950">Inventario de Libros</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAddBookModal(true)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-emerald-100"
                        >
                          <Plus className="w-3 h-3" /> Agregar Libro
                        </button>
                        <button 
                          onClick={() => setArchiveModal({ show: true, type: 'books' })}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-rose-100"
                        >
                          <Clock className="w-3 h-3" /> Archivar Periodo
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar por título o autor..."
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                      <select 
                        value={peFilter}
                        onChange={(e) => setPeFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white text-sm"
                      >
                        <option value="all">Todas las Carreras</option>
                        {allPEs.map(pe => (
                          <option key={pe} value={pe}>{pe}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Título</th>
                          <th className="px-6 py-4">Autor</th>
                          <th className="px-6 py-4">Carrera</th>
                          <th className="px-6 py-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-50">
                        {filteredBooks.map(b => (
                          <tr key={b.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-violet-900">{b.tituloLibro}</td>
                            <td className="px-6 py-4 text-sm text-violet-600">{b.autor}</td>
                            <td className="px-6 py-4 text-sm text-violet-500">{b.programaEducativo}</td>
                            <td className="px-6 py-4">
                              {b.isCommunal && (
                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                                  Comunal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubView === 'requests' && (
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-violet-50">
                    <h3 className="text-xl font-bold text-violet-950">Solicitudes de Donación Comunal</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Libro</th>
                          <th className="px-6 py-4">Alumno</th>
                          <th className="px-6 py-4">Correo</th>
                          <th className="px-6 py-4">Motivo</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-50">
                        {communalRequests.map(req => (
                          <tr key={req.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => {
                                  const book = allBooks.find(b => b.id === req.bookId);
                                  if (book) setSelectedBookInfo(book);
                                }}
                                className="font-bold text-black hover:text-violet-900 transition-colors text-left"
                              >
                                {req.bookTitle}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-violet-950">{req.studentName}</td>
                            <td className="px-6 py-4 text-sm text-violet-500">{req.studentEmail}</td>
                            <td className="px-6 py-4 text-sm text-violet-900 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                                req.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                req.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                "bg-rose-100 text-rose-700"
                              )}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {req.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleCommunalAction(req.id!, 'approved')}
                                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                                  >
                                    Aprobar
                                  </button>
                                  <button 
                                    onClick={() => handleCommunalAction(req.id!, 'rejected')}
                                    className="text-rose-600 hover:text-rose-700 font-bold text-xs"
                                  >
                                    Rechazar
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubView === 'bookings' && (
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-violet-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-violet-950">Gestión de Donaciones</h3>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar alumno, matrícula o libro..." 
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-100 focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                          value={bookingSearch}
                          onChange={(e) => setBookingSearch(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => setArchiveModal({ show: true, type: 'bookings' })}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-amber-100"
                      >
                        <Archive className="w-3 h-3" /> Archivar Periodo
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Alumno</th>
                          <th className="px-6 py-4">Libro</th>
                          <th className="px-6 py-4">Fecha Donación</th>
                          <th className="px-6 py-4">Fecha Límite</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-50">
                        {filteredBookings.map(b => (
                          <tr key={b.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-black">{b.studentName}</div>
                              <div className="text-xs text-violet-900">{b.studentMatricula}</div>
                            </td>
                            <td className="px-6 py-4 font-medium text-violet-950">{b.bookTitle}</td>
                            <td className="px-6 py-4 text-sm text-violet-900">{new Date(b.bookingDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-violet-900">{new Date(b.deadlineDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right space-x-3">
                              <button 
                                onClick={() => setReceiptModal({ show: true, booking: b })}
                                className="text-violet-600 hover:text-violet-700 font-bold text-xs"
                              >
                                Comprobante
                              </button>
                              <button 
                                onClick={() => handleMarkDonated(b)}
                                className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                              >
                                Donar
                              </button>
                              <button 
                                onClick={() => handleRelease(b)}
                                className="text-rose-600 hover:text-rose-700 font-bold text-xs"
                              >
                                Liberar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubView === 'donations' && (
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-violet-50">
                    <h3 className="text-xl font-bold text-violet-950">Historial de Donaciones</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Alumno</th>
                          <th className="px-6 py-4">Libro</th>
                          <th className="px-6 py-4">Fecha Donación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-50">
                        {allBookings.filter(b => b.status === 'donated').map(b => (
                          <tr key={b.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-black">{b.studentName}</div>
                              <div className="text-xs text-violet-900">{b.studentMatricula}</div>
                            </td>
                            <td className="px-6 py-4 font-medium text-violet-950">{b.bookTitle}</td>
                            <td className="px-6 py-4 text-sm text-violet-900">{new Date(b.bookingDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSwapModal({ show: false, newBook: null })}
              className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ArrowLeftRight className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-violet-950">Cambiar Donación</h3>
                <p className="text-violet-500">Ya tienes un libro seleccionado para donación. ¿Deseas liberar "{activeBooking?.bookTitle}" y seleccionar "{swapModal.newBook?.tituloLibro}"?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSwapModal({ show: false, newBook: null })} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={handleSwap} className="btn-primary flex-1">Confirmar Cambio</button>
              </div>
            </motion.div>
          </div>
        )}

        {communalModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommunalModal({ show: false, book: null, reason: '', email: '' })}
              className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <UsersRound className="w-8 h-8" />
              </div>
              <div className="space-y-4 text-center">
                <h3 className="text-2xl font-serif font-bold text-violet-950">Donación Comunal</h3>
                <p className="text-lg text-violet-700 font-medium">
                  Si este libro es costoso puedes solicitar donarlo con alguien mas.
                </p>
                <p className="text-sm text-violet-400">
                  Se enviará una solicitud al administrador para habilitar la donación colaborativa para este título.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-violet-900">Tu Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@correo.com"
                    className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950"
                    value={communalModal.email}
                    onChange={(e) => setCommunalModal({ ...communalModal, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-violet-900">Motivo (Opcional)</label>
                  <textarea 
                    placeholder="¿Por qué solicitas donación comunal?"
                    className="w-full px-6 py-4 rounded-2xl bg-violet-50 border-none focus:ring-2 focus:ring-violet-500 transition-all text-violet-950 min-h-[100px]"
                    value={communalModal.reason}
                    onChange={(e) => setCommunalModal({ ...communalModal, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCommunalModal({ show: false, book: null, reason: '', email: '' })} className="btn-secondary flex-1">Cancelar</button>
                <button 
                  onClick={handleCommunalRequest} 
                  disabled={!communalModal.email}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Solicitar
                </button>
              </div>
            </motion.div>
          </div>
        )}

      {/* Add Book Modal */}
      {addBookModal && (
        <div className="fixed inset-0 bg-violet-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-violet-950">Agregar Libro Manual</h3>
              <button onClick={() => setAddBookModal(false)} className="p-2 hover:bg-violet-50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-violet-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Título del Libro</label>
                <input 
                  type="text"
                  value={newBookData.tituloLibro}
                  onChange={(e) => setNewBookData({...newBookData, tituloLibro: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="Ej. Cálculo Diferencial"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Autor</label>
                <input 
                  type="text"
                  value={newBookData.autor}
                  onChange={(e) => setNewBookData({...newBookData, autor: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="Nombre del autor"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Año</label>
                  <input 
                    type="text"
                    value={newBookData.año}
                    onChange={(e) => setNewBookData({...newBookData, año: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="2023"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Editorial</label>
                  <input 
                    type="text"
                    value={newBookData.editorial}
                    onChange={(e) => setNewBookData({...newBookData, editorial: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="Pearson"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">Carrera / PE</label>
                <input 
                  type="text"
                  value={newBookData.programaEducativo}
                  onChange={(e) => setNewBookData({...newBookData, programaEducativo: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="Ej. Ingeniería en Software"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setAddBookModal(false)}
                className="flex-1 py-3 rounded-xl border border-violet-100 text-violet-600 font-bold hover:bg-violet-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddBook}
                disabled={loading || !newBookData.tituloLibro || !newBookData.autor || !newBookData.programaEducativo}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 disabled:opacity-50"
              >
                {loading ? 'Agregando...' : 'Guardar Libro'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

        {selectedBookInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBookInfo(null)}
              className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-violet-950 rounded-3xl p-8 shadow-2xl max-w-md w-full space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                  <BookIcon className="w-8 h-8" />
                </div>
                <button onClick={() => setSelectedBookInfo(null)} className="p-2 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-violet-400" />
                </button>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-violet-950 dark:text-white">{selectedBookInfo.tituloLibro}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Autor</p>
                    <p className="text-violet-900 dark:text-violet-200 font-medium">{selectedBookInfo.autor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Año</p>
                    <p className="text-violet-900 dark:text-violet-200 font-medium">{selectedBookInfo.año}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Editorial</p>
                    <p className="text-violet-900 dark:text-violet-200 font-medium">{selectedBookInfo.editorial}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Carrera</p>
                    <p className="text-violet-900 dark:text-violet-200 font-medium">{selectedBookInfo.programaEducativo}</p>
                  </div>
                </div>
                {selectedBookInfo.isCommunal && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-300">
                    <UsersRound className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase">Libro de Donación Comunal</span>
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedBookInfo(null)} className="btn-primary w-full">Cerrar</button>
            </motion.div>
          </div>
        )}

        {emailModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEmailModal({ show: false, book: null })}
              className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-violet-950 rounded-3xl p-8 shadow-2xl max-w-md w-full space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-violet-950 dark:text-white">Confirmar Donación</h3>
                <p className="text-violet-500">Ingresa tu correo electrónico para recibir la confirmación de tu donación.</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="tu@correo.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="input-field"
                />
                <div className="flex gap-3">
                  <button onClick={() => setEmailModal({ show: false, book: null })} className="btn-secondary flex-1">Cancelar</button>
                  <button 
                    onClick={confirmBooking} 
                    disabled={!studentEmail.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {confirmationModal?.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmationModal(null)}
              className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full space-y-6 my-8"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 hover:bg-violet-50 rounded-xl transition-colors text-violet-600"
                    title="Imprimir"
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                  </button>
                  <button onClick={() => setConfirmationModal(null)} className="p-2 hover:bg-violet-50 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-violet-400" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-6 print:m-0" id="printable-receipt">
                <div className="text-center">
                  <h3 className="text-3xl font-serif font-bold text-violet-950">¡Donación Confirmada!</h3>
                  <p className="text-violet-500">Comprobante de Solicitud de Donación</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-violet-50 rounded-3xl border border-violet-100">
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">ID de Solicitud</p>
                    <p className="text-violet-900 font-mono font-bold">{confirmationModal.requestId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Fecha</p>
                    <p className="text-violet-900 font-bold">{confirmationModal.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Nombre</p>
                    <p className="text-violet-900 font-bold">{confirmationModal.studentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Matrícula</p>
                    <p className="text-violet-900 font-bold">{confirmationModal.matricula}</p>
                  </div>
                  <div className="col-span-full border-t border-violet-100 pt-4 mt-2">
                    <p className="text-violet-400 uppercase font-bold text-[10px] mb-2">Libro para Donación</p>
                    <div className="bg-white p-4 rounded-2xl border border-violet-100">
                      <p className="text-lg font-serif font-bold text-violet-950">{confirmationModal.bookTitle}</p>
                      <p className="text-sm text-violet-500">{confirmationModal.bookAuthor}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-bold uppercase">Instrucciones Importantes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Presenta este comprobante (digital o impreso) en la biblioteca.</li>
                      <li>Este libro es para tu proceso de donación para titulación.</li>
                      <li>Asegúrate de entregar el libro físico para completar el trámite.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button onClick={() => setConfirmationModal(null)} className="btn-primary w-full print:hidden">Cerrar</button>
            </motion.div>
          </div>
        )}

        {receiptModal.show && receiptModal.booking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceiptModal({ show: false, booking: null })}
              className="absolute inset-0 bg-violet-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full space-y-6 my-8"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 hover:bg-violet-50 rounded-xl transition-colors text-violet-600"
                    title="Imprimir"
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                  </button>
                  <button onClick={() => setReceiptModal({ show: false, booking: null })} className="p-2 hover:bg-violet-50 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-violet-400" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-3xl font-serif font-bold text-violet-950">Comprobante de Donación</h3>
                  <p className="text-violet-500">Documento Oficial de Registro</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-violet-50 rounded-3xl border border-violet-100">
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">ID de Registro</p>
                    <p className="text-violet-900 font-mono font-bold">{receiptModal.booking.id?.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Fecha de Donación</p>
                    <p className="text-violet-900 font-bold">{new Date(receiptModal.booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Nombre del Alumno</p>
                    <p className="text-violet-900 font-bold">{receiptModal.booking.studentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Matrícula</p>
                    <p className="text-violet-900 font-bold">{receiptModal.booking.studentMatricula}</p>
                  </div>
                  <div className="col-span-full border-t border-violet-100 pt-4 mt-2">
                    <p className="text-violet-400 uppercase font-bold text-[10px] mb-2">Libro para Donación</p>
                    <div className="bg-white p-4 rounded-2xl border border-violet-100">
                      <p className="text-lg font-serif font-bold text-violet-950">{receiptModal.booking.bookTitle}</p>
                      <p className="text-sm text-violet-500">Estado: {receiptModal.booking.status}</p>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <p className="text-violet-400 uppercase font-bold text-[10px]">Fecha Límite de Entrega</p>
                    <p className="text-rose-600 font-bold">{new Date(receiptModal.booking.deadlineDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 text-center">
                  <p className="text-[10px] text-violet-400 uppercase font-bold tracking-widest">Sello Digital de Validación</p>
                  <div className="mt-2 font-mono text-[8px] text-violet-300 break-all">
                    {btoa(JSON.stringify(receiptModal.booking)).substring(0, 128)}
                  </div>
                </div>
              </div>
              <button onClick={() => setReceiptModal({ show: false, booking: null })} className="btn-primary w-full">Cerrar</button>
            </motion.div>
          </div>
        )}

        {/* Archive Modal */}
        {archiveModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-violet-100"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Archive className="text-amber-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-violet-950 text-center mb-2">Archivar Periodo</h2>
              <p className="text-violet-500 text-center mb-6">
                Los registros actuales de <span className="font-bold text-violet-900 uppercase">{archiveModal.type}</span> se marcarán como archivados. 
                Por favor, ingresa un identificador para este periodo (ej. 2026-Q1).
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">ID del Periodo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. 2026-Q1"
                    className="w-full px-6 py-4 rounded-2xl bg-violet-50 border border-violet-100 focus:ring-2 focus:ring-violet-500 outline-none font-bold text-violet-900"
                    value={periodoId}
                    onChange={(e) => setPeriodoId(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setArchiveModal({ show: false, type: null })}
                  className="flex-1 py-4 rounded-2xl font-bold text-violet-400 hover:bg-violet-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleArchive}
                  disabled={!periodoId.trim() || loading}
                  className="flex-1 py-4 rounded-2xl font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all disabled:opacity-50"
                >
                  {loading ? 'Archivando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-violet-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 purple-gradient rounded-lg flex items-center justify-center">
              <BookIcon className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-serif font-bold text-violet-900">Donación de Libros</span>
          </div>
          <p className="text-sm text-violet-400">© 2026 Sistema de Gestión de Donaciones. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-violet-400 hover:text-violet-600 transition-colors"><Settings className="w-5 h-5" /></a>
            <a href="#" className="text-violet-400 hover:text-violet-600 transition-colors"><HelpCircle className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-white min-w-[320px]",
              notification.type === 'success' ? "bg-emerald-600 shadow-emerald-200" : "bg-rose-600 shadow-rose-200"
            )}
          >
            {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
