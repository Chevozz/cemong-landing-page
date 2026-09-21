export default function ProductsLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-300 px-4 md:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-border rounded mb-2" />
          <div className="h-4 w-64 bg-border rounded mb-8" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface rounded-lg border border-border">
                <div className="aspect-[4/3] bg-border rounded-t-lg" />
                <div className="px-4 py-3">
                  <div className="h-4 w-3/4 bg-border rounded mb-1" />
                  <div className="h-3 w-12 bg-border rounded mb-2" />
                  <div className="h-5 w-24 bg-border rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
