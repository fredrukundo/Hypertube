export default function MovieCardSkeleton() {
  return (
    <div className="bg-card border-2 border-border rounded-2xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[2/3] bg-secondary" />

      {/* Info placeholder */}
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary rounded-full w-4/5" />
        <div className="h-3 bg-secondary rounded-full w-1/2" />
        <div className="flex gap-1">
          <div className="h-5 bg-secondary rounded-full w-14" />
          <div className="h-5 bg-secondary rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}