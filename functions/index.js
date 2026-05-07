const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { Resend } = require("resend");
const { generateSolicitudPDF } = require("./generatePDF");

// const resend = new Resend(process.env.RESEND_API_KEY);

exports.onNuevaReserva = onDocumentCreated(
  "bookings/{bookingId}",
  async (event) => {
    const booking = event.data.data();
    const bookingId = event.params.bookingId;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "❌ ERROR: La variable RESEND_API_KEY no está definida en el .env",
      );
      return null;
    }
    const resend = new Resend(apiKey);

    if (!booking.alumnoEmail) {
      console.error("Reserva sin correo de alumno:", bookingId);
      return null;
    }

    try {
      console.log(
        `📄 Generando PDF para solicitud #${booking.solicitudNum}...`,
      );

      // 1. Generar el PDF
      const pdfBytes = await generateSolicitudPDF(booking, bookingId);
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

      console.log(`📧 Enviando correo a: ${booking.alumnoEmail}...`);

      // 2. Enviar correo con Resend
      const { data, error } = await resend.emails.send({
        from: "Biblioteca UPP <onboarding@resend.dev>",
        to: [booking.alumnoEmail],
        subject: `Registro de Donación #${booking.solicitudNum} - UPP`,
        html: buildEmailHTML(booking),
        attachments: [
          {
            filename: `Solicitud_UPP_${booking.solicitudNum}.pdf`,
            content: pdfBase64,
          },
        ],
      });

      if (error) {
        console.error("Error al enviar correo:", error);
        await event.data.ref.update({
          correoEnviado: false,
          correoError: error.message,
        });
        return null;
      }

      console.log("✅ Correo enviado con éxito. ID:", data.id);
      await event.data.ref.update({
        correoEnviado: true,
        correoEnviadoAt: new Date(),
        resendEmailId: data.id,
      });

      return null;
    } catch (err) {
      console.error("Error inesperado en la función:", err);
      return null;
    }
  },
);

function buildEmailHTML(booking) {
  // Colores UPP: Morado (#5A1A71 aprox)
  const uppPurple = "#5A1A71";
  const uppGold = "#B38E5D";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${uppPurple}; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { border: 1px solid #ddd; padding: 24px; border-radius: 0 0 8px 8px; border-top: none; }
    .book-card { background: #f9f9f9; border-left: 4px solid ${uppGold}; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .footer { text-align: center; font-size: 12px; color: #888; margin-top: 24px; }
    .badge { background: ${uppGold}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin:0">Universidad Politécnica de Pachuca</h2>
    <p style="margin:8px 0 0;opacity:.9; font-size: 14px;">Centro de Información y Biblioteca</p>
  </div>
  <div class="content">
    <p>Hola <strong>${booking.alumnoNombre}</strong>,</p>
    <p>Tu registro para la donación de material bibliográfico en la <strong>UPP</strong> se ha realizado con éxito.</p>

    <div class="book-card">
      <p style="margin:0 0 8px"><span class="badge">Folio UPP #${booking.solicitudNum}</span></p>
      <p style="margin:4px 0"><strong>Libro:</strong> ${booking.libroTitulo}</p>
      <p style="margin:4px 0"><strong>Autor:</strong> ${booking.libroAutor || "—"}</p>
      <p style="margin:4px 0"><strong>Fecha de registro:</strong> ${booking.fechaFormateada || new Date().toLocaleDateString("es-MX")}</p>
    </div>

    <p>Adjunto a este correo encontrarás tu <strong>Solicitud de Donación</strong> en formato PDF. Por favor, imprímelo y preséntalo junto con el libro en el mostrador de la biblioteca.</p>

    <div style="background:#fff4e5; border:1px solid #ffcc80; padding:15px; border-radius:4px; font-size: 13px;">
      <strong>⚠️ Nota importante:</strong> El libro será inspeccionado físicamente. Debe ser nuevo y no presentar rayaduras, manchas o páginas sueltas.
    </div>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Universidad Politécnica de Pachuca<br>
    Sistema de Gestión de Biblioteca - Correo Automático</p>
  </div>
</body>
</html>
  `;
}
