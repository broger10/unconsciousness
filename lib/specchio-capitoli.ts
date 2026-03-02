export interface Capitolo {
  slug: string;
  titolo: string;
  sottotitolo: string;
  descrizione: string;
  icona: string;
  colore: string;
  giorni: number;
  tematica: string;
}

export const CAPITOLI: Record<string, Capitolo> = {
  radici: {
    slug: "radici",
    titolo: "Le Radici",
    sottotitolo: "Come sei stato formato",
    descrizione: "Da dove vieni determina dove vai. Non l'hai scelto tu.",
    icona: "\u{1F331}",
    colore: "#8B6B47",
    giorni: 4,
    tematica: "famiglia, origine, condizionamenti ricevuti, chi ti ha insegnato chi sei",
  },
  paure: {
    slug: "paure",
    titolo: "Le Paure",
    sottotitolo: "Cosa eviti senza saperlo",
    descrizione: "Non sono i mostri che vedi. Sono quelli che non nomini.",
    icona: "\u{1F311}",
    colore: "#4A3B6B",
    giorni: 4,
    tematica: "evitamento, paure profonde, cosa non riesci a fare, blocchi inconsci",
  },
  confini: {
    slug: "confini",
    titolo: "I Confini",
    sottotitolo: "Dove finisci tu",
    descrizione: "La difficolt\u00e0 a dire no non \u00e8 gentilezza. \u00c8 altro.",
    icona: "\u25C8",
    colore: "#4A7B6B",
    giorni: 3,
    tematica: "limiti personali, relazioni, dire no, spazio personale, bisogni ignorati",
  },
  desiderio: {
    slug: "desiderio",
    titolo: "Il Desiderio",
    sottotitolo: "Cosa vuoi davvero",
    descrizione: "Quello che dici di volere e quello che vuoi non sempre coincidono.",
    icona: "\u2726",
    colore: "#C9A84C",
    giorni: 4,
    tematica: "desideri autentici vs performati, obiettivi reali, cosa si rimanda sempre",
  },
  relazioni: {
    slug: "relazioni",
    titolo: "Le Relazioni",
    sottotitolo: "I pattern con gli altri",
    descrizione: "Scegli le stesse persone con facce diverse.",
    icona: "\u25C7",
    colore: "#7B4A4A",
    giorni: 4,
    tematica: "pattern relazionali, attaccamento, dinamiche ripetute, bisogno di approvazione",
  },
  ombra: {
    slug: "ombra",
    titolo: "L'Ombra",
    sottotitolo: "Le parti che non vuoi vedere",
    descrizione: "Jung lo sapeva: quello che non integri ti governa.",
    icona: "\u263D",
    colore: "#3B4A6B",
    giorni: 5,
    tematica: "lati nascosti, proiezioni, giudizi sugli altri come specchio, emozioni negate",
  },
  potere: {
    slug: "potere",
    titolo: "Il Potere",
    sottotitolo: "Cosa ti ferma",
    descrizione: "Sai gi\u00e0 cosa dovresti fare. Il problema non \u00e8 la risposta.",
    icona: "\u2B21",
    colore: "#4A6B4A",
    giorni: 4,
    tematica: "agency, procrastinazione, autosabotaggio, identit\u00e0, chi vuoi diventare",
  },
};

export const CAPITOLI_SLUGS = Object.keys(CAPITOLI);
