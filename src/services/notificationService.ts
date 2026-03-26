import { CommunalDonationRequest } from '../types';

export const notificationService = {
  async sendCommunalDecisionEmail(request: CommunalDonationRequest, status: 'approved' | 'rejected') {
    const subject = status === 'approved' ? 'Solicitud de Donación Comunal Aprobada' : 'Solicitud de Donación Comunal Rechazada';
    const message = status === 'approved' 
      ? `Hola ${request.studentName},\n\nTu solicitud para el libro "${request.bookTitle}" ha sido aprobada.\n\nPuedes gestionar tu apartado aquí: ${window.location.origin}/communal-booking?requestId=${request.id}\n\nOpciones:\n- Apartado Privado: Comparte el enlace con tus compañeros.\n- Apartado Público: Otros podrán unirse desde la sección de libros comunales.`
      : `Hola ${request.studentName},\n\nLamentamos informarte que tu solicitud para el libro "${request.bookTitle}" ha sido rechazada.`;

    console.log(`[SIMULATED EMAIL to ${request.studentEmail}]`, {
      subject,
      message
    });

    // In a real app, you would call an API here (e.g., SendGrid, Mailgun)
    return true;
  },

  async sendCommunalMatchEmail(email1: string, email2: string, bookTitle: string) {
    const message = `¡Buenas noticias!\n\nSe ha encontrado un compañero para la donación comunal del libro "${bookTitle}".\n\nDatos de contacto:\nParticipante 1: ${email1}\nParticipante 2: ${email2}\n\nPueden ponerse en contacto para coordinar la entrega.`;

    console.log(`[SIMULATED EMAIL to ${email1} and ${email2}]`, {
      subject: 'Compañero encontrado para Donación Comunal',
      message
    });

    return true;
  }
};
