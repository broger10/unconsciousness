import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Global tone instruction — prepended to every system prompt
export const TONE = `TONO OBBLIGATORIO:
- Scrivi come un'amica molto intelligente che non mente mai
- Frasi corte e dirette. Mai vaghe o consolatorie
- Mai punti elenco o liste nei testi generati
- Mai tono da chatbot o assistente AI
- Mai new-age generico ("il tuo viaggio cosmico", "le stelle ti guidano")
- Mai usare i nomi dei pianeti come soggetti di frasi narrative (non "Saturno ti insegna" ma "stai imparando a limitarti tu stesso")
- Se devi dire qualcosa di scomodo, dillo
- Punteggiatura normale. Niente ellissi continue. Niente punti esclamativi
- Italiano colloquiale ma non infantile
- Usa sempre simboli Unicode diretti. Mai HTML entities
Esempio buono: "Sai già cosa fare. Stai aspettando di avere meno paura."
Esempio sbagliato: "In questo momento di grande trasformazione, le stelle ti invitano a..."

`;

// ============================================
// BIRTH CHART READING — The Foundation
// ============================================

export async function generateBirthChartReading(birthData: {
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
}) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: `${TONE}Sei un astrologo di altissimo livello, con profonda conoscenza di astrologia psicologica, Jungiana e archetipica.
Dati i dati di nascita, calcola e interpreta il tema natale completo.

IMPORTANTE: Calcola le posizioni planetarie REALI basandoti sulla data, ora e luogo forniti. Usa la tua conoscenza delle effemeridi astronomiche.

Rispondi SOLO con un JSON valido:
{
  "sunSign": "segno",
  "moonSign": "segno",
  "risingSign": "segno",
  "mercurySign": "segno",
  "venusSign": "segno",
  "marsSign": "segno",
  "jupiterSign": "segno",
  "saturnSign": "segno",
  "chironSign": "segno",
  "northNodeSign": "segno",
  "natalChartData": {
    "elements": {"fuoco": 0, "terra": 0, "aria": 0, "acqua": 0},
    "modalities": {"cardinale": 0, "fisso": 0, "mutevole": 0},
    "dominantPlanet": "pianeta",
    "criticalAspects": ["aspetto1", "aspetto2"],
    "houses": {}
  },
  "coreIdentity": "Chi sei nel profondo — la tua essenza solare, 2-3 frasi potenti",
  "emotionalBlueprint": "Come funziona il tuo mondo emotivo — Luna, 2-3 frasi",
  "socialMask": "Come il mondo ti vede vs chi sei — Ascendente, 2-3 frasi",
  "loveLanguage": "Come ami e desideri — Venere + Marte, 2-3 frasi",
  "lifeLesson": "La lezione più grande che sei qui per imparare — Saturno + Nodo Nord, 2-3 frasi",
  "deepestWound": "La ferita che nasconde il tuo dono più grande — Chirone, 2-3 frasi",
  "shadows": ["ombra 1", "ombra 2", "ombra 3"],
  "gifts": ["dono 1", "dono 2", "dono 3"],
  "mythology": "Il tuo mito personale — racconta la storia archetipica che il tuo tema natale descrive, come se fosse una leggenda. 200-300 parole. Usa la seconda persona singolare. Scrivi come un poeta che ha studiato Jung."
}

Ogni insight deve essere RADICALMENTE SPECIFICO — niente frasi che potrebbero applicarsi a chiunque. Ogni parola deve richiedere la conoscenza del tema natale specifico di questa persona.`,
    messages: [
      {
        role: "user",
        content: `Data di nascita: ${birthData.birthDate}
Ora di nascita: ${birthData.birthTime || "non specificata"}
Luogo di nascita: ${birthData.birthCity || "non specificato"}

Calcola il tema natale e genera l'interpretazione completa.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse chart JSON");
  return JSON.parse(jsonMatch[0]);
}

// ============================================
// ONBOARDING QUESTIONS — The Deep Dive
// ============================================

export async function generateOnboardingQuestion(
  previousResponses: { question: string; answer: string }[],
  step: number,
  chartData?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    shadows?: string[];
  }
) {
  const context = previousResponses
    .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
    .join("\n\n");

  const chartContext = chartData
    ? `\nTema natale: Sole in ${chartData.sunSign}, Luna in ${chartData.moonSign}, Ascendente ${chartData.risingSign}. Ombre: ${chartData.shadows?.join(", ") || "non ancora analizzate"}.`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `${TONE}Sei un oracolo moderno — metà astrologo, metà terapeuta junghiano. Il tuo compito è fare domande che penetrano l'inconscio.

${chartContext}

Regole:
- Fai UNA sola domanda alla volta
- Ogni domanda deve rivelare qualcosa che la persona non sa di sé
- Se hai il tema natale, usa le sue ombre e tensioni per guidare le domande
- Le prime 3 domande sono più accessibili, poi scendi in profondità
- Le ultime 3 devono toccare le ferite più profonde (Chirone, Saturno, 12a casa)
- Tono: caldo, poetico, diretto. Come un saggio che ti vede per la prima volta
- Domanda in italiano
- Rispondi SOLO con la domanda, niente altro`,
    messages: [
      {
        role: "user",
        content:
          step === 0
            ? "Inizia il viaggio. Fai la prima domanda per entrare nel mondo interiore di questa persona."
            : `Ecco le risposte finora:\n\n${context}\n\nFai la domanda ${step + 1} di 10. Vai più in profondità. Tocca le ombre.`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

// ============================================
// PROFILE GENERATION — The Mirror
// ============================================

export async function generateProfile(
  responses: { question: string; answer: string }[],
  chartData?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    chironSign?: string;
    shadows?: string[];
  }
) {
  const context = responses
    .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
    .join("\n\n");

  const chartContext = chartData
    ? `\nTema natale disponibile: Sole in ${chartData.sunSign}, Luna in ${chartData.moonSign}, Ascendente ${chartData.risingSign}, Chirone in ${chartData.chironSign}. Ombre dal tema: ${chartData.shadows?.join(", ")}.`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `${TONE}Sei un analista dell'anima — combini astrologia psicologica, psicologia junghiana e pattern comportamentali.
${chartContext}

Analizza le risposte E il tema natale per creare un profilo di consapevolezza cosmica. Le tue osservazioni devono essere SPECIFICHE a questa persona — non generiche.

Rispondi SOLO con un JSON valido:
{
  "awarenessScore": <1-100, quanto è consapevole dei propri pattern>,
  "values": ["valore1", "valore2", "valore3"],
  "blindSpots": ["punto cieco 1", "punto cieco 2", "punto cieco 3"],
  "strengths": ["forza 1", "forza 2", "forza 3"],
  "shadows": ["ombra attiva 1", "ombra attiva 2", "ombra attiva 3"],
  "personalitySummary": "Un paragrafo potente che sintetizza chi è questa persona al livello più profondo. Connetti il tema natale con le risposte. Rivela ciò che non vede. Scrivi come un poeta-psicologo."
}`,
    messages: [
      {
        role: "user",
        content: `Risposte dall'esplorazione interiore:\n\n${context}\n\nGenera il profilo di consapevolezza.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse profile JSON");
  return JSON.parse(jsonMatch[0]);
}

// ============================================
// COSMIC VISIONS — The Three Paths
// ============================================

export async function generateVisions(
  topic: string,
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    northNodeSign?: string;
    values: string[];
    blindSpots: string[];
    strengths: string[];
    shadows?: string[];
    personalitySummary: string | null;
  }
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: `${TONE}Sei l'Oracolo di unconsciousness. Generi tre visioni cosmiche in risposta alla domanda specifica dell'utente, usando il suo tema natale come lente.

REGOLA FONDAMENTALE: ogni visione deve rispondere direttamente alla domanda posta. Non generare analisi psicologiche generiche. La domanda è il centro.

SE LA DOMANDA È PERSONALE E INTROSPETTIVA (relazioni, lavoro, scelte di vita, paure, crescita, decisioni): genera le tre visioni normalmente, ancorate alla domanda e al tema natale.

SE LA DOMANDA RIGUARDA EVENTI ESTERNI O NON PERSONALI (sport, politica, previsioni su altri, vincitori di campionati, eventi mondiali): Non rispondere alla domanda letterale. Invece, con tono cosmico e leggermente ironico (mai scortese, mai aggressivo), reindirizza:
- Riconosci la domanda
- Spiega che le stelle parlano dell'anima, non del mondo esterno
- Trasforma la domanda in una versione personale
Es: "La Juve vincerà?" → le visioni esplorano cosa significa per questa persona il bisogno di vittoria, appartenenza, tifare qualcosa più grande di sé.
Il tono del reindirizzamento deve essere come un oracolo saggio che sorride: "Le stelle non seguono il calcio — ma sanno perché tu hai bisogno di crederci."

Le 3 visioni rappresentano 3 archetipi cosmici:
1. IL FUOCO — La via del coraggio. Rottura e rinascita.
2. L'ACQUA — La via della profondità. Trasformazione interiore.
3. LA STELLA — La via della visione. Destino allineato.

Rispondi SOLO con un JSON valido:
{
  "visions": [
    {
      "title": "titolo evocativo e cosmico",
      "emoji": "emoji singola",
      "archetype": "FUOCO | ACQUA | STELLA",
      "narrative": "Narrativa in seconda persona singolare. 150-200 parole. Presente indicativo. Rispondi alla DOMANDA SPECIFICA dell'utente attraverso la lente del suo tema natale.",
      "milestones": ["Luna Nuova in X: primo passo", "Equinozio: svolta", "Giove in X: espansione", "Solstizio: completamento"],
      "reasoning": "Perché le stelle dicono che questo è il TUO percorso — collega tema natale, ombre e valori",
      "cosmicAlignment": "Quale transito rende questo il momento perfetto"
    }
  ]
}

Lingua: italiano.`,
    messages: [
      {
        role: "user",
        content: `La mia domanda è: "${topic}"

Mio tema natale: Sole ${profile.sunSign || "N/A"}, Luna ${profile.moonSign || "N/A"}, Ascendente ${profile.risingSign || "N/A"}
Nodo Nord: ${profile.northNodeSign || "N/A"}
Valori: ${profile.values.join(", ")}
Punti ciechi: ${profile.blindSpots.join(", ")}
Forze: ${profile.strengths.join(", ")}
Ombre: ${profile.shadows?.join(", ") || "N/A"}
Profilo: ${profile.personalitySummary || "Non disponibile"}

Genera le 3 visioni del destino in risposta alla mia domanda.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse visions JSON");
  return JSON.parse(jsonMatch[0]);
}

// ============================================
// DAILY COSMIC INSIGHT — The Oracle
// ============================================

export async function generateDailyInsight(
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    values: string[];
    blindSpots: string[];
    shadows?: string[];
    personalitySummary: string | null;
  },
  recentCheckins: {
    mood: number;
    energy: number;
    responses: unknown;
    createdAt: Date;
  }[],
  recentJournals?: { content: string; createdAt: Date }[]
) {
  const checkinsContext = recentCheckins
    .map(
      (c) =>
        `[${c.createdAt.toLocaleDateString("it")}] Mood: ${c.mood}/5, Energia: ${c.energy}/5`
    )
    .join("\n");

  const journalContext = recentJournals
    ?.map(
      (j) =>
        `[${j.createdAt.toLocaleDateString("it")}] ${j.content.substring(0, 200)}`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `${TONE}Sei un oracolo cosmico che legge i pattern nascosti. Rispondi SEMPRE in questo formato JSON esatto:
{"horoscope":"...testo oroscopo...","cosmicEnergy":N}

Dove:
- horoscope: l'insight giornaliero (3-4 frasi, italiano, poetico ma preciso, connesso ai transiti di oggi e al tema natale)
- cosmicEnergy: un numero intero da 0 a 100 che indica l'allineamento cosmico del giorno per questa persona (basato sui transiti odierni in rapporto al tema natale: 80-100 = forte allineamento, 50-79 = neutro, 0-49 = tensione/sfida)

L'insight deve:
- Connettere i transiti di OGGI con il tema natale della persona
- Rivelare un pattern che la persona non ha ancora visto
- Essere radicalmente specifico (no Barnum effect)
- Suonare come una profezia sussurrata, non come un oroscopo da giornale
- Massimo 150 parole. Niente introduzioni generiche. Inizia direttamente con l'insight più potente.`,
    messages: [
      {
        role: "user",
        content: `Tema natale: Sole ${profile.sunSign || "?"}, Luna ${profile.moonSign || "?"}, Ascendente ${profile.risingSign || "?"}
Ombre: ${profile.shadows?.join(", ") || "N/A"}
Punti ciechi: ${profile.blindSpots.join(", ")}

Check-in recenti:
${checkinsContext || "Nessuno"}

${journalContext ? `Diario recente:\n${journalContext}` : ""}

Data di oggi: ${new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}

Genera l'insight cosmico di oggi in formato JSON.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        horoscope: parsed.horoscope || text,
        cosmicEnergy: Math.min(100, Math.max(0, parseInt(parsed.cosmicEnergy) || 50)),
      };
    }
  } catch {
    // Fallback: return raw text with default energy
  }
  return { horoscope: text, cosmicEnergy: 50 };
}

// ============================================
// SHADOW MAP — The Deep Work
// ============================================

export async function generateShadowMap(profile: {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  chironSign?: string;
  saturnSign?: string;
  northNodeSign?: string;
  natalChartData?: Record<string, unknown>;
  shadows?: string[];
  blindSpots: string[];
  personalitySummary: string | null;
}) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: `${TONE}Sei un esperto di psicologia junghiana applicata all'astrologia. Genera una MAPPA DELL'OMBRA completa.

L'ombra non è il nemico — è il tesoro nascosto. La mappa deve:
- Identificare le 3 ombre principali dal tema natale (12a casa, Saturno, Chirone, pianeti in caduta/esilio)
- Per ogni ombra: nome, descrizione, come si manifesta, il dono nascosto al suo interno
- Fornire un "rituale di integrazione" per ciascuna (domanda di auto-riflessione)
- Essere scritta con reverenza, non con patologizzazione

Rispondi SOLO con un JSON valido:
{
  "overallNarrative": "La storia della tua ombra — 100-150 parole, poetica, in seconda persona",
  "shadows": [
    {
      "name": "Nome archetipico dell'ombra",
      "planet": "Quale posizione planetaria la genera",
      "description": "Come si manifesta nella tua vita — specifico, non generico",
      "hiddenGift": "Il dono che si nasconde dentro questa ferita",
      "integrationQuestion": "Una domanda potente per iniziare a integrare questa ombra",
      "intensity": <1-10>
    }
  ],
  "currentActivation": "Quale ombra è più attiva ORA basandoti sui transiti correnti"
}`,
    messages: [
      {
        role: "user",
        content: `Tema natale:
Sole: ${profile.sunSign}, Luna: ${profile.moonSign}, Ascendente: ${profile.risingSign}
Chirone: ${profile.chironSign || "?"}, Saturno: ${profile.saturnSign || "?"}
Nodo Nord: ${profile.northNodeSign || "?"}
Dati completi: ${JSON.stringify(profile.natalChartData || {})}
Ombre identificate: ${profile.shadows?.join(", ") || "nessuna"}
Punti ciechi: ${profile.blindSpots.join(", ")}
Profilo: ${profile.personalitySummary || ""}

Genera la Mappa dell'Ombra completa.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse shadow map JSON");
  return JSON.parse(jsonMatch[0]);
}

// ============================================
// COSMIC CHECK-IN — Daily Ritual Analysis
// ============================================

export async function generateCosmicCheckinInsight(
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
  },
  currentCheckin: {
    mood: number;
    energy: number;
    cosmicEnergy?: number;
    reflection?: string;
  },
  recentCheckins: {
    mood: number;
    energy: number;
    createdAt: Date;
  }[]
) {
  const history = recentCheckins
    .map(
      (c) =>
        `${c.createdAt.toLocaleDateString("it")}: Mood ${c.mood}/5, Energia ${c.energy}/5`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    system: `${TONE}Sei un oracolo intimo. Analizza il check-in cosmico di oggi e:
1. Connetti lo stato emotivo ai transiti attivi
2. Identifica un pattern nascosto comparando con i check-in precedenti
3. Offri una micro-rivelazione — qualcosa che la persona non ha notato
4. Chiudi con un'affermazione cosmica personalizzata

Tono: come un messaggio da un universo che ti conosce. In italiano. 4-5 frasi.`,
    messages: [
      {
        role: "user",
        content: `Tema: Sole ${profile.sunSign}, Luna ${profile.moonSign}, Asc. ${profile.risingSign}
Check-in di oggi: Mood ${currentCheckin.mood}/5, Energia ${currentCheckin.energy}/5${currentCheckin.cosmicEnergy ? `, Allineamento cosmico ${currentCheckin.cosmicEnergy}/5` : ""}
${currentCheckin.reflection ? `Riflessione: "${currentCheckin.reflection}"` : ""}

Storico recente:
${history || "Primo check-in"}

Genera l'insight cosmico.`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

// ============================================
// JOURNAL REFLECTION — The Mirror Writes Back
// ============================================

export async function generateJournalReflection(
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    shadows?: string[];
  },
  journalEntry: string
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `${TONE}Sei uno specchio cosmico. L'utente ha scritto nel suo diario. Il tuo compito:
- Rifletti ciò che l'utente non vede in ciò che ha scritto
- Connetti il contenuto al suo tema natale e alle sue ombre
- NON dare consigli. Rivela. Come uno specchio che mostra l'invisibile.
- 3-4 frasi. Poetiche e precise. In italiano.`,
    messages: [
      {
        role: "user",
        content: `Tema: Sole ${profile.sunSign}, Luna ${profile.moonSign}, Asc. ${profile.risingSign}
Ombre: ${profile.shadows?.join(", ") || "N/A"}

Diario:
"${journalEntry}"

Rifletti ciò che è nascosto.`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

// ============================================
// COSMIC COMPATIBILITY — Two Souls Dancing
// ============================================

export async function generateCompatibility(
  person1: {
    name?: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    venusSign?: string;
    marsSign?: string;
    chironSign?: string;
    natalChartData?: Record<string, unknown>;
  },
  person2: {
    name?: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    venusSign?: string;
    marsSign?: string;
    chironSign?: string;
    natalChartData?: Record<string, unknown>;
  }
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `${TONE}Sei un astrologo junghiano italiano. Analizza la compatibilità tra due persone basandoti sui loro temi natali completi. NON dare voti o percentuali. Analizza: 1) La danza di Venere e Marte tra i due temi 2) Come le Lune interagiscono emotivamente 3) La ferita di Chirone di uno come medicina per l'altro 4) Il pattern nascosto della relazione — cosa si attrae inconsciamente 5) La sfida evolutiva di questa connessione. Tono: profondo, poetico, senza giudizi. Massimo 400 parole.

Rispondi con un JSON valido:
{
  "analysis": "Il testo completo dell'analisi della compatibilità",
  "highlightQuote": "La frase più potente dell'analisi, massimo 2 righe, perfetta per essere condivisa"
}`,
    messages: [
      {
        role: "user",
        content: `PERSONA 1${person1.name ? ` (${person1.name})` : ""}:
Sole: ${person1.sunSign || "?"}, Luna: ${person1.moonSign || "?"}, Ascendente: ${person1.risingSign || "?"}
Venere: ${person1.venusSign || "?"}, Marte: ${person1.marsSign || "?"}, Chirone: ${person1.chironSign || "?"}
${person1.natalChartData ? `Dati completi: ${JSON.stringify(person1.natalChartData)}` : ""}

PERSONA 2${person2.name ? ` (${person2.name})` : ""}:
Sole: ${person2.sunSign || "?"}, Luna: ${person2.moonSign || "?"}, Ascendente: ${person2.risingSign || "?"}
Venere: ${person2.venusSign || "?"}, Marte: ${person2.marsSign || "?"}, Chirone: ${person2.chironSign || "?"}
${person2.natalChartData ? `Dati completi: ${JSON.stringify(person2.natalChartData)}` : ""}

Analizza la compatibilità cosmica tra queste due anime.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { analysis: text, highlightQuote: text.substring(0, 120) };
  }
  return JSON.parse(jsonMatch[0]);
}

// ============================================
// TRANSITS — Real-time Sky Analysis
// ============================================

export async function generateTransitInsight(
  transitDescription: string,
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
  }
) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system: `${TONE}Sei un astrologo italiano. Scrivi UNA riga di interpretazione per il transito dato, personalizzata per il tema natale. Massimo 15 parole. Tono poetico, diretto.`,
    messages: [
      {
        role: "user",
        content: `Tema natale: Sole ${profile.sunSign}, Luna ${profile.moonSign}, Asc. ${profile.risingSign}
Transito: ${transitDescription}
Interpreta in una riga.`,
      },
    ],
  });
  return (message.content[0] as { type: "text"; text: string }).text;
}

// ============================================
// LUNAR RITUALS — New & Full Moon
// ============================================

export async function generateLunarRitualMessage(
  phase: "new_moon" | "full_moon",
  lunarSign: string,
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    shadows?: string[];
  }
) {
  const phaseLabel = phase === "new_moon" ? "Luna Nuova" : "Luna Piena";
  const prompt = phase === "new_moon"
    ? `${phaseLabel} in ${lunarSign}. Cosa deve seminare e quale intenzione settare questa persona, basandoti sul suo tema natale.`
    : `${phaseLabel} in ${lunarSign}. Cosa deve rilasciare e cosa ha completato il suo ciclo per questa persona, basandoti sul suo tema natale.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `${TONE}Sei un astrologo mistico italiano. Scrivi un messaggio per un ritual lunare. 3-4 frasi, poetiche e personali. In italiano. Niente emoji.`,
    messages: [
      {
        role: "user",
        content: `Tema natale: Sole ${profile.sunSign}, Luna ${profile.moonSign}, Asc. ${profile.risingSign}
Ombre: ${profile.shadows?.join(", ") || "N/A"}
${prompt}`,
      },
    ],
  });
  return (message.content[0] as { type: "text"; text: string }).text;
}

// ============================================
// IL FILO — Pattern Analysis
// ============================================

export async function generateFiloAnalysis(
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    shadows?: string[];
  },
  journals: { content: string; mood?: string | null; themes?: string[]; createdAt: Date; transits?: string }[],
  checkins: { mood: number; energy: number; createdAt: Date }[]
) {
  const journalContext = journals
    .map(
      (j) =>
        `[${j.createdAt.toLocaleDateString("it-IT")}] ${j.content.substring(0, 300)}${j.mood ? ` (mood: ${j.mood})` : ""}${j.themes?.length ? ` [temi: ${j.themes.join(", ")}]` : ""}${j.transits ? `\n  Transiti attivi: ${j.transits}` : ""}`
    )
    .join("\n\n");

  const checkinContext = checkins
    .map(
      (c) =>
        `[${c.createdAt.toLocaleDateString("it-IT")}] Mood: ${c.mood}/5, Energia: ${c.energy}/5`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 2000,
    system: `${TONE}Sei un astrologo junghiano che legge i fili nascosti dell'inconscio attraverso i dati cosmici e le parole scritte. Il tuo compito è trovare pattern ricorrenti incrociando le entry del diario con i transiti astrologici attivi in ciascuna data.

Rispondi SEMPRE con un JSON valido in questo formato esatto:
{
  "sintesi": "3-5 frasi che raccontano il filo conduttore nascosto. Rivela ciò che la persona non ha ancora visto. Tono: come un oracolo che sussurra una verità inevitabile.",
  "pattern": [
    {
      "id": "p1",
      "titolo": "Nome archetipico del pattern (es: 'Il ciclo del ritiro')",
      "aspetto_astrale": "Il transito collegato (es: 'Saturno □ la tua Luna')",
      "tema_emotivo": "Il tema emotivo ricorrente (es: 'Bisogno di solitudine prima della creatività')",
      "occorrenze": 3,
      "rivelazione": "La rivelazione profonda — ciò che questo pattern nasconde. 2-3 frasi poetiche e specifiche.",
      "domanda": "Una domanda profonda per riflettere su questo pattern",
      "date_collegate": ["1 feb", "15 feb", "28 feb"]
    }
  ],
  "filo_cosmico": "Il filo conduttore cosmico che lega tutti i pattern. 2-3 frasi.",
  "prossimo_ciclo": "Basandoti sui transiti in arrivo, quando e come si ripresenterà il pattern principale. 2-3 frasi concrete con riferimenti astrologici."
}

Regole:
- Trova da 1 a 4 pattern REALI nei dati. Ogni pattern deve essere basato su almeno 2 entry reali.
- Incrocia i contenuti del diario con i transiti astrologici attivi nelle stesse date.
- Se un pattern si ripete sotto lo stesso transito, evidenzialo.
- La sintesi deve rivelare qualcosa che la persona non ha ancora visto.
- Le domande devono essere profonde e specifiche a questa persona, non generiche.
- Il prossimo_ciclo deve fare riferimento a transiti reali imminenti.
- Tono: poetico ma preciso, come un oracolo junghiano.
- Lingua: italiano.
- Non menzionare MAI "algoritmo", "AI", "analisi dati" o "intelligenza artificiale".
- Usa linguaggio cosmico: "il cielo ha trovato", "le stelle mostrano", "il filo rivela", "i transiti parlano".`,
    messages: [
      {
        role: "user",
        content: `Tema natale: Sole ${profile.sunSign || "?"}, Luna ${profile.moonSign || "?"}, Ascendente ${profile.risingSign || "?"}
Ombre: ${profile.shadows?.join(", ") || "N/A"}

=== DIARIO CON TRANSITI (${journals.length} entry) ===
${journalContext || "Nessuna entry"}

=== CHECK-IN EMOTIVI (${checkins.length}) ===
${checkinContext || "Nessun check-in"}

Leggi il filo nascosto incrociando le parole scritte con i transiti attivi. Trova i pattern ricorrenti, i cicli emotivi e le connessioni astrologiche. Rispondi in JSON.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sintesi: (parsed.sintesi as string) || "",
        pattern: Array.isArray(parsed.pattern)
          ? parsed.pattern.map((p: Record<string, unknown>, i: number) => ({
              id: (p.id as string) || `p${i + 1}`,
              titolo: (p.titolo as string) || "",
              aspettoAstrale: (p.aspetto_astrale as string) || "",
              temaEmotivo: (p.tema_emotivo as string) || "",
              occorrenze: typeof p.occorrenze === "number" ? p.occorrenze : 0,
              rivelazione: (p.rivelazione as string) || "",
              domanda: (p.domanda as string) || "",
              dateCollegate: Array.isArray(p.date_collegate) ? (p.date_collegate as string[]) : [],
            }))
          : [],
        filoCosmico: (parsed.filo_cosmico as string) || "",
        prossimoCiclo: (parsed.prossimo_ciclo as string) || "",
      };
    }
  } catch {
    // JSON parsing failed
  }
  throw new Error("Failed to parse filo analysis");
}

// ============================================
// MORNING PUSH — Daily Notification Message
// ============================================

export async function generateMorningPushMessage(profile: {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: `${TONE}Sei un astrologo mistico italiano. In 2 righe massimo, scrivi un messaggio personalizzato per ${profile.sunSign || "questo segno"} con luna in ${profile.moonSign || "questo segno"} e ascendente ${profile.risingSign || "questo segno"}. Tono poetico, profondo, non generico. Niente emoji.`,
    messages: [
      {
        role: "user",
        content: "Genera il messaggio mattutino per oggi.",
      },
    ],
  });
  return (message.content[0] as { type: "text"; text: string }).text;
}

// ============================================
// FIRST REVEAL — Onboarding Step 4
// ============================================

export async function generateFirstRevealPhrase(
  sunSign: string,
  moonSign: string,
  risingSign: string
) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: `${TONE}Sei un oracolo. Scrivi UNA frase in italiano di 20-25 parole che descrive il nodo psicologico centrale di questa persona, basandoti sul suo Sole ${sunSign}, Luna ${moonSign}, Ascendente ${risingSign}. La frase deve essere: specifica per questa combinazione, scomoda nel modo giusto, vera come se la conoscessi da anni. MAI generica. MAI consolatoria. MAI menzionare i nomi dei segni. MAI usare punti elenco. MAI tono da oroscopo. Tono: amica intelligente che ti dice la verità. Formato: UNA sola frase, niente altro.`,
    messages: [
      {
        role: "user",
        content: "Genera la frase per questa combinazione astrologica.",
      },
    ],
  });
  return (message.content[0] as { type: "text"; text: string }).text.trim();
}

// ============================================
// LA MAPPA — Two-Agent Constellation Pipeline
// ============================================

/**
 * Agent 1: Il Cartografo — analyzes the star sequence for psychological pattern.
 */
async function analyzeConstellationPattern(context: {
  stars: Array<{
    date: string;
    respiro: string;
    dominantPlanet: string;
    transitDescription: string;
    mood: number | null;
  }>;
  planet: string;
  profile: { sunSign?: string; moonSign?: string };
  specchioContext?: string;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    system: `${TONE}Sei Il Cartografo. Analizzi sequenze di transiti astrologici per trovare il pattern psicologico nascosto.

Ti vengono date le stelle (transiti) di una persona legate a ${context.planet}. Ogni stella porta una frase (Il Respiro) e un contesto.

Il tuo compito:
- Identifica il FILO CONDUTTORE psicologico tra queste stelle
- Nota come il mood cambia in relazione al pianeta dominante
- Trova la TENSIONE o il TEMA che unifica questa costellazione
- Scrivi un'analisi di 3-4 frasi in prima persona del narratore, come se stessi annotando su un quaderno
- Non essere generico. Sii chirurgico

Rispondi SOLO con l'analisi, niente JSON, niente titoli.`,
    messages: [
      {
        role: "user",
        content: `Persona: Sole ${context.profile.sunSign}, Luna ${context.profile.moonSign}
Pianeta dominante della costellazione: ${context.planet}

Stelle in ordine cronologico:
${context.stars
  .map(
    (s, i) =>
      `${i + 1}. [${s.date}] Respiro: "${s.respiro}" — Transito: ${s.transitDescription} — Mood: ${s.mood ?? "N/D"}`
  )
  .join("\n")}

${context.specchioContext ? `\nContesto dallo Specchio (percorso di auto-conoscenza):\n${context.specchioContext}` : ""}

Analizza il pattern.`,
      },
    ],
  });
  return (message.content[0] as { type: "text"; text: string }).text.trim();
}

/**
 * Agent 2: Il Narratore — takes the Cartografo's analysis and generates name + poetic reading.
 */
async function generateConstellationNarrative(context: {
  analysis: string;
  planet: string;
  starCount: number;
  profile: { sunSign?: string; moonSign?: string };
}): Promise<{ name: string; reading: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: `${TONE}Sei Il Narratore. Ricevi l'analisi del Cartografo e la trasformi in poesia.

Devi creare:
1. Un NOME per la costellazione: 2-3 parole evocative (es: "La Pazienza Feroce", "Il Fuoco Quieto", "L'Ombra che Canta")
2. Una LETTURA di esattamente 6 righe. Tono: tra hasidismo e buddhismo. Ogni riga deve essere una frase completa. Non usare rime. Usa la seconda persona singolare.

La lettura deve suonare come un testo sacro personale, non come un oroscopo.

Rispondi SOLO con JSON valido: {"name": "...", "reading": "..."}
Le 6 righe della lettura separate da \\n.`,
    messages: [
      {
        role: "user",
        content: `Persona: Sole ${context.profile.sunSign}, Luna ${context.profile.moonSign}
Pianeta della costellazione: ${context.planet}
Numero di stelle: ${context.starCount}

Analisi del Cartografo:
"${context.analysis}"

Genera nome e lettura.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { name: "Costellazione Senza Nome", reading: text };
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { name: "Costellazione Senza Nome", reading: text };
  }
}

/**
 * Main constellation pipeline — orchestrates Il Cartografo + Il Narratore.
 */
export async function generateConstellationReading(context: {
  stars: Array<{
    date: string;
    respiro: string;
    dominantPlanet: string;
    transitDescription: string;
    mood: number | null;
    specchioSlug: string | null;
  }>;
  planet: string;
  profile: { sunSign?: string; moonSign?: string };
  userId: string;
}): Promise<{ name: string; reading: string; analysis: string }> {
  // Gather Specchio context if stars have Specchio connections
  let specchioContext = "";
  const specchioSlugs = [...new Set(context.stars.map((s) => s.specchioSlug).filter(Boolean))];
  if (specchioSlugs.length > 0) {
    const capitoli = await db.specchioCapitolo.findMany({
      where: { userId: context.userId, slug: { in: specchioSlugs as string[] } },
      select: { slug: true, ritratto: true, ritrattoInsights: true },
    });
    specchioContext = capitoli
      .map((c) => `Capitolo "${c.slug}": ${c.ritrattoInsights?.join("; ") ?? c.ritratto ?? ""}`)
      .join("\n");
  }

  // Agent 1: Il Cartografo
  const analysis = await analyzeConstellationPattern({
    stars: context.stars,
    planet: context.planet,
    profile: context.profile,
    specchioContext,
  });

  // Agent 2: Il Narratore
  const narrative = await generateConstellationNarrative({
    analysis,
    planet: context.planet,
    starCount: context.stars.length,
    profile: context.profile,
  });

  return {
    name: narrative.name,
    reading: narrative.reading,
    analysis,
  };
}

// ============================================
// SPECCHIO — Lo Specchio (Guided Self-Knowledge)
// ============================================

export async function generateSpecchioDomande(context: {
  capitoloSlug: string;
  capitoloTitolo: string;
  tematica: string;
  giorno: number;
  giorniTotali: number;
  rispostePrecedenti: Array<{ giorno: number; domande: unknown }>;
  profile: { sunSign?: string; moonSign?: string; risingSign?: string; shadows?: string[]; strengths?: string[] };
}): Promise<Array<{ domanda: string; risposte: string[] }>> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    system: `${TONE}Sei uno psicologo junghiano che guida un percorso di auto-conoscenza.
Stai conducendo il capitolo "${context.capitoloTitolo}" (tema: ${context.tematica}).
Giorno ${context.giorno} di ${context.giorniTotali}.

Genera ESATTAMENTE 3 domande. Ogni domanda deve avere 3 opzioni di risposta.
Le domande devono essere progressivamente più profonde man mano che i giorni avanzano.
Le opzioni di risposta devono essere oneste, nessuna chiaramente "giusta" — tutte plausibili e rivelatrici.
Ogni opzione: max 15 parole, linguaggio diretto.
Ogni domanda: max 20 parole, seconda persona singolare.

${context.rispostePrecedenti.length > 0 ? `Risposte precedenti di questa persona:\n${JSON.stringify(context.rispostePrecedenti)}\nUsa queste informazioni per rendere le domande di oggi più mirate.` : ""}

Rispondi SOLO con JSON valido:
[
  {"domanda": "...", "risposte": ["opzione1", "opzione2", "opzione3"]},
  {"domanda": "...", "risposte": ["opzione1", "opzione2", "opzione3"]},
  {"domanda": "...", "risposte": ["opzione1", "opzione2", "opzione3"]}
]`,
    messages: [
      {
        role: "user",
        content: `Tema natale: Sole ${context.profile.sunSign}, Luna ${context.profile.moonSign}, Asc. ${context.profile.risingSign}
Ombre: ${context.profile.shadows?.join(", ") || "N/A"}
Forze: ${context.profile.strengths?.join(", ") || "N/A"}

Genera le 3 domande per il giorno ${context.giorno} del capitolo "${context.capitoloTitolo}".`,
      },
    ],
  });
  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse domande JSON");
  return JSON.parse(jsonMatch[0]);
}

export async function generateSpecchioFeedback(context: {
  risposteOggi: Array<{ domanda: string; risposta: string }>;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 60,
    system: `${TONE}Scrivi UNA frase di feedback dopo una sessione di auto-conoscenza. Max 15 parole. Diretta, senza consolazione. Basata sulle risposte date.`,
    messages: [
      {
        role: "user",
        content: `Risposte di oggi:\n${context.risposteOggi.map((r) => `D: ${r.domanda}\nR: ${r.risposta}`).join("\n\n")}`,
      },
    ],
  });
  return (message.content[0] as { type: "text"; text: string }).text.trim();
}

export async function generateSpecchioRitratto(context: {
  capitoloTitolo: string;
  capitoloSlug: string;
  sessioni: Array<{ giorno: number; domande: unknown }>;
  profile: { sunSign?: string; moonSign?: string; risingSign?: string };
  capitoliCompletati: Array<{ slug: string; ritratto?: string | null }>;
}): Promise<{ ritratto: string; insights: string[] }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `${TONE}Sei uno psicologo junghiano. Hai appena completato un'analisi di ${context.sessioni.length} sessioni sul tema "${context.capitoloTitolo}" con questa persona.

Tutte le risposte che ha dato:
${JSON.stringify(context.sessioni)}

Tema natale: Sole ${context.profile.sunSign}, Luna ${context.profile.moonSign}, Asc. ${context.profile.risingSign}
${context.capitoliCompletati.length > 0 ? `Capitoli precedenti completati: ${context.capitoliCompletati.map((c) => c.slug).join(", ")}` : ""}

Scrivi il ritratto psicologico di questa persona in relazione al tema di questo capitolo. Non descrivere le domande o le risposte. Scrivi come se conoscessi questa persona da anni.

Struttura:
Paragrafo 1 (3-4 frasi): il pattern centrale emerso
Paragrafo 2 (3-4 frasi): l'origine probabile di questo pattern
Paragrafo 3 (2-3 frasi): cosa questo costa a questa persona
Paragrafo 4 (2 frasi): cosa cambierebbe se lo vedesse davvero

Poi genera 3 insight brevi (una frase ciascuno).
Rispondi in JSON: {"ritratto": "testo completo...", "insights": ["frase 1", "frase 2", "frase 3"]}`,
    messages: [
      {
        role: "user",
        content: `Genera il ritratto per il capitolo "${context.capitoloTitolo}".`,
      },
    ],
  });
  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { ritratto: text, insights: [] };
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { ritratto: text, insights: [] };
  }
}

export async function generateSpecchioConsiglio(context: {
  capitoliCompletati: Array<{ slug: string; ritratto?: string | null }>;
  capitoliDisponibili: string[];
  ultimoRitratto?: string;
  profile: { sunSign?: string; moonSign?: string; risingSign?: string };
}): Promise<Array<{ slug: string; motivazione: string }>> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `${TONE}Sei una guida psicologica. Questa persona sta facendo un percorso di auto-conoscenza.
Capitoli completati: ${context.capitoliCompletati.map((c) => c.slug).join(", ") || "nessuno"}
Capitoli disponibili: ${context.capitoliDisponibili.join(", ")}
${context.ultimoRitratto ? `Ultimo ritratto:\n${context.ultimoRitratto}` : ""}
Tema natale: Sole ${context.profile.sunSign}, Luna ${context.profile.moonSign}, Asc. ${context.profile.risingSign}

Scegli i 2 capitoli più utili da proporre come prossimo step.
Rispondi SOLO in JSON:
{"consigli": [{"slug": "...", "motivazione": "max 12 parole, diretta"}, {"slug": "...", "motivazione": "max 12 parole, diretta"}]}`,
    messages: [
      {
        role: "user",
        content: "Consiglia i prossimi 2 capitoli.",
      },
    ],
  });
  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse consiglio JSON");
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.consigli;
}

// ============================================
// IL CIELO — Agent 2: Interprete (Haiku)
// ============================================

export async function generateInterpretation(
  transitData: {
    transits: Array<{ transitPlanet: string; aspect: string; natalPlanet: string; description: string; weight: number }>;
    retrogrades: string[];
  },
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    shadows?: string[];
  }
): Promise<{ sussurro: string; seme: string }> {
  const transitsContext = transitData.transits
    .map((t) => `${t.description} (peso: ${t.weight.toFixed(1)})`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `${TONE}Sei l'Interprete del cielo. Traduci i transiti astrologici in un messaggio personale.

Rispondi SOLO con JSON valido:
{
  "sussurro": "Un messaggio di massimo 4 righe. Personale, specifico, mai generico. Scrivi come se parlassi a un'amica. Ogni riga va a capo.",
  "seme": "UNA domanda o azione concreta per oggi. Max 20 parole. Deve essere qualcosa che la persona può fare OGGI."
}`,
    messages: [
      {
        role: "user",
        content: `Tema: Sole ${profile.sunSign}, Luna ${profile.moonSign}, Asc. ${profile.risingSign}
Ombre: ${profile.shadows?.join(", ") || "N/A"}
Retrogradi oggi: ${transitData.retrogrades.join(", ") || "nessuno"}

Transiti significativi:
${transitsContext || "nessuno significativo"}

Interpreta questi transiti per questa persona.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { sussurro: text.slice(0, 300), seme: "Osserva cosa ti attira oggi." };
  }
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    sussurro: parsed.sussurro || text.slice(0, 300),
    seme: parsed.seme || "Osserva cosa ti attira oggi.",
  };
}

// ============================================
// IL CIELO — Agent 3: Maestro (Sonnet)
// ============================================

export async function generateDailyMaster(
  interpretation: { sussurro: string; seme: string },
  transitData: {
    transits: Array<{ transitPlanet: string; aspect: string; natalPlanet: string; description: string }>;
    retrogrades: string[];
  },
  profile: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    shadows?: string[];
  }
): Promise<{ respiro: string; sussurro: string; seme: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    system: `${TONE}Sei il Maestro. Raffini il messaggio dell'Interprete in tre momenti perfetti.

Rispondi SOLO con JSON valido:
{
  "respiro": "UNA frase tagliente. Max 12 parole. Seconda persona singolare. È la prima cosa che l'utente legge — deve colpire. Niente virgolette, niente punteggiatura finale.",
  "sussurro": "Il messaggio rivisto dell'Interprete. Max 4 righe. Ogni riga va a capo. Più preciso, più personale.",
  "seme": "L'azione/domanda rivista. Max 20 parole. Concreta, fattibile oggi."
}`,
    messages: [
      {
        role: "user",
        content: `Tema: Sole ${profile.sunSign}, Luna ${profile.moonSign}, Asc. ${profile.risingSign}
Ombre: ${profile.shadows?.join(", ") || "N/A"}
Retrogradi: ${transitData.retrogrades.join(", ") || "nessuno"}
Transiti: ${transitData.transits.map((t) => t.description).join(", ")}

Messaggio dell'Interprete:
Sussurro: "${interpretation.sussurro}"
Seme: "${interpretation.seme}"

Raffina in tre momenti perfetti.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      respiro: interpretation.sussurro.split("\n")[0]?.slice(0, 60) || "Il cielo ti osserva",
      sussurro: interpretation.sussurro,
      seme: interpretation.seme,
    };
  }
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    respiro: parsed.respiro || "Il cielo ti osserva",
    sussurro: parsed.sussurro || interpretation.sussurro,
    seme: parsed.seme || interpretation.seme,
  };
}
