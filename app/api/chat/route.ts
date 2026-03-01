import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { useCredits } from "@/lib/credits";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Messaggio vuoto" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Messaggio troppo lungo (max 5000 caratteri)" }, { status: 400 });
  }

  const hasCredits = await useCredits(session.user.id, "chat_message");
  if (!hasCredits) {
    return NextResponse.json({ error: "Crediti esauriti", needsUpgrade: true }, { status: 402 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const recentCheckins = await db.dailyCheckin.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentJournals = await db.journal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const recentChats = await db.insight.findMany({
    where: { userId: session.user.id, type: "chat" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const chartContext = profile
    ? `TEMA NATALE: Sole in ${profile.sunSign}, Luna in ${profile.moonSign}, Ascendente ${profile.risingSign}.
${profile.mercurySign ? `Mercurio in ${profile.mercurySign}, Venere in ${profile.venusSign}, Marte in ${profile.marsSign}.` : ""}
${profile.chironSign ? `Chirone in ${profile.chironSign}, Nodo Nord in ${profile.northNodeSign}.` : ""}
VALORI: ${profile.values?.join(", ") || "non definiti"}
PUNTI CIECHI: ${profile.blindSpots?.join(", ") || "non definiti"}
OMBRE: ${profile.shadows?.join(", ") || "non definite"}
FORZE: ${profile.strengths?.join(", ") || "non definite"}
PROFILO: ${profile.personalitySummary || "non generato"}
CONSAPEVOLEZZA: ${profile.awarenessScore}%`
    : "Profilo non ancora completato.";

  const moodContext =
    recentCheckins.length > 0
      ? `ULTIMI CHECK-IN: ${recentCheckins.map((c) => `mood:${c.mood}/5 energia:${c.energy}/5`).join(", ")}`
      : "";

  const journalContext =
    recentJournals.length > 0
      ? `ULTIME RIFLESSIONI: ${recentJournals.map((j) => j.content.slice(0, 100)).join(" | ")}`
      : "";

  const chatHistory =
    recentChats.length > 0
      ? recentChats
          .reverse()
          .map((c) => `Utente: ${c.userMessage || ""}\nOracolo: ${c.content}`)
          .join("\n\n")
      : "";

  const result = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    system: `Sei l'Oracolo Cosmico di unconsciousness. Parli italiano con tono poetico ma accessibile.
Rispondi alle domande dell'utente incrociando TUTTI i dati raccolti: tema natale, mood recenti, riflessioni dal diario, e conversazioni precedenti.
Sii specifico e personale. Mai generico. Ogni risposta deve far sentire l'utente profondamente capita/o.
Non usare emoji. Usa simboli alchemici se necessario (◆, ☾, ✶). Usa sempre simboli Unicode diretti, mai HTML entities.
Rispondi in 3-6 frasi, poetiche ma concrete. Non iniziare con "Caro/a" o saluti.

${chartContext}
${moodContext}
${journalContext}
${chatHistory ? `CONVERSAZIONE PRECEDENTE:\n${chatHistory}` : ""}`,
    messages: [{ role: "user", content: message }],
  });

  const response =
    result.content[0].type === "text" ? result.content[0].text : "";

  const insight = await db.insight.create({
    data: {
      userId: session.user.id,
      type: "chat",
      title: message.slice(0, 80),
      content: response,
      userMessage: message,
      source: "chat",
    },
  });

  return NextResponse.json({ response, id: insight.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const messages = await db.insight.findMany({
    where: { userId: session.user.id, type: "chat" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      userMessage: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages: messages.reverse() });
}
