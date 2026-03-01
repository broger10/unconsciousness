import type { FiloPattern } from "@/lib/types/filo";
import { decodeHtmlEntities } from "@/lib/utils";

interface FiloPatternCardProps {
  pattern: FiloPattern;
  onAskQuestion: (question: string) => void;
  locked?: boolean;
}

export function FiloPatternCard({ pattern, onAskQuestion, locked }: FiloPatternCardProps) {
  return (
    <div className={`glass rounded-xl p-5 border border-amber/10 transition-all duration-300 hover:border-amber/20 ${locked ? "curiosity-blur pointer-events-none" : ""}`}>
      <div className="flex items-start gap-3 mb-2">
        <span className="text-amber text-sm shrink-0 mt-0.5">&#10038;</span>
        <div>
          <h3 className="text-base font-bold font-display">{decodeHtmlEntities(pattern.titolo)}</h3>
          {pattern.aspettoAstrale && (
            <span className="text-[10px] text-amber/70 font-ui">{decodeHtmlEntities(pattern.aspettoAstrale)}</span>
          )}
        </div>
      </div>

      {pattern.temaEmotivo && (
        <div className="pl-6 mb-2">
          <span className="text-xs text-verdigris font-ui italic">{decodeHtmlEntities(pattern.temaEmotivo)}</span>
        </div>
      )}

      <p className="text-sm text-text-secondary font-body italic leading-relaxed mb-4 pl-6">
        {decodeHtmlEntities(pattern.rivelazione)}
      </p>

      <div className="flex flex-wrap gap-3 pl-6 mb-4">
        {pattern.occorrenze > 0 && (
          <span className="text-[10px] font-ui text-text-muted glass rounded-full px-2.5 py-1 border border-border/30">
            {pattern.occorrenze} {pattern.occorrenze === 1 ? "occorrenza" : "occorrenze"}
          </span>
        )}
        {pattern.dateCollegate.length > 0 && (
          <span className="text-[10px] font-ui text-text-muted glass rounded-full px-2.5 py-1 border border-border/30">
            {pattern.dateCollegate.join(" · ")}
          </span>
        )}
      </div>

      <div className="pl-6">
        <button
          onClick={() => onAskQuestion(pattern.domanda)}
          className="text-xs font-ui text-amber transition-colors duration-200 hover:text-amber-glow"
        >
          Approfondisci nel diario &#10038;
        </button>
      </div>
    </div>
  );
}
