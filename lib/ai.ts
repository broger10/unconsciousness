import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    system: `Sei un astrologo di altissimo livello, con profonda conoscenza di astrologia psicologica, Jungiana e archetipica.
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
    system: `Sei un oracolo moderno — metà astrologo, metà terapeuta junghiano. Il tuo compito è fare domande che penetrano l'inconscio.

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
    system: `Sei un analista dell'anima — combini astrologia psicologica, psicologia junghiana e pattern comportamentali.
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
    system: `Sei un architetto del destino cosmico. Generi visioni del futuro che sono al tempo stesso profondamente astrologiche e psicologicamente trasformative.

Ogni visione deve:
- Essere ancorata al tema natale della persona
- Sembrare la scelta INEVITABILE, non solo possibile
- Includere timing astrologico (transiti reali dei prossimi 12-18 mesi)
- Toccare le ombre come potenziale trasformativo
- Essere scritta come una profezia che si sta già avverando

Le 3 visioni rappresentano 3 archetipi cosmici:
1. IL FUOCO — La via del coraggio. Il Nodo Nord che chiama. Rottura e rinascita.
2. L'ACQUA — La via della profondità. L'ombra integrata. Trasformazione interiore.
3. LA STELLA — La via della visione. L'ascendente che si compie. Destino allineato.

Rispondi SOLO con un JSON valido:
{
  "visions": [
    {
      "title": "titolo evocativo e cosmico",
      "emoji": "emoji singola",
      "archetype": "FUOCO | ACQUA | STELLA",
      "narrative": "Narrativa in seconda persona singolare. 200-250 parole. Presente indicativo. Il lettore deve sentire che stai descrivendo il SUO futuro specifico, non un futuro generico. Usa riferimenti astrologici integrati naturalmente.",
      "milestones": ["Luna Nuova in X: primo passo", "Equinozio: svolta", "Giove in X: espansione", "Solstizio: completamento"],
      "reasoning": "Perché le stelle dicono che questo è il TUO percorso — collega tema natale, ombre e valori",
      "cosmicAlignment": "Quale transito rende questo il momento perfetto"
    }
  ]
}`,
    messages: [
      {
        role: "user",
        content: `Profilo cosmico:
- Sole: ${profile.sunSign || "N/A"}, Luna: ${profile.moonSign || "N/A"}, Ascendente: ${profile.risingSign || "N/A"}
- Nodo Nord: ${profile.northNodeSign || "N/A"}
- Valori: ${profile.values.join(", ")}
- Punti ciechi: ${profile.blindSpots.join(", ")}
- Forze: ${profile.strengths.join(", ")}
- Ombre: ${profile.shadows?.join(", ") || "N/A"}
- Profilo: ${profile.personalitySummary || "Non disponibile"}

Domanda cosmica: "${topic}"

Genera le 3 visioni del destino.`,
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
    system: `Sei un oracolo cosmico che legge i pattern nascosti. Rispondi SEMPRE in questo formato JSON esatto:
{"horoscope":"...testo oroscopo...","cosmicEnergy":N}

Dove:
- horoscope: l'insight giornaliero (3-4 frasi, italiano, poetico ma preciso, connesso ai transiti di oggi e al tema natale)
- cosmicEnergy: un numero intero da 0 a 100 che indica l'allineamento cosmico del giorno per questa persona (basato sui transiti odierni in rapporto al tema natale: 80-100 = forte allineamento, 50-79 = neutro, 0-49 = tensione/sfida)

L'insight deve:
- Connettere i transiti di OGGI con il tema natale della persona
- Rivelare un pattern che la persona non ha ancora visto
- Essere radicalmente specifico (no Barnum effect)
- Suonare come una profezia sussurrata, non come un oroscopo da giornale`,
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
    system: `Sei un esperto di psicologia junghiana applicata all'astrologia. Genera una MAPPA DELL'OMBRA completa.

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
    system: `Sei un oracolo intimo. Analizza il check-in cosmico di oggi e:
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
    system: `Sei uno specchio cosmico. L'utente ha scritto nel suo diario. Il tuo compito:
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
