import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc, 
  writeBatch,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { Student, Book, Booking, CommunalDonationRequest, CommunalBooking } from '../types';

export const firestoreService = {
  // Students
  async getStudents() {
    const q = query(collection(db, 'students'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  async addStudent(student: Student) {
    const normalizedStudent = {
      ...student,
      programaEducativo: student.programaEducativo?.trim().toUpperCase() || '',
      status: 'active'
    };
    await addDoc(collection(db, 'students'), normalizedStudent);
  },

  // Books
  async getBooks() {
    const q = query(collection(db, 'books'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
  },

  async updateBook(bookId: string, data: Partial<Book>) {
    const normalizedData = { ...data };
    if (normalizedData.programaEducativo) {
      normalizedData.programaEducativo = normalizedData.programaEducativo.trim().toUpperCase();
    }
    if (bookId) {
      await updateDoc(doc(db, 'books', bookId), normalizedData);
    } else {
      await addDoc(collection(db, 'books'), { ...normalizedData, status: 'active' });
    }
  },

  async addBook(book: Omit<Book, 'id'>) {
    const normalizedBook = {
      ...book,
      programaEducativo: book.programaEducativo?.trim().toUpperCase() || '',
      status: 'active'
    };
    return await addDoc(collection(db, 'books'), normalizedBook);
  },

  // Bookings
  async getBookings() {
    const q = query(collection(db, 'bookings'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  },

  async getActiveBookingByStudent(matricula: string) {
    const q = query(
      collection(db, 'bookings'), 
      where('studentMatricula', '==', matricula),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Booking;
  },

  async addBooking(booking: Booking) {
    return await addDoc(collection(db, 'bookings'), { ...booking, status: 'active' });
  },

  async updateBooking(bookingId: string, data: Partial<Booking>) {
    await updateDoc(doc(db, 'bookings', bookingId), data);
  },

  // Communal Donation Requests
  async getCommunalRequests() {
    const q = query(collection(db, 'communalDonationRequests'), where('status', '!=', 'archived'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunalDonationRequest));
  },

  async addCommunalRequest(request: CommunalDonationRequest) {
    await addDoc(collection(db, 'communalDonationRequests'), { ...request, status: 'pending' });
  },

  async updateCommunalRequest(requestId: string, data: Partial<CommunalDonationRequest>) {
    await updateDoc(doc(db, 'communalDonationRequests', requestId), data);
  },

  // Real-time listeners
  subscribeToBooks(callback: (books: Book[]) => void) {
    const q = query(collection(db, 'books'), where('status', '==', 'active'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
    });
  },

  subscribeToBookings(callback: (bookings: Booking[]) => void) {
    const q = query(collection(db, 'bookings'), where('status', '==', 'active'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });
  },

  subscribeToStudents(callback: (students: Student[]) => void) {
    const q = query(collection(db, 'students'), where('status', '==', 'active'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });
  },

  subscribeToCommunalRequests(callback: (requests: CommunalDonationRequest[]) => void) {
    const q = query(collection(db, 'communalDonationRequests'), where('status', '!=', 'archived'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunalDonationRequest)));
    });
  },

  // Communal Bookings
  async addCommunalBooking(booking: Omit<CommunalBooking, 'id'>) {
    return await addDoc(collection(db, 'communalBookings'), { ...booking, status: 'active' });
  },

  async getCommunalBooking(id: string) {
    const snap = await getDoc(doc(db, 'communalBookings', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as CommunalBooking;
  },

  async updateCommunalBooking(id: string, data: Partial<CommunalBooking>) {
    await updateDoc(doc(db, 'communalBookings', id), data);
  },

  async getPublicCommunalBookings() {
    const q = query(collection(db, 'communalBookings'), where('type', '==', 'public'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunalBooking));
  },

  subscribeToCommunalBookings(callback: (bookings: CommunalBooking[]) => void) {
    const q = query(collection(db, 'communalBookings'), where('status', '==', 'active'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunalBooking)));
    });
  },

  async archiveCollection(collectionName: string, periodoId: string) {
    const q = query(collection(db, collectionName), where('status', '==', 'active'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { 
        status: 'archived', 
        periodoId: periodoId,
        archivedAt: new Date().toISOString()
      });
    });
    await batch.commit();
  }
};
