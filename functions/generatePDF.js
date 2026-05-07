const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

async function generateSolicitudPDF(booking, bookingId) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Tamaño Carta
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ─── PALETA DE COLORES UPP ────────────────────────────────────
  const uppPurple = rgb(0.35, 0.1, 0.45); // Morado Institucional
  const uppGold = rgb(0.7, 0.55, 0.2); // Dorado / Ocre
  const black = rgb(0, 0, 0);
  const lightGray = rgb(0.97, 0.97, 0.97);
  const darkGray = rgb(0.3, 0.3, 0.3);

  const margin = 50;
  let y = height - 40;

  // ─── ENCABEZADO ───────────────────────────────────────────────
  page.drawRectangle({
    x: margin,
    y: y - 55,
    width: width - margin * 2,
    height: 55,
    color: lightGray,
    borderColor: uppPurple,
    borderWidth: 0.5,
  });

  // Placeholder Logo UPP
  page.drawRectangle({
    x: margin + 4,
    y: y - 51,
    width: 47,
    height: 47,
    color: uppPurple,
  });

  page.drawText("UPP", {
    x: margin + 12,
    y: y - 32,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Datos Institucionales UPP
  page.drawText("UNIVERSIDAD POLITÉCNICA DE PACHUCA", {
    x: margin + 60,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: uppPurple,
  });
  page.drawText("DIRECCIÓN DE SERVICIOS ESCOLARES", {
    x: margin + 60,
    y: y - 30,
    size: 7.5,
    font: fontReg,
    color: darkGray,
  });
  page.drawText("CENTRO DE INFORMACIÓN Y BIBLIOTECA", {
    x: margin + 60,
    y: y - 41,
    size: 7.5,
    font: fontReg,
    color: darkGray,
  });

  y -= 80;

  // ─── TÍTULO ───────────────────────────────────────────────────
  const titulo = "Solicitud de Donación de Material Bibliográfico";
  const tituloW = fontBold.widthOfTextAtSize(titulo, 14);
  page.drawText(titulo, {
    x: (width - tituloW) / 2,
    y,
    size: 14,
    font: fontBold,
    color: uppPurple,
  });

  y -= 25;

  // ─── DATOS GENERALES ──────────────────────────────────────────
  const col1x = margin;
  const col2x = 340;

  page.drawText("Estudiante:", {
    x: col1x,
    y,
    size: 8.5,
    font: fontBold,
    color: black,
  });
  page.drawText(booking.alumnoNombre?.toUpperCase() || "—", {
    x: col1x + 55,
    y,
    size: 8.5,
    font: fontReg,
    color: black,
  });

  page.drawText("Tipo de Donación:", {
    x: col2x,
    y,
    size: 8.5,
    font: fontBold,
    color: black,
  });
  page.drawText("Individual", {
    x: col2x + 85,
    y,
    size: 8.5,
    font: fontReg,
    color: black,
  });

  y -= 14;
  page.drawText("ID Solicitud:", {
    x: col1x,
    y,
    size: 8.5,
    font: fontBold,
    color: black,
  });
  page.drawText(String(booking.solicitudNum || bookingId.slice(0, 8)), {
    x: col1x + 55,
    y,
    size: 8.5,
    font: fontReg,
    color: black,
  });

  page.drawText("Fecha:", {
    x: col2x,
    y,
    size: 8.5,
    font: fontBold,
    color: black,
  });
  page.drawText(booking.fechaFormateada || formatDate(booking.creadoAt), {
    x: col2x + 36,
    y,
    size: 8.5,
    font: fontReg,
    color: black,
  });

  y -= 18;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.8,
    color: uppGold,
  });
  y -= 14;

  // Párrafo de referencia
  const descText = [
    `Comprobante de registro de donación para el alumno(a) ${booking.alumnoNombre?.toUpperCase() || "—"},`,
    `con número de matrícula ${booking.alumnoCuenta || "—"} del Programa Educativo:`,
    `${booking.alumnoPrograma?.toUpperCase() || "—"}.`,
  ];

  for (const line of descText) {
    page.drawText(line, { x: margin, y, size: 8, font: fontReg, color: black });
    y -= 12;
  }

  y -= 10;

  // ─── SECCIÓN 1: DETALLES DEL LIBRO ───────────────────────────
  page.drawText("1. Detalles del Material Bibliográfico", {
    x: margin,
    y,
    size: 9.5,
    font: fontBold,
    color: uppPurple,
  });
  y -= 14;

  const filas = [
    ["ISBN / ISSN:", booking.libroISBN || "—"],
    ["Título del Libro:", booking.libroTitulo?.toUpperCase() || "—"],
    ["Autor(es):", booking.libroAutor?.toUpperCase() || "—"],
    ["Editorial:", booking.libroEditor?.toUpperCase() || "—"],
    ["Año de Publicación:", String(booking.libroAnio || "—")],
    ["Edición:", booking.libroEdicion || "—"],
    ["Formato:", "FÍSICO / IMPRESO"],
  ];

  for (const [label, value] of filas) {
    // Fondo de etiqueta (Morado muy tenue)
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: 130,
      height: 14,
      color: rgb(0.95, 0.9, 0.96),
    });
    page.drawText(label, {
      x: margin + 4,
      y,
      size: 8,
      font: fontBold,
      color: uppPurple,
    });

    // Celda de valor
    page.drawRectangle({
      x: margin + 130,
      y: y - 4,
      width: width - margin * 2 - 130,
      height: 14,
      borderColor: uppPurple,
      borderWidth: 0.2,
    });
    page.drawText(truncate(value, 75), {
      x: margin + 134,
      y,
      size: 8,
      font: fontReg,
      color: black,
    });
    y -= 14;
  }

  y -= 20;

  // ─── SECCIÓN 2: REQUISITOS DE RECEPCIÓN ──────────────────────
  page.drawText("2. Requisitos de Recepción (Importante)", {
    x: margin,
    y,
    size: 9.5,
    font: fontBold,
    color: uppPurple,
  });
  y -= 16;
  page.drawText(
    "El ejemplar debe presentarse en excelentes condiciones físicas:",
    { x: margin, y, size: 8.5, font: fontReg, color: black },
  );
  y -= 16;

  const requisitos = [
    "Ejemplar nuevo (sin uso previo).",
    "Sin daños en pastas, lomo o interiores (rasgaduras).",
    "Sin rastros de humedad o manchas.",
    "Sin anotaciones, subrayados o dedicatorias.",
    "Páginas y anexos completos.",
  ];

  for (const req of requisitos) {
    page.drawCircle({ x: margin + 10, y: y + 2, size: 2, color: uppGold });
    page.drawText(req, {
      x: margin + 20,
      y,
      size: 8.5,
      font: fontReg,
      color: black,
    });
    y -= 13;
  }

  y -= 10;
  page.drawText(
    "Nota: El Centro de Información se reserva el derecho de no recibir material dañado.",
    {
      x: margin,
      y,
      size: 8.5,
      font: fontBold,
      color: uppPurple,
    },
  );

  y -= 45;

  // ─── FIRMAS ───────────────────────────────────────────────────
  const lineW = 160;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + lineW, y },
    thickness: 0.5,
    color: black,
  });
  page.drawText("Firma del Estudiante", {
    x: margin + 35,
    y: y - 14,
    size: 8,
    font: fontReg,
    color: darkGray,
  });

  page.drawLine({
    start: { x: width - margin - lineW, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: black,
  });
  page.drawText("Sello y Firma de Biblioteca", {
    x: width - margin - 135,
    y: y - 14,
    size: 8,
    font: fontReg,
    color: darkGray,
  });

  // ─── PIE DE PÁGINA ────────────────────────────────────────────
  y = 30;
  page.drawText(
    `ID de Validación: ${bookingId.toUpperCase()} | Universidad Politécnica de Pachuca`,
    {
      x: margin,
      y,
      size: 7,
      font: fontReg,
      color: uppPurple,
    },
  );

  return await pdfDoc.save();
}

function formatDate(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("es-MX");
  }
}

function truncate(str, max) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

module.exports = { generateSolicitudPDF };
