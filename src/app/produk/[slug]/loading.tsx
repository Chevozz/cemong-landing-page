export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-300 px-4 py-8 md:px-8 md:py-12">
      <div className="animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 w-32 bg-border rounded mb-6" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {/* Image skeleton */}
          <div className="aspect-square bg-border rounded-lg" />

          {/* Info skeleton */}
          <div className="flex flex-col">
            <div className="h-4 w-24 bg-border rounded mb-1" />
            <div className="h-8 w-3/4 bg-border rounded mb-3" />
            <div className="h-6 w-32 bg-border rounded mb-6" />
            <div className="h-4 w-full bg-border rounded mb-2" />
            <div className="h-4 w-2/3 bg-border rounded mb-6" />
            <div className="h-8 w-24 bg-border rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
