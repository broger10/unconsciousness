import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPremium, getUserSubscription, stripe } from "@/lib/stripe";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const DARK_BG = rgb(13 / 255, 23 / 255, 16 / 255); // #0D1710
const AMBER = rgb(201 / 255, 169 / 255, 110 / 255); // #C9A96E
const TEXT_PRIMARY = rgb(237 / 255, 232 / 255, 220 / 255); // #EDE8DC
const TEXT_SECONDARY = rgb(184 / 255, 175 / 255, 155 / 255); // #B8AF9B
const VERDIGRIS = rgb(78 / 255, 158 / 255, 138 / 255); // #4E9E8A

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  // Check access: user must be premium OR have completed a one-shot payment
  const subscription = await getUserSubscription(session.user.id);
  const userIsPremium = isPremium(subscription);

  if (!userIsPremium) {
    // Check if user has a completed Stripe checkout for pdf_report
    let hasPaid = false;
    if (subscription?.stripeCustomerId) {
      const sessions = await stripe.checkout.sessions.list({
        customer: subscription.stripeCustomerId,
        status: "complete",
        limit: 10,
      });
      hasPaid = sessions.data.some(
        (s) => s.metadata?.product === "pdf_report" && s.payment_status === "paid"
      );
    }
    if (!hasPaid) {
      return NextResponse.json(
        { error: "Acquista il report PDF o attiva un abbonamento premium" },
        { status: 403 }
      );
    }
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingComplete) {
    return NextResponse.json({ error: "Completa l'onboarding prima" }, { status: 400 });
  }

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Helper to add a new page
  function addPage() {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    // Dark background
    page.drawRectangle({
      x: 0, y: 0,
      width: pageWidth, height: pageHeight,
      color: DARK_BG,
    });
    return page;
  }

  // Helper to draw wrapped text
  function drawWrappedText(
    page: ReturnType<typeof addPage>,
    text: string,
    x: number,
    startY: number,
    options: {
      font: typeof font;
      size: number;
      color: typeof AMBER;
      maxWidth: number;
      lineHeight?: number;
    }
  ): number {
    const { size, color, maxWidth, lineHeight = size * 1.4 } = options;
    const words = text.split(" ");
    let currentLine = "";
    let y = startY;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = options.font.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && currentLine) {
        page.drawText(currentLine, { x, y, font: options.font, size, color });
        y -= lineHeight;
        currentLine = word;
        if (y < margin + 20) {
          page = addPage();
          y = pageHeight - margin;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x, y, font: options.font, size, color });
      y -= lineHeight;
    }
    return y;
  }

  // === PAGE 1 — Cover ===
  let page = addPage();
  let y = pageHeight - 100;

  // Title
  page.drawText("unconsciousness", {
    x: margin, y,
    font: fontItalic, size: 28,
    color: AMBER,
  });
  y -= 40;

  page.drawText("Il Tuo Tema Natale Completo", {
    x: margin, y,
    font: fontBold, size: 22,
    color: TEXT_PRIMARY,
  });
  y -= 50;

  // Decorative line
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 200, y },
    thickness: 1,
    color: AMBER,
  });
  y -= 40;

  // User info
  if (user?.name) {
    page.drawText(user.name, {
      x: margin, y,
      font: fontBold, size: 16,
      color: TEXT_PRIMARY,
    });
    y -= 30;
  }

  if (profile.birthDate) {
    const dateStr = new Date(profile.birthDate).toLocaleDateString("it-IT", {
      day: "numeric", month: "long", year: "numeric",
    });
    page.drawText(`Nato/a il ${dateStr}`, {
      x: margin, y,
      font, size: 12,
      color: TEXT_SECONDARY,
    });
    y -= 20;
  }

  if (profile.birthTime) {
    page.drawText(`Ore ${profile.birthTime}`, {
      x: margin, y,
      font, size: 12,
      color: TEXT_SECONDARY,
    });
    y -= 20;
  }

  if (profile.birthCity) {
    page.drawText(profile.birthCity, {
      x: margin, y,
      font, size: 12,
      color: TEXT_SECONDARY,
    });
    y -= 40;
  }

  // Big three
  y -= 20;
  page.drawText("La Tua Triade", {
    x: margin, y,
    font: fontBold, size: 16,
    color: AMBER,
  });
  y -= 30;

  const triade = [
    { label: "Sole", value: profile.sunSign, desc: "La tua essenza" },
    { label: "Luna", value: profile.moonSign, desc: "Il tuo mondo emotivo" },
    { label: "Ascendente", value: profile.risingSign, desc: "La tua maschera" },
  ];

  for (const t of triade) {
    if (t.value) {
      page.drawText(`${t.label}: ${t.value}`, {
        x: margin, y,
        font: fontBold, size: 13,
        color: TEXT_PRIMARY,
      });
      page.drawText(` — ${t.desc}`, {
        x: margin + fontBold.widthOfTextAtSize(`${t.label}: ${t.value}`, 13), y,
        font: fontItalic, size: 11,
        color: TEXT_SECONDARY,
      });
      y -= 22;
    }
  }

  // === PAGE 2 — All 10 Planets ===
  page = addPage();
  y = pageHeight - margin;

  page.drawText("I Tuoi 10 Pianeti", {
    x: margin, y,
    font: fontBold, size: 18,
    color: AMBER,
  });
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 150, y },
    thickness: 1,
    color: AMBER,
  });
  y -= 30;

  const allPlanets = [
    { label: "Sole", value: profile.sunSign, desc: "La tua essenza — chi sei nel nucleo" },
    { label: "Luna", value: profile.moonSign, desc: "Il tuo mondo emotivo — come senti" },
    { label: "Ascendente", value: profile.risingSign, desc: "La tua maschera sociale" },
    { label: "Mercurio", value: profile.mercurySign, desc: "La tua mente — come pensi e comunichi" },
    { label: "Venere", value: profile.venusSign, desc: "Il tuo amore — come ami e desideri" },
    { label: "Marte", value: profile.marsSign, desc: "La tua forza — come agisci e combatti" },
    { label: "Giove", value: profile.jupiterSign, desc: "La tua espansione — dove cresci" },
    { label: "Saturno", value: profile.saturnSign, desc: "La tua lezione — dove la vita ti prova" },
    { label: "Chirone", value: profile.chironSign, desc: "La tua ferita sacra" },
    { label: "Nodo Nord", value: profile.northNodeSign, desc: "Il tuo destino" },
  ];

  for (const p of allPlanets) {
    if (!p.value) continue;
    page.drawText(`${p.label}`, {
      x: margin, y,
      font: fontBold, size: 12,
      color: VERDIGRIS,
    });
    page.drawText(` in ${p.value}`, {
      x: margin + fontBold.widthOfTextAtSize(`${p.label}`, 12), y,
      font: fontBold, size: 12,
      color: TEXT_PRIMARY,
    });
    y -= 18;
    page.drawText(p.desc, {
      x: margin + 15, y,
      font: fontItalic, size: 10,
      color: TEXT_SECONDARY,
    });
    y -= 30;
  }

  // === PAGE 3 — Lo Specchio Cosmico ===
  page = addPage();
  y = pageHeight - margin;

  page.drawText("Lo Specchio Cosmico", {
    x: margin, y,
    font: fontBold, size: 18,
    color: AMBER,
  });
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 170, y },
    thickness: 1,
    color: AMBER,
  });
  y -= 30;

  if (profile.personalitySummary) {
    y = drawWrappedText(page, profile.personalitySummary, margin, y, {
      font: fontItalic, size: 11, color: TEXT_SECONDARY, maxWidth: contentWidth,
    });
    y -= 20;
  }

  // Doni
  y -= 10;
  page.drawText("Doni Cosmici", {
    x: margin, y,
    font: fontBold, size: 14,
    color: AMBER,
  });
  y -= 25;

  for (const s of profile.strengths || []) {
    page.drawText(`  ${s}`, {
      x: margin, y,
      font, size: 11,
      color: TEXT_PRIMARY,
    });
    y -= 18;
  }

  // Valori
  y -= 15;
  page.drawText("Valori", {
    x: margin, y,
    font: fontBold, size: 14,
    color: VERDIGRIS,
  });
  y -= 25;

  for (const v of profile.values || []) {
    page.drawText(`  ${v}`, {
      x: margin, y,
      font, size: 11,
      color: TEXT_PRIMARY,
    });
    y -= 18;
  }

  // Ferita di Chirone
  if (profile.chironSign) {
    y -= 20;
    page.drawText("La Ferita di Chirone", {
      x: margin, y,
      font: fontBold, size: 14,
      color: rgb(192 / 255, 94 / 255, 60 / 255), // sienna
    });
    y -= 25;
    page.drawText(`Chirone in ${profile.chironSign}`, {
      x: margin, y,
      font, size: 11,
      color: TEXT_PRIMARY,
    });
    y -= 18;
    page.drawText("La ferita sacra — il dono nascosto nel dolore", {
      x: margin + 15, y,
      font: fontItalic, size: 10,
      color: TEXT_SECONDARY,
    });
    y -= 25;
  }

  // === PAGE 4 — Mythology ===
  if (profile.mythologyNarrative) {
    page = addPage();
    y = pageHeight - margin;

    page.drawText("La Tua Mitologia", {
      x: margin, y,
      font: fontBold, size: 18,
      color: AMBER,
    });
    y -= 10;
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + 140, y },
      thickness: 1,
      color: AMBER,
    });
    y -= 30;

    drawWrappedText(page, profile.mythologyNarrative, margin, y, {
      font: fontItalic, size: 11, color: TEXT_SECONDARY, maxWidth: contentWidth,
    });
  }

  // Footer on last page
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  lastPage.drawText("unconsciousness — il tuo specchio cosmico", {
    x: margin, y: 30,
    font: fontItalic, size: 9,
    color: rgb(110 / 255, 106 / 255, 96 / 255),
  });
  lastPage.drawText("unconsciousness.vercel.app", {
    x: pageWidth - margin - font.widthOfTextAtSize("unconsciousness.vercel.app", 9), y: 30,
    font, size: 9,
    color: AMBER,
  });

  // Serialize
  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tema-natale-${user?.name?.replace(/\s/g, "-") || "completo"}.pdf"`,
    },
  });
}
