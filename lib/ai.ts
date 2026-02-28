import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateOnboardingQuestion(
  previousResponses: { question: string; answer: string }[],
  step: number
) {
  const context = previousResponses
    .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `Sei un esploratore dell'anima umana. Il tuo compito è fare domande che rivelano ciò che la persona non sa di sé stessa.

Regole:
- Fai UNA sola domanda alla volta
- Vai in profondità, non restare in superficie
- Non giudicare mai
- Adatta ogni domanda basandoti sulle risposte precedenti
- Le prime domande sono più leggere, poi vai sempre più in profondità
- Usa un tono caldo ma diretto, come un mentore saggio
- La domanda deve essere in italiano
- Rispondi SOLO con la domanda, niente altro`,
    messages: [
      {
        role: "user",
        content: step === 0
          ? "Inizia la scoperta. Fai la prima domanda per conoscere questa persona."
          : `Ecco le risposte finora:\n\n${context}\n\nFai la domanda successiva (step ${step + 1} di 10). Vai più in profondità basandoti su quello che hai scoperto.`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

export async function generateProfile(
  responses: { question: string; answer: string }[]
) {
  const context = responses
    .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `Sei un analista comportamentale esperto. Analizza le risposte di questa persona e genera un profilo di consapevolezza.

Rispondi SOLO con un JSON valido in questo formato:
{
  "awarenessScore": <numero da 1 a 100>,
  "values": ["valore1", "valore2", "valore3"],
  "blindSpots": ["punto cieco 1", "punto cieco 2", "punto cieco 3"],
  "strengths": ["forza 1", "forza 2", "forza 3"],
  "personalitySummary": "Un paragrafo che descrive chi è questa persona, cosa non vede di sé, e dove ha il potenziale più grande"
}`,
    messages: [
      {
        role: "user",
        content: `Analizza queste risposte e genera il profilo:\n\n${context}`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse profile JSON");
  return JSON.parse(jsonMatch[0]);
}

export async function generateVisions(
  topic: string,
  profile: {
    values: string[];
    blindSpots: string[];
    strengths: string[];
    personalitySummary: string | null;
  }
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: `Sei un visionario che illumina il futuro delle persone. Devi creare 3 visioni del futuro profondamente personalizzate e convincenti.

Ogni visione deve:
- Sembrare la scelta GIUSTA per questa specifica persona
- Essere motivante e credibile
- Includere una narrativa in prima persona (come se la persona la stesse vivendo)
- Spiegare PERCHÉ questa visione risuona con i suoi valori e affronta i suoi punti ciechi
- Essere diversa dalle altre due ma ugualmente convincente

Le 3 visioni devono rappresentare 3 approcci diversi allo stesso obiettivo:
1. Il percorso AUDACE — la scelta coraggiosa che rompe gli schemi
2. Il percorso SAGGIO — la scelta equilibrata che integra crescita e stabilità
3. Il percorso PROFONDO — la scelta che trasforma dall'interno verso l'esterno

Rispondi SOLO con un JSON valido:
{
  "visions": [
    {
      "title": "titolo evocativo",
      "emoji": "emoji singola",
      "narrative": "narrativa in prima persona, 150-200 parole, presente indicativo, immersiva",
      "milestones": ["Mese 1: azione concreta", "Mese 3: risultato visibile", "Mese 6: trasformazione", "Mese 12: nuova identità"],
      "reasoning": "Spiegazione psicologica di perché questa visione è perfetta per te, collegata ai tuoi valori e blind spots"
    }
  ]
}`,
    messages: [
      {
        role: "user",
        content: `Profilo della persona:
- Valori: ${profile.values.join(", ")}
- Punti ciechi: ${profile.blindSpots.join(", ")}
- Punti di forza: ${profile.strengths.join(", ")}
- Descrizione: ${profile.personalitySummary || "Non disponibile"}

Obiettivo/decisione su cui generare le visioni: "${topic}"

Genera 3 visioni del futuro per questa persona.`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse visions JSON");
  return JSON.parse(jsonMatch[0]);
}

export async function generateDailyInsight(
  profile: {
    values: string[];
    blindSpots: string[];
    personalitySummary: string | null;
  },
  recentCheckins: { mood: number; energy: number; responses: unknown; createdAt: Date }[]
) {
  const checkinsContext = recentCheckins
    .map(
      (c) =>
        `[${c.createdAt.toLocaleDateString("it")}] Mood: ${c.mood}/5, Energia: ${c.energy}/5, Note: ${JSON.stringify(c.responses)}`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `Sei un osservatore acuto dei pattern umani. Genera un insight breve e potente che rivela qualcosa che la persona non ha notato di sé stessa. Massimo 2-3 frasi. Sii diretto, non generico. Parla in italiano.`,
    messages: [
      {
        role: "user",
        content: `Profilo: ${profile.personalitySummary || "Nessun profilo"}
Punti ciechi: ${profile.blindSpots.join(", ")}
Valori: ${profile.values.join(", ")}

Check-in recenti:
${checkinsContext || "Nessun check-in precedente"}

Genera un insight che riveli un pattern nascosto.`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}
