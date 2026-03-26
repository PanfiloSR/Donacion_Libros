export interface Student {
  id?: string;
  matricula: string;
  apellidoMaterno: string;
  apellidoPaterno: string;
  nombreAlumno: string;
  programaEducativo: string;
  status?: 'active' | 'archived';
  periodoId?: string;
}

export interface Book {
  id?: string;
  consecutivo: number;
  programaEducativo: string;
  tituloLibro: string;
  autor: string;
  año: string;
  editorial: string;
  bookingCount: number;
  isCommunal?: boolean;
  status?: 'active' | 'archived';
  periodoId?: string;
}

export interface Booking {
  id?: string;
  studentMatricula: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  bookingDate: any;
  deadlineDate: any;
  status: 'active' | 'released' | 'donated' | 'archived';
  periodoId?: string;
}

export interface CommunalDonationRequest {
  id?: string;
  bookId: string;
  bookTitle: string;
  studentMatricula: string;
  studentName: string;
  studentEmail: string;
  requestDate: any;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  periodoId?: string;
  reason?: string;
}

export interface CommunalBooking {
  id?: string;
  bookId: string;
  bookTitle: string;
  participants: {
    matricula: string;
    name: string;
    email: string;
  }[];
  type: 'private' | 'public';
  status: 'active' | 'completed' | 'archived';
  createdAt: any;
  periodoId?: string;
}

export interface AdminStats {
  students: number;
  books: number;
  bookings: number;
  donations: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'student';
}
