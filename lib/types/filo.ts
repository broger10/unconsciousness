export interface FiloPattern {
  id: string;
  titolo: string;
  aspettoAstrale: string;
  temaEmotivo: string;
  occorrenze: number;
  rivelazione: string;
  domanda: string;
  dateCollegate: string[];
}

export interface FiloAnalysis {
  sintesi: string;
  pattern: FiloPattern[];
  filoCosmico: string;
  prossimoCiclo: string;
}
