export function FiloSkeleton() {
  return (
    <div className="space-y-4">
      {/* Synthesis skeleton */}
      <div className="glass rounded-2xl p-6 border border-amber/10">
        <div className="filo-shimmer rounded h-3 w-2/3 mb-3" />
        <div className="filo-shimmer rounded h-3 w-full mb-2" />
        <div className="filo-shimmer rounded h-3 w-5/6 mb-2" />
        <div className="filo-shimmer rounded h-3 w-3/4" />
      </div>

      {/* Pattern card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-xl p-5 border border-amber/5">
          <div className="filo-shimmer rounded h-4 w-1/3 mb-3" />
          <div className="filo-shimmer rounded h-3 w-full mb-2" />
          <div className="filo-shimmer rounded h-3 w-4/5 mb-4" />
          <div className="flex gap-4">
            <div className="filo-shimmer rounded h-3 w-24" />
            <div className="filo-shimmer rounded h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
