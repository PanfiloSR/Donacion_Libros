import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { firestoreService } from "../dal/firestoreService";
import { Booking, Book, CommunalDonationRequest } from "../types";
import { notificationService } from "../services/notificationService";

export const bookingLogic = {
  async canBook(
    matricula: string,
  ): Promise<{ allowed: boolean; currentBooking?: Booking }> {
    const activeBooking =
      await firestoreService.getActiveBookingByStudent(matricula);
    if (activeBooking) {
      return { allowed: false, currentBooking: activeBooking };
    }
    return { allowed: true };
  },

  async performBooking(
    matricula: string,
    studentName: string,
    book: Book,
    skipCheck: boolean = false,
  ) {
    if (!skipCheck) {
      const { allowed, currentBooking } = await this.canBook(matricula);
      if (!allowed) {
        throw new Error("Ya tienes un libro apartado.");
      }
    }

    const now = new Date();
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 4); // One cuatrimestre

    const booking: Booking = {
      studentMatricula: matricula,
      studentName: studentName,
      bookId: book.id!,
      bookTitle: book.tituloLibro,
      bookingDate: now.toISOString(),
      deadlineDate: deadline.toISOString(),
      status: "active",
    };

    const docRef = await firestoreService.addBooking(booking);
    await firestoreService.updateBook(book.id!, {
      bookingCount: (book.bookingCount || 0) + 1,
    });
    return docRef.id;
  },

  async swapBooking(
    matricula: string,
    studentName: string,
    currentBooking: Booking,
    newBook: Book,
  ) {
    console.log("Attempting swap for student:", matricula);

    // 1. Find the REAL current active booking to avoid stale IDs
    const activeBooking =
      await firestoreService.getActiveBookingByStudent(matricula);

    const batch = writeBatch(db);

    if (activeBooking) {
      // Release current
      const currentRef = doc(db, "bookings", activeBooking.id!);
      batch.update(currentRef, { status: "released" });

      // Decrement count for old book
      if (activeBooking.bookId) {
        const oldBookRef = doc(db, "books", activeBooking.bookId);
        // We update blindly with a catch in case it fails, or just update the count
        // Note: Security rules should allow this
        const oldBookSnap = await getDoc(oldBookRef);
        if (oldBookSnap.exists()) {
          const oldData = oldBookSnap.data() as Book;
          batch.update(oldBookRef, {
            bookingCount: Math.max(0, (oldData.bookingCount || 0) - 1),
          });
        }
      }
    }

    // 2. Create new booking
    const now = new Date();
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 4);

    const newBookingData = {
      studentMatricula: matricula,
      studentName: studentName,
      bookId: newBook.id!,
      bookTitle: newBook.tituloLibro,
      bookingDate: now.toISOString(),
      deadlineDate: deadline.toISOString(),
      status: "active",
    };

    const newBookingRef = doc(collection(db, "bookings"));
    batch.set(newBookingRef, newBookingData);

    // 3. Increment count for new book
    const newBookRef = doc(db, "books", newBook.id!);
    batch.update(newBookRef, { bookingCount: (newBook.bookingCount || 0) + 1 });

    await batch.commit();
    return newBookingRef.id;
  },

  async releaseBooking(booking: Booking) {
    await firestoreService.updateBooking(booking.id!, { status: "released" });
    const books = await firestoreService.getBooks();
    const book = books.find((b) => b.id === booking.bookId);
    if (book) {
      await firestoreService.updateBook(book.id!, {
        bookingCount: Math.max(0, (book.bookingCount || 0) - 1),
      });
    }
  },

  async markAsDonated(booking: Booking) {
    await firestoreService.updateBooking(booking.id!, { status: "donated" });
  },

  async requestCommunalDonation(
    matricula: string,
    studentName: string,
    studentEmail: string,
    book: Book,
    reason: string,
  ) {
    const request: CommunalDonationRequest = {
      bookId: book.id!,
      bookTitle: book.tituloLibro,
      studentMatricula: matricula,
      studentName: studentName,
      studentEmail: studentEmail,
      requestDate: new Date().toISOString(),
      status: "pending",
      reason: reason,
    };
    await firestoreService.addCommunalRequest(request);
  },

  async handleCommunalRequest(
    requestId: string,
    status: "approved" | "rejected",
  ) {
    const requests = await firestoreService.getCommunalRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    await firestoreService.updateCommunalRequest(requestId, { status });

    if (status === "approved") {
      await firestoreService.updateBook(request.bookId, { isCommunal: true });
    }

    // Send notification
    await notificationService.sendCommunalDecisionEmail(request, status);
  },

  async createCommunalBooking(requestId: string, type: "private" | "public") {
    const requests = await firestoreService.getCommunalRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) throw new Error("Solicitud no encontrada.");

    const communalBooking = {
      bookId: request.bookId,
      bookTitle: request.bookTitle,
      participants: [
        {
          matricula: request.studentMatricula,
          name: request.studentName,
          email: request.studentEmail,
        },
      ],
      type,
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await firestoreService.addCommunalBooking(communalBooking);
    // Mark request as archived or similar to avoid re-creation
    await firestoreService.updateCommunalRequest(requestId, {
      status: "archived",
    });
    return docRef.id;
  },

  async joinCommunalBooking(
    bookingId: string,
    matricula: string,
    name: string,
    email: string,
  ) {
    const booking = await firestoreService.getCommunalBooking(bookingId);
    if (!booking) throw new Error("Apartado no encontrado.");
    if (booking.status !== "active")
      throw new Error("Este apartado ya no está activo.");
    if (booking.participants.length >= 2)
      throw new Error("Este apartado ya tiene el cupo completo.");
    if (booking.participants.some((p) => p.matricula === matricula))
      throw new Error("Ya estás unido a este apartado.");

    const updatedParticipants = [
      ...booking.participants,
      { matricula, name, email },
    ];
    await firestoreService.updateCommunalBooking(bookingId, {
      participants: updatedParticipants,
      status: updatedParticipants.length >= 2 ? "completed" : "active",
    });

    if (updatedParticipants.length >= 2) {
      // Send notification to both
      await notificationService.sendCommunalMatchEmail(
        booking.participants[0].email,
        email,
        booking.bookTitle,
      );
    }
  },
};
